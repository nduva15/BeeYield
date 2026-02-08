"""
BeeYield Polygon Blockchain Service
Public chain anchoring for honey traceability verification
"""
import os
import json
import hashlib
from typing import Optional, Any
from datetime import datetime

try:
    from web3 import Web3
    from web3.middleware import geth_poa_middleware
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    print("WARNING: web3 not installed. Polygon integration will use mock mode.")


class PolygonService:
    """
    Service for anchoring honey batch hashes to the Polygon blockchain.
    
    Features:
    - Connect to Polygon Mainnet or Mumbai Testnet
    - Anchor batch hashes for public verification
    - Verify batch authenticity on-chain
    - Generate PolygonScan verification URLs
    """
    
    # Polygon Network Configuration
    POLYGON_MAINNET_RPC = "https://polygon-rpc.com"
    POLYGON_MUMBAI_RPC = "https://rpc-mumbai.maticvigil.com"
    POLYGON_MAINNET_CHAIN_ID = 137
    POLYGON_MUMBAI_CHAIN_ID = 80001
    
    # PolygonScan URLs
    POLYGONSCAN_MAINNET = "https://polygonscan.com"
    POLYGONSCAN_MUMBAI = "https://mumbai.polygonscan.com"
    
    def __init__(self, use_testnet: bool = True):
        """
        Initialize the Polygon service.
        
        Args:
            use_testnet: If True, connect to Mumbai testnet. If False, use mainnet.
        """
        self.use_testnet = use_testnet
        self.api_key = os.getenv("POLYGON_API_KEY", "")
        self.private_key = os.getenv("POLYGON_PRIVATE_KEY", "")
        self.account_address = os.getenv("POLYGON_ACCOUNT_ADDRESS", "")
        
        # Set RPC URL based on network
        if use_testnet:
            self.rpc_url = os.getenv("POLYGON_TESTNET_RPC_URL", self.POLYGON_MUMBAI_RPC)
            self.chain_id = self.POLYGON_MUMBAI_CHAIN_ID
            self.explorer_url = self.POLYGONSCAN_MUMBAI
        else:
            self.rpc_url = os.getenv("POLYGON_RPC_URL", self.POLYGON_MAINNET_RPC)
            self.chain_id = self.POLYGON_MAINNET_CHAIN_ID
            self.explorer_url = self.POLYGONSCAN_MAINNET
        
        # Add API key to RPC URL if using Alchemy/Infura style
        if self.api_key and "{key}" in self.rpc_url:
            self.rpc_url = self.rpc_url.replace("{key}", self.api_key)
        
        self.web3: Optional[Web3] = None
        self.connected = False
        
        # Local cache for anchored hashes (fallback when not connected)
        self._anchor_cache: dict[str, dict] = {}
        self._load_cache()
        
        # Try to connect
        self._connect()
    
    def _get_cache_path(self) -> str:
        """Get path for local anchor cache"""
        return os.path.join(
            os.path.dirname(os.path.abspath(__file__)), 
            "..", "blockchain", "polygon_anchors.json"
        )
    
    def _load_cache(self) -> None:
        """Load anchor cache from disk"""
        try:
            path = self._get_cache_path()
            if os.path.exists(path):
                with open(path, "r") as f:
                    self._anchor_cache = json.load(f)
                print(f"POLYGON: Loaded {len(self._anchor_cache)} anchors from cache")
        except Exception as e:
            print(f"POLYGON: Failed to load cache: {e}")
    
    def _save_cache(self) -> None:
        """Save anchor cache to disk"""
        try:
            path = self._get_cache_path()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as f:
                json.dump(self._anchor_cache, f, indent=2)
        except Exception as e:
            print(f"POLYGON: Failed to save cache: {e}")
    
    def _connect(self) -> bool:
        """Connect to Polygon network"""
        if not WEB3_AVAILABLE:
            print("POLYGON: Web3 not available, using mock mode")
            return False
        
        try:
            self.web3 = Web3(Web3.HTTPProvider(self.rpc_url))
            
            # Add PoA middleware for Polygon
            self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            if self.web3.is_connected():
                self.connected = True
                block = self.web3.eth.block_number
                print(f"POLYGON: Connected to {'Mumbai Testnet' if self.use_testnet else 'Mainnet'}")
                print(f"POLYGON: Current block: {block}")
                return True
            else:
                print("POLYGON: Failed to connect to network")
                return False
        except Exception as e:
            print(f"POLYGON: Connection error: {e}")
            return False
    
    def is_connected(self) -> bool:
        """Check if connected to Polygon network"""
        if not self.web3:
            return False
        try:
            return self.web3.is_connected()
        except:
            return False
    
    def get_network_status(self) -> dict[str, Any]:
        """Get current Polygon network status"""
        status = {
            "network": "Mumbai Testnet" if self.use_testnet else "Polygon Mainnet",
            "chain_id": self.chain_id,
            "connected": self.connected,
            "rpc_url": self.rpc_url[:50] + "..." if len(self.rpc_url) > 50 else self.rpc_url,
            "api_key_configured": bool(self.api_key),
            "cached_anchors": len(self._anchor_cache)
        }
        
        if self.connected and self.web3:
            try:
                status["latest_block"] = self.web3.eth.block_number
                status["gas_price_gwei"] = self.web3.from_wei(self.web3.eth.gas_price, 'gwei')
            except:
                pass
        
        return status
    
    def compute_batch_hash(self, batch_code: str, batch_data: Optional[dict] = None) -> str:
        """
        Compute a deterministic hash for a honey batch.
        
        Args:
            batch_code: The unique batch identifier
            batch_data: Optional additional data to include in hash
        
        Returns:
            SHA-256 hash of the batch data
        """
        data_string = batch_code
        if batch_data:
            data_string += json.dumps(batch_data, sort_keys=True, default=str)
        
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def anchor_batch_hash(
        self, 
        batch_code: str, 
        data_hash: str,
        metadata: Optional[dict] = None
    ) -> dict[str, Any]:
        """
        Anchor a batch hash to the Polygon blockchain.
        
        In connected mode: Creates an on-chain transaction storing the hash.
        In mock mode: Stores in local cache with simulated tx hash.
        
        Args:
            batch_code: Unique batch identifier
            data_hash: SHA-256 hash of batch data
            metadata: Optional additional metadata
        
        Returns:
            Anchoring result with tx_hash and verification URL
        """
        anchor_record = {
            "batch_code": batch_code,
            "data_hash": data_hash,
            "anchored_at": datetime.utcnow().isoformat(),
            "network": "mumbai" if self.use_testnet else "mainnet",
            "chain_id": self.chain_id,
            "metadata": metadata or {}
        }
        
        if self.connected and self.web3 and self.private_key:
            # Real on-chain anchoring
            try:
                tx_hash = self._write_to_chain(data_hash)
                anchor_record["tx_hash"] = tx_hash
                anchor_record["status"] = "confirmed"
                anchor_record["verification_url"] = f"{self.explorer_url}/tx/{tx_hash}"
            except Exception as e:
                print(f"POLYGON: On-chain anchoring failed: {e}, using local cache")
                anchor_record["tx_hash"] = self._generate_mock_tx_hash(batch_code)
                anchor_record["status"] = "cached_pending"
                anchor_record["verification_url"] = None
        else:
            # Mock mode - generate simulated tx hash
            anchor_record["tx_hash"] = self._generate_mock_tx_hash(batch_code)
            anchor_record["status"] = "cached_mock"
            anchor_record["verification_url"] = f"{self.explorer_url}/tx/{anchor_record['tx_hash']}"
            anchor_record["mock_mode"] = True
        
        # Store in local cache
        self._anchor_cache[batch_code] = anchor_record
        self._save_cache()
        
        print(f"POLYGON: Anchored batch {batch_code} -> {anchor_record['tx_hash'][:16]}...")
        
        return {
            "success": True,
            "batch_code": batch_code,
            "data_hash": data_hash,
            "tx_hash": anchor_record["tx_hash"],
            "status": anchor_record["status"],
            "verification_url": anchor_record.get("verification_url"),
            "network": anchor_record["network"]
        }
    
    def _write_to_chain(self, data_hash: str) -> str:
        """
        Write hash to blockchain using a simple data transaction.
        
        This embeds the hash in the transaction's input data field.
        """
        if not self.web3 or not self.private_key or not self.account_address:
            raise ValueError("Web3 not configured for on-chain transactions")
        
        # Build transaction with hash in data field
        nonce = self.web3.eth.get_transaction_count(self.account_address)
        
        tx = {
            'nonce': nonce,
            'to': self.account_address,  # Self-transaction
            'value': 0,
            'gas': 21000 + (len(data_hash) * 16),  # Base + data cost
            'gasPrice': self.web3.eth.gas_price,
            'chainId': self.chain_id,
            'data': f"0x{data_hash}"  # Embed hash as hex data
        }
        
        # Sign and send
        signed_tx = self.web3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return self.web3.to_hex(tx_hash)
    
    def _generate_mock_tx_hash(self, batch_code: str) -> str:
        """Generate a deterministic mock transaction hash"""
        seed = f"beeyield-polygon-{batch_code}-{self.chain_id}"
        return "0x" + hashlib.sha256(seed.encode()).hexdigest()
    
    def verify_batch_on_chain(self, batch_code: str) -> dict[str, Any]:
        """
        Verify a batch's anchoring status on Polygon.
        
        Args:
            batch_code: The batch code to verify
        
        Returns:
            Verification result with status and details
        """
        # Check local cache first
        if batch_code in self._anchor_cache:
            cached = self._anchor_cache[batch_code]
            
            result = {
                "verified": True,
                "batch_code": batch_code,
                "data_hash": cached.get("data_hash"),
                "tx_hash": cached.get("tx_hash"),
                "anchored_at": cached.get("anchored_at"),
                "network": cached.get("network"),
                "status": cached.get("status"),
                "verification_url": cached.get("verification_url"),
                "source": "cache"
            }
            
            # If connected, try to verify on-chain
            if self.connected and self.web3 and cached.get("status") == "confirmed":
                try:
                    receipt = self.web3.eth.get_transaction_receipt(cached["tx_hash"])
                    result["block_number"] = receipt.get("blockNumber")
                    result["confirmations"] = self.web3.eth.block_number - receipt.get("blockNumber", 0)
                    result["on_chain_verified"] = True
                except:
                    result["on_chain_verified"] = False
            
            return result
        
        return {
            "verified": False,
            "batch_code": batch_code,
            "message": "Batch not found in Polygon anchor records",
            "source": "cache"
        }
    
    def get_verification_url(self, batch_code: str) -> Optional[str]:
        """Get PolygonScan verification URL for a batch"""
        if batch_code in self._anchor_cache:
            return self._anchor_cache[batch_code].get("verification_url")
        return None
    
    def get_all_anchors(self, limit: int = 50) -> list[dict[str, Any]]:
        """Get all anchored batches"""
        anchors = list(self._anchor_cache.values())
        anchors.sort(key=lambda x: x.get("anchored_at", ""), reverse=True)
        return anchors[:limit]


# Singleton instance
polygon_service = PolygonService(use_testnet=True)
