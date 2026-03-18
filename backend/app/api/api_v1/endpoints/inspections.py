from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from app.schemas.inspections import Inspection, InspectionCreate, InspectionUpdate
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.core import security
from datetime import date
from uuid import UUID

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

async def get_user_and_farmer_ids(user_id: str, token: Optional[str] = None) -> List[str]:
    ids = [user_id]
    try:
        farmers = await db_select("farmers", filters={"user_id": user_id}, token=token)
        if farmers:
            ids.append(farmers[0]["id"])
    except Exception:
        pass
    return list(set(ids))

@router.get("/", response_model=List[Inspection])
async def get_inspections(
    hive_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 100,
    skip: int = 0,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
) -> Any:
    """Retrieve inspections for accessible hives."""
    relevant_ids = await get_user_and_farmer_ids(user_id, token)
    
    # 1. First find visible hives
    hives = await db_select("hives", filters={"user_id": relevant_ids}, token=token)
    if not hives and len(relevant_ids) > 1:
        try:
            hives = await db_select("hives", filters={"farmer_id": relevant_ids[1]}, token=token)
        except Exception:
            pass
            
    if not hives:
        return []
        
    hive_ids = [h["id"] for h in hives]
    
    filters = {"hive_id": hive_ids}
    if hive_id and str(hive_id) in hive_ids:
        filters["hive_id"] = str(hive_id)
    elif hive_id:
        return [] # Requested hive not owned
    
    if start_date:
        filters["inspection_date"] = f"gte.{start_date.isoformat()}"
    if end_date:
        filters["inspection_date"] = f"lte.{end_date.isoformat()}"
        
    data = await db_select(
        "inspections", 
        filters=filters, 
        order_by="inspection_date", 
        ascending=False, 
        limit=limit,
        token=token
    )
    
    return data

@router.post("/", response_model=Inspection)
async def create_inspection(
    inspection_in: InspectionCreate,
    token: Optional[str] = Depends(get_token)
) -> Any:
    data = inspection_in.model_dump(mode='json')
    res = await db_insert("inspections", data, token=token)
    
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=f"Could not create inspection: {res.get('error')}")
        
    return res.get("data")[0]

@router.get("/{id}", response_model=Inspection)
async def get_inspection_by_id(
    id: UUID,
    token: Optional[str] = Depends(get_token)
) -> Any:
    # db_get_by_id is sync, we should probably use db_select
    res = await db_select("inspections", filters={"id": str(id)}, token=token)
    if not res:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return res[0]

@router.put("/{id}", response_model=Inspection)
async def update_inspection(
    id: UUID,
    inspection_in: InspectionUpdate,
    token: Optional[str] = Depends(get_token)
) -> Any:
    existing = await db_select("inspections", filters={"id": str(id)}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    update_data = inspection_in.model_dump(exclude_unset=True, mode='json')
    if not update_data:
        return existing[0]
        
    res = await db_update("inspections", update_data, {"id": str(id)}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=f"Could not update inspection: {res.get('error')}")
        
    return res.get("data")[0]

@router.delete("/{id}", response_model=Any)
async def delete_inspection(
    id: UUID,
    token: Optional[str] = Depends(get_token)
) -> Any:
    res = await db_delete("inspections", {"id": str(id)}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail="Could not delete inspection")
        
    return {"message": "Inspection deleted successfully"}
