"""
Reports API Endpoints
======================
Handles PDF/Excel report generation, status polling, download,
and scheduled report management.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
import io
import os

from app.core import security
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.services.report_worker import generate_report_async, DataAggregator, PDFReportGenerator, ExcelReportGenerator

router = APIRouter()

# =======================
# SCHEMAS
# =======================

class ReportGenerateRequest(BaseModel):
    type: str = Field("season", description="Report type: season, financial, audit, full_summary, ai_analysis")
    parameters: Optional[dict] = Field(default_factory=dict)
    file_format: Optional[str] = Field("PDF", description="PDF or XLSX")

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
# CORE ENDPOINTS
# =======================

@router.post("/generate")
async def generate_report_endpoint(
    body: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    POST /api/v1/reports/generate
    Triggers async report generation.
    Returns { job_id, status: "pending" }
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    import uuid
    job_id = str(uuid.uuid4())

    # Record pending job immediately
    await db_insert("generated_reports", {
        "id": job_id,
        "user_id": user_id,
        "report_type": body.type,
        "file_format": body.file_format or "PDF",
        "parameters": body.parameters or {},
        "status": "pending",
        "file_url": None
    }, token=token)

    # Schedule background generation
    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=user_id,
        report_type=body.type,
        parameters=body.parameters or {},
        file_format=body.file_format or "PDF",
        token=token
    )

    return {"job_id": job_id, "status": "pending"}


@router.get("/status/{job_id}")
async def get_report_status(
    job_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    GET /api/v1/reports/status/{job_id}
    Returns { status, file_url }
    """
    reports = await db_select("generated_reports", filters={"id": job_id}, token=token)
    if not reports:
        raise HTTPException(status_code=404, detail="Report job not found")

    report = reports[0]
    if report.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "job_id": job_id,
        "status": report.get("status", "unknown"),
        "file_url": report.get("file_url"),
        "file_name": report.get("file_name"),
        "report_type": report.get("report_type"),
        "created_at": report.get("created_at")
    }


@router.get("/download/{filename}")
async def download_report(
    filename: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Fallback download endpoint when Storage upload fails.
    Regenerates the report on-the-fly.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Determine format from filename
    is_excel = filename.endswith(".xlsx")
    
    # Generate on-the-fly
    agg = DataAggregator(user_id, token)
    kpis = await agg.compute_kpis(365)
    apiaries = await agg.get_apiaries()
    hives = await agg.get_hives()
    harvests = await agg.get_harvests(365)
    billing = await agg.get_billing(365)
    inspections = await agg.get_inspections(365)
    sections = ["apiaries", "hives", "harvests", "inspections", "overview"]

    if is_excel:
        gen = ExcelReportGenerator()
        file_bytes = gen.generate(kpis, apiaries, hives, harvests, billing, inspections, sections)
        content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        gen = PDFReportGenerator()
        file_bytes = gen.generate(kpis, apiaries, hives, harvests, billing, inspections, sections)
        content_type = "application/pdf"

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# =======================
# LEGACY ENDPOINTS (kept for backward compatibility)
# =======================

@router.get("", response_model=List[dict])
async def get_generated_reports(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all generated reports for the current user"""
    return await db_select("generated_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)

@router.post("", response_model=dict)
async def generate_report_legacy(
    report_in: ReportCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Legacy endpoint: Trigger report generation (backward compatible)"""
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    import uuid
    job_id = str(uuid.uuid4())

    data = report_in.dict()
    data["id"] = job_id
    data["user_id"] = user_id
    data["status"] = "pending"
    data["file_url"] = None

    result = await db_insert("generated_reports", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create report job"))

    # Background generation
    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=user_id,
        report_type=report_in.report_type,
        parameters=report_in.parameters or {},
        file_format=report_in.file_format or "PDF",
        token=token
    )

    response_data = result["data"][0] if result.get("data") else data
    return response_data


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
    existing = await db_select("scheduled_reports", filters={"id": schedule_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")

    if existing[0].get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db_delete("scheduled_reports", {"id": schedule_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete schedule"))

    return None


# =======================
# INTERNAL BACKGROUND TASK
# =======================

async def _run_report_generation(
    job_id: str,
    user_id: str,
    report_type: str,
    parameters: dict,
    file_format: str,
    token: Optional[str]
):
    """Background task that runs the full report generation pipeline."""
    try:
        # Update status to processing
        await db_update(
            "generated_reports",
            {"status": "processing"},
            {"id": job_id},
            token=token
        )

        scope_days = int(parameters.get("scope_days", 365))
        sections = parameters.get("sections", ["apiaries", "hives", "harvests", "overview"])
        place_id = parameters.get("place_id")
        user_name = parameters.get("user_name", "Beekeeper")

        # Aggregate data
        agg = DataAggregator(user_id, token)
        kpis = await agg.compute_kpis(scope_days)
        apiaries = await agg.get_apiaries(place_id)
        hives = await agg.get_hives()
        harvests = await agg.get_harvests(scope_days)
        billing = await agg.get_billing(scope_days)
        inspections = await agg.get_inspections(scope_days)

        # Generate file
        if file_format.upper() == "XLSX":
            gen = ExcelReportGenerator()
            file_bytes = gen.generate(kpis, apiaries, hives, harvests, billing, inspections, sections, user_name)
            ext = "xlsx"
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            gen = PDFReportGenerator()
            file_bytes = gen.generate(kpis, apiaries, hives, harvests, billing, inspections, sections, user_name)
            ext = "pdf"
            content_type = "application/pdf"

        filename = f"beeyield_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"

        # Upload to Supabase Storage
        from app.services.report_worker import _upload_to_storage
        file_url = await _upload_to_storage(file_bytes, filename, content_type, token)

        # Update job as completed
        await db_update(
            "generated_reports",
            {"status": "completed", "file_url": file_url, "file_name": filename},
            {"id": job_id},
            token=token
        )

        print(f"[REPORT] ✅ Report {job_id} completed: {filename}")

    except Exception as e:
        print(f"[REPORT] ❌ Report {job_id} failed: {str(e)}")
        await db_update(
            "generated_reports",
            {"status": "failed"},
            {"id": job_id},
            token=token
        )
