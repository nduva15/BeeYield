from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.inspections import Inspection, InspectionCreate, InspectionUpdate
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, db_get_by_id
from datetime import date, datetime
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[Inspection])
def get_inspections(
    hive_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 100,
    skip: int = 0
) -> Any:
    """
    Retrieve inspections.
    """
    filters = {}
    if hive_id:
        filters["hive_id"] = str(hive_id)
    
    if start_date:
        filters["inspection_date"] = f"gte.{start_date.isoformat()}"
        
    if end_date:
        filters["inspection_date"] = f"lte.{end_date.isoformat()}"
        
    data = db_select(
        "inspections", 
        filters=filters, 
        order_by="inspection_date", 
        ascending=False, 
        limit=limit
    )
    
    return data

@router.post("/", response_model=Inspection)
def create_inspection(
    inspection_in: InspectionCreate
) -> Any:
    """
    Create a new inspection.
    """
    data = inspection_in.model_dump(mode='json')
    res = db_insert("inspections", data)
    
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=f"Could not create inspection: {res.get('error')}")
        
    return res.get("data")[0]

@router.get("/{id}", response_model=Inspection)
def get_inspection_by_id(
    id: UUID
) -> Any:
    """
    Get a specific inspection by ID.
    """
    data = db_get_by_id("inspections", str(id))
    
    if not data:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    return data

@router.put("/{id}", response_model=Inspection)
def update_inspection(
    id: UUID,
    inspection_in: InspectionUpdate
) -> Any:
    """
    Update an inspection.
    """
    # Check if exists
    existing = db_get_by_id("inspections", str(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    update_data = inspection_in.model_dump(exclude_unset=True, mode='json')
    
    if not update_data:
        return existing
        
    res = db_update("inspections", update_data, {"id": str(id)})
    
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=f"Could not update inspection: {res.get('error')}")
        
    return res.get("data")[0]

@router.delete("/{id}", response_model=Any)
def delete_inspection(
    id: UUID
) -> Any:
    """
    Delete an inspection.
    """
    # Check if exists
    existing = db_get_by_id("inspections", str(id))
    if not existing:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    res = db_delete("inspections", {"id": str(id)})
    
    if not res.get("success"):
        raise HTTPException(status_code=400, detail="Could not delete inspection")
        
    return {"message": "Inspection deleted successfully"}
