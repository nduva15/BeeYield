from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from app.core import security
from app.db.supabase_db import db_select, db_insert, db_update, db_delete

router = APIRouter()

# =======================
# SCHEMAS
# =======================

class ReportCreate(BaseModel):
    report_type: str
    parameters: Optional[dict] = None
    file_format: Optional[str] = "PDF"

class ScheduledReportCreate(BaseModel):
    name: str
    report_type: str
    frequency: str = Field(..., description="daily, weekly, monthly")
    recipients: Optional[List[str]] = []
    is_active: Optional[bool] = True
    report_config: Optional[dict] = None

# =======================
# HELPERS
# =======================

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id

# =======================
# ENDPOINTS
# =======================

@router.get("", response_model=List[dict])
def get_generated_reports(user_id: str = Depends(get_user_id)):
    """Get all generated reports for the current user"""
    return db_select("generated_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False)

@router.post("", response_model=dict)
def generate_report(
    report_in: ReportCreate,
    user_id: str = Depends(get_user_id)
):
    """Trigger a new report generation"""
    data = report_in.dict()
    data["user_id"] = user_id
    data["status"] = "pending"
    # In a real system, this would trigger a background job (Celery/BullMQ)
    # For now, we'll simulate it by creating the record.
    # We can fake it being completed immediately for demo purposes
    data["status"] = "completed"
    data["file_url"] = "https://example.com/report.pdf"  # Mock URL
    
    result = db_insert("generated_reports", data)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate report"))
    
    return result["data"][0] if result.get("data") else data

@router.get("/scheduled", response_model=List[dict])
def get_scheduled_reports(user_id: str = Depends(get_user_id)):
    """Get all scheduled reports"""
    return db_select("scheduled_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False)

@router.post("/scheduled", response_model=dict)
def create_scheduled_report(
    schedule_in: ScheduledReportCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new scheduled report"""
    data = schedule_in.dict()
    data["user_id"] = user_id
    
    result = db_insert("scheduled_reports", data)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create schedule"))
    
    return result["data"][0] if result.get("data") else data

@router.delete("/scheduled/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scheduled_report(
    schedule_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a schedule"""
    # Verify ownership
    existing = db_select("scheduled_reports", filters={"id": schedule_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    if existing[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    result = db_delete("scheduled_reports", {"id": schedule_id})
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete schedule"))
        
    return None
