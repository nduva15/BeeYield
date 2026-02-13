"""
Traceability Endpoints - Powered by BeeYield Blockchain
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from typing import Optional, Any
from app.schemas import traceability as schemas
from app.services import traceability_service
from app.blockchain.honey_chain import honey_blockchain

router = APIRouter()

@router.get("/code/{code}", response_model=schemas.TraceResponse)
def get_trace_by_code(code: str, request: Request, background_tasks: BackgroundTasks):
    """
    Public endpoint to trace honey by its batch code (e.g. from jar).
    Returns full journey: Farmer -> Apiary -> Hive -> Harvest -> Processing.
    """
    from app.db.clickhouse_db import track_traceability_scan
    
    print(f"Trace Request for Code: {code}")
    result = traceability_service.get_trace_journey(code)
    
    if result:
        print(f"Found in Blockchain: {code}")
        background_tasks.add_task(track_traceability_scan, code)
        return result
        
    background_tasks.add_task(track_traceability_scan, code)
    print(f"[ERROR] Code Not Found: {code}")

    raise HTTPException(status_code=404, detail=f"Traceability code '{code}' not found. Please verify the code on your jar.")

@router.get("/chain", response_model=dict[str, Any])
def get_blockchain_status():
    """
    Get current status and stats of the BeeYield Blockchain.
    Transparency endpoint.
    """
    return {
        "status": "active",
        "stats": honey_blockchain.get_chain_stats(),
        "latest_blocks": honey_blockchain.get_chain_history(limit=5)
    }

@router.post("/farmers", response_model=dict[str, Any])
def create_farmer(farmer_in: schemas.FarmerCreate):
    """Register a new farmer/beekeeper."""
    return traceability_service.register_farmer(farmer_in)

@router.post("/apiaries", response_model=dict[str, Any])
def create_apiary(apiary_in: schemas.ApiaryCreate):
    """Register a new apiary location."""
    return traceability_service.register_apiary(apiary_in)

@router.post("/hives", response_model=dict[str, Any])
def create_hive(hive_in: schemas.HiveCreate):
    """Register a new hive."""
    return traceability_service.register_hive(hive_in)

@router.post("/sensors", response_model=dict[str, Any])
def record_sensor_data(sensor_in: schemas.HiveSensorData):
    """Record IoT sensor data for a hive."""
    return traceability_service.record_sensor_data(sensor_in)

@router.post("/harvests", response_model=dict[str, Any])
def record_harvest(harvest_in: schemas.HarvestCreate):
    """Record a harvest."""
    return traceability_service.record_harvest(harvest_in)

@router.get("/harvests", response_model=list[dict[str, Any]])
def get_harvests(limit: int = 100):
    """Get all harvests with full joined data for dashboard."""
    return traceability_service.get_all_harvests(limit=limit)

@router.get("/apiaries", response_model=list[dict[str, Any]])
def get_apiaries(limit: int = 100):
    """Get all apiaries."""
    return traceability_service.get_all_apiaries(limit=limit)

@router.get("/hives", response_model=list[dict[str, Any]])
def get_hives(limit: int = 100):
    """Get all hives."""
    return traceability_service.get_all_hives(limit=limit)

@router.post("/batches", response_model=dict[str, Any])
def create_batch(batch_in: dict[str, Any]):
    """Create a final product batch."""
    return traceability_service.create_batch(batch_in)


@router.get("/batches", response_model=list[dict[str, Any]])
def get_batches(limit: int = 100):
    """Get all honey batches."""
    return traceability_service.get_all_batches(limit=limit)


# ==================== POLYGON BLOCKCHAIN ENDPOINTS ====================

@router.get("/polygon/status", response_model=dict[str, Any])
def get_polygon_status():
    """
    Get Polygon network connection status.
    Returns network info, connection state, and cached anchor count.
    """
    from app.services.polygon_service import polygon_service
    return polygon_service.get_network_status()


@router.get("/polygon/verify/{batch_code}", response_model=dict[str, Any])
def verify_on_polygon(batch_code: str):
    """
    Verify a batch's anchoring status on the Polygon blockchain.
    Returns verification details including tx hash and PolygonScan URL.
    """
    from app.services.polygon_service import polygon_service
    return polygon_service.verify_batch_on_chain(batch_code)


@router.post("/polygon/anchor/{batch_code}", response_model=dict[str, Any])
def anchor_to_polygon(batch_code: str, background_tasks: BackgroundTasks):
    """
    Manually anchor a batch hash to the Polygon blockchain.
    This creates an immutable public record of the batch.
    """
    from app.services.polygon_service import polygon_service
    
    # Get batch data from HoneyChain
    trace_result = honey_blockchain.trace_batch(batch_code)
    
    if not trace_result.get('found'):
        raise HTTPException(status_code=404, detail=f"Batch '{batch_code}' not found in HoneyChain")
    
    # Compute hash from batch data
    batch_data = trace_result.get('batch_details', {})
    data_hash = polygon_service.compute_batch_hash(batch_code, batch_data)
    
    # Anchor to Polygon
    result = polygon_service.anchor_batch_hash(
        batch_code=batch_code,
        data_hash=data_hash,
        metadata={
            "honeychain_block": trace_result.get('block_hash'),
            "honey_type": batch_data.get('honey_type'),
            "farmer_id": batch_data.get('farmer_id')
        }
    )
    
    return result


@router.get("/polygon/anchors", response_model=list[dict[str, Any]])
def get_all_polygon_anchors(limit: int = 50):
    """
    Get all batches anchored to Polygon.
    Returns list of anchored batches with their verification details.
    """
    from app.services.polygon_service import polygon_service
    return polygon_service.get_all_anchors(limit=limit)

