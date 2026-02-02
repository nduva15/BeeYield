"""
API endpoints for Precision Pollination module
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import date

from app.core import security
from app.schemas import pollination as schemas
from app.services.pollination_service import pollination_service

router = APIRouter()


# ========== CROP REQUIREMENTS ==========

@router.get("/crops", response_model=List[schemas.CropPollinationRequirements])
def get_crop_requirements(
    crop_name: Optional[str] = Query(None, description="Filter by crop name")
):
    """
    Get pollination requirements for crops.
    
    - **crop_name**: Optional filter by specific crop
    """
    return pollination_service.get_crop_requirements(crop_name)


# ========== POLLINATION APIARIES ==========

@router.get("/apiaries", response_model=List[schemas.PollinationApiary])
def get_pollination_apiaries(
    current_user: dict = Depends(security.get_current_user)
):
    """
    Get all apiaries available for pollination.
    
    Returns apiaries with hive counts and availability for pollination contracts.
    """
    user_id = current_user.get("sub")
    return pollination_service.get_pollination_apiaries(user_id=user_id)


@router.get("/apiaries/{apiary_id}", response_model=schemas.PollinationApiary)
def get_pollination_apiary(
    apiary_id: str,
    current_user: dict = Depends(security.get_current_user)
):
    """Get a specific apiary with pollination-relevant data"""
    user_id = current_user.get("sub")
    apiary = pollination_service.get_pollination_apiary(apiary_id, user_id=user_id)
    
    if not apiary:
        raise HTTPException(status_code=404, detail="Apiary not found")
    
    return apiary


@router.post("/apiaries", response_model=schemas.PollinationApiary, status_code=201)
def create_pollination_apiary(
    apiary_data: schemas.PollinationApiaryCreate,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Create a new apiary for pollination operations.
    
    This creates a new apiary and associates it with the authenticated user.
    """
    user_id = current_user.get("sub")
    apiary = pollination_service.create_pollination_apiary(apiary_data, user_id)
    
    if not apiary:
        raise HTTPException(status_code=500, detail="Failed to create apiary")
    
    return apiary


@router.put("/apiaries/{apiary_id}", response_model=schemas.PollinationApiary)
def update_pollination_apiary(
    apiary_id: str,
    apiary_data: schemas.PollinationApiaryUpdate,
    current_user: dict = Depends(security.get_current_user)
):
    """Update an existing pollination apiary"""
    apiary = pollination_service.update_pollination_apiary(apiary_id, apiary_data)
    
    if not apiary:
        raise HTTPException(status_code=404, detail="Apiary not found or update failed")
    
    return apiary


