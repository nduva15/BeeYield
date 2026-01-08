from datetime import datetime
import uuid
from typing import Dict, Any, List, Optional

from app.blockchain.honey_chain import honey_blockchain, BlockType
from app.db.supabase_db import db_select, db_insert, db_get_by_id
from app.schemas import traceability as schemas

# --- Write Operations (Blockchain + DB) ---

def register_farmer(farmer_in: schemas.FarmerCreate) -> Dict[str, Any]:
    """Register a farmer in DB and Blockchain"""
    data = farmer_in.dict()
    data['farmer_id'] = str(uuid.uuid4())
    data['registration_date'] = datetime.utcnow().isoformat()
    
    # 1. Blockchain
    block = honey_blockchain.register_farmer(data)
    data['blockchain_hash'] = block.hash
    
    # 2. DB
    db_insert("farmers", data)
    
    return data

def register_apiary(apiary_in: schemas.ApiaryCreate) -> Dict[str, Any]:
    """Register an apiary"""
    data = apiary_in.dict()
    data['apiary_id'] = str(uuid.uuid4())
    
    block = honey_blockchain.register_apiary(data)
    data['blockchain_hash'] = block.hash
    
    db_insert("apiaries", data)
    return data

def register_hive(hive_in: schemas.HiveCreate) -> Dict[str, Any]:
    """Register a hive"""
    data = hive_in.dict()
    data['hive_id'] = str(uuid.uuid4())
    data['status'] = 'ACTIVE'
    
    block = honey_blockchain.register_hive(data)
    data['blockchain_hash'] = block.hash
    
    db_insert("hives", data)
    return data

def record_sensor_data(sensor_in: schemas.HiveSensorData) -> Dict[str, Any]:
    """Record IoT sensor readings"""
    data = sensor_in.dict()
    # Ensure timestamp is string for serialization
    data['timestamp'] = data['timestamp'].isoformat()
    
    block = honey_blockchain.record_sensor_data(data)
    
    return {
        "status": "success",
        "block_index": block.index,
        "hash": block.hash,
        "anomalies": block.data.get("anomalies_detected", [])
    }

def record_harvest(harvest_in: schemas.HarvestCreate) -> Dict[str, Any]:
    """Record a harvest"""
    data = harvest_in.dict()
    data['harvest_id'] = str(uuid.uuid4())
    data['harvest_code'] = honey_blockchain.crypto.generate_unique_id()[:8].upper()
    data['harvest_date'] = data['harvest_date'].isoformat()
    
    block = honey_blockchain.record_harvest(data)
    data['blockchain_hash'] = block.hash
    data['quality_score'] = block.data.get("sustainability_score")
    
    db_insert("harvests", data)
    return data

