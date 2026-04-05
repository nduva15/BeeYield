from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Any, Dict, Optional
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.core.security import get_current_user
from app.schemas.notes import NoteCreate, NoteUpdate

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.get("/", response_model=List[Any])
async def read_notes(
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Retrieve notes for the authenticated user.
    RLS on the database handles isolation, but we enforce it here by passing user_id filter.
    """
    user_id = current_user.get("sub")
    # Even though RLS is enabled, explicitly filtering by user_id is good practice for the API layer
    notes = await db_select("notes", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)
    return notes

@router.get("/{note_id}", response_model=Any)
async def get_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Get a single note by id (owner only).
    """
    user_id = current_user.get("sub")
    rows = await db_select("notes", filters={"id": note_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Note not found")
    return rows[0]

@router.post("/", response_model=Any)
async def create_note(
    note_in: NoteCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new note for the authenticated user.
    The User ID is automatically assigned from the JWT token.
    """
    user_id = current_user.get("sub")
    note_data = note_in.dict(exclude_unset=True)
    note_data["user_id"] = user_id
    
    # Map 'description' to 'content' if content is missing, for frontend compatibility
    if not note_data.get("content") and note_data.get("description"):
        note_data["content"] = note_data.get("description")

    result = await db_insert("notes", note_data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result.get("data")

@router.put("/{note_id}", response_model=Any)
async def update_note(
    note_id: str,
    note_in: NoteUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Update a note. RLS ensures only owner can modify.
    """
    user_id = current_user.get("sub")
    note_data = note_in.dict(exclude_unset=True)
    
    # Ensure user can only update their own note
    result = await db_update("notes", note_data, filters={"id": note_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result.get("data")

@router.delete("/{note_id}", response_model=Any)
async def delete_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Delete a note. RLS ensures only owner can delete.
    """
    user_id = current_user.get("sub")
    
    result = await db_delete("notes", filters={"id": note_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return {"success": True}
