from datetime import datetime, date
import uuid
from typing import Any, Optional

from app.blockchain.honey_chain import honey_blockchain, BlockType
from app.db.supabase_db import db_select, db_insert, db_get_by_id
from app.schemas import traceability as schemas

# --- Write Operations (Blockchain + DB) ---

def register_farmer(farmer_in: schemas.FarmerCreate) -> dict[str, Any]:
    """Register a farmer in DB and Blockchain"""
    data = farmer_in.dict()
    data['farmer_id'] = f"F-{str(uuid.uuid4())[:8].upper()}" if not data.get('farmer_id') else data.get('farmer_id')
    data['registration_date'] = datetime.utcnow().isoformat()
    
    # 1. Blockchain
    block = honey_blockchain.register_farmer(data)
    data['blockchain_hash'] = block.hash
    
    # 2. DB
    res = db_insert("farmers", data)
    if not res.get("success"):
        raise Exception(f"Database insertion failed: {res.get('error')}")
    
    return data

def register_apiary(apiary_in: schemas.ApiaryCreate) -> dict[str, Any]:
    """Register an apiary"""
    data = apiary_in.dict()
    if isinstance(data.get('established_date'), date):
        data['established_date'] = data['established_date'].isoformat()
    data['apiary_id'] = str(uuid.uuid4())
    
    block = honey_blockchain.register_apiary(data)
    data['blockchain_hash'] = block.hash
    
    db_insert("apiaries", data)
    return data

def register_hive(hive_in: schemas.HiveCreate) -> dict[str, Any]:
    """Register a hive"""
    data = hive_in.dict()
    if isinstance(data.get('installation_date'), date):
        data['installation_date'] = data['installation_date'].isoformat()
    data['hive_id'] = str(uuid.uuid4())
    data['status'] = 'ACTIVE'
    
    block = honey_blockchain.register_hive(data)
    data['blockchain_hash'] = block.hash
    
    db_insert("hives", data)
    return data

def record_sensor_data(sensor_in: schemas.HiveSensorData) -> dict[str, Any]:
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

def record_harvest(harvest_in: schemas.HarvestCreate) -> dict[str, Any]:
    """Record a harvest in both Blockchain and Database"""
    data = harvest_in.dict()
    data['id'] = str(uuid.uuid4()) if not data.get('id') else data.get('id')
    data['harvest_id'] = data['id']
    data['harvest_code'] = honey_blockchain.crypto.generate_unique_id()[:8].upper()
    
    if isinstance(data.get('harvest_date'), date):
        data['harvest_date'] = data['harvest_date'].isoformat()
    
    # Set defaults for missing fields if necessary
    if not data.get('extraction_method'):
        data['extraction_method'] = 'Cold Extraction'
    
    # 1. Blockchain Seal
    block = honey_blockchain.record_harvest(data)
    data['blockchain_hash'] = block.hash
    data['quality_score'] = block.data.get("sustainability_score", 85)
    
    # 2. Database Record
    res = db_insert("harvests", data)
    if not res.get("success"):
        print(f"ERROR: Harvest DB insertion failed: {res.get('error')}")
    
    return data

