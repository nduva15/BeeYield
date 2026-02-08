from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class NoteBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None # Added for compatibility with current frontend
    category: Optional[str] = "General"
    priority: Optional[str] = "medium"
    hive_id: Optional[str] = None
    apiary_id: Optional[str] = None
    note_date: Optional[str] = None # YYYY-MM-DD
    note_time: Optional[str] = None # HH:MM:SS

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class Note(NoteBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
