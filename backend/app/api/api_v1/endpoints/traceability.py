from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas import traceability as schemas
from app.services import traceability_service
from app.db.supabase_db import db_select, db_insert

router = APIRouter()

@router.get("/code/{code}", response_model=schemas.TraceResponse)
def get_trace_by_code(code: str):
    """
    Public endpoint to trace honey by its batch code (e.g. from jar).
    """
    result = traceability_service.get_history_by_code(code)
    if not result:
        raise HTTPException(status_code=404, detail="Traceability code not found")
    return result

@router.post("/hives", response_model=dict)
def create_hive(hive_in: schemas.HiveCreate):
    """
    Protected endpoint to register a new Hive in the blockchain and DB.
    """
    return traceability_service.register_hive(hive_in)

@router.post("/harvests", response_model=dict)
def record_harvest(harvest_in: schemas.HarvestCreate):
    """
    Protected endpoint to record a harvest in blockchain and DB.
    """
    return traceability_service.record_harvest(harvest_in)

