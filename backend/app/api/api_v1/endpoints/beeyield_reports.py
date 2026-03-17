"""
BeeYield Reports API Endpoints
==============================
BeeYield-specific wrapper around the core Reports Engine routes.

Why this exists:
- We expose BeeYield routes under /api/v1/beeyield/reports/*
- We keep the core engine under /api/v1/reports/*
- We avoid mounting the same router twice (which can create duplicate OpenAPI operationIds)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import io

from app.core import security
from app.db.supabase_db import db_select, db_insert, db_update, db_delete

# Reuse the same worker implementation as the core engine
from app.api.api_v1.endpoints.reports import _run_report_generation
from app.services.report_worker import DataAggregator, PDFReportGenerator, ExcelReportGenerator

router = APIRouter()


# =======================
# SCHEMAS
# =======================

class BeeYieldReportGenerateRequest(BaseModel):
    type: str = Field("season", description="Report type: season, financial, audit, full_summary, ai_analysis")
    parameters: Optional[dict] = Field(default_factory=dict)
    file_format: Optional[str] = Field("PDF", description="PDF or XLSX")


class BeeYieldReportCreate(BaseModel):
    report_type: str
    parameters: Optional[dict] = None
    file_format: Optional[str] = "PDF"


class BeeYieldScheduledReportCreate(BaseModel):
    name: str
    report_type: str
    frequency: str = Field(..., description="daily, weekly, monthly")
    recipients: Optional[List[str]] = []
    is_active: Optional[bool] = True
    report_config: Optional[dict] = None


# =======================
# HELPERS
# =======================

def beeyield_get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token",
        )
    return user_id


def beeyield_get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


# =======================
# CORE ENDPOINTS (BeeYield wrapper)
# =======================

@router.post("/generate")
async def beeyield_generate_report_endpoint(
    body: BeeYieldReportGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(beeyield_get_token),
):
    """
    POST /api/v1/beeyield/reports/generate
    Triggers async report generation.
    Returns { job_id, status: "pending" }
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    import uuid

    job_id = str(uuid.uuid4())

    await db_insert(
        "generated_reports",
        {
            "id": job_id,
            "user_id": user_id,
            "report_type": body.type,
            "file_format": body.file_format or "PDF",
            "parameters": body.parameters or {},
            "status": "pending",
            "file_url": None,
        },
        token=token,
    )

    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=user_id,
        report_type=body.type,
        parameters=body.parameters or {},
        file_format=body.file_format or "PDF",
        token=token,
    )

    return {"job_id": job_id, "status": "pending"}


@router.get("/status/{job_id}")
async def beeyield_get_report_status(
    job_id: str,
    user_id: str = Depends(beeyield_get_user_id),
    token: Optional[str] = Depends(beeyield_get_token),
):
    """
    GET /api/v1/beeyield/reports/status/{job_id}
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
        "created_at": report.get("created_at"),
    }


@router.get("/download/{filename}")
async def beeyield_download_report(
    filename: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(beeyield_get_token),
):
    """
    Fallback download endpoint when Storage upload fails.
    Regenerates the report on-the-fly.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    is_excel = filename.endswith(".xlsx")

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
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# =======================
# LIST + SCHEDULES (BeeYield wrapper)
# =======================

@router.get("", response_model=List[dict])
async def beeyield_get_generated_reports(
    user_id: str = Depends(beeyield_get_user_id),
    token: Optional[str] = Depends(beeyield_get_token),
):
    return await db_select(
        "generated_reports",
        filters={"user_id": user_id},
        order_by="created_at",
        ascending=False,
        token=token,
    )


@router.post("", response_model=dict)
async def beeyield_generate_report_legacy(
    report_in: BeeYieldReportCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(beeyield_get_token),
):
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

    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=user_id,
        report_type=report_in.report_type,
        parameters=report_in.parameters or {},
        file_format=report_in.file_format or "PDF",
        token=token,
    )

    response_data = result["data"][0] if result.get("data") else data
    return response_data


@router.get("/scheduled", response_model=List[dict])
async def beeyield_get_scheduled_reports(
    user_id: str = Depends(beeyield_get_user_id),
    token: Optional[str] = Depends(beeyield_get_token),
):
    return await db_select(
        "scheduled_reports",
        filters={"user_id": user_id},
        order_by="created_at",
        ascending=False,
        token=token,
    )


@router.post("/scheduled", response_model=dict)
async def beeyield_create_scheduled_report(
    schedule_in: BeeYieldScheduledReportCreate,
    user_id: str = Depends(beeyield_get_user_id),
    token: Optional[str] = Depends(beeyield_get_token),
):
    data = schedule_in.dict()
    data["user_id"] = user_id

    result = await db_insert("scheduled_reports", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create schedule"))

    return result["data"][0] if result.get("data") else data


@router.delete("/scheduled/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def beeyield_delete_scheduled_report(
    schedule_id: str,
    user_id: str = Depends(beeyield_get_user_id),
    token: Optional[str] = Depends(beeyield_get_token),
):
    existing = await db_select("scheduled_reports", filters={"id": schedule_id}, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")

    if existing[0].get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db_delete("scheduled_reports", {"id": schedule_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete schedule"))

    return None

