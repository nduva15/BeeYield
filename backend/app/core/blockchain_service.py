import json
import os
from web3 import Web3
from app.core.config import settings

"""
DEPRECATED: This file is no longer used in the active application.
The active blockchain implementation is in `backend/app/blockchain/honey_chain.py` (Python-based).
This Web3 implementation is kept for future reference only.
"""


# Minimal ABI based on our contract (Normally you'd auto-generate this from solc)
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string","name": "_beekeeperName","type": "string"},
            {"internalType": "string","name": "_farmLocation","type": "string"},
            {"internalType": "string","name": "_floralSource","type": "string"},
            {"internalType": "string","name": "_honeyType","type": "string"}
        ],
        "name": "createHarvestBatch",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256","name": "_batchId","type": "uint256"}],
        "name": "getBatchDetails",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256","name": "id","type": "uint256"},
                    {"internalType": "string","name": "beekeeperName","type": "string"},
                    {"internalType": "string","name": "farmLocation","type": "string"},
                    {"internalType": "uint256","name": "harvestTimestamp","type": "uint256"},
                    {"internalType": "string","name": "floralSource","type": "string"},
                    {"internalType": "string","name": "honeyType","type": "string"},
                    {"internalType": "string","name": "processingNotes","type": "string"},
                    {"internalType": "uint256","name": "processingTimestamp","type": "uint256"},
                    {"internalType": "string","name": "shippingDetails","type": "string"},
                    {"internalType": "uint256","name": "shippingTimestamp","type": "uint256"},
                    {"internalType": "bool","name": "exists","type": "bool"}
                ],
                "internalType": "struct HoneyTraceability.Batch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

class BlockchainService:
    def __init__(self):
        # In a real app, use settings.BLOCKCHAIN_RPC_URL (e.g., Infura, Alchemy, or Local Ganache)
        self.rpc_url = os.getenv("BLOCKCHAIN_URL", "http://127.0.0.1:8545")
        self.web3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.contract_address = os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
        self.account_address = os.getenv("BLOCKCHAIN_ACCOUNT")

        if self.contract_address:
            self.contract = self.web3.eth.contract(address=self.contract_address, abi=CONTRACT_ABI)
        else:
            print("WARNING: No Contract Address set. Blockchain capabilities disabled.")
            self.contract = None

    def is_connected(self):
        return self.web3.is_connected()

    def create_harvest(self, beekeeper: str, location: str, floral_source: str, honey_type: str):
        if not self.contract or not self.private_key:
            return {"error": "Blockchain not configured", "tx_hash": "mock_hash_123"}
        
        # Build Transaction
        nonce = self.web3.eth.get_transaction_count(self.account_address)
        tx = self.contract.functions.createHarvestBatch(
            beekeeper, location, floral_source, honey_type
        ).build_transaction({
            'chainId': 1337, # Replace with correct ID
            'gas': 2000000,
            'gasPrice': self.web3.to_wei('50', 'gwei'),
            'nonce': nonce,
        })
        
        # Sign and Send
        signed_tx = self.web3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return {"tx_hash": self.web3.to_hex(tx_hash)}

    def get_batch(self, batch_id: int):
        if not self.contract:
            # Return Mock Data if no blockchain is running
            return {
                "id": batch_id,
                "beekeeperName": "Mock Keeper",
                "farmLocation": "Mock Farm, Kenya",
                "harvestTimestamp": 1700000000,
                "floralSource": "Acacia",
                "honeyType": "Raw Organic",
                "processingNotes": "Filtered",
                "processingTimestamp": 1700003600,
                "shippingDetails": "Shipped to Nairobi",
                "shippingTimestamp": 1700100000,
                "exists": True
            }
        
        try:
            batch = self.contract.functions.getBatchDetails(batch_id).call()
            # Format Tuple to Dict
            return {
                "id": batch[0],
                "beekeeperName": batch[1],
                "farmLocation": batch[2],
                "harvestTimestamp": batch[3],
                "floralSource": batch[4],
                "honeyType": batch[5],
                "processingNotes": batch[6],
                "processingTimestamp": batch[7],
                "shippingDetails": batch[8],
                "shippingTimestamp": batch[9],
                "exists": batch[10]
            }
        except Exception as e:
            return {"error": str(e)}

blockchain_service = BlockchainService()