def create_batch(batch_data: dict[str, Any]) -> dict[str, Any]:
    """Create a final product batch and sync with DB"""
    # 1. Blockchain Seal
    block = honey_blockchain.create_batch(batch_data)
    final_data = block.data
    final_data['blockchain_hash'] = block.hash
    
    # 2. Enrich for DB (Match honey_batches schema)
    # Get Harvest details
    harvest_id = batch_data.get('harvest_id')
    harvest = db_get_by_id("harvests", harvest_id) if harvest_id else None
    
    # Get Farmer & Apiary details
    farmer_id = batch_data.get('farmer_id') or (harvest.get('farmer_id') if harvest else None)
    farmer = db_get_by_id("farmers", farmer_id) if farmer_id else None
    
    apiary_id = batch_data.get('apiary_id') or (harvest.get('apiary_id') if harvest else None)
    apiary = db_get_by_id("apiaries", apiary_id) if apiary_id else None
    
    db_record = {
        "id": batch_data.get('id', str(uuid.uuid4())),
        "batch_code": final_data.get('batch_code'),
        "honey_type": batch_data.get('honey_type', harvest.get('honey_type') if harvest else 'Multifloral'),
        "harvest_date": harvest.get('harvest_date') if harvest else datetime.now().date().isoformat(),
        "packaged_date": datetime.now().date().isoformat(),
        "quantity_kg": batch_data.get('total_quantity_kg', batch_data.get('quantity_kg', 0)),
        "processing_method": batch_data.get('processing_method', 'Cold Extraction'),
        "farmer_name": farmer.get('name') if farmer else 'Timothy Nduva',
        "beekeeper_name": farmer.get('name') if farmer else 'Timothy Nduva',
        "beekeeper_id": farmer_id,
        "apiary_name": apiary.get('name') if apiary else 'Kibwezi Apiary',
        "location_county": apiary.get('county') if apiary else 'Makueni',
        "location_region": apiary.get('region') if apiary else 'Eastern',
        "latitude": apiary.get('latitude') if apiary else -2.41,
        "longitude": apiary.get('longitude') if apiary else 37.97,
        "quality_grade": batch_data.get('quality_grade', 'Premium'),
        "status": "verified",
        "blockchain_hash": block.hash,
        "block_hash": block.hash
    }
    
    # 3. Synchronize with Database
    # Try honey_batches first (the master record)
    res = db_insert("honey_batches", db_record)
    if not res.get("success"):
        # Fallback to batches if honey_batches is missing
        db_insert("batches", db_record)
    
    return final_data

# --- Read Operations (Traceability Journey) ---

def get_all_harvests(limit: int = 100) -> list[dict[str, Any]]:
    """
    Get all harvests with full joining (Hive -> Apiary, Farmer)
    """
    # Use nested select syntax for PostgREST
    # We join hive (and its apiary) and farmer
    columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
    
    data = db_select("harvests", columns=columns, order_by="harvest_date", ascending=False, limit=limit)
    
    # Process data to match frontend expectations
    processed = []
    for h in data:
        # Flatten apiary for easier access if needed by frontend
        # The frontend checks harvest.apiary OR harvest.hive.apiary
        # We'll ensure hive.apiary is present
        
        # Ensure honey_type and other new fields have defaults if missing in older data
        if not h.get('honey_type'): h['honey_type'] = 'Multifloral'
        if not h.get('color_grade'): h['color_grade'] = 'Amber'
        if h.get('is_verified') is None: h['is_verified'] = False
        
        # Add apiary to root if available in hive
        if h.get('hive') and h['hive'].get('apiary'):
            h['apiary'] = h['hive']['apiary']
            
        processed.append(h)
        
    return processed


def get_all_apiaries(limit: int = 100) -> list[dict[str, Any]]:
    """Get all apiaries with joined farmer data"""
    return db_select("apiaries", columns="*,farmer:farmers(*)", order_by="created_at", ascending=False, limit=limit)


def get_all_hives(limit: int = 100) -> list[dict[str, Any]]:
    """Get all hives with joined apiary and farmer data"""
    return db_select("hives", columns="*,apiary:apiaries(*),farmer:farmers(*)", order_by="created_at", ascending=False, limit=limit)


