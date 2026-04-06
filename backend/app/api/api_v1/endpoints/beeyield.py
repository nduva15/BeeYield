"""
BeeYield Dashboard API Endpoints
User-specific management of apiaries, hives, harvests, tasks, and inspections
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import Optional, List, Any
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.core import security
from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID

try:
    from beeyield_core import DashboardEngine  # type: ignore
except ImportError:
    DashboardEngine = None  # type: ignore[assignment]

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
    hive_type: Optional[str] = Field("Langstroth", description="Langstroth, KTBH, Traditional Log")
    status: Optional[str] = Field("Active & Healthy", description="Active & Healthy, Weak Colony, Abandoned, Recently Harvested")
    installation_date: Optional[date] = None
    health_status: Optional[str] = None
    bee_type: Optional[str] = None
    queen_type: Optional[str] = None
    frame_count: Optional[int] = None
    material: Optional[str] = None
    has_sensors: Optional[bool] = False
    notes: Optional[str] = None

class HiveUpdate(BaseModel):
    hive_code: Optional[str] = None
    apiary_id: Optional[UUID] = None
    hive_type: Optional[str] = None
    status: Optional[str] = None
    installation_date: Optional[date] = None
    health_status: Optional[str] = None
    bee_type: Optional[str] = None
    queen_type: Optional[str] = None
    frame_count: Optional[int] = None
    material: Optional[str] = None
    has_sensors: Optional[bool] = None
    last_inspection_date: Optional[date] = None
    notes: Optional[str] = None

class HarvestCreate(BaseModel):
    hive_id: UUID
    apiary_id: UUID
    harvest_date: date
    quantity_kg: float
    honey_type: Optional[str] = Field("Multi-flower", description="Acacia, Multi-flower, Forest, etc.")
    florage_type: Optional[str] = Field(None, description="Acacia, Multifloral, Coffee, Avocado, Wildflower")
    moisture_content: Optional[float] = None
    moisture_content_percent: Optional[float] = None # Added for consistency
    quantity_left_for_bees_kg: Optional[float] = None # 50/50 rule
    batch_code: Optional[str] = None
    color_grade: Optional[str] = Field("Light Amber", description="Water White, Extra White, Extra Light Amber, Light Amber, Dark Amber")
    is_verified: Optional[bool] = False
    notes: Optional[str] = None
    extraction_method: Optional[str] = None
    nectar_source: Optional[str] = None
    weather_conditions: Optional[str] = None
    farmer_id: Optional[UUID] = None

class HarvestBatchInput(BaseModel):
    """Smart Harvest Logging — creates an immutable batch with IoT & health snapshots."""
    hive_id: UUID = Field(..., description="The hive being harvested")
    apiary_id: UUID = Field(..., description="The apiary location")
    quantity_kg: float = Field(..., description="Amount extracted in kg")
    florage_type: str = Field("Multifloral", description="Acacia, Multifloral, Coffee, Avocado, Wildflower")
    harvest_date: Optional[date] = Field(None, description="Defaults to today if not provided")
    honey_type: Optional[str] = Field("Multi-flower", description="Honey variety")
    notes: Optional[str] = None

class HarvestUpdate(BaseModel):
    hive_id: Optional[UUID] = None
    apiary_id: Optional[UUID] = None
    harvest_date: Optional[date] = None
    quantity_kg: Optional[float] = None
    honey_type: Optional[str] = None
    florage_type: Optional[str] = None
    moisture_content: Optional[float] = None
    moisture_content_percent: Optional[float] = None # Added for consistency
    quantity_left_for_bees_kg: Optional[float] = None # 50/50 rule
    batch_code: Optional[str] = None
    color_grade: Optional[str] = None
    is_verified: Optional[bool] = None
    notes: Optional[str] = None
    extraction_method: Optional[str] = None
    nectar_source: Optional[str] = None
    weather_conditions: Optional[str] = None
    farmer_id: Optional[UUID] = None

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

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

async def get_user_and_farmer_ids(user_id: str, token: Optional[str] = None) -> List[str]:
    """Get all relevant IDs for this user (User ID + Farmer ID if exists)"""
    ids = [user_id]
    try:
        # Check if this user is a farmer
        farmers = await db_select("farmers", filters={"user_id": user_id}, token=token)
        if farmers:
            ids.append(farmers[0]["id"])
    except Exception:
        pass
    return list(set(ids))

async def check_apiary_access(apiary_id: str, user_id: str, required_permission: str = "view", token: Optional[str] = None) -> dict:
    """
    Check if user has access to apiary (owner or shared).
    Returns basic apiary info if authorized.
    """
    # 1. Check direct ownership first (most common)
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, token=token)
    if not apiaries:
        raise HTTPException(status_code=404, detail="Apiary not found")
        
    apiary = apiaries[0]
    if apiary.get("user_id") == user_id:
        return apiary
        
    # 2. Check sharing
    shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id}, token=token)
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
    token: Optional[str] = Depends(get_token),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    """Get all apiaries (owned + shared) for the current user"""
    # 1. Owned apiaries
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    
    # Try filtering by user_id first
    owned_apiaries = await db_select("apiaries", filters={"user_id": relevant_ids}, order_by="created_at", ascending=False, token=token)
    
    # If no owned apiaries found and farmer_id exists, try farmer_id as well
    if not owned_apiaries and len(relevant_ids) > 1:
         # Try finding by farmer_id column if it exists in schema
         try:
             owned_apiaries = await db_select("apiaries", filters={"farmer_id": relevant_ids[1]}, order_by="created_at", ascending=False, token=token)
         except Exception:
             pass
    
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
    shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
    if shares:
        shared_ids = [s["apiary_id"] for s in shares]
        # Bulk fetch shared apiaries
        results = await db_select("apiaries", filters={"id": shared_ids}, token=token)
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
        all_relevant_hives = await db_select("hives", filters={"apiary_id": apiary_ids}, limit=1000, token=token)
        
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
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get a specific apiary by ID"""
    apiary = await check_apiary_access(apiary_id, user_id, "view", token=token)
    
    # Add hive count and list
    hives = await db_select("hives", filters={"apiary_id": apiary_id}, token=token)
    apiary["hive_count"] = len(hives)
    apiary["hives"] = hives
    
    return apiary

