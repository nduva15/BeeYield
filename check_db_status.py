
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import db_select
from app.blockchain.honey_chain import honey_blockchain

def check():
    print("--- DB BATCHES ---")
    batches = db_select("honey_batches")
    print(f"Count: {len(batches)}")
    for b in batches:
        print(f"- {b.get('batch_code')}: {b.get('honey_type')}")
    
    print("\n--- BLOCKCHAIN BATCHES ---")
    blocks = [b for b in honey_blockchain.chain if b.block_type.value == 'BATCH_CREATION']
    print(f"Count: {len(blocks)}")
    for b in blocks:
        print(f"- {b.data.get('batch_code')}: {b.data.get('honey_type')}")

if __name__ == "__main__":
    check()