@router.delete("/apiaries/{apiary_id}")
def delete_pollination_apiary(
    apiary_id: str,
    current_user: dict = Depends(security.get_current_user)
):
    """Delete (soft-delete) a pollination apiary"""
    success = pollination_service.delete_pollination_apiary(apiary_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Apiary not found or deletion failed")
    
    return {"message": "Apiary deleted successfully"}


# ========== POLLINATION CALCULATOR ==========

@router.post("/calculate", response_model=schemas.PollinationCalculatorResult)
def calculate_pollination_needs(
    input_data: schemas.PollinationCalculatorInput
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
    return pollination_service.calculate_pollination_needs(input_data)


# ========== CONTRACTS ==========

@router.get("/contracts", response_model=List[schemas.PollinationContract])
def get_contracts(
    status: Optional[str] = Query(None, description="Filter by contract status"),
    farmer_id: Optional[str] = Query(None, description="Filter by farmer ID"),
    current_user: dict = Depends(security.get_current_user)
):
    """
    Get all pollination contracts for the authenticated user.
    
    - **status**: Optional filter by status (pending, active, completed, cancelled)
    - **farmer_id**: Optional filter by farmer
    """
    user_id = current_user.get("sub")
    return pollination_service.get_contracts(
        user_id=user_id,
        status=status,
        farmer_id=farmer_id
    )


@router.post("/contracts", response_model=schemas.PollinationContract)
def create_contract(
    contract_data: schemas.PollinationContractCreate,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Create a new pollination contract.
    
    Requires authentication. The contract will be associated with the authenticated user.
    """
    user_id = current_user.get("sub")
    contract = pollination_service.create_contract(contract_data, user_id)
    
    if not contract:
        raise HTTPException(status_code=500, detail="Failed to create contract")
    
    return contract


@router.get("/contracts/{contract_id}", response_model=schemas.PollinationContract)
def get_contract(
    contract_id: str,
    current_user: dict = Depends(security.get_current_user)
):
    """Get a specific pollination contract by ID"""
    user_id = current_user.get("sub")
    contracts = pollination_service.get_contracts(user_id=user_id)
    
    contract = next((c for c in contracts if c.id == contract_id), None)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return contract


@router.put("/contracts/{contract_id}", response_model=schemas.PollinationContract)
def update_contract(
    contract_id: str,
    contract_data: schemas.PollinationContractUpdate,
    current_user: dict = Depends(security.get_current_user)
):
    """Update an existing pollination contract"""
    contract = pollination_service.update_contract(contract_id, contract_data)
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found or update failed")
    
    return contract


@router.delete("/contracts/{contract_id}")
def delete_contract(
    contract_id: str,
    current_user: dict = Depends(security.get_current_user)
):
    """Delete a pollination contract"""
    success = pollination_service.delete_contract(contract_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Contract not found or deletion failed")
    
    return {"message": "Contract deleted successfully"}


# ========== HIVE ASSIGNMENTS ==========

@router.get("/assignments", response_model=List[schemas.HiveAssignment])
def get_hive_assignments(
    contract_id: Optional[str] = Query(None, description="Filter by contract ID"),
    hive_id: Optional[str] = Query(None, description="Filter by hive ID"),
    active_only: bool = Query(False, description="Show only active assignments"),
    current_user: dict = Depends(security.get_current_user)
):
    """
    Get hive assignments.
    
    - **contract_id**: Optional filter by contract
    - **hive_id**: Optional filter by hive
    - **active_only**: Show only assignments without removal date
    """
    return pollination_service.get_hive_assignments(
        contract_id=contract_id,
        hive_id=hive_id,
        active_only=active_only
    )


@router.post("/assignments", response_model=schemas.HiveAssignment)
def assign_hive(
    assignment_data: schemas.HiveAssignmentCreate,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Assign a hive to a pollination contract.
    
    This will:
    - Create the assignment record
    - Update the contract's deployed hive count
    - Log the activity
    """
    assignment = pollination_service.assign_hive(assignment_data)
    
    if not assignment:
        raise HTTPException(status_code=500, detail="Failed to assign hive")
    
    return assignment


@router.put("/assignments/{assignment_id}/remove")
def remove_hive_assignment(
    assignment_id: str,
    removal_date: date = Query(..., description="Date when hive was removed"),
    current_user: dict = Depends(security.get_current_user)
):
    """
    Remove a hive from a pollination contract by setting the removal date.
    
    This will:
    - Update the assignment with removal date
    - Update the contract's deployed hive count
    - Log the activity
    """
    success = pollination_service.remove_hive_assignment(assignment_id, removal_date)
    
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found or removal failed")
    
    return {"message": "Hive removed from contract successfully"}


@router.put("/assignments/{assignment_id}", response_model=schemas.HiveAssignment)
def update_hive_assignment(
    assignment_id: str,
    assignment_data: schemas.HiveAssignmentUpdate,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Update a hive assignment.
    
    Allows updating placement location, coordinates, and notes.
    """
    assignment = pollination_service.update_hive_assignment(assignment_id, assignment_data)
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or update failed")
    
    return assignment


# ========== HIVE SENSOR DATA ==========

@router.get("/hive-sensors", response_model=List[schemas.HiveSensorData])
def get_hive_sensor_data(
    contract_id: Optional[str] = Query(None, description="Get sensors for hives in this contract"),
    current_user: dict = Depends(security.get_current_user)
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
    return pollination_service.get_hive_sensor_data(contract_id=contract_id)


# ========== ANALYTICS ==========

@router.get("/analytics", response_model=schemas.PollinationAnalytics)
def get_analytics(
    current_user: dict = Depends(security.get_current_user)
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
    return pollination_service.get_analytics(user_id=user_id)


# ========== ACTIVITY LOGS ==========

@router.get("/activity-logs", response_model=List[schemas.PollinationActivityLog])
def get_activity_logs(
    contract_id: Optional[str] = Query(None, description="Filter by contract ID"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of logs to return"),
    current_user: dict = Depends(security.get_current_user)
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
    return pollination_service.get_activity_logs(
        contract_id=contract_id,
        limit=limit
    )


# ========== DASHBOARD DATA ==========

@router.get("/dashboard", response_model=schemas.PollinationDashboardData)
def get_dashboard_data(
    current_user: dict = Depends(security.get_current_user)
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
    contracts = pollination_service.get_contracts(user_id=user_id, status='active')
    hive_sensor_data = pollination_service.get_hive_sensor_data()
    analytics = pollination_service.get_analytics(user_id=user_id)
    recent_activities = pollination_service.get_activity_logs(limit=20)
    crop_requirements = pollination_service.get_crop_requirements()
    
    return schemas.PollinationDashboardData(
        contracts=contracts,
        hive_sensor_data=hive_sensor_data,
        analytics=analytics,
        recent_activities=recent_activities,
        crop_requirements=crop_requirements
    )
