from datetime import datetime
import json
import hashlib
from typing import Any, Dict, Optional

class Block:
    def __init__(
        self, 
        index: int, 
        data: Dict[str, Any], 
        previous_hash: str,
        timestamp: Optional[float] = None,
        nonce: int = 0
    ):
        """
        Initialize a new Block in the chain.
        
        :param index: Position of the block in the chain
        :param data: The actual data stored in the block (e.g. harvest info)
        :param previous_hash: Hash of the previous block
        :param timestamp: Creation time of the block
        :param nonce: Number used for Proof of Work (if we implement it)
        """
        self.index = index
        self.timestamp = timestamp or datetime.utcnow().timestamp()
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.calculate_hash()

    def calculate_hash(self) -> str:
        """
        Calculate the SHA-256 hash of the block.
        """
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True).encode()
        
        return hashlib.sha256(block_string).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert block to dictionary for storage/API.
        """
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "nonce": self.nonce
        }
