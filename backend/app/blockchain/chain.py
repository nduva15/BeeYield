from typing import List, Dict, Any
from app.blockchain.block import Block

class Blockchain:
    def __init__(self):
        """
        Initialize the blockchain with a genesis block.
        """
        self.chain: List[Block] = []
        self.pending_data: List[Dict[str, Any]] = []
        self.create_genesis_block()

    def create_genesis_block(self):
        """
        Create the first block in the chain (Genesis Block).
        """
        genesis_block = Block(0, {"message": "Genesis Block - BeeYield Traceability Start"}, "0")
        self.chain.append(genesis_block)

    @property
    def last_block(self) -> Block:
        return self.chain[-1]

    def add_block(self, data: Dict[str, Any]) -> Block:
        """
        Create a new block with data and add it to the chain.
        In a real distributed system, this would involve mining/consensus.
        Here we simplify for a private centralized chain.
        """
        previous_block = self.last_block
        new_block = Block(
            index=previous_block.index + 1,
            data=data,
            previous_hash=previous_block.hash
        )
        self.chain.append(new_block)
        return new_block

    def is_chain_valid(self) -> bool:
        """
        Check if the blockchain is valid.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Check if stored hash is correct
            if current.hash != current.calculate_hash():
                return False
            
            # Check if block links to previous correctly
            if current.previous_hash != previous.hash:
                return False

        return True

    def get_chain_dict(self) -> List[Dict[str, Any]]:
        """
        Return the full chain as a list of dictionaries.
        """
        return [block.to_dict() for block in self.chain]

    def find_blocks_by_id(self, internal_id: str) -> List[Block]:
        """
        Find blocks that contain specific data ID (e.g. searching for a Harvest ID).
        """
        found = []
        for block in self.chain:
            # Assuming data payload structure usually has 'record_id'
            if block.data.get('record_id') == internal_id:
                found.append(block)
        return found
        
blockchain_instance = Blockchain()
