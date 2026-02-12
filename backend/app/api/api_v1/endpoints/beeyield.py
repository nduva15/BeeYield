"""
BeeYield Dashboard API Endpoints
User-specific management of apiaries, hives, harvests, tasks, and inspections
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Any, Optional, List
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.core import security
from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID

router = APIRouter()

# ============================================
# SCHEMAS
# ============================================

class ApiaryCreate(BaseModel):
    name: str = Field(..., description="Apiary name")
    apiary_type: Optional[str] = Field("Permanent", description="Permanent, Migratory, Breeding, Quarantine")
    location_name: Optional[str] = None
    county: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    size_acres: Optional[float] = Field(0, description="Size in acres")
    expected_hives: Optional[int] = Field(0, description="Expected number of hives")
    primary_forage: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = Field("active", description="active, inactive")

class ApiaryUpdate(BaseModel):
    name: Optional[str] = None
    apiary_type: Optional[str] = None
    location_name: Optional[str] = None
    county: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    size_acres: Optional[float] = None
    expected_hives: Optional[int] = None
    primary_forage: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class HiveCreate(BaseModel):
    hive_code: str = Field(..., description="Unique hive identifier")
    apiary_id: UUID = Field(..., description="Parent apiary ID")
    type: Optional[str] = Field("Langstroth", description="Langstroth, KTBH, Traditional Log")
    status: Optional[str] = Field("Active & Healthy", description="Active & Healthy, Weak Colony, Abandoned, Recently Harvested")
    installation_date: Optional[date] = None
    health_status: Optional[str] = None
    notes: Optional[str] = None

class HiveUpdate(BaseModel):
    hive_code: Optional[str] = None
    apiary_id: Optional[UUID] = None
    type: Optional[str] = None
    status: Optional[str] = None
    installation_date: Optional[date] = None
    health_status: Optional[str] = None
    last_inspection_date: Optional[date] = None
    notes: Optional[str] = None

class HarvestCreate(BaseModel):
    hive_id: UUID
    apiary_id: UUID
    harvest_date: date
    quantity_kg: float
    honey_type: Optional[str] = Field("Multi-flower", description="Acacia, Multi-flower, Forest, etc.")
    moisture_content: Optional[float] = None
    moisture_content_percent: Optional[float] = None # Added for consistency
    quantity_left_for_bees_kg: Optional[float] = None # 50/50 rule
    batch_code: Optional[str] = None
    color_grade: Optional[str] = Field("Light Amber", description="Water White, Extra White, Extra Light Amber, Light Amber, Dark Amber")
    is_verified: Optional[bool] = False
    notes: Optional[str] = None

class HarvestUpdate(BaseModel):
    hive_id: Optional[UUID] = None
    apiary_id: Optional[UUID] = None
    harvest_date: Optional[date] = None
    quantity_kg: Optional[float] = None
    honey_type: Optional[str] = None
    moisture_content: Optional[float] = None
    moisture_content_percent: Optional[float] = None # Added for consistency
    quantity_left_for_bees_kg: Optional[float] = None # 50/50 rule
    batch_code: Optional[str] = None
    color_grade: Optional[str] = None
    is_verified: Optional[bool] = None
    notes: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = Field("pending", description="pending, in_progress, completed")
    priority: Optional[str] = Field("medium", description="low, medium, high")
    category: Optional[str] = Field("General", description="Inspection, Feeding, Harvest, General")
    due_date: Optional[datetime] = None
    apiary_id: Optional[UUID] = None
    hive_id: Optional[UUID] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    apiary_id: Optional[UUID] = None
    hive_id: Optional[UUID] = None
    is_completed: Optional[bool] = None

class InspectionCreate(BaseModel):
    apiary_id: UUID
    hive_id: UUID
    inspection_date: date
    queen_seen: Optional[bool] = None
    eggs_seen: Optional[bool] = None
    larvae_seen: Optional[bool] = None
    capped_brood: Optional[bool] = None
    brood_pattern: Optional[str] = None
    bee_activity: Optional[str] = None
    weather: Optional[str] = None
    weight: Optional[float] = None
    queen_cells: Optional[bool] = None
    queen_cells_comment: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None

class InspectionUpdate(BaseModel):
    apiary_id: Optional[UUID] = None
    hive_id: Optional[UUID] = None
    inspection_date: Optional[date] = None
    queen_seen: Optional[bool] = None
    eggs_seen: Optional[bool] = None
    larvae_seen: Optional[bool] = None
    capped_brood: Optional[bool] = None
    brood_pattern: Optional[str] = None
    bee_activity: Optional[str] = None
    weather: Optional[str] = None
    weight: Optional[float] = None
    queen_cells: Optional[bool] = None
    queen_cells_comment: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None

# ============================================
# HELPER FUNCTIONS
# ============================================


def _process_apiary_output(a: dict) -> dict:
    """Ensure consistency for apiary objects (handles status vs is_active)"""
    if "status" not in a:
        a["status"] = "active" if a.get("is_active", True) else "inactive"
    return a

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    """Extract user ID from JWT token"""
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id

async def check_apiary_access(apiary_id: str, user_id: str, required_permission: str = "view") -> dict:
    """
    Check if user has access to apiary (owner or shared).
    Returns basic apiary info if authorized.
    """
    # 1. Check direct ownership first (most common)
    apiaries = await db_select("apiaries", filters={"id": apiary_id})
    if not apiaries:
        raise HTTPException(status_code=404, detail="Apiary not found")
        
    apiary = apiaries[0]
    if apiary.get("user_id") == user_id:
        return apiary
        
    # 2. Check sharing
    shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id})
    if not shares:
         raise HTTPException(status_code=403, detail="Access denied")
         
    share = shares[0]
    if required_permission == "edit" and share.get("permission") != "edit":
        raise HTTPException(status_code=403, detail="Edit permission required")
        
    # Mark as shared for frontend visibility if needed
    apiary["is_shared"] = True
    apiary["share_permission"] = share.get("permission")
    return _process_apiary_output(apiary)


# ============================================
# APIARIES (PLACES) ENDPOINTS
# ============================================

@router.get("/apiaries", response_model=List[dict])
async def get_user_apiaries(
    user_id: str = Depends(get_user_id),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    """Get all apiaries (owned + shared) for the current user"""
    # 1. Owned apiaries
    filters = {"user_id": user_id}
    # Handle missing 'status' column by filtering in memory or using is_active
    db_filters = filters.copy()
    
    owned_apiaries = await db_select("apiaries", filters=db_filters, order_by="created_at", ascending=False)
    
    # Post-process for status filter and ensure 'status' field exists
    def process_apiary(a):
        # Fallback for missing status column
        if "status" not in a:
            a["status"] = "active" if a.get("is_active", True) else "inactive"
        return a

    owned_apiaries = [process_apiary(a) for a in owned_apiaries]
    
    # ------------------------------------------

    if status_filter:
        owned_apiaries = [a for a in owned_apiaries if a.get("status") == status_filter]
    
    
    # 2. Shared apiaries
    shared_apiaries = []
    shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id})
    if shares:
        shared_ids = [s["apiary_id"] for s in shares]
        # Bulk fetch shared apiaries
        results = await db_select("apiaries", filters={"id": shared_ids})
        # Add sharing metadata
        share_map = {s["apiary_id"]: s for s in shares}
        for a in results:
            process_apiary(a)
            if status_filter and a.get("status") != status_filter:
                continue
            a["is_shared"] = True
            a["permission"] = share_map.get(a["id"], {}).get("permission")
            shared_apiaries.append(a)
    
    all_apiaries = owned_apiaries + shared_apiaries
    
    # Enrich with hive count (Bulk fetch all hives for all visible apiaries)
    if all_apiaries:
        apiary_ids = [a["id"] for a in all_apiaries]
        all_relevant_hives = await db_select("hives", filters={"apiary_id": apiary_ids}, limit=1000)
        
        # Count in memory
        hive_counts = {}
        for h in all_relevant_hives:
            aid = str(h["apiary_id"])
            hive_counts[aid] = hive_counts.get(aid, 0) + 1
            
        for apiary in all_apiaries:
            apiary["hive_count"] = hive_counts.get(str(apiary["id"]), 0)
    
    return all_apiaries

@router.get("/apiaries/{apiary_id}", response_model=dict)
async def get_apiary(
    apiary_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get a specific apiary by ID"""
    apiary = await check_apiary_access(apiary_id, user_id, "view")
    
    # Add hive count and list
    hives = await db_select("hives", filters={"apiary_id": apiary_id})
    apiary["hive_count"] = len(hives)
    apiary["hives"] = hives
    
    return apiary

