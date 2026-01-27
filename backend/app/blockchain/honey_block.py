"""
BeeYield Honey Block - Enhanced Block Structure
Specialized block implementation for honey traceability with rich metadata
"""
from datetime import datetime
import json
import hashlib
from typing import Any, dict, Optional, list
from enum import Enum
from .merkle_tree import MerkleTree


class BlockType(Enum):
    """Types of blocks in the BeeYield blockchain"""
    GENESIS = "GENESIS"
    FARMER_REGISTRATION = "FARMER_REGISTRATION"
    APIARY_REGISTRATION = "APIARY_REGISTRATION"
    HIVE_REGISTRATION = "HIVE_REGISTRATION"
    HIVE_SENSOR_DATA = "HIVE_SENSOR_DATA"
    HARVEST_RECORD = "HARVEST_RECORD"
    PROCESSING_RECORD = "PROCESSING_RECORD"
    QUALITY_TEST = "QUALITY_TEST"
    PACKAGING_RECORD = "PACKAGING_RECORD"
    BATCH_CREATION = "BATCH_CREATION"
    TRANSFER_OF_CUSTODY = "TRANSFER_OF_CUSTODY"


class HoneyBlock:
    """
    Enhanced Block specifically designed for honey traceability.
    Includes:
    - Proof of Work (PoW) for chain security
    - Merkle root for data integrity verification
    - Digital signatures for authentication
    - Rich metadata for traceability
    """
    
    DIFFICULTY = 2  # Number of leading zeros required in hash (adjustable)
    
    def __init__(
        self,
        index: int,
        block_type: BlockType,
        data: dict[str, Any],
        previous_hash: str,
        creator_signature: str = "",
        timestamp: Optional[float] = None,
        nonce: int = 0,
        merkle_root: Optional[str] = None
    ):
        self.index = index
        self.block_type = block_type
        self.timestamp = timestamp or datetime.utcnow().timestamp()
        self.data = data
        self.previous_hash = previous_hash
        self.creator_signature = creator_signature
        self.nonce = nonce
        
        # Build Merkle tree from data if multiple items
        self.merkle_root = merkle_root or self._calculate_merkle_root()
        
        # Calculate hash with Proof of Work
        self.hash = self.calculate_hash()
    
    def _calculate_merkle_root(self) -> str:
        """
        Calculate Merkle root from block data.
        Useful when block contains multiple records.
        """
        if isinstance(self.data, dict):
            # Single record - hash it directly
            data_items = [json.dumps(self.data, sort_keys=True, default=str)]
        elif isinstance(self.data, list):
            # Multiple records - build Merkle tree
            data_items = [json.dumps(item, sort_keys=True, default=str) for item in self.data]
        else:
            data_items = [str(self.data)]
        
        tree = MerkleTree(data_items)
        return tree.get_root_hash()
    
    def calculate_hash(self) -> str:
        """
        Calculate SHA-256 hash of the block.
        """
        block_string = json.dumps({
            "index": self.index,
            "block_type": self.block_type.value,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "merkle_root": self.merkle_root,
            "nonce": self.nonce
        }, sort_keys=True, default=str).encode()
        
        return hashlib.sha256(block_string).hexdigest()
    
    def mine_block(self) -> None:
        """
        Perform Proof of Work mining.
        Finds a nonce that produces a hash with required leading zeros.
        """
        target = "0" * self.DIFFICULTY
        
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self.calculate_hash()
        
        print(f"Block mined! Nonce: {self.nonce}, Hash: {self.hash}")
    
    def to_dict(self) -> dict[str, Any]:
        """
        Convert block to dictionary for storage/API responses.
        """
        return {
            "index": self.index,
            "block_type": self.block_type.value,
            "timestamp": self.timestamp,
            "timestamp_readable": datetime.fromtimestamp(self.timestamp).isoformat(),
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "merkle_root": self.merkle_root,
            "nonce": self.nonce,
            "creator_signature": self.creator_signature,
            "difficulty": self.DIFFICULTY
        }
    
    def verify_integrity(self) -> bool:
        """
        Verify block integrity by recalculating hash.
        """
        return self.hash == self.calculate_hash()
    
    def get_block_summary(self) -> dict[str, Any]:
        """
        Get a human-readable summary of the block.
        """
        return {
            "block_number": self.index,
            "type": self.block_type.value,
            "created": datetime.fromtimestamp(self.timestamp).strftime("%Y-%m-%d %H:%M:%S"),
            "hash_preview": f"{self.hash[:8]}...{self.hash[-8:]}",
            "verified": self.verify_integrity()
        }


# Convenience factory functions
def create_farmer_block(
    index: int,
    previous_hash: str,
    farmer_data: dict,
    signature: str
) -> HoneyBlock:
    """Create a block for farmer registration"""
    return HoneyBlock(
        index=index,
        block_type=BlockType.FARMER_REGISTRATION,
        data={
            "record_type": "FARMER",
            **farmer_data,
            "registered_at": datetime.utcnow().isoformat()
        },
        previous_hash=previous_hash,
        creator_signature=signature
    )


def create_hive_sensor_block(
    index: int,
    previous_hash: str,
    sensor_readings: list[dict],
    signature: str
) -> HoneyBlock:
    """Create a block for hive sensor data"""
    return HoneyBlock(
        index=index,
        block_type=BlockType.HIVE_SENSOR_DATA,
        data={
            "record_type": "SENSOR_BATCH",
            "readings": sensor_readings,
            "reading_count": len(sensor_readings),
            "recorded_at": datetime.utcnow().isoformat()
        },
        previous_hash=previous_hash,
        creator_signature=signature
    )


def create_harvest_block(
    index: int,
    previous_hash: str,
    harvest_data: dict,
    signature: str
) -> HoneyBlock:
    """Create a block for harvest record"""
    return HoneyBlock(
        index=index,
        block_type=BlockType.HARVEST_RECORD,
        data={
            "record_type": "HARVEST",
            **harvest_data,
            "recorded_at": datetime.utcnow().isoformat()
        },
        previous_hash=previous_hash,
        creator_signature=signature
    )
