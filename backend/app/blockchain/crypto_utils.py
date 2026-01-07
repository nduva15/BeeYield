"""
Cryptographic Utilities for BeeYield Blockchain
Provides digital signatures and verification for honey traceability
"""
import hashlib
import hmac
import secrets
import base64
from typing import Tuple, Optional
from datetime import datetime
import json


class BeeYieldCrypto:
    """
    Cryptographic utilities for the BeeYield blockchain.
    Uses HMAC-SHA256 for simplified digital signatures.
    In production, this would use proper asymmetric cryptography (RSA/ECDSA).
    """
    
    def __init__(self, master_secret: Optional[str] = None):
        """
        Initialize with a master secret key.
        In production, this would be securely stored/managed.
        """
        self.master_secret = master_secret or secrets.token_hex(32)
    
    def generate_keypair(self, entity_id: str) -> Tuple[str, str]:
        """
        Generate a deterministic keypair for an entity (farmer, apiary, etc.)
        Returns (private_key, public_key)
        """
        # Derive keys from master secret and entity ID
        private_key = hmac.new(
            self.master_secret.encode(),
            entity_id.encode(),
            hashlib.sha512
        ).hexdigest()
        
        # Public key is derived from private key
        public_key = hashlib.sha256(private_key.encode()).hexdigest()
        
        return private_key, public_key
    
    def sign_data(self, data: dict, private_key: str) -> str:
        """
        Sign data using the private key.
        Returns a base64-encoded signature.
        """
        # Canonicalize data
        data_string = json.dumps(data, sort_keys=True, default=str)
        
        # Create HMAC signature
        signature = hmac.new(
            private_key.encode(),
            data_string.encode(),
            hashlib.sha256
        ).digest()
        
        return base64.b64encode(signature).decode()
    
    def verify_signature(self, data: dict, signature: str, private_key: str) -> bool:
        """
        Verify a signature against the data.
        """
        expected_signature = self.sign_data(data, private_key)
        return hmac.compare_digest(signature, expected_signature)
    
    @staticmethod
    def hash_data(data: dict) -> str:
        """
        Create a SHA-256 hash of data for immutable record keeping.
        """
        data_string = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    @staticmethod
    def generate_batch_code(
        apiary_code: str,
        harvest_date: datetime,
        honey_type: str,
        batch_number: int
    ) -> str:
        """
        Generate a unique, human-readable batch code for honey jars.
        Format: BY-YYYY-APIARY-HONEY_TYPE-NNN
        """
        year = harvest_date.strftime("%Y")
        month = harvest_date.strftime("%m")
        honey_abbr = honey_type[:4].upper()
        apiary_abbr = apiary_code[:3].upper()
        
        return f"BY-{year}{month}-{apiary_abbr}-{honey_abbr}-{batch_number:03d}"
    
    @staticmethod
    def generate_qr_code_data(batch_code: str, blockchain_hash: str) -> dict:
        """
        Generate QR code payload for honey jar labels.
        """
        return {
            "type": "BEEYIELD_TRACE",
            "version": "1.0",
            "batch_code": batch_code,
            "blockchain_hash": blockchain_hash[:16],  # Short hash for QR
            "verify_url": f"https://beeyield.co.ke/trace/{batch_code}",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def generate_unique_id() -> str:
        """Generate a unique identifier for records"""
        return secrets.token_hex(16)
