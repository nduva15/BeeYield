from fastapi import APIRouter, Depends, HTTPException, status, Request
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

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# =======================
# ENDPOINTS
# =======================

@router.get("", response_model=List[dict])
async def get_generated_reports(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all generated reports for the current user"""
    return await db_select("generated_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)

@router.post("", response_model=dict)
async def generate_report(
    report_in: ReportCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Trigger a new report generation"""
    data = report_in.dict()
    data["user_id"] = user_id
    data["status"] = "completed"
    data["file_url"] = "https://example.com/report.pdf"  # Mock URL
    
    result = await db_insert("generated_reports", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate report"))
    
    return result["data"][0] if result.get("data") else data

@router.get("/scheduled", response_model=List[dict])
async def get_scheduled_reports(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all scheduled reports"""
    return await db_select("scheduled_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)

@router.post("/scheduled", response_model=dict)
async def create_scheduled_report(
    schedule_in: ScheduledReportCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new scheduled report"""
    data = schedule_in.dict()
    data["user_id"] = user_id
    
    result = await db_insert("scheduled_reports", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create schedule"))
    
    return result["data"][0] if result.get("data") else data

@router.delete("/scheduled/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scheduled_report(
    schedule_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a schedule"""
    # Verify ownership
    existing = await db_select("scheduled_reports", filters={"id": schedule_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    if existing[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    result = await db_delete("scheduled_reports", {"id": schedule_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete schedule"))
        
    return None