@router.post("/apiaries", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_apiary(
    apiary_in: ApiaryCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
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
        data["apiary_code"] = f"APY-{str(uuid.uuid4()).split('-')[0].upper()}"
    
    result = await db_insert("apiaries", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create apiary")
        )
    
    res_data = result["data"][0] if result.get("data") else data
    return _process_apiary_output(res_data)

@router.put("/apiaries/{apiary_id}", response_model=dict)
async def update_apiary(
    apiary_id: str,
    apiary_in: ApiaryUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing apiary"""
    # Verify access (edit)
    await check_apiary_access(apiary_id, user_id, "edit", token=token)
    
    data = apiary_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Map status to is_active for DB compatibility
    if "status" in data:
        data["is_active"] = (data["status"] == "active")
    
    result = await db_update("apiaries", data, {"id": apiary_id}, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update apiary")
        )
    
    res_data = result["data"][0] if result.get("data") else data
    return _process_apiary_output(res_data)

@router.delete("/apiaries/{apiary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_apiary(
    apiary_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete an apiary (soft delete by setting status to inactive)"""
    # Verify OWNERSHIP strict
    existing = await db_select("apiaries", filters={"id": apiary_id, "user_id": user_id}, token=token)
    if not existing:
        raise HTTPException(status_code=403, detail="Only owner can delete")
    
    # Soft delete
    result = await db_update("apiaries", {"status": "inactive"}, {"id": apiary_id}, token=token)
    
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
    token: Optional[str] = Depends(get_token),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    # 1. Fetch available apiaries (owned + shared)
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    
    # Try finding apiaries by user_id or farmer_id
    owned_apiaries = await db_select("apiaries", filters={"user_id": relevant_ids}, token=token)
    if not owned_apiaries and len(relevant_ids) > 1:
        try:
            owned_apiaries = await db_select("apiaries", filters={"farmer_id": relevant_ids[1]}, token=token)
        except Exception:
            pass
            
    # Shared apiary shares
    shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
    shared_apiary_ids = [s["apiary_id"] for s in shares] if shares else []
    
    # All accessible apiary IDs
    accessible_apiary_ids = [a["id"] for a in owned_apiaries] + shared_apiary_ids
    
    # If a specific apiary_id was requested, check access
    if apiary_id:
        if str(apiary_id) not in [str(aid) for aid in accessible_apiary_ids]:
             return [] # No access to this apiary
        h_filters = {"apiary_id": apiary_id}
    else:
        # Default: Search all accessible apiaries
        if accessible_apiary_ids:
            h_filters = {"apiary_id": accessible_apiary_ids}
        else:
            # Fallback to direct user ownership if no apiaries
            h_filters = {"user_id": relevant_ids}

    # 2. Fetch the hives
    all_hives = await db_select("hives", filters=h_filters, order_by="created_at", ascending=False, limit=1000, token=token)
    
    # Final processing/enrichment
    final_hives = []
    
    # Pre-map apiaries for speed
    apiary_map = {str(a["id"]): a for a in owned_apiaries}
    
    for h in all_hives:
        if status_filter and h.get("status") != status_filter:
            continue
            
        aid = str(h.get("apiary_id"))
        if aid and aid != "None":
            if aid in apiary_map:
                h["apiary"] = _process_apiary_output(apiary_map[aid])
            else:
                # Fetch missing apiary (shared ones)
                try:
                    shared_apiary = await db_select("apiaries", filters={"id": h["apiary_id"]}, single=True, token=token)
                    if shared_apiary:
                        h["apiary"] = _process_apiary_output(shared_apiary)
                        apiary_map[aid] = shared_apiary # Cache
                except:
                    h["apiary"] = None
        else:
            h["apiary"] = None

        final_hives.append(h)

    return final_hives

@router.get("/hives/{hive_id}", response_model=dict)
async def get_hive(
    hive_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get a specific hive by ID"""
    # Look up hive
    hives = await db_select("hives", filters={"id": hive_id}, token=token)
    if not hives:
        raise HTTPException(status_code=404, detail="Hive not found")
    hive = hives[0]
    
    # Check access to its apiary
    await check_apiary_access(str(hive["apiary_id"]), user_id, "view", token=token)
    
    # Add apiary info
    if hive.get("apiary_id"):
        apiaries = await db_select("apiaries", filters={"id": hive["apiary_id"]}, token=token)
        if apiaries:
            hive["apiary"] = apiaries[0]
    
    return hive

@router.post("/hives", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_hive(
    hive_in: HiveCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new hive for the current user"""
    # Verify apiary access (edit)
    apiary = await check_apiary_access(str(hive_in.apiary_id), user_id, "edit", token=token)
    
    data = hive_in.dict()
    # The hive belongs to the APIARY OWNER (or current user if orphaned)
    data["user_id"] = apiary.get("user_id") or user_id
    
    result = await db_insert("hives", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create hive")
        )
    
    return result["data"][0] if result.get("data") else data

@router.put("/hives/{hive_id}", response_model=dict)
async def update_hive(
    hive_id: str,
    hive_in: HiveUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing hive"""
    # 1. Get Hive
    existing = await db_select("hives", filters={"id": hive_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Hive not found")
    hive = existing[0]

    # Verify apiary access (edit)
    await check_apiary_access(str(hive["apiary_id"]), user_id, "edit", token=token)
    
    data = hive_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # If apiary_id is being changed, verify new apiary access
    if "apiary_id" in data:
        await check_apiary_access(str(data["apiary_id"]), user_id, "edit", token=token)
    
    result = await db_update("hives", data, {"id": hive_id}, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update hive")
        )
    
    return result["data"][0] if result.get("data") else data

@router.delete("/hives/{hive_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hive(
    hive_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a hive"""
    # 1. Get Hive
    existing = await db_select("hives", filters={"id": hive_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Hive not found")
    hive = existing[0]

    # Verify apiary access (edit). Editors can delete hives.
    await check_apiary_access(str(hive["apiary_id"]), user_id, "edit", token=token)
    
    result = await db_delete("hives", {"id": hive_id}, token=token)
    
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
async def get_user_harvests(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    hive_id: Optional[str] = Query(None, description="Filter by hive"),
    year: Optional[int] = Query(None, description="Filter by year")
):
    """Get all harvests (owned + shared) for the current user"""
    # 1. Owned harvests
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    filters: dict[str, Any] = {"user_id": relevant_ids}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    if hive_id:
        filters["hive_id"] = hive_id
    
    columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
    owned = await db_select("harvests", filters=filters, columns=columns, order_by="date", ascending=False, limit=2000, token=token)
    
    if not owned and len(relevant_ids) > 1:
        try:
            h_filters = {"farmer_id": relevant_ids[1]}
            if apiary_id:
                h_filters["apiary_id"] = apiary_id
            if hive_id:
                h_filters["hive_id"] = hive_id
            owned = await db_select("harvests", filters=h_filters, columns=columns, order_by="date", ascending=False, limit=2000, token=token)
        except Exception:
            pass
    
    
    # 2. Shared harvests
    shared = []
    # If filtering by apiary_id, simply check if shared
    if apiary_id:
        shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id}, token=token)
        if shares:
            h_filters = {"apiary_id": apiary_id}
            if hive_id:
                h_filters["hive_id"] = hive_id
            shared = await db_select("harvests", filters=h_filters, columns=columns, limit=1000, token=token)
    elif not hive_id:
        # Fetch all shared apiaries, then harvests
        shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
        for share in shares:
            shared.extend(await db_select("harvests", filters={"apiary_id": share["apiary_id"]}, columns=columns, limit=1000, token=token))
    
    
    all_harvests = owned + shared
    
    # Filter by year if provided
    if year:
        all_harvests = [h for h in all_harvests if h.get("harvest_date") and str(year) in str(h["harvest_date"])]
    
    # Process data to ensure consistency and defaults
    for harvest in all_harvests:
        # Map database schema names back to frontend payload schema
        if 'date' in harvest and 'harvest_date' not in harvest:
            harvest['harvest_date'] = harvest['date']
        if 'weight_kg' in harvest and 'quantity_kg' not in harvest:
            harvest['quantity_kg'] = harvest['weight_kg']
        if 'floral_source' in harvest and 'nectar_source' not in harvest:
            harvest['nectar_source'] = harvest['floral_source']

        # Defaults for missing data
        if not harvest.get('honey_type'):
            harvest['honey_type'] = 'Multifloral'
        if not harvest.get('color_grade'):
            harvest['color_grade'] = 'Amber'
        if harvest.get('is_verified') is None:
            harvest['is_verified'] = False
        
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

@router.get("/harvests/{harvest_id}", response_model=dict)
async def get_harvest(
    harvest_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    """Get a single harvest record by id (owned or via shared apiary)."""
    relevant_ids = await get_user_and_farmer_ids(user_id, token)

    columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
    rows = await db_select("harvests", filters={"id": harvest_id, "user_id": relevant_ids}, columns=columns, limit=1, token=token)
    if rows:
        return rows[0]

    # Shared apiary path
    all_rows = await db_select("harvests", filters={"id": harvest_id}, columns=columns, limit=1, token=token)
    if not all_rows:
        raise HTTPException(status_code=404, detail="Harvest not found")

    harvest = all_rows[0]
    apiary_id = harvest.get("apiary_id")
    if apiary_id:
        shares = await db_select(
            "apiary_shares",
            filters={"apiary_id": apiary_id, "shared_with_user_id": user_id},
            limit=1,
            token=token,
        )
        if shares:
            return harvest

    raise HTTPException(status_code=403, detail="Harvest access denied")

@router.get("/batches", response_model=List[dict])
async def get_user_batches(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
    honey_type: Optional[str] = Query(None, description="Filter by honey type"),
    year: Optional[int] = Query(None, description="Filter by year"),
    limit: Optional[int] = Query(1000, description="Max records to return")
):
    """Get all batches for the current user's apiaries (bypasses RLS to fetch all traceability records if needed)"""
    # For a complete traceability view, we might need to look across all batches 
    # but normally we filter by the user's farmer/apiary names.
    # To keep it simple and ensure the dashboard works, we fetch the batches using the service role key.
    
    from app.core.config import settings
    from supabase import create_client
    
    # Use service key to bypass RLS for traceability batch read
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    
    query = supabase.table("honey_batches").select("*").order("harvest_date", desc=True)
    
    if honey_type:
        query = query.eq("honey_type", honey_type)
    if year:
        query = query.gte("harvest_date", f"{year}-01-01").lte("harvest_date", f"{year}-12-31")
    if limit:
        query = query.limit(limit)
        
    try:
        response = query.execute()
        return response.data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/harvests/log", response_model=dict, status_code=status.HTTP_201_CREATED)
async def log_harvest_batch(
    batch_in: HarvestBatchInput,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Smart Harvest Logger — Creates an immutable batch record.
    
    This endpoint "freezes time" by:
    1. Generating a unique BEE-YYYYMM-HIVE batch ID
    2. Fetching the latest IoT sensor snapshot for the hive
    3. Checking disease_detections for health certification
    4. Compiling everything into an immutable batch record
    """
    from app.services.harvest_batch_service import log_harvest_batch as batch_service
    
    # Verify apiary access
    await check_apiary_access(str(batch_in.apiary_id), user_id, "edit", token=token)
    
    # Verify hive exists and get its name
    hives = await db_select("hives", filters={"id": str(batch_in.hive_id), "apiary_id": str(batch_in.apiary_id)}, token=token)
    if not hives:
        raise HTTPException(status_code=404, detail="Hive not found in this apiary")
    
    hive = hives[0]
    hive_name = hive.get("hive_code") or hive.get("hive_name") or str(batch_in.hive_id).split('-')[0]
    
    # Resolve farmer name from the user profile
    farmer_name = "Unknown"
    try:
        profiles = await db_select("profiles", filters={"id": user_id}, limit=1, token=token)
        if profiles:
            p = profiles[0]
            first = p.get("first_name") or ""
            last = p.get("last_name") or ""
            full = f"{first} {last}".strip()
            farmer_name = full or p.get("display_name") or p.get("username") or p.get("email") or "Unknown"
    except Exception:
        pass
    
    # Determine harvest date (defaults to today)
    harvest_date = str(batch_in.harvest_date) if batch_in.harvest_date else datetime.now().date().isoformat()
    
    # Extra data forwarded to the batch record
    extra = {}
    if batch_in.honey_type:
        extra["honey_type"] = batch_in.honey_type
    if batch_in.notes:
        extra["notes"] = batch_in.notes
    
    # Execute the batch logging service
    result = await batch_service(
        user_id=user_id,
        hive_id=str(batch_in.hive_id),
        apiary_id=str(batch_in.apiary_id),
        hive_name=hive_name,
        quantity_kg=batch_in.quantity_kg,
        florage_type=batch_in.florage_type,
        harvest_date=harvest_date,
        farmer_name=farmer_name,
        token=token,
        extra_data=extra
    )
    
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create batch")
        )
    
    return result

@router.post("/harvests", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_harvest(
    harvest_in: HarvestCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new harvest record (legacy endpoint, also supports florage_type)"""
    # Verify apiary ownership/edit
    apiary = await check_apiary_access(str(harvest_in.apiary_id), user_id, "edit", token=token)
    
    # Verify hive exists and belongs to apiary
    hives = await db_select("hives", filters={"id": str(harvest_in.hive_id), "apiary_id": str(harvest_in.apiary_id)}, token=token)
    if not hives:
         raise HTTPException(status_code=404, detail="Hive not found in this apiary")
    
    data = harvest_in.dict(exclude_unset=True)
    data["user_id"] = apiary.get("user_id") or user_id
    
    # Map fields for Supabase schema
    if "harvest_date" in data:
        data["date"] = data.pop("harvest_date")
    if "quantity_kg" in data:
        data["weight_kg"] = data.pop("quantity_kg")
    if "nectar_source" in data:
        data["floral_source"] = data.pop("nectar_source")

    # Map moisture_content_percent to moisture_content if needed for DB
    if "moisture_content_percent" in data and "moisture_content" not in data:
        data["moisture_content"] = data.pop("moisture_content_percent")
 
    # Generate harvest code
    if "harvest_code" not in data or not data.get("harvest_code"):
        import uuid
        data["harvest_code"] = f"HRV-{str(uuid.uuid4()).split('-')[0].upper()}"

    # ── Auto-generate batch_code from hive, flora, and date ──
    if not data.get("batch_code"):
        hive_code = hives[0].get("hive_code", "HIVE") if hives else "HIVE"
        flora_raw = (
            data.get("florage_type")
            or data.get("honey_type")
            or data.get("nectar_source")
            or "MFL"
        )
        # Shorten flora to a 3-char tag (e.g. Acacia -> ACA, Multifloral -> MFL)
        flora_str = str(flora_raw) if flora_raw else "MFL"
        flora_tag = flora_str.replace(" ", "")[:3].upper()
        harvest_dt = data.get("harvest_date")
        if harvest_dt:
            try:
                if isinstance(harvest_dt, str):
                    harvest_dt_obj = datetime.fromisoformat(harvest_dt)
                else:
                    harvest_dt_obj = harvest_dt
                date_tag = harvest_dt_obj.strftime("%y%m%d")
            except Exception:
                date_tag = datetime.utcnow().strftime("%y%m%d")
        else:
            date_tag = datetime.utcnow().strftime("%y%m%d")
        data["batch_code"] = f"BTCH-{hive_code}-{flora_tag}-{date_tag}"

    result = await db_insert("harvests", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create harvest")
        )
    
    # Return enriched data so frontend has full hive/apiary/farmer objects
    new_id = result["data"][0]["id"] if result.get("data") else data.get("id")
    if new_id:
        enriched = await db_select("harvests", filters={"id": new_id}, columns="*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)", token=token)
        if enriched:
            h = enriched[0]
            # Ensure consistency
            if h.get('date'):
                h['harvest_date'] = h['date']
            if h.get('weight_kg'):
                h['quantity_kg'] = h['weight_kg']
            if h.get('floral_source'):
                h['nectar_source'] = h['floral_source']

            if h.get('hive') and h['hive'].get('apiary'):
                h['apiary'] = h['hive']['apiary']
            if not h.get('honey_type'):
                h['honey_type'] = 'Multifloral'
            if h.get('hive'):
                h['hive_code'] = h['hive'].get('hive_code')
            if h.get('moisture_content') is not None:
                h['moisture_content_percent'] = h['moisture_content']
            return h
            
    return result["data"][0] if result.get("data") else data

@router.put("/harvests/{harvest_id}", response_model=dict)
async def update_harvest(
    harvest_id: str,
    harvest_in: HarvestUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing harvest"""
    # 1. Get Harvest
    existing = await db_select("harvests", filters={"id": harvest_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Harvest not found")
    harvest = existing[0]

    # 2. Verify apiary access (edit)
    await check_apiary_access(str(harvest["apiary_id"]), user_id, "edit", token=token)
    
    data = harvest_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Map fields for Supabase schema
    if "harvest_date" in data:
        data["date"] = data.pop("harvest_date")
    if "quantity_kg" in data:
        data["weight_kg"] = data.pop("quantity_kg")
    if "nectar_source" in data:
        data["floral_source"] = data.pop("nectar_source")

    if "moisture_content_percent" in data and "moisture_content" not in data:
        data["moisture_content"] = data.pop("moisture_content_percent")

    result = await db_update("harvests", data, {"id": harvest_id}, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update harvest")
        )
    
    # Return enriched data
    enriched = await db_select("harvests", filters={"id": harvest_id}, columns="*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)", token=token)
    if enriched:
        h = enriched[0]
        if h.get('date'):
            h['harvest_date'] = h['date']
        if h.get('weight_kg'):
            h['quantity_kg'] = h['weight_kg']
        if h.get('floral_source'):
            h['nectar_source'] = h['floral_source']
            
        if h.get('hive') and h['hive'].get('apiary'):
            h['apiary'] = h['hive']['apiary']
        if not h.get('honey_type'):
            h['honey_type'] = 'Multifloral'
        if h.get('hive'):
            h['hive_code'] = h['hive'].get('hive_code')
        if h.get('moisture_content') is not None:
            h['moisture_content_percent'] = h['moisture_content']
        return h

    return result["data"][0] if result.get("data") else data

@router.delete("/harvests/{harvest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_harvest(
    harvest_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a harvest record"""
    # 1. Get Harvest
    existing = await db_select("harvests", filters={"id": harvest_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Harvest not found")
    harvest = existing[0]

    # 2. Verify apiary access (edit)
    await check_apiary_access(str(harvest["apiary_id"]), user_id, "edit", token=token)
    
    result = await db_delete("harvests", {"id": harvest_id}, token=token)
    
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
async def get_telemetry_latest(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Fetches the most recent sensor packets for the user's hives/devices.
    Links User -> Farmer -> Devices -> Readings
    """
    # 1. Get Farmer ID
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    
    # 2. Get Devices
    devices = await db_select("iot_devices", filters={"farmer_id": relevant_ids}, token=token)
    if not devices:
        return []
        
    device_ids = [d["id"] for d in devices]
    
    # 3. Get latest readings for each device
    all_readings = []
    for d_id in device_ids:
        readings = await db_select("sensor_readings", filters={"device_id": d_id}, limit=1, order_by="timestamp", ascending=False, token=token)
        if readings:
            # Attach device info
            reading = readings[0]
            device = next(d for d in devices if d["id"] == d_id)
            reading["device"] = device
            all_readings.append(reading)
            
    return all_readings


@router.get("/readings", response_model=List[dict])
async def get_hive_readings(
    hive_id: str = Query(..., description="Hive ID to fetch readings for"),
    limit: int = Query(50, ge=1, le=500, description="Max number of readings"),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    """
    Fetch sensor readings for a specific hive (backend-gated; Supabase token required).
    This enables BeeYield Online view to be fully backend-driven (no direct browser Supabase reads).
    """
    relevant_ids = await get_user_and_farmer_ids(user_id, token)

    # Verify hive is accessible to this user (owned or shared via apiary share)
    hives = await db_select("hives", filters={"id": hive_id, "user_id": relevant_ids}, limit=1, token=token)
    if not hives:
        # Shared access path: if hive belongs to an apiary shared with user, allow
        hive_rows = await db_select("hives", filters={"id": hive_id}, limit=1, token=token)
        if not hive_rows:
            raise HTTPException(status_code=404, detail="Hive not found")
        apiary_id = hive_rows[0].get("apiary_id")
        if not apiary_id:
            raise HTTPException(status_code=403, detail="Hive access denied")
        shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id}, limit=1, token=token)
        if not shares:
            raise HTTPException(status_code=403, detail="Hive access denied")

    readings = await db_select(
        "sensor_readings",
        filters={"hive_id": hive_id},
        limit=limit,
        order_by="timestamp",
        ascending=False,
        token=token,
    )
    return readings or []


# ============================================
# ACTIVITY LOGS (BeeYield dashboard feed)
# ============================================

@router.get("/activity-logs", response_model=List[dict])
async def get_activity_logs(
    limit: int = Query(50, ge=1, le=200),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await db_select("activity_logs", filters={"user_id": user_id}, order_by="created_at", ascending=False, limit=limit, token=token)


@router.post("/activity-logs", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_activity_log(
    body: dict,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    allowed = {"event_type", "entity_type", "entity_id", "title", "subtitle", "metadata"}
    payload = {k: v for k, v in (body or {}).items() if k in allowed}
    if not payload.get("title"):
        raise HTTPException(status_code=400, detail="title is required")
    payload["user_id"] = user_id
    payload.setdefault("event_type", "system")
    payload.setdefault("created_at", datetime.utcnow().isoformat())

    res = await db_insert("activity_logs", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create activity log"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


# ============================================
# CALCULATOR LOGS
# ============================================

@router.get("/calculator-logs", response_model=List[dict])
async def get_calculator_logs(
    calculation_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"user_id": user_id}
    if calculation_type:
        filters["calculation_type"] = calculation_type
    return await db_select("calculator_logs", filters=filters, order_by="created_at", ascending=False, limit=limit, token=token)


@router.post("/calculator-logs", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_calculator_log(
    body: dict,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = dict(body or {})
    payload["user_id"] = user_id
    payload.setdefault("created_at", datetime.utcnow().isoformat())

    res = await db_insert("calculator_logs", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create calculator log"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


# ============================================
# INFRASTRUCTURE REGISTRY (calibration)
# ============================================

@router.get("/infrastructure-registry", response_model=List[dict])
async def get_infrastructure_registry(
    limit: int = Query(500, ge=1, le=2000),
    token: Optional[str] = Depends(get_token),
):
    # Registry isn't strictly user-scoped in all deployments; rely on RLS where configured.
    return await db_select("infrastructure_registry", limit=limit, order_by="created_at", ascending=False, token=token)


@router.patch("/infrastructure-registry/{serial_number}", response_model=dict)
async def update_infrastructure_registry(
    serial_number: str,
    body: dict,
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("infrastructure_registry", filters={"serial_number": serial_number}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Device not found")

    allowed = {"calibration_offset", "metadata", "status"}
    patch = {k: v for k, v in (body or {}).items() if k in allowed}
    patch["updated_at"] = datetime.utcnow().isoformat()

    res = await db_update("infrastructure_registry", patch, {"serial_number": serial_number}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update registry"))
    updated = res.get("data") or []
    return updated[0] if isinstance(updated, list) and updated else rows[0]

# ============================================
# TASKS ENDPOINTS
# ============================================

@router.get("/tasks", response_model=List[dict])
async def get_user_tasks(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary")
):
    """Get all tasks (owned + shared) for the current user"""
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    
    # 1. Owned tasks
    filters: dict[str, Any] = {"user_id": relevant_ids}
    if status_filter:
        filters["status"] = status_filter
    if apiary_id:
        filters["apiary_id"] = apiary_id
        
    owned_tasks = await db_select("tasks", filters=filters, order_by="due_date", ascending=True, limit=1000, token=token)
    
    if not owned_tasks and len(relevant_ids) > 1:
        try:
             # Try fallback to farmer_id if column exists
             h_filters = {"farmer_id": relevant_ids[1]}
             if status_filter:
                 h_filters["status"] = status_filter
             if apiary_id:
                 h_filters["apiary_id"] = apiary_id
             owned_tasks = await db_select("tasks", filters=h_filters, limit=1000, token=token)
        except Exception:
             pass

    # 2. Shared tasks (tasks from shared apiaries)
    shared_tasks = []
    if apiary_id:
        shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id}, token=token)
        if shares:
            t_filters = {"apiary_id": apiary_id}
            if status_filter:
                t_filters["status"] = status_filter
            shared_tasks = await db_select("tasks", filters=t_filters, limit=1000, token=token)
    else:
        shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
        for share in shares:
            t_filters = {"apiary_id": share["apiary_id"]}
            if status_filter:
                t_filters["status"] = status_filter
            tasks = await db_select("tasks", filters=t_filters, limit=1000, token=token)
            shared_tasks.extend(tasks)
            
    all_tasks = owned_tasks + shared_tasks
    
    # Enrich with apiary/hive names
    for task in all_tasks:
        if task.get("apiary_id"):
            apiaries = await db_select("apiaries", filters={"id": task["apiary_id"]}, token=token)
            if apiaries:
                task["apiary_name"] = apiaries[0].get("name")
        
        if task.get("hive_id"):
            hives = await db_select("hives", filters={"id": task["hive_id"]}, token=token)
            if hives:
                task["hive_code"] = hives[0].get("hive_code")
    
    return all_tasks

@router.get("/tasks/{task_id}", response_model=dict)
async def get_task(
    task_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    """Get a single task by id (owned or via shared apiary)."""
    relevant_ids = await get_user_and_farmer_ids(user_id, token)

    rows = await db_select("tasks", filters={"id": task_id, "user_id": relevant_ids}, limit=1, token=token)
    if rows:
        return rows[0]

    # Shared apiary path
    all_rows = await db_select("tasks", filters={"id": task_id}, limit=1, token=token)
    if not all_rows:
        raise HTTPException(status_code=404, detail="Task not found")
    task = all_rows[0]
    apiary_id = task.get("apiary_id")
    if apiary_id:
        shares = await db_select(
            "apiary_shares",
            filters={"apiary_id": apiary_id, "shared_with_user_id": user_id},
            limit=1,
            token=token,
        )
        if shares:
            return task

    raise HTTPException(status_code=403, detail="Task access denied")

@router.post("/tasks", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new task"""
    # Verify apiary access if provided
    if task_in.apiary_id:
        apiary = await check_apiary_access(str(task_in.apiary_id), user_id, "edit", token=token)
        target_owner_id = apiary["user_id"]
    else:
        target_owner_id = user_id

    data = task_in.dict()
    data["user_id"] = target_owner_id
    
    result = await db_insert("tasks", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create task")
        )
    
    return result["data"][0] if result.get("data") else data

@router.put("/tasks/{task_id}", response_model=dict)
async def update_task(
    task_id: str,
    task_in: TaskUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing task"""
    # 1. Get Task
    existing = await db_select("tasks", filters={"id": task_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    task = existing[0]

    # 2. Verify access
    if task.get("apiary_id"):
        await check_apiary_access(str(task["apiary_id"]), user_id, "edit", token=token)
    elif task.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    data = task_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db_update("tasks", data, {"id": task_id}, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update task")
        )
    
    return result["data"][0] if result.get("data") else data

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a task"""
    # 1. Get Task
    existing = await db_select("tasks", filters={"id": task_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    task = existing[0]

    # 2. Verify access
    if task.get("apiary_id"):
        await check_apiary_access(str(task["apiary_id"]), user_id, "edit", token=token)
    elif task.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db_delete("tasks", {"id": task_id}, token=token)
    
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
async def get_user_inspections(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    hive_id: Optional[str] = Query(None, description="Filter by hive")
):
    """Get all inspections (owned + shared) for the current user"""
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    
    filters: dict[str, Any] = {"user_id": relevant_ids}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    if hive_id:
        filters["hive_id"] = hive_id
    
    # 1. Owned inspections
    owned = await db_select("inspections", filters=filters, order_by="inspection_date", ascending=False, token=token)
    
    if not owned and len(relevant_ids) > 1:
        try:
            h_filters = {"farmer_id": relevant_ids[1]}
            if apiary_id:
                h_filters["apiary_id"] = apiary_id
            if hive_id:
                h_filters["hive_id"] = hive_id
            owned = await db_select("inspections", filters=h_filters, order_by="inspection_date", ascending=False, token=token)
        except Exception:
            pass
    
    # 2. Shared inspections
    shared = []
    if apiary_id:
        shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id, "shared_with_user_id": user_id}, token=token)
        if shares:
            i_filters = {"apiary_id": apiary_id}
            if hive_id:
                i_filters["hive_id"] = hive_id
            shared = await db_select("inspections", filters=i_filters, token=token)
    elif not hive_id:
        shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
        for share in shares:
            shared.extend(await db_select("inspections", filters={"apiary_id": share["apiary_id"]}, token=token))

    all_inspections = owned + shared
    
    # Enrich with apiary and hive names
    for inspection in all_inspections:
        if inspection.get("apiary_id"):
            apiaries = await db_select("apiaries", filters={"id": inspection["apiary_id"]}, token=token)
            if apiaries:
                inspection["apiary_name"] = apiaries[0].get("name")
        
        if inspection.get("hive_id"):
            hives = await db_select("hives", filters={"id": inspection["hive_id"]}, token=token)
            if hives:
                inspection["hive_code"] = hives[0].get("hive_code")
    
    return all_inspections

@router.get("/inspections/{inspection_id}", response_model=dict)
async def get_inspection(
    inspection_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    """Get a single inspection by id (owned or via shared apiary)."""
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    rows = await db_select("inspections", filters={"id": inspection_id, "user_id": relevant_ids}, limit=1, token=token)
    if rows:
        return rows[0]

    # Shared apiary path
    all_rows = await db_select("inspections", filters={"id": inspection_id}, limit=1, token=token)
    if not all_rows:
        raise HTTPException(status_code=404, detail="Inspection not found")
    inspection = all_rows[0]
    apiary_id = inspection.get("apiary_id")
    if apiary_id:
        shares = await db_select(
            "apiary_shares",
            filters={"apiary_id": apiary_id, "shared_with_user_id": user_id},
            limit=1,
            token=token,
        )
        if shares:
            return inspection

    raise HTTPException(status_code=403, detail="Inspection access denied")


@router.post("/inspections", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    inspection_in: InspectionCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new inspection record"""
    # Verify apiary ownership/edit
    apiary = await check_apiary_access(str(inspection_in.apiary_id), user_id, "edit", token=token)
    
    # Verify hive exists and belongs to apiary
    hives = await db_select("hives", filters={"id": str(inspection_in.hive_id), "apiary_id": str(inspection_in.apiary_id)}, token=token)
    if not hives:
         raise HTTPException(status_code=404, detail="Hive not found in this apiary")
    
    data = inspection_in.dict()
    data["user_id"] = apiary["user_id"]
    
    result = await db_insert("inspections", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create inspection")
        )
    
    # Update hive's last_inspection_date
    await db_update("hives", {"last_inspection_date": inspection_in.inspection_date}, {"id": str(inspection_in.hive_id)}, token=token)
    
    return result["data"][0] if result.get("data") else data

@router.put("/inspections/{inspection_id}", response_model=dict)
async def update_inspection(
    inspection_id: str,
    inspection_in: InspectionUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing inspection"""
    # 1. Get Inspection
    existing = await db_select("inspections", filters={"id": inspection_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
    inspection = existing[0]

    # 2. Verify apiary access (edit)
    await check_apiary_access(str(inspection["apiary_id"]), user_id, "edit", token=token)
    
    data = inspection_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db_update("inspections", data, {"id": inspection_id}, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update inspection")
        )
    
    return result["data"][0] if result.get("data") else data

@router.delete("/inspections/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inspection(
    inspection_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete an inspection record"""
    # 1. Get Inspection
    existing = await db_select("inspections", filters={"id": inspection_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
    inspection = existing[0]

    # 2. Verify apiary access (edit)
    await check_apiary_access(str(inspection["apiary_id"]), user_id, "edit", token=token)
    
    result = await db_delete("inspections", {"id": inspection_id}, token=token)
    
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
async def get_user_stats(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get dashboard statistics for the current user (owned + shared)"""
    engine = DashboardEngine() if DashboardEngine is not None else None
    try:
        # 1. Get all accessible apiary IDs (owned + shared)
        relevant_ids = await get_user_and_farmer_ids(user_id, token)
        owned_apiaries = await db_select("apiaries", filters={"user_id": relevant_ids}, token=token)
        
        # Fallback if no apiaries found by user_id but farmer_id exists
        if not owned_apiaries and len(relevant_ids) > 1:
            try:
                owned_apiaries = await db_select("apiaries", filters={"farmer_id": relevant_ids[1]}, token=token)
            except Exception:
                pass

        shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, token=token)
        
        shared_apiary_ids = [s["apiary_id"] for s in shares]
        all_apiary_ids = [a["id"] for a in owned_apiaries] + shared_apiary_ids
        
        # 2. Bulk fetch everything
        # Fetch shared apiaries if any
        all_apiaries = owned_apiaries
        if shared_apiary_ids:
            shared_results = await db_select("apiaries", filters={"id": shared_apiary_ids}, token=token)
            # Filter matches only those not already in owned
            owned_ids = {a["id"] for a in owned_apiaries}
            for sa in shared_results:
                if sa["id"] not in owned_ids:
                    all_apiaries.append(sa)
            
        # Fetch all hives for all these apiaries
        hives = await db_select("hives", filters={"apiary_id": all_apiary_ids}, limit=2000, token=token)
        hive_ids = [h["id"] for h in hives]
        
        # Fetch all harvests and tasks
        harvests = []
        if hive_ids:
            harvests = await db_select("harvests", filters={"hive_id": hive_ids}, limit=2000, token=token)
            
        tasks = []
        if all_apiary_ids:
            try:
                tasks = await db_select("tasks", filters={"apiary_id": all_apiary_ids}, limit=2000, token=token)
            except Exception:
                pass

        stats = engine.compute_stats(all_apiaries, hives, harvests, tasks)
        return stats
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

async def get_user_id_by_email(email: str) -> Optional[str]:
    """
    Look up user ID by email using Supabase Admin Auth API.
    Requires SERVICE_ROLE_KEY.
    """
    try:
        
        # Try fetching from profiles first if emails are synced there
        profiles = await db_select("profiles", filters={"email": email}, limit=1)
        if profiles:
            return profiles[0]["id"]

        # Fallback: try farmers table
        farmers = await db_select("farmers", filters={"email": email}, limit=1)
        if farmers and farmers[0].get("user_id"):
            return farmers[0]["user_id"]
        
    except Exception as e:
        print(f"Error looking up user: {e}")
    return None


@router.post("/apiaries/{apiary_id}/share", response_model=dict)
async def share_apiary(
    apiary_id: str,
    share_in: ShareCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Share an apiary with another user by email"""
    # 1. Verify ownership (Only owner can share)
    # Use db_select directly to check ownership field, not RLS-filtered view which might include editors
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, token=token)
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
    profiles = await db_select("profiles", filters={"email": share_in.email}, token=token)
    if profiles:
        target_user_id = profiles[0]["id"]
    else:
        # Try searching farmers table as fallback
        farmers = await db_select("farmers", filters={"email": share_in.email}, token=token)
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
    existing = await db_select("apiary_shares", filters={
        "apiary_id": apiary_id, 
        "shared_with_user_id": target_user_id
    }, token=token)
    
    if existing:
        # Update permission
        result = await db_update("apiary_shares", {"permission": share_in.permission}, {"id": existing[0]["id"]}, token=token)
    else:
        # Insert new
        result = await db_insert("apiary_shares", share_data, token=token)
        
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to share apiary")
        
    return {"message": f"Apiary shared with {share_in.email} as {share_in.permission}"}

@router.delete("/apiaries/{apiary_id}/share/{target_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unshare_apiary(
    apiary_id: str,
    target_user_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Remove a user's access to an apiary"""
    # 1. Verify ownership
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, token=token)
    if not apiaries or apiaries[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can unshare")
        
    # 2. Delete share
    result = await db_delete("apiary_shares", {
        "apiary_id": apiary_id, 
        "shared_with_user_id": target_user_id
    }, token=token)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Failed to remove share")
    
    return None

@router.get("/apiaries/{apiary_id}/shares", response_model=List[dict])
async def get_apiary_shares(
    apiary_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get list of users this apiary is shared with"""
    # 1. Verify ownership
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, token=token)
    if not apiaries or apiaries[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    shares = await db_select("apiary_shares", filters={"apiary_id": apiary_id}, token=token)
    
    # Enrich with emails from profiles
    for share in shares:
        if share.get("shared_with_user_id"):
            profiles = await db_select("profiles", filters={"id": share["shared_with_user_id"]}, token=token)
            if profiles:
                share["email"] = profiles[0].get("email")
                share["name"] = f"{profiles[0].get('first_name', '')} {profiles[0].get('last_name', '')}".strip()
                
    return shares


# ============================================
# QUEEN SCHEMAS
# ============================================

class QueenCreate(BaseModel):
    hive_id: Optional[UUID] = None
    name: Optional[str] = None
    breed: Optional[str] = None
    origin: Optional[str] = Field(None, description="purchased, raised, swarm-caught")
    marking_color: Optional[str] = Field(None, description="white, yellow, red, green, blue")
    year_introduced: Optional[int] = None
    status: Optional[str] = Field("active", description="active, failed, superseded, lost")
    notes: Optional[str] = None

class QueenUpdate(BaseModel):
    hive_id: Optional[UUID] = None
    name: Optional[str] = None
    breed: Optional[str] = None
    origin: Optional[str] = None
    marking_color: Optional[str] = None
    year_introduced: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class QueenRearingBatchCreate(BaseModel):
    hive_id: UUID
    batch_name: str
    method: Optional[str] = Field("Grafting", description="Grafting, Walk-away, Miller, Jenter, OTS")
    start_date: date
    planned_units: Optional[int] = Field(20, description="Number of queen cells planned")
    notebook: Optional[str] = None
    generate_calendar: Optional[bool] = True
    generate_units: Optional[bool] = True
    generate_reminders: Optional[bool] = True

class QueenRearingBatchUpdate(BaseModel):
    batch_name: Optional[str] = None
    method: Optional[str] = None
    start_date: Optional[date] = None
    planned_units: Optional[int] = None
    notebook: Optional[str] = None
    generate_calendar: Optional[bool] = None
    generate_units: Optional[bool] = None
    generate_reminders: Optional[bool] = None
    status: Optional[str] = None


# ============================================
# QUEEN ENDPOINTS
# ============================================

@router.get("/queens", response_model=List[dict])
async def get_queens(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
    hive_id: Optional[str] = Query(None, description="Filter by hive")
):
    """Get queens for this user, optionally filtered by hive_id"""
    try:
        filters = {"user_id": user_id}
        if hive_id:
            filters["hive_id"] = hive_id
        queens = await db_select("queens", filters=filters, order_by="created_at", ascending=False, token=token)
        return queens
    except Exception as e:
        print(f"[ERROR] get_queens: {e}")
        return []


@router.post("/queens", response_model=dict, status_code=201)
async def create_queen(
    queen: QueenCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new queen record"""
    payload: dict[str, Any] = {k: v for k, v in queen.model_dump().items() if v is not None}
    payload["user_id"] = user_id

    # Serialize UUIDs
    if "hive_id" in payload:
        payload["hive_id"] = str(payload["hive_id"])

    result = await db_insert("queens", payload, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create queen"))

    data = result.get("data")
    if isinstance(data, list) and data:
        return data[0]
    return data or payload


@router.put("/queens/{queen_id}", response_model=dict)
async def update_queen(
    queen_id: str,
    queen: QueenUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update a queen record"""
    payload: dict[str, Any] = {k: v for k, v in queen.model_dump().items() if v is not None}
    if "hive_id" in payload:
        payload["hive_id"] = str(payload["hive_id"])

    result = await db_update("queens", payload, {"id": queen_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update queen"))

    data = result.get("data")
    if isinstance(data, list) and data:
        return data[0]
    return data or payload


@router.delete("/queens/{queen_id}", status_code=204)
async def delete_queen(
    queen_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a queen record"""
    result = await db_delete("queens", {"id": queen_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete queen"))
    return None


# ============================================
# QUEEN REARING BATCH ENDPOINTS
# ============================================

@router.get("/queen-rearing-batches", response_model=List[dict])
async def get_queen_rearing_batches(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
    hive_id: Optional[str] = Query(None, description="Filter by hive")
):
    """Get queen rearing batches for this user"""
    try:
        filters = {"user_id": user_id}
        if hive_id:
            filters["hive_id"] = hive_id
        batches = await db_select("queen_rearing_batches", filters=filters, order_by="created_at", ascending=False, token=token)
        return batches
    except Exception as e:
        print(f"[ERROR] get_queen_rearing_batches: {e}")
        return []


@router.post("/queen-rearing-batches", response_model=dict, status_code=201)
async def create_queen_rearing_batch(
    batch: QueenRearingBatchCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new queen rearing batch"""
    payload: dict[str, Any] = {k: v for k, v in batch.model_dump(mode="json").items() if v is not None}
    payload["user_id"] = user_id

    # Serialize UUIDs
    if "hive_id" in payload:
        payload["hive_id"] = str(payload["hive_id"])

    result = await db_insert("queen_rearing_batches", payload, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create queen rearing batch"))

    data = result.get("data")
    if isinstance(data, list) and data:
        return data[0]
    return data or payload


@router.put("/queen-rearing-batches/{batch_id}", response_model=dict)
async def update_queen_rearing_batch(
    batch_id: str,
    batch: QueenRearingBatchUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update a queen rearing batch"""
    payload: dict[str, Any] = {k: v for k, v in batch.model_dump(mode="json").items() if v is not None}

    result = await db_update("queen_rearing_batches", payload, {"id": batch_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update batch"))

    data = result.get("data")
    if isinstance(data, list) and data:
        return data[0]
    return data or payload


@router.delete("/queen-rearing-batches/{batch_id}", status_code=204)
async def delete_queen_rearing_batch(
    batch_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a queen rearing batch"""
    result = await db_delete("queen_rearing_batches", {"id": batch_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete batch"))
    return None


# ============================================
# HIVE DETAIL AGGREGATE ENDPOINT
# ============================================

@router.get("/hives/{hive_id}/detail", response_model=dict)
async def get_hive_detail(
    hive_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Get comprehensive hive detail:
    hive info, apiary, queen, last inspection, harvests, requests, queen rearing batches
    """
    try:
        # Fetch hive
        hives = await db_select("hives", filters={"id": hive_id}, token=token)
        if not hives:
            raise HTTPException(status_code=404, detail="Hive not found")
        hive = hives[0]

        # Fetch apiary
        apiary = None
        if hive.get("apiary_id"):
            apiaries = await db_select("apiaries", filters={"id": hive["apiary_id"]}, token=token)
            if apiaries:
                apiary = apiaries[0]

        # Fetch queen for this hive
        queens = await db_select("queens", filters={"hive_id": hive_id}, order_by="created_at", ascending=False, limit=1, token=token)
        queen = queens[0] if queens else None

        # Fetch last inspection
        inspections = await db_select("inspections", filters={"hive_id": hive_id}, order_by="inspection_date", ascending=False, limit=5, token=token)
        last_inspection = inspections[0] if inspections else None

        # Fetch harvests for this hive (ensure we get history from 2020 onwards by increasing limit and removing tight date bounds if any exist)
        harvests = await db_select("harvests", filters={"hive_id": hive_id}, order_by="harvest_date", ascending=False, limit=5000, token=token)

        # Fetch requests for this hive
        requests_list = []
        try:
            requests_list = await db_select("requests", filters={"hive_id": hive_id}, order_by="created_at", ascending=False, limit=10, token=token)
        except Exception:
            pass  # requests table may not exist

        # Fetch queen rearing batches for this hive
        rearing_batches = await db_select("queen_rearing_batches", filters={"hive_id": hive_id}, order_by="created_at", ascending=False, token=token)

        return {
            "hive": hive,
            "apiary": apiary,
            "queen": queen,
            "last_inspection": last_inspection,
            "inspections": inspections,
            "harvests": harvests,
            "requests": requests_list,
            "queen_rearing_batches": rearing_batches,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] get_hive_detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

