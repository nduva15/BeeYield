from fastapi import APIRouter, HTTPException
from typing import List, Any
from app.db.supabase_db import db_select, db_insert

router = APIRouter()

@router.get("/", response_model=List[Any])
def read_notes():
    """
    Retrieve all notes.
    """
    notes = db_select("notes", order_by="id", ascending=True)
    return notes

@router.post("/", response_model=Any)
def create_note(title: str):
    """
    Create a new note.
    """
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    result = db_insert("notes", {"title": title})
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result.get("data")
