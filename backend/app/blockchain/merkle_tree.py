"""
Merkle Tree Implementation for BeeYield Blockchain
Provides data integrity verification for honey traceability records
"""
import hashlib
from typing import Optional


class MerkleNode:
    """
    A node in the Merkle Tree
    """
    def __init__(self, left=None, right=None, data: Optional[str] = None):
        self.left = left
        self.right = right
        
        if data is not None:
            # Leaf node - hash the data directly
            self.hash = self._hash(data)
        else:
            # Internal node - hash the concatenation of children's hashes
            left_hash = left.hash if left else ""
            right_hash = right.hash if right else left_hash  # Duplicate if odd number
            self.hash = self._hash(left_hash + right_hash)
    
    @staticmethod
    def _hash(data: str) -> str:
        """SHA-256 hash of the data"""
        return hashlib.sha256(data.encode()).hexdigest()


class MerkleTree:
    """
    Merkle Tree for verifying batch data integrity.
    Used to efficiently verify that traceability data hasn't been tampered with.
    """
    
    def __init__(self, data_items: list[str]):
        """
        Build a Merkle Tree from a list of data items.
        Each item is typically a JSON string of a record (harvest, hive reading, etc.)
        """
        self.data_items = data_items
        self.root = self._build_tree(data_items)
    
    def _build_tree(self, items: list[str]) -> Optional[MerkleNode]:
        """
        Recursively build the Merkle Tree
        """
        if not items:
            return None
        
        # Create leaf nodes
        nodes = [MerkleNode(data=item) for item in items]
        
        # Build tree bottom-up
        while len(nodes) > 1:
            next_level = []
            
            for i in range(0, len(nodes), 2):
                left = nodes[i]
                right = nodes[i + 1] if i + 1 < len(nodes) else nodes[i]
                parent = MerkleNode(left=left, right=right)
                next_level.append(parent)
            
            nodes = next_level
        
        return nodes[0] if nodes else None
    
    def get_root_hash(self) -> str:
        """Get the root hash of the Merkle Tree"""
        return self.root.hash if self.root else ""
    
    def get_proof(self, index: int) -> list[tuple]:
        """
        Get the Merkle proof for a specific data item.
        Returns list of (hash, direction) tuples for verification.
        """
        if index >= len(self.data_items):
            return []
        
        proof = []
        nodes = [MerkleNode(data=item) for item in self.data_items]
        current_index = index
        
        while len(nodes) > 1:
            next_level = []
            
            for i in range(0, len(nodes), 2):
                left = nodes[i]
                right = nodes[i + 1] if i + 1 < len(nodes) else nodes[i]
                
                # Check if our target is in this pair
                if i == current_index or i + 1 == current_index:
                    if current_index == i:
                        proof.append((right.hash, 'right'))
                    else:
                        proof.append((left.hash, 'left'))
                    current_index = i // 2
                
                parent = MerkleNode(left=left, right=right)
                next_level.append(parent)
            
            nodes = next_level
            
        return proof
    
    @staticmethod
    def verify_proof(data: str, proof: list[tuple], root_hash: str) -> bool:
        """
        Verify a Merkle proof for a piece of data.
        """
        current_hash = hashlib.sha256(data.encode()).hexdigest()
        
        for sibling_hash, direction in proof:
            if direction == 'left':
                combined = sibling_hash + current_hash
            else:
                combined = current_hash + sibling_hash
            current_hash = hashlib.sha256(combined.encode()).hexdigest()
        
        return current_hash == root_hash