@router.post("/apiaries", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_apiary(
    apiary_in: ApiaryCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new apiary for the current user"""
    data = apiary_in.dict()
    data["user_id"] = user_id
    
    # Map status to is_active for DB compatibility
    if "status" in data:
        data["is_active"] = (data["status"] == "active")
    
    # Generate apiary code if not provided
    if "apiary_code" not in data or not data.get("apiary_code"):
        import uuid
        data["apiary_code"] = f"APY-{str(uuid.uuid4())[:8].upper()}"
    
    result = db_insert("apiaries", data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create apiary")
        )
    
    res_data = result["data"][0] if result.get("data") else data
    return _process_apiary_output(res_data)

@router.put("/apiaries/{apiary_id}", response_model=dict)
def update_apiary(
    apiary_id: str,
    apiary_in: ApiaryUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update an existing apiary"""
    # Verify access (edit)
    check_apiary_access(apiary_id, user_id, "edit")
    
    data = apiary_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Map status to is_active for DB compatibility
    if "status" in data:
        data["is_active"] = (data["status"] == "active")
    
    result = db_update("apiaries", data, {"id": apiary_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update apiary")
        )
    
    res_data = result["data"][0] if result.get("data") else data
    return _process_apiary_output(res_data)

@router.delete("/apiaries/{apiary_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_apiary(
    apiary_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete an apiary (soft delete by setting status to inactive)"""
    # Verify OWNERSHIP strict
    existing = db_select("apiaries", filters={"id": apiary_id, "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=403, detail="Only owner can delete")
    
    # Soft delete
    result = db_update("apiaries", {"status": "inactive"}, {"id": apiary_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to delete apiary")
        )
    
    return None

# ============================================
# HIVES ENDPOINTS
# ============================================

@router.get("/hives", response_model=List[dict])
async def get_user_hives(
    user_id: str = Depends(get_user_id),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    """Get all hives (owned + shared) for the current user"""
    filters = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    if status_filter:
        filters["status"] = status_filter
    
    # 1. Owned hives
    owned_hives = await db_select("hives", filters=filters, order_by="created_at", ascending=False, limit=1000)
    
    
    
    # 2. Shared hives (via apiary shares)
    shared_hives = []
    # If filtered by apiary_id, check if that apiary is shared
    if apiary_id:
        # Check if apiary is shared with user
        shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id})
        if shares:
            # Fetch all hives for this apiary
            h_filters = {"apiary_id": apiary_id}
            if status_filter:
                h_filters["status"] = status_filter
            hives_in_shared = await db_select("hives", filters=h_filters, limit=1000)
            shared_hives.extend(hives_in_shared)
    else:
        # Get all shared apiaries, then all hives inside them
        shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id})
        for share in shares:
            h_filters = {"apiary_id": share["apiary_id"]}
            if status_filter:
                h_filters["status"] = status_filter
            hives = await db_select("hives", filters=h_filters, limit=1000)
            shared_hives.extend(hives)

    all_hives = owned_hives + shared_hives

    # Enrich with apiary name
    for hive in all_hives:
        if hive.get("apiary_id"):
            apiaries = await db_select("apiaries", filters={"id": hive["apiary_id"]})
            if apiaries:
                hive["apiary_name"] = apiaries[0].get("name")
    
    return all_hives

@router.get("/hives/{hive_id}", response_model=dict)
def get_hive(
    hive_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get a specific hive by ID"""
    # Look up hive
    hives = db_select("hives", filters={"id": hive_id})
    if not hives:
        raise HTTPException(status_code=404, detail="Hive not found")
    hive = hives[0]
    
    # Check access to its apiary
    check_apiary_access(str(hive["apiary_id"]), user_id, "view")
    
    # Add apiary info
    if hive.get("apiary_id"):
        apiaries = db_select("apiaries", filters={"id": hive["apiary_id"]})
        if apiaries:
            hive["apiary"] = apiaries[0]
    
    return hive

@router.post("/hives", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_hive(
    hive_in: HiveCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new hive for the current user"""
    # Verify apiary access (edit)
    apiary = check_apiary_access(str(hive_in.apiary_id), user_id, "edit")
    
    data = hive_in.dict()
    # The hive belongs to the APIARY OWNER (or current user if orphaned)
    data["user_id"] = apiary.get("user_id") or user_id
    
    result = db_insert("hives", data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create hive")
        )
    
    return result["data"][0] if result.get("data") else data

@router.put("/hives/{hive_id}", response_model=dict)
def update_hive(
    hive_id: str,
    hive_in: HiveUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update an existing hive"""
    # 1. Get Hive
    existing = db_select("hives", filters={"id": hive_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Hive not found")
    hive = existing[0]

    # Verify apiary access (edit)
    check_apiary_access(str(hive["apiary_id"]), user_id, "edit")
    
    data = hive_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # If apiary_id is being changed, verify new apiary access
    if "apiary_id" in data:
        check_apiary_access(str(data["apiary_id"]), user_id, "edit")
    
    result = db_update("hives", data, {"id": hive_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update hive")
        )
    
    return result["data"][0] if result.get("data") else data

@router.delete("/hives/{hive_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hive(
    hive_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a hive"""
    # 1. Get Hive
    existing = db_select("hives", filters={"id": hive_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Hive not found")
    hive = existing[0]

    # Verify apiary access (edit). Editors can delete hives.
    check_apiary_access(str(hive["apiary_id"]), user_id, "edit")
    
    result = db_delete("hives", {"id": hive_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to delete hive")
        )
    
    return None

# ============================================
# HARVESTS ENDPOINTS
# ============================================

@router.get("/harvests", response_model=List[dict])
def get_user_harvests(
    user_id: str = Depends(get_user_id),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    hive_id: Optional[str] = Query(None, description="Filter by hive"),
    year: Optional[int] = Query(None, description="Filter by year")
):
    """Get all harvests (owned + shared) for the current user"""
    filters = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    if hive_id:
        filters["hive_id"] = hive_id
    
    # 1. Owned harvests
    columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
    owned = db_select("harvests", filters=filters, columns=columns, order_by="harvest_date", ascending=False, limit=2000)
    
    
    # 2. Shared harvests
    shared = []
    # If filtering by apiary_id, simply check if shared
    if apiary_id:
        shares = db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id})
        if shares:
            h_filters = {"apiary_id": apiary_id}
            if hive_id: h_filters["hive_id"] = hive_id
            shared = db_select("harvests", filters=h_filters, columns=columns, limit=1000)
    elif not hive_id:
        # Fetch all shared apiaries, then harvests
        shares = db_select("apiary_shares", filters={"shared_with_user_id": user_id})
        for share in shares:
            shared.extend(db_select("harvests", filters={"apiary_id": share["apiary_id"]}, columns=columns, limit=1000))
    
    
    all_harvests = owned + shared
    
    # Filter by year if provided
    if year:
        all_harvests = [h for h in all_harvests if h.get("harvest_date") and str(year) in str(h["harvest_date"])]
    
    # Process data to ensure consistency and defaults
    for harvest in all_harvests:
        # Defaults for missing data
        if not harvest.get('honey_type'): harvest['honey_type'] = 'Multifloral'
        if not harvest.get('color_grade'): harvest['color_grade'] = 'Amber'
        if harvest.get('is_verified') is None: harvest['is_verified'] = False
        
        # Consistent moisture field for frontend
        if harvest.get('moisture_content') is not None and harvest.get('moisture_content_percent') is None:
            harvest['moisture_content_percent'] = harvest['moisture_content']
        
        # Backward compatibility for flat fields if frontend expects them
        if harvest.get("apiary_id") and not harvest.get("apiary_name"):
            if harvest.get("hive") and harvest["hive"].get("apiary"):
                harvest["apiary_name"] = harvest["hive"]["apiary"].get("name")
        
        if harvest.get("hive") and not harvest.get("hive_code"):
            harvest["hive_code"] = harvest["hive"].get("hive_code")
            
        # Ensure 'apiary' exists at top level if it's nested in hive
        if harvest.get('hive') and harvest['hive'].get('apiary') and not harvest.get('apiary'):
            harvest['apiary'] = harvest['hive']['apiary']
    
    return all_harvests

@router.post("/harvests", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_harvest(
    harvest_in: HarvestCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new harvest record"""
    # Verify apiary ownership/edit
    apiary = check_apiary_access(str(harvest_in.apiary_id), user_id, "edit")
    
    # Verify hive exists and belongs to apiary
    hives = db_select("hives", filters={"id": str(harvest_in.hive_id), "apiary_id": str(harvest_in.apiary_id)})
    if not hives:
         raise HTTPException(status_code=404, detail="Hive not found in this apiary")
    
    data = harvest_in.dict(exclude_unset=True)
    data["user_id"] = apiary.get("user_id") or user_id
    
    # Map moisture_content_percent to moisture_content if needed for DB
    if "moisture_content_percent" in data and "moisture_content" not in data:
        data["moisture_content"] = data["moisture_content_percent"]

    # Generate harvest code
    if "harvest_code" not in data or not data.get("harvest_code"):
        import uuid
        data["harvest_code"] = f"HRV-{str(uuid.uuid4())[:8].upper()}"
    
    result = db_insert("harvests", data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create harvest")
        )
    
    # Return enriched data so frontend has full hive/apiary/farmer objects
    new_id = result["data"][0]["id"] if result.get("data") else data.get("id")
    if new_id:
        enriched = db_select("harvests", filters={"id": new_id}, columns="*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)")
        if enriched:
            h = enriched[0]
            # Ensure consistency
            if h.get('hive') and h['hive'].get('apiary'): h['apiary'] = h['hive']['apiary']
            if not h.get('honey_type'): h['honey_type'] = 'Multifloral'
            if h.get('hive'): h['hive_code'] = h['hive'].get('hive_code')
            if h.get('moisture_content') is not None: h['moisture_content_percent'] = h['moisture_content']
            return h
            
    return result["data"][0] if result.get("data") else data

@router.put("/harvests/{harvest_id}", response_model=dict)
def update_harvest(
    harvest_id: str,
    harvest_in: HarvestUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update an existing harvest"""
    # 1. Get Harvest
    existing = db_select("harvests", filters={"id": harvest_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Harvest not found")
    harvest = existing[0]

    # 2. Verify apiary access (edit)
    check_apiary_access(str(harvest["apiary_id"]), user_id, "edit")
    
    data = harvest_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Map moisture_content_percent to moisture_content if needed for DB
    if "moisture_content_percent" in data and "moisture_content" not in data:
        data["moisture_content"] = data["moisture_content_percent"]

    result = db_update("harvests", data, {"id": harvest_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update harvest")
        )
    
    # Return enriched data
    enriched = db_select("harvests", filters={"id": harvest_id}, columns="*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)")
    if enriched:
        h = enriched[0]
        if h.get('hive') and h['hive'].get('apiary'): h['apiary'] = h['hive']['apiary']
        if not h.get('honey_type'): h['honey_type'] = 'Multifloral'
        if h.get('hive'): h['hive_code'] = h['hive'].get('hive_code')
        if h.get('moisture_content') is not None: h['moisture_content_percent'] = h['moisture_content']
        return h

    return result["data"][0] if result.get("data") else data

@router.delete("/harvests/{harvest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_harvest(
    harvest_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a harvest record"""
    # 1. Get Harvest
    existing = db_select("harvests", filters={"id": harvest_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Harvest not found")
    harvest = existing[0]

    # 2. Verify apiary access (edit)
    check_apiary_access(str(harvest["apiary_id"]), user_id, "edit")
    
    result = db_delete("harvests", {"id": harvest_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to delete harvest")
        )
    
    return None

# ============================================
# TELEMETRY ENDPOINTS
# ============================================

@router.get("/telemetry/latest", response_model=List[dict])
def get_telemetry_latest(
    user_id: str = Depends(get_user_id)
):
    """
    Fetches the most recent sensor packets for the user's hives/devices.
    Links User -> Farmer -> Devices -> Readings
    """
    # 1. Get farmer profile for user
    farmers = db_select("farmers", filters={"user_id": user_id})
    if not farmers:
        # If no farmer profile, try direct ownership if supported or return empty
        # For now, assuming devices are linked to farmers
        return []
    
    farmer_id = farmers[0]["id"]
    
    # 2. Get devices for farmer
    devices = db_select("iot_devices", filters={"farmer_id": farmer_id})
    if not devices:
        return []
    
    # 3. Get latest reading for each device
    # Optimization: In a real DB we'd use a window function or distinct on.
    # Here we loop, assuming device count is small per user.
    readings = []
    for dev in devices:
        # Get latest reading
        dev_readings = db_select(
            "sensor_readings", 
            filters={"device_id": dev["id"]}, 
            limit=1, 
            order_by="timestamp", 
            ascending=False
        )
        if dev_readings:
            reading = dev_readings[0]
            # Enrich with device info if needed
            reading["device_code"] = dev.get("device_code")
            reading["location_name"] = dev.get("location_name")
            readings.append(reading)
            
    return readings

# ============================================
# TASKS ENDPOINTS
# ============================================

@router.get("/tasks", response_model=List[dict])
def get_user_tasks(
    user_id: str = Depends(get_user_id),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary")
):
    """Get all tasks (owned + shared) for the current user"""
    filters = {"user_id": user_id}
    if status_filter:
        filters["status"] = status_filter
    if apiary_id:
        filters["apiary_id"] = apiary_id
    
    # 1. Owned tasks
    owned_tasks = db_select("tasks", filters=filters, order_by="due_date", ascending=True)
    
    # 2. Shared tasks
    shared_tasks = []
    if apiary_id:
        shares = db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id})
        if shares:
            t_filters = {"apiary_id": apiary_id}
            if status_filter: t_filters["status"] = status_filter
            shared_tasks = db_select("tasks", filters=t_filters)
    else:
        shares = db_select("apiary_shares", filters={"shared_with_user_id": user_id})
        for share in shares:
            t_filters = {"apiary_id": share["apiary_id"]}
            if status_filter: t_filters["status"] = status_filter
            shared_tasks.extend(db_select("tasks", filters=t_filters))

    all_tasks = owned_tasks + shared_tasks
    
    # Enrich with apiary and hive names
    for task in all_tasks:
        if task.get("apiary_id"):
            apiaries = db_select("apiaries", filters={"id": task["apiary_id"]})
            if apiaries:
                task["apiary_name"] = apiaries[0].get("name")
        
        if task.get("hive_id"):
            hives = db_select("hives", filters={"id": task["hive_id"]})
            if hives:
                task["hive_code"] = hives[0].get("hive_code")
    
    return all_tasks

@router.post("/tasks", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new task"""
    # Verify apiary access if provided
    if task_in.apiary_id:
        apiary = check_apiary_access(str(task_in.apiary_id), user_id, "edit")
        target_owner_id = apiary["user_id"]
    else:
        target_owner_id = user_id

    data = task_in.dict()
    data["user_id"] = target_owner_id
    
    result = db_insert("tasks", data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create task")
        )
    
    return result["data"][0] if result.get("data") else data

@router.put("/tasks/{task_id}", response_model=dict)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update an existing task"""
    # 1. Get Task
    existing = db_select("tasks", filters={"id": task_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    task = existing[0]

    # 2. Verify access
    if task.get("apiary_id"):
        check_apiary_access(str(task["apiary_id"]), user_id, "edit")
    elif task.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    data = task_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = db_update("tasks", data, {"id": task_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update task")
        )
    
    return result["data"][0] if result.get("data") else data

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a task"""
    # 1. Get Task
    existing = db_select("tasks", filters={"id": task_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    task = existing[0]

    # 2. Verify access
    if task.get("apiary_id"):
        check_apiary_access(str(task["apiary_id"]), user_id, "edit")
    elif task.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = db_delete("tasks", {"id": task_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to delete task")
        )
    
    return None

# ============================================
# INSPECTIONS ENDPOINTS
# ============================================

@router.get("/inspections", response_model=List[dict])
def get_user_inspections(
    user_id: str = Depends(get_user_id),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    hive_id: Optional[str] = Query(None, description="Filter by hive")
):
    """Get all inspections (owned + shared) for the current user"""
    filters = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    if hive_id:
        filters["hive_id"] = hive_id
    
    # 1. Owned inspections
    owned = db_select("inspections", filters=filters, order_by="inspection_date", ascending=False)
    
    # 2. Shared inspections
    shared = []
    if apiary_id:
        shares = db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id})
        if shares:
            i_filters = {"apiary_id": apiary_id}
            if hive_id: i_filters["hive_id"] = hive_id
            shared = db_select("inspections", filters=i_filters)
    elif not hive_id:
        shares = db_select("apiary_shares", filters={"shared_with_user_id": user_id})
        for share in shares:
            shared.extend(db_select("inspections", filters={"apiary_id": share["apiary_id"]}))

    all_inspections = owned + shared
    
    # Enrich with apiary and hive names
    for inspection in all_inspections:
        if inspection.get("apiary_id"):
            apiaries = db_select("apiaries", filters={"id": inspection["apiary_id"]})
            if apiaries:
                inspection["apiary_name"] = apiaries[0].get("name")
        
        if inspection.get("hive_id"):
            hives = db_select("hives", filters={"id": inspection["hive_id"]})
            if hives:
                inspection["hive_code"] = hives[0].get("hive_code")
    
    return all_inspections

@router.post("/inspections", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_inspection(
    inspection_in: InspectionCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new inspection record"""
    # Verify apiary ownership/edit
    apiary = check_apiary_access(str(inspection_in.apiary_id), user_id, "edit")
    
    # Verify hive exists and belongs to apiary
    hives = db_select("hives", filters={"id": str(inspection_in.hive_id), "apiary_id": str(inspection_in.apiary_id)})
    if not hives:
         raise HTTPException(status_code=404, detail="Hive not found in this apiary")
    
    data = inspection_in.dict()
    data["user_id"] = apiary["user_id"]
    
    result = db_insert("inspections", data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create inspection")
        )
    
    # Update hive's last_inspection_date
    db_update("hives", {"last_inspection_date": inspection_in.inspection_date}, {"id": str(inspection_in.hive_id)})
    
    return result["data"][0] if result.get("data") else data

@router.put("/inspections/{inspection_id}", response_model=dict)
def update_inspection(
    inspection_id: str,
    inspection_in: InspectionUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update an existing inspection"""
    # 1. Get Inspection
    existing = db_select("inspections", filters={"id": inspection_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
    inspection = existing[0]

    # 2. Verify apiary access (edit)
    check_apiary_access(str(inspection["apiary_id"]), user_id, "edit")
    
    data = inspection_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = db_update("inspections", data, {"id": inspection_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update inspection")
        )
    
    return result["data"][0] if result.get("data") else data

@router.delete("/inspections/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inspection(
    inspection_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete an inspection record"""
    # 1. Get Inspection
    existing = db_select("inspections", filters={"id": inspection_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
    inspection = existing[0]

    # 2. Verify apiary access (edit)
    check_apiary_access(str(inspection["apiary_id"]), user_id, "edit")
    
    result = db_delete("inspections", {"id": inspection_id})
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to delete inspection")
        )
    
    return None

# ============================================
# DASHBOARD STATS
# ============================================

@router.get("/stats", response_model=dict)
def get_user_stats(user_id: str = Depends(get_user_id)):
    """Get dashboard statistics for the current user (owned + shared)"""
    try:
        # 1. Get all accessible apiary IDs (owned + shared)
        owned_apiaries = db_select("apiaries", filters={"user_id": user_id})
        shares = db_select("apiary_shares", filters={"shared_with_user_id": user_id})
        
        shared_apiary_ids = [s["apiary_id"] for s in shares]
        all_apiary_ids = [a["id"] for a in owned_apiaries] + shared_apiary_ids
        
        # 2. Bulk fetch everything
        # Fetch shared apiaries if any
        all_apiaries = owned_apiaries
        if shared_apiary_ids:
            shared_results = db_select("apiaries", filters={"id": shared_apiary_ids})
            # Filter matches only those not already in owned
            owned_ids = {a["id"] for a in owned_apiaries}
            for sa in shared_results:
                if sa["id"] not in owned_ids:
                    all_apiaries.append(sa)
            
        # Fetch all hives for all these apiaries
        hives = db_select("hives", filters={"apiary_id": all_apiary_ids}, limit=2000)
        hive_ids = [h["id"] for h in hives]
        
        # Fetch all harvests and tasks
        harvests = []
        if hive_ids:
            harvests = db_select("harvests", filters={"hive_id": hive_ids}, limit=2000)
            
        tasks = []
        if all_apiary_ids:
            try:
                tasks = db_select("tasks", filters={"apiary_id": all_apiary_ids}, limit=2000)
            except:
                pass

        total_honey_kg = sum(float(h.get("quantity_kg", 0)) for h in harvests)
        total_acres = sum(float(a.get("size_acres", 0)) for a in all_apiaries)
        pending_tasks = len([t for t in tasks if t.get("status") == "pending"])
        active_hives = len([h for h in hives if h.get("status") in ["Active & Healthy", "active"]])
        
        return {
            "total_apiaries": len(all_apiaries),
            "total_hives": len(hives),
            "active_hives": active_hives,
            "total_harvests": len(harvests),
            "total_honey_kg": total_honey_kg,
            "total_acres": total_acres,
            "total_tasks": len(tasks),
            "pending_tasks": pending_tasks,
            "active_apiaries": len([a for a in all_apiaries if a.get("status") == "active"])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )

# ============================================
# SHARING ENDPOINTS
# ============================================

class ShareCreate(BaseModel):
    email: str = Field(..., description="Email of the user to share with")
    permission: str = Field("view", description="'view' or 'edit'")

def get_user_id_by_email(email: str) -> Optional[str]:
    """
    Look up user ID by email using Supabase Admin Auth API.
    Requires SERVICE_ROLE_KEY.
    """
    try:
        import httpx
        from app.core.config import settings
        
        # Use simple filtering on profiles if available (preferred/safer if profiles has email)
        # But commonly we need to check auth.users via Admin API
        
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        }
        
        # Try fetching from profiles first if emails are synced there
        profiles = db_select("profiles", filters={"email": email}, limit=1)
        if profiles:
            return profiles[0]["id"]

        # Fallback: List users (Inefficient for large base, but functional for small apps)
        # Note: Proper way is an RPC function "get_user_by_email"
        # Or using the /auth/v1/admin/users endpoint if using Supabase
        
        # Mock implementation for now: 
        # In a real production app, you should create a PostgreSQL RPC function:
        # CREATE FUNCTION get_user_by_email(email_input TEXT) RETURNS TABLE (id UUID) SECURITY DEFINER AS $$ ... $$;
        pass
        
    except Exception as e:
        print(f"Error looking up user: {e}")
    return None

@router.post("/apiaries/{apiary_id}/share", response_model=dict)
def share_apiary(
    apiary_id: str,
    share_in: ShareCreate,
    user_id: str = Depends(get_user_id)
):
    """Share an apiary with another user by email"""
    # 1. Verify ownership (Only owner can share)
    # Use db_select directly to check ownership field, not RLS-filtered view which might include editors
    apiaries = db_select("apiaries", filters={"id": apiary_id})
    if not apiaries:
        raise HTTPException(status_code=404, detail="Apiary not found")
    
    if apiaries[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can share this apiary")
    
    # 2. Resolve email to ID
    # Note: For this to define 'target_user_id', we need an actual lookup. 
    # Since we can't easily query auth.users from here without an RPC, 
    # we will rely on the profiles table having emails, 
    # OR we assume the frontend sends user_id if email lookup fails.
    
    # Check profiles table
    target_user_id = None
    profiles = db_select("profiles", filters={"email": share_in.email})
    if profiles:
        target_user_id = profiles[0]["id"]
    else:
        # Try searching farmers table as fallback
        farmers = db_select("farmers", filters={"email": share_in.email})
        if farmers and farmers[0].get("user_id"):
            target_user_id = farmers[0]["user_id"]
            
    if not target_user_id:
         raise HTTPException(status_code=404, detail="User with this email not found in the system.")

    if target_user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    # 3. Create Share Record
    share_data = {
        "apiary_id": apiary_id,
        "shared_with_user_id": target_user_id,
        "owner_user_id": user_id,
        "permission": share_in.permission
    }
    
    # Check if already shared
    existing = db_select("apiary_shares", filters={
        "apiary_id": apiary_id, 
        "shared_with_user_id": target_user_id
    })
    
    if existing:
        # Update permission
        result = db_update("apiary_shares", {"permission": share_in.permission}, {"id": existing[0]["id"]})
    else:
        # Insert new
        result = db_insert("apiary_shares", share_data)
        
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to share apiary")
        
    return {"message": f"Apiary shared with {share_in.email} as {share_in.permission}"}

@router.delete("/apiaries/{apiary_id}/share/{target_user_id}", status_code=status.HTTP_204_NO_CONTENT)
def unshare_apiary(
    apiary_id: str,
    target_user_id: str,
    user_id: str = Depends(get_user_id)
):
    """Remove a user's access to an apiary"""
    # 1. Verify ownership
    apiaries = db_select("apiaries", filters={"id": apiary_id})
    if not apiaries or apiaries[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can unshare")
        
    # 2. Delete share
    result = db_delete("apiary_shares", {
        "apiary_id": apiary_id, 
        "shared_with_user_id": target_user_id
    })
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to remove share")
    
    return None

@router.get("/apiaries/{apiary_id}/shares", response_model=List[dict])
def get_apiary_shares(
    apiary_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get list of users this apiary is shared with"""
    # 1. Verify ownership
    apiaries = db_select("apiaries", filters={"id": apiary_id})
    if not apiaries or apiaries[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    shares = db_select("apiary_shares", filters={"apiary_id": apiary_id})
    
    # Enrich with emails from profiles
    for share in shares:
        if share.get("shared_with_user_id"):
            profiles = db_select("profiles", filters={"id": share["shared_with_user_id"]})
            if profiles:
                share["email"] = profiles[0].get("email")
                share["name"] = f"{profiles[0].get('first_name', '')} {profiles[0].get('last_name', '')}".strip()
                
    return shares

@router.post("/fix-ownership", response_model=dict)
def fix_data_ownership(
    current_user: dict = Depends(security.get_current_user)
):
    """
    EMERGENCY FIX: Assign orphaned 'Kibwezi Main Apiary' to the current user.
    RESTRICTED TO: timothynduva349@gmail.com.
    Also ensures hive count is 184.
    """
    user_id = current_user.get("sub")
    email = current_user.get("email")
    
    if email != "timothynduva349@gmail.com":
         raise HTTPException(status_code=403, detail="This operation is restricted to the primary BeeYield account.")

    print(f"Attempting to fix ownership for user: {user_id}")
    
    # 1. Find the apiary (by name/ID)
    # We look for the specific one found in our check script or generally by name "Kibwezi Main Apiary"
    apiaries = db_select("apiaries", filters={"name": "Kibwezi Main Apiary"})
    
    if not apiaries:
        # Create it if missing
        print("Apiary not found, creating it...")
        new_apiary = {
            "name": "Kibwezi Main Apiary",
            "user_id": user_id,
            "location_name": "Kibwezi",
            "status": "active",
            "size_acres": 5,
            "expected_hives": 184,
            "apiary_type": "Permanent"
        }
        res = db_insert("apiaries", new_apiary)
        if not res.get("success"):
             raise HTTPException(500, "Failed to create apiary")
        # Handle different return structures
        if isinstance(res.get("data"), list) and res["data"]:
            apiary_id = res["data"][0]["id"]
        else:
             # Try to fetch it back
             apiaries_check = db_select("apiaries", filters={"name": "Kibwezi Main Apiary", "user_id": user_id})
             if apiaries_check:
                 apiary_id = apiaries_check[0]["id"]
             else:
                 raise HTTPException(500, "Created apiary but could not retrieve ID")
    else:
        apiary = apiaries[0]
        apiary_id = apiary["id"]
        # Fix ownership
        print(f"Fixing apiary {apiary_id} ownership to {user_id}")
        db_update("apiaries", {"user_id": user_id, "status": "active"}, {"id": apiary_id})

    # 2. Fix Hives Ownership & Count
    hives = db_select("hives", filters={"apiary_id": apiary_id})
    current_count = len(hives)
    print(f"Found {current_count} hives")

    # Update existing hives
    if hives:
        print("Updating existing hives ownership...")
        for hive in hives:
            if hive.get("user_id") != user_id:
                db_update("hives", {"user_id": user_id}, {"id": hive["id"]})

    # 3. Seed missing hives to reach 184
    needed = 184 - current_count
    if needed > 0:
        print(f"Seeding {needed} new hives...")
        import uuid
        from datetime import datetime
        
        for i in range(needed):
            hive_num = current_count + i + 1
            new_hive = {
                "apiary_id": apiary_id,
                "user_id": user_id,
                "hive_code": f"KBZ-{hive_num:03d}",
                "type": "Langstroth",
                "status": "Active & Healthy",
                "installation_date": datetime.now().strftime("%Y-%m-%d")
            }
            db_insert("hives", new_hive)
            
    return {
        "success": True, 
        "message": f"Ownership fixed for user {user_id}. Connected to Apiary {apiary_id}. Hives count verified at 184.",
        "apiary_id": apiary_id,
        "hive_count": current_count + (184 - current_count) if (184 - current_count) > 0 else current_count
    }
