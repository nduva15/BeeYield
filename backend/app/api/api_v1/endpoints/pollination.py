"""
API endpoints for Precision Pollination module
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import List, Optional
from datetime import date

from app.core import security
from app.schemas import pollination as schemas
from app.services.pollination_service import pollination_service
from app.db.supabase_db import db_select, db_insert, db_update, db_delete

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


# ========== CROP REQUIREMENTS ==========

@router.get("/crops", response_model=List[schemas.CropPollinationRequirements])
async def get_crop_requirements(
    crop_name: Optional[str] = Query(None, description="Filter by crop name"),
    token: Optional[str] = Depends(get_token)
):
    """
    Get pollination requirements for crops.
    
    - **crop_name**: Optional filter by specific crop
    """
    return await pollination_service.get_crop_requirements(crop_name, token=token)


# ========== POLLINATION APIARIES ==========

@router.get("/apiaries", response_model=List[schemas.PollinationApiary])
async def get_pollination_apiaries(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all apiaries available for pollination.
    
    Returns apiaries with hive counts and availability for pollination contracts.
    """
    user_id = current_user.get("sub")
    return await pollination_service.get_pollination_apiaries(user_id=user_id, token=token)


@router.get("/apiaries/{apiary_id}", response_model=schemas.PollinationApiary)
async def get_pollination_apiary(
    apiary_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get a specific apiary with pollination-relevant data"""
    user_id = current_user.get("sub")
    apiary = await pollination_service.get_pollination_apiary(apiary_id, user_id=user_id, token=token)
    
    if not apiary:
        raise HTTPException(status_code=404, detail="Apiary not found")
    
    return apiary


@router.post("/apiaries", response_model=schemas.PollinationApiary, status_code=201)
async def create_pollination_apiary(
    apiary_data: schemas.PollinationApiaryCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new apiary for pollination operations.
    
    This creates a new apiary and associates it with the authenticated user.
    """
    user_id = current_user.get("sub")
    apiary = await pollination_service.create_pollination_apiary(apiary_data, user_id, token=token)
    
    if not apiary:
        raise HTTPException(status_code=500, detail="Failed to create apiary")
    
    return apiary


@router.put("/apiaries/{apiary_id}", response_model=schemas.PollinationApiary)
async def update_pollination_apiary(
    apiary_id: str,
    apiary_data: schemas.PollinationApiaryUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing pollination apiary"""
    apiary = await pollination_service.update_pollination_apiary(apiary_id, apiary_data, token=token)
    
    if not apiary:
        raise HTTPException(status_code=404, detail="Apiary not found or update failed")
    
    return apiary


@router.delete("/apiaries/{apiary_id}")
async def delete_pollination_apiary(
    apiary_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Delete (soft-delete) a pollination apiary"""
    success = await pollination_service.delete_pollination_apiary(apiary_id, token=token)
    
    if not success:
        raise HTTPException(status_code=404, detail="Apiary not found or deletion failed")
    
    return {"message": "Apiary deleted successfully"}


# ========== POLLINATION CALCULATOR ==========

@router.post("/calculate", response_model=schemas.PollinationCalculatorResult)
async def calculate_pollination_needs(
    input_data: schemas.PollinationCalculatorInput,
    token: Optional[str] = Depends(get_token)
):
    """
    Calculate pollination requirements based on crop type and acreage.
    
    - **crop_type**: Type of crop to pollinate
    - **acreage**: Size of farm in acres
    - **avg_frames_per_hive**: Average frames of bees per hive (6-12)
    - **weather_factor**: Weather adjustment factor (0.5-1.0)
    
    Returns detailed calculations including:
    - Number of hives needed
    - Target and actual FPA (Frames Per Acre)
    - Coverage health percentage
    - Foraging efficiency
    - Colony strength category
    """
    return await pollination_service.calculate_pollination_needs(input_data, token=token)


@router.post("/bloom", response_model=schemas.BloomSimulationResult)
async def simulate_bloom_pollination(
    input_data: schemas.BloomSimulationInput,
):
    """
    Simulate bloom-period pollination output for a single colony.

    Captures the bloom-management effects of hive orientation, cover crops,
    and pesticide stewardship on active foragers and forager-hours.
    """
    return await pollination_service.simulate_bloom(input_data)


# ========== FLIGHT OPTIMIZATION (AHP / SPATIAL) ==========

@router.post("/optimize", response_model=List[schemas.PollinationPlacementResult])
async def optimize_hive_placement(
    request: schemas.PollinationOptimizationRequest,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Run the Spatial Optimizer engine using a Greedy Algorithm.
    Given an orchard boundary (GeoJSON), target crop, and number of hives to deploy,
    generates optimal latitude/longitude placements minimizing overlap and maximizing coverage.
    """
    from app.services.spatial_optimizer import SpatialOptimizer, OptimizerConfig

    configKwargs = {}
    if request.bee_flight_radius_km is not None:
        configKwargs['bee_flight_radius_km'] = request.bee_flight_radius_km
    if request.ahp_weights is not None:
        configKwargs['ahp_weights'] = request.ahp_weights
    if request.bloom_intensity is not None:
        configKwargs['bloom_intensity'] = request.bloom_intensity
    if request.forage_condition is not None:
        configKwargs['forage_condition'] = request.forage_condition

    optimizer = SpatialOptimizer(OptimizerConfig(**configKwargs))
    
    # optimize_placement returns a list of PlacementResult Pydantic models.
    # The endpoint response_model schemas.PollinationPlacementResult matches it exactly.
    placements = optimizer.optimize_placement(
        orchard_geojson=request.orchard_geojson,
        hive_count=request.hive_count,
        target_crop=request.target_crop
    )
    
    return [p.dict() for p in placements]

# ========== CONTRACTS ==========

@router.get("/contracts", response_model=List[schemas.PollinationContract])
async def get_contracts(
    status: Optional[str] = Query(None, description="Filter by contract status"),
    farmer_id: Optional[str] = Query(None, description="Filter by farmer ID"),
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all pollination contracts for the authenticated user.
    
    - **status**: Optional filter by status (pending, active, completed, cancelled)
    - **farmer_id**: Optional filter by farmer
    """
    user_id = current_user.get("sub")
    return await pollination_service.get_contracts(
        user_id=user_id,
        status=status,
        farmer_id=farmer_id,
        token=token
    )


@router.post("/contracts", response_model=schemas.PollinationContract)
async def create_contract(
    contract_data: schemas.PollinationContractCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new pollination contract.
    
    Requires authentication. The contract will be associated with the authenticated user.
    """
    user_id = current_user.get("sub")
    contract = await pollination_service.create_contract(contract_data, user_id, token=token)
    
    if not contract:
        raise HTTPException(status_code=500, detail="Failed to create contract")
    
    return contract


@router.get("/contracts/{contract_id}", response_model=schemas.PollinationContract)
async def get_contract(
    contract_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get a specific pollination contract by ID"""
    user_id = current_user.get("sub")
    contracts = await pollination_service.get_contracts(user_id=user_id, token=token)
    
    contract = next((c for c in contracts if c.id == contract_id), None)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return contract


@router.put("/contracts/{contract_id}", response_model=schemas.PollinationContract)
async def update_contract(
    contract_id: str,
    contract_data: schemas.PollinationContractUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing pollination contract"""
    contract = await pollination_service.update_contract(contract_id, contract_data, token=token)
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found or update failed")
    
    return contract


@router.delete("/contracts/{contract_id}")
async def delete_contract(
    contract_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Delete a pollination contract"""
    success = await pollination_service.delete_contract(contract_id, token=token)
    
    if not success:
        raise HTTPException(status_code=404, detail="Contract not found or deletion failed")
    
    return {"message": "Contract deleted successfully"}


# ========== HIVE ASSIGNMENTS ==========

@router.get("/assignments", response_model=List[schemas.HiveAssignment])
async def get_hive_assignments(
    contract_id: Optional[str] = Query(None, description="Filter by contract ID"),
    hive_id: Optional[str] = Query(None, description="Filter by hive ID"),
    active_only: bool = Query(False, description="Show only active assignments"),
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get hive assignments.
    
    - **contract_id**: Optional filter by contract
    - **hive_id**: Optional filter by hive
    - **active_only**: Show only assignments without removal date
    """
    return await pollination_service.get_hive_assignments(
        contract_id=contract_id,
        hive_id=hive_id,
        active_only=active_only,
        token=token
    )


@router.post("/assignments", response_model=schemas.HiveAssignment)
async def assign_hive(
    assignment_data: schemas.HiveAssignmentCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Assign a hive to a pollination contract.
    
    This will:
    - Create the assignment record
    - Update the contract's deployed hive count
    - Log the activity
    """
    assignment = await pollination_service.assign_hive(assignment_data, token=token)
    
    if not assignment:
        raise HTTPException(status_code=500, detail="Failed to assign hive")
    
    return assignment


@router.put("/assignments/{assignment_id}/remove")
async def remove_hive_assignment(
    assignment_id: str,
    removal_date: date = Query(..., description="Date when hive was removed"),
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Remove a hive from a pollination contract by setting the removal date.
    
    This will:
    - Update the assignment with removal date
    - Update the contract's deployed hive count
    - Log the activity
    """
    success = await pollination_service.remove_hive_assignment(assignment_id, removal_date, token=token)
    
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found or removal failed")
    
    return {"message": "Hive removed from contract successfully"}


@router.put("/assignments/{assignment_id}", response_model=schemas.HiveAssignment)
async def update_hive_assignment(
    assignment_id: str,
    assignment_data: schemas.HiveAssignmentUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Update a hive assignment.
    
    Allows updating placement location, coordinates, and notes.
    """
    assignment = await pollination_service.update_hive_assignment(assignment_id, assignment_data, token=token)
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or update failed")
    
    return assignment


# ========== HIVE SENSOR DATA ==========

@router.get("/hive-sensors", response_model=List[schemas.HiveSensorData])
async def get_hive_sensor_data(
    contract_id: Optional[str] = Query(None, description="Get sensors for hives in this contract"),
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get real-time sensor data for hives.
    
    - **contract_id**: Optional filter to get only hives assigned to a specific contract
    
    Returns sensor readings including:
    - Acoustics (Hz)
    - Temperature (°C)
    - Humidity (%)
    - Flight activity (VPM - Visits Per Minute)
    - Queen status
    - Hive health status
    """
    return await pollination_service.get_hive_sensor_data(contract_id=contract_id, token=token)


# ========== ANALYTICS ==========

@router.get("/analytics", response_model=schemas.PollinationAnalytics)
async def get_analytics(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get comprehensive analytics for pollination operations.
    
    Returns:
    - Total and active contracts
    - Total hives deployed
    - Total acres covered
    - Average FPA (Frames Per Acre)
    - Coverage health percentage
    - Hive health statistics (healthy, warning, critical)
    - Total revenue
    """
    user_id = current_user.get("sub")
    return await pollination_service.get_analytics(user_id=user_id, token=token)


# ========== ACTIVITY LOGS ==========

@router.get("/activity-logs", response_model=List[schemas.PollinationActivityLog])
async def get_activity_logs(
    contract_id: Optional[str] = Query(None, description="Filter by contract ID"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of logs to return"),
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get activity logs for pollination operations.
    
    - **contract_id**: Optional filter by contract
    - **limit**: Maximum number of logs to return (1-200)
    
    Activity types include:
    - contract_created
    - hive_deployed
    - hive_removed
    - inspection
    - alert
    - payment
    """
    return await pollination_service.get_activity_logs(
        contract_id=contract_id,
        limit=limit,
        token=token
    )


# ========== DASHBOARD DATA ==========

@router.get("/dashboard", response_model=schemas.PollinationDashboardData)
async def get_dashboard_data(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get complete dashboard data for precision pollination.
    
    This is a convenience endpoint that returns all data needed for the dashboard:
    - Active contracts
    - Hive sensor data
    - Analytics
    - Recent activity logs
    - Crop requirements
    """
    user_id = current_user.get("sub")
    
    # Get all data
    contracts = await pollination_service.get_contracts(user_id=user_id, status='active', token=token)
    hive_sensor_data = await pollination_service.get_hive_sensor_data(token=token)
    analytics = await pollination_service.get_analytics(user_id=user_id, token=token)
    recent_activities = await pollination_service.get_activity_logs(limit=20, token=token)
    crop_requirements = await pollination_service.get_crop_requirements(token=token)
    
    return schemas.PollinationDashboardData(
        contracts=contracts,
        hive_sensor_data=hive_sensor_data,
        analytics=analytics,
        recent_activities=recent_activities,
        crop_requirements=crop_requirements
    )


# ========== DEPLOYMENTS (Tactical plans) ==========

@router.get("/deployments", response_model=List[schemas.PollinationDeployment])
async def list_deployments(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    rows = await db_select("pollination_deployments", filters={"user_id": user_id}, order_by="created_at", ascending=False, limit=1000, token=token)
    return [schemas.PollinationDeployment(**r) for r in rows]


@router.post("/deployments", response_model=schemas.PollinationDeployment, status_code=201)
async def create_deployment(
    body: schemas.PollinationDeploymentCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    payload = body.model_dump()
    payload["user_id"] = user_id
    res = await db_insert("pollination_deployments", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create deployment"))
    rows = res.get("data") or []
    created = rows[0] if isinstance(rows, list) and rows else payload
    return schemas.PollinationDeployment(**created)


@router.patch("/deployments/{deployment_id}", response_model=schemas.PollinationDeployment)
async def update_deployment(
    deployment_id: str,
    body: schemas.PollinationDeploymentUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    existing = await db_select("pollination_deployments", filters={"id": deployment_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Deployment not found")

    patch = body.model_dump(exclude_unset=True)
    if not patch:
        return schemas.PollinationDeployment(**existing[0])
    patch["updated_at"] = __import__("datetime").datetime.utcnow().isoformat()
    res = await db_update("pollination_deployments", patch, {"id": deployment_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update deployment"))
    rows = res.get("data") or []
    updated = rows[0] if isinstance(rows, list) and rows else existing[0]
    return schemas.PollinationDeployment(**updated)


@router.delete("/deployments/{deployment_id}", status_code=204)
async def delete_deployment(
    deployment_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    existing = await db_select("pollination_deployments", filters={"id": deployment_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Deployment not found")

    res = await db_delete("pollination_deployments", {"id": deployment_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete deployment"))
    return None
