from datetime import datetime
import uuid
from app.blockchain.chain import blockchain_instance
from app.db.supabase_db import db_select, db_insert, db_get_by_id
from app.schemas import traceability as schemas

def get_history_by_code(code: str):
    """
    Fetch comprehensive history for a given batch code from Supabase.
    """
    # 1. Fetch batch info
    batch = db_select("batches", filters={"batch_code": code}, limit=1)
    if not batch:
        return None
    
    batch_data = batch[0]
    
    # 2. Fetch processing record
    processing = db_get_by_id("processing_records", batch_data.get("processing_id"))
    
    # 3. Fetch harvest and hive
    harvest = None
    hive = None
    if processing:
        harvest = db_get_by_id("harvests", processing.get("harvest_id"))
        if harvest:
            hive = db_get_by_id("hives", harvest.get("hive_id"))
            
    return {
        "batch_id": code,
        "verified": True,
        "blockchain_verified": bool(batch_data.get("blockchain_hash")),
        "journey": {
            "hive": hive or {},
            "harvest": harvest or {},
            "processing": processing or {}
        },
        "batch_details": batch_data
    }

def register_hive(hive_in: schemas.HiveCreate):
    """
    Register a hive in both DB and Blockchain.
    """
    hive_data = hive_in.dict()
    hive_data['id'] = str(uuid.uuid4())
    
    # 1. Add to Blockchain
    try:
        block = blockchain_instance.add_block({
            "type": "HIVE_CREATION",
            "data": hive_data
        })
        hive_data['blockchain_hash'] = block.hash
    except Exception as e:
        print(f"Blockchain error: {e}")
        hive_data['blockchain_hash'] = None
    
    # 2. Save to DB
    result = db_insert("hives", hive_data)
    
    return {"status": "success", "hive_id": hive_data['id'], "result": result}

def record_harvest(harvest_in: schemas.HarvestCreate):
    """
    Record harvest.
    """
    harvest_data = harvest_in.dict()
    harvest_data['id'] = str(uuid.uuid4())
    
    # 1. Add to Blockchain
    try:
        block = blockchain_instance.add_block({
            "type": "HARVEST_RECORD",
            "data": harvest_data
        })
        harvest_data['blockchain_hash'] = block.hash
    except Exception as e:
        print(f"Blockchain error: {e}")
        harvest_data['blockchain_hash'] = None
    
    # 2. Save to DB
    result = db_insert("harvests", harvest_data)
    
    return {"status": "success", "harvest_id": harvest_data['id'], "result": result}