def create_batch(batch_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a final product batch"""
    # Simply wrap the blockchain call
    block = honey_blockchain.create_batch(batch_data)
    return block.data

# --- Read Operations (Traceability Journey) ---

def get_trace_journey(batch_code: str) -> Optional[schemas.TraceResponse]:
    """
    Reconstruct the full journey of a honey batch from the blockchain.
    
    This is the core 'Traceability' feature. It finds the batch,
    then recursively looks up the linked Processing -> Harvest -> Hive -> Apiary -> Farmer.
    """
    
    # 1. Find Batch Block
    raise Exception("I AM RUNNING!")
    trace_result = honey_blockchain.trace_batch(batch_code)
    # ... (rest of logic) ...

    # Step D: Hive Life (Sensor Data)
    hive_id = harvest_data.get('hive_id') or batch_data.get('hive_id')
    hive_block = honey_blockchain.search_by_record_id(hive_id) if hive_id else None
    
    hive = None
    if hive_block:
        h_data = hive_block['data']
        # ... (hive object creation) ...
        hive = schemas.Hive(
            hive_id=h_data.get('hive_id'),
            hive_code=h_data.get('hive_code'),
            hive_type=h_data.get('hive_type'),
            bee_type=h_data.get('bee_type'),
            apiary_id=h_data.get('apiary_id'),
            farmer_id=h_data.get('farmer_id'),
            installation_date=datetime.now().date(), # Fallback
            has_sensors=h_data.get('is_monitored', False),
            frame_count=h_data.get('initial_frame_count', 0),
            material=h_data.get('material', 'Wood')
        )
        
        with open("debug_GOLD.txt", "a") as f:
            f.write(f"Hive found: {hive_id}. Scanning chain of length {len(honey_blockchain.chain)}\n")
            for b in honey_blockchain.chain:
                if b.block_type == BlockType.HIVE_SENSOR_DATA:
                    f.write(f"Sensor Block {b.index}: Hive {b.data.get('hive_id')} | Anomalies: {b.data.get('anomalies_detected')}\n")

        sensor_blocks = [
            b for b in honey_blockchain.chain 
            if b.block_type == BlockType.HIVE_SENSOR_DATA 
            and b.data.get('hive_id') == hive_id
        ]
        
        for s_block in sensor_blocks:
            anomalies = s_block.data.get('anomalies_detected', [])
            if "ACOUSTIC_VARROA_PATTERN" in anomalies:
                journey_timeline.append(schemas.TraceJourneyStep(
                    title="Health Shield Activated",
                    date=s_block.data.get('timestamp', '')[:10], # YYYY-MM-DD
                    location=f"Hive {h_data.get('hive_code')}",
                    description="BeeYield Acoustic Sensors (ApiSense) detected early Varroa mite signature. Automatic alert sent to Beekeeper. Organic intervention applied immediately. Colony health restored.",
                    icon="Shield",
                    data={"anomalies": anomalies, "sensor_reading": s_block.data},
                    hash=s_block.hash
                ))

        journey_timeline.append(schemas.TraceJourneyStep(
            title="Hive Life",
            date="Continuous Monitoring",
            location=f"Hive {h_data.get('hive_code')}",
            description=f"Home to {h_data.get('bee_type')} bees. {h_data.get('hive_type')} hive structure.",
            icon="Hexagon",
            data=h_data,
            hash=hive_block['hash']
        ))

    # Step E: Apiary & Location
    apiary_id = harvest_data.get('apiary_id') or batch_data.get('apiary_id') or (hive.apiary_id if hive else None)
    apiary_block = honey_blockchain.search_by_record_id(apiary_id) if apiary_id else None
    
    apiary = None
    if apiary_block:
        a_data = apiary_block['data']
        apiary = schemas.Apiary(
            apiary_id=a_data.get('apiary_id'),
            apiary_code=a_data.get('apiary_code'),
            name=a_data.get('name'),
            farmer_id=a_data.get('farmer_id'),
            environment_type=a_data.get('environment_type'),
            flora_types=a_data.get('flora_types', []),
            location_name=a_data.get('location_name'),
            latitude=a_data.get('coordinates', {}).get('latitude', 0.0),
            longitude=a_data.get('coordinates', {}).get('longitude', 0.0),
            region=a_data.get('region', ''),
            county=a_data.get('county', ''),
            established_date=datetime.now().date()
        )
        
        journey_timeline.append(schemas.TraceJourneyStep(
            title="The Origin",
            date="Established Location",
            location=f"{a_data.get('location_name')}, {a_data.get('region')}",
            description=f"Foraged from {', '.join(a_data.get('flora_types', []))}. Environment: {a_data.get('environment_type')}.",
            icon="MapPin",
            data=a_data,
            hash=apiary_block['hash']
        ))

    # Step F: Farmer / Beekeeper
    farmer_id = harvest_data.get('farmer_id') or batch_data.get('farmer_id') or (hive.farmer_id if hive else None)
    farmer_block = honey_blockchain.search_by_record_id(farmer_id) if farmer_id else None
    
    farmer = None
    if farmer_block:
        f_data = farmer_block['data']
        farmer = schemas.Farmer(
            farmer_id=f_data.get('farmer_id'),
            name=f_data.get('name'),
            registration_date=datetime.now(),
            location_name=f_data.get('region', ''),
            latitude=0.0, longitude=0.0, region=f_data.get('region', ''), county=f_data.get('county', ''),
            story=f_data.get('story', "Dedicated to sustainable beekeeping."),
            experience_years=f_data.get('experience_years', 1)
        )

    # 3. Construct Final Response
    return schemas.TraceResponse(
        batch_code=batch_code,
        product_name=f"{batch_data.get('honey_type', 'Pure')} Honey",
        verified=True,
        blockchain_verified=True,
        verification_url=trace_result.get('verification_url', ''),
        farmer=farmer,
        apiary=apiary,
        hive=hive,
        story_title=f"Meet {farmer.name}" if farmer else "Our Story",
        story_content=farmer.story if farmer else "Sustainably harvested from Kenya's rich landscapes.",
        impact_stats={
            "farmer_fair_pay": "100%",
            "bees_protected": "Yes",
            "biodiversity_score": "High"
        },
        timeline=journey_timeline
    )