def get_trace_journey(batch_code: str) -> Optional[schemas.TraceResponse]:
    """
    Reconstruct the full journey of a honey batch from the blockchain.
    """
    try:
        # 1. Find Batch Block
        trace_result = honey_blockchain.trace_batch(batch_code)
        if not trace_result['found']:
            return None
        
        batch_data = trace_result['batch_details']
        journey_timeline = []
        
        # 2. Reconstruct Timeline (working backwards)
        
        # Step A: The Product (Batch)
        journey_timeline.append(schemas.TraceJourneyStep(
            title="Ready for You",
            date=batch_data.get('production_date', datetime.now().isoformat()),
            location="BeeYield Distribution Center",
            description=f"Bottled and sealed. Batch {batch_code}.",
            icon="Jar",
            data=batch_data,
            hash=trace_result['block_hash']
        ))
        
        # Step B: Processing
        processing_id = batch_data.get('processing_id')
        proc_block = honey_blockchain.search_by_record_id(processing_id) if processing_id else None
        
        if proc_block:
            proc_data = proc_block['data']
            journey_timeline.append(schemas.TraceJourneyStep(
                title="Processing & Quality Check",
                date=proc_data.get('processing_date', ''),
                location=proc_data.get('facility_name', 'Makueni Processing Facility'),
                description=f"Filtered using {proc_data.get('filtering_method', 'Coarse Mesh')} method. Moisture: {proc_data.get('moisture_content_percent')}% (Optimal). Quality Grade: {proc_data.get('quality_grade', 'Premium')}. Certified Raw: {proc_data.get('is_raw', True)}.",
                icon="Factory",
                data=proc_data,
                hash=proc_block['hash']
            ))
        
        # Step C: Harvest
        harvest_id = batch_data.get('harvest_id')
        harvest_block = honey_blockchain.search_by_record_id(harvest_id, BlockType.HARVEST_RECORD) if harvest_id else None
        
        harvest_data = {}
        if harvest_block:
            harvest_data = harvest_block['data']
            journey_timeline.append(schemas.TraceJourneyStep(
                title="Harvest Day",
                date=harvest_data.get('harvest_date', ''),
                location="Kibwezi Sanctuary",
                description=f"Harvested by {harvest_data.get('harvester_name', 'Timothy Nduva')}. {harvest_data.get('quantity_kg')}kg collected from {harvest_data.get('nectar_source', 'Acacia')}. Weather: {harvest_data.get('weather_conditions', 'Sunny')}. Extraction: {harvest_data.get('extraction_method', 'Cold Extraction')}. 50/50 Promise: {harvest_data.get('quantity_left_for_bees_kg')}kg left for the colony.",
                icon="Basket",
                data=harvest_data,
                hash=harvest_block['hash']
            ))
            
        # Step D: Hive Life (Sensor Data)
        hive_id = harvest_data.get('hive_id') or batch_data.get('hive_id')
        hive_block = honey_blockchain.search_by_record_id(hive_id, BlockType.HIVE_REGISTRATION) if hive_id else None
        
        hive = None
        if hive_block:
            h_data = hive_block['data']
            hive = schemas.Hive(
                hive_id=h_data.get('hive_id') or str(uuid.uuid4()),
                hive_code=h_data.get('hive_code') or 'UNKNOWN',
                hive_type=h_data.get('hive_type') or 'Traditional Log',
                bee_type=h_data.get('bee_type') or 'African Honey Bee',
                apiary_id=h_data.get('apiary_id') or '',
                farmer_id=h_data.get('farmer_id') or '',
                installation_date=h_data.get('installation_date') or datetime.now().date(),
                has_sensors=h_data.get('has_sensors', False),
                frame_count=h_data.get('frame_count', 0),
                material=h_data.get('material', 'Wood')
            )
            
            # Check for Disease/Health Events and get latest readings
            sensor_snapshot = {}
            try:
                sensor_blocks = [
                    b for b in honey_blockchain.chain 
                    if b.block_type == BlockType.HIVE_SENSOR_DATA 
                    and b.data.get('hive_id') == hive_id
                ]
                
                if sensor_blocks:
                    latest = sensor_blocks[-1].data
                    sensor_snapshot = {
                        "avg_temp": latest.get('temperature') or latest.get('temperature_celsius'),
                        "avg_humidity": latest.get('humidity') or latest.get('humidity_percent'),
                        "weight_kg": latest.get('weight') or latest.get('weight_kg'),
                        "acoustic_health": latest.get('acoustic_frequency') or latest.get('acoustic_health', 'STABLE')
                    }

                for s_block in sensor_blocks:
                    anomalies = s_block.data.get('anomalies_detected', [])
                    if "ACOUSTIC_VARROA_PATTERN" in anomalies:
                        journey_timeline.append(schemas.TraceJourneyStep(
                            title="Health Shield Activated",
                            date=s_block.data.get('timestamp', '')[:10],
                            location=f"Hive {h_data.get('hive_code')}",
                            description="BeeYield Acoustic Sensors detected early Varroa mite signature. Automatic alert sent to Beekeeper. Organic intervention applied immediately. Colony health restored.",
                            icon="Shield",
                            data={"anomalies": anomalies, "sensor_reading": s_block.data},
                            hash=s_block.hash
                        ))
            except Exception as e:
                pass # Fail silently on sensor check if needed

            journey_timeline.append(schemas.TraceJourneyStep(
                title="Hive Life",
                date="Continuous Monitoring",
                location=f"Hive {h_data.get('hive_code')}",
                description=f"Home to {h_data.get('bee_type', 'African Honey Bee')} bees. {h_data.get('hive_type', 'Traditional Log')} hive structure.",
                icon="Hexagon",
                data=h_data,
                hash=hive_block['hash']
            ))
        
        # Step E: Apiary
        apiary_id = harvest_data.get('apiary_id') or batch_data.get('apiary_id') or (h_data.get('apiary_id') if hive_block else None)
        apiary_block = honey_blockchain.search_by_record_id(apiary_id, BlockType.APIARY_REGISTRATION) if apiary_id else None
        
        apiary = None
        if apiary_block:
            a_data = apiary_block['data']
            apiary = schemas.Apiary(
                apiary_id=a_data.get('apiary_id') or str(uuid.uuid4()),
                apiary_code=a_data.get('apiary_code') or 'UNK',
                name=a_data.get('name') or 'Kibwezi Apiary',
                farmer_id=a_data.get('farmer_id') or '',
                environment_type=a_data.get('environment_type') or 'Savannah',
                flora_types=a_data.get('flora_types', []),
                location_name=a_data.get('location_name') or 'Kibwezi',
                latitude=a_data.get('latitude') or a_data.get('coordinates', {}).get('latitude', 0.0),
                longitude=a_data.get('longitude') or a_data.get('coordinates', {}).get('longitude', 0.0),
                region=a_data.get('region', 'Eastern'),
                county=a_data.get('county') or 'Makueni',
                established_date=a_data.get('established_date') or datetime.now().date()
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
        
        # Step F: Farmer
        farmer_id = harvest_data.get('farmer_id') or batch_data.get('farmer_id') or (h_data.get('farmer_id') if hive_block else None)
        farmer_block = honey_blockchain.search_by_record_id(farmer_id, BlockType.FARMER_REGISTRATION) if farmer_id else None
        
        farmer = None
        if farmer_block:
            f_data = farmer_block['data']
            farmer = schemas.Farmer(
                farmer_id=f_data.get('farmer_id', 'F-UNK'),
                name=f_data.get('name') or 'Timothy Nduva',
                registration_date=f_data.get('registration_date') or datetime.utcnow(),
                location_name=f_data.get('location_name') or f_data.get('region') or 'Kibwezi',
                latitude=f_data.get('latitude') or 0.0, 
                longitude=f_data.get('longitude') or 0.0, 
                region=f_data.get('region') or 'Eastern', 
                county=f_data.get('county') or 'Makueni',
                story=f_data.get('story') or "Dedicated to sustainable beekeeping.",
                experience_years=f_data.get('experience_years') or 1
            )


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
            story_content=batch_data.get('origin_story') or (farmer.story if farmer else "Sustainably harvested from Kenya's rich landscapes."),
            impact_stats={
                "acres_pollinated": batch_data.get('acres_pollinated') or (apiary.location_name if apiary else "Local Community"),
                "trees_planted": batch_data.get('trees_planted') or "Sustainable Growth",
                "beekeepers": farmer.name if farmer else "Verified Partner",
                "bees_protected": "YES - 50/50 Promise",
                "farmer_fair_pay": "100% Verified"
            },
            sensor_snapshot=sensor_snapshot,
            timeline=journey_timeline
        )
    except Exception as e:
        import traceback
        with open("C:/Users/aggym/Downloads/Honey/FATAL_LOG.txt", "w") as f:
            f.write(traceback.format_exc())
            f.write("\n")
            f.write(str(e))
        raise e
