"""
Reports API Endpoints
======================
Full CRUD for generated reports and scheduled reports, plus async generation,
status polling, and fallback downloads.
"""
from datetime import datetime
import io
import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core import security
from app.db.supabase_db import db_delete, db_insert, db_select, db_update
from app.services.report_worker import DataAggregator, ExcelReportGenerator, PDFReportGenerator

router = APIRouter()


class ReportGenerateRequest(BaseModel):
    type: str = Field("season", description="Report type: season, financial, audit, full_summary, ai_analysis")
    parameters: Optional[dict[str, Any]] = Field(default_factory=dict)
    file_format: Optional[str] = Field("PDF", description="PDF or XLSX")


class ReportCreate(BaseModel):
    report_type: str
    parameters: Optional[dict[str, Any]] = None
    file_format: Optional[str] = "PDF"


class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None
    file_format: Optional[str] = None
    status: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class ScheduledReportCreate(BaseModel):
    name: str
    report_type: str
    frequency: str = Field(..., description="daily, weekly, monthly")
    recipients: Optional[List[str]] = []
    is_active: Optional[bool] = True
    report_config: Optional[dict[str, Any]] = None


class ScheduledReportUpdate(BaseModel):
    name: Optional[str] = None
    report_type: Optional[str] = None
    frequency: Optional[str] = None
    recipients: Optional[List[str]] = None
    is_active: Optional[bool] = None
    report_config: Optional[dict[str, Any]] = None
    last_run_at: Optional[str] = None
    next_run_at: Optional[str] = None


def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
    return user_id


def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


async def _get_user_report_or_404(report_id: str, user_id: str, token: Optional[str]) -> dict[str, Any]:
    reports = await db_select("generated_reports", filters={"id": report_id}, token=token)
    if not reports:
        raise HTTPException(status_code=404, detail="Report not found")
    report = reports[0]
    if report.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return report


async def _get_schedule_or_404(schedule_id: str, user_id: str, token: Optional[str]) -> dict[str, Any]:
    rows = await db_select("scheduled_reports", filters={"id": schedule_id}, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Schedule not found")
    schedule = rows[0]
    if schedule.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return schedule


@router.post("/generate")
async def generate_report_endpoint(
    body: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

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
async def get_report_status(
    job_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    report = await _get_user_report_or_404(job_id, user_id, token)
    return {
        "job_id": job_id,
        "status": report.get("status", "unknown"),
        "file_url": report.get("file_url"),
        "file_name": report.get("file_name"),
        "file_format": report.get("file_format"),
        "report_type": report.get("report_type"),
        "created_at": report.get("created_at"),
    }


@router.get("/download/{filename}")
async def download_report(
    filename: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
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


@router.get("", response_model=List[dict])
async def get_generated_reports(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await db_select("generated_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)


@router.post("", response_model=dict)
async def generate_report_legacy(
    report_in: ReportCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    job_id = str(uuid.uuid4())
    data = {
        "id": job_id,
        "user_id": user_id,
        "report_type": report_in.report_type,
        "parameters": report_in.parameters or {},
        "file_format": report_in.file_format or "PDF",
        "status": "pending",
        "file_url": None,
    }
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
    rows = result.get("data") or []
    return rows[0] if rows else data


@router.get("/scheduled", response_model=List[dict])
async def get_scheduled_reports(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await db_select("scheduled_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)


@router.post("/scheduled", response_model=dict)
async def create_scheduled_report(
    schedule_in: ScheduledReportCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    data = schedule_in.dict()
    data["user_id"] = user_id
    result = await db_insert("scheduled_reports", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to create schedule"))
    rows = result.get("data") or []
    return rows[0] if rows else data


@router.get("/scheduled/{schedule_id}", response_model=dict)
async def get_scheduled_report(
    schedule_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _get_schedule_or_404(schedule_id, user_id, token)


@router.put("/scheduled/{schedule_id}", response_model=dict)
@router.patch("/scheduled/{schedule_id}", response_model=dict)
async def update_scheduled_report(
    schedule_id: str,
    schedule_in: ScheduledReportUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await _get_schedule_or_404(schedule_id, user_id, token)
    patch = schedule_in.model_dump(exclude_unset=True)
    if not patch:
        return existing

    result = await db_update("scheduled_reports", patch, {"id": schedule_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update schedule"))
    rows = result.get("data") or []
    return rows[0] if rows else {**existing, **patch}


@router.delete("/scheduled/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scheduled_report(
    schedule_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    await _get_schedule_or_404(schedule_id, user_id, token)
    result = await db_delete("scheduled_reports", {"id": schedule_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete schedule"))
    return None


@router.get("/{report_id}", response_model=dict)
async def get_generated_report(
    report_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _get_user_report_or_404(report_id, user_id, token)


@router.put("/{report_id}", response_model=dict)
@router.patch("/{report_id}", response_model=dict)
async def update_generated_report(
    report_id: str,
    report_in: ReportUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await _get_user_report_or_404(report_id, user_id, token)
    patch = report_in.model_dump(exclude_unset=True)
    if not patch:
        return existing

    result = await db_update("generated_reports", patch, {"id": report_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update report"))
    rows = result.get("data") or []
    return rows[0] if rows else {**existing, **patch}


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generated_report(
    report_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    await _get_user_report_or_404(report_id, user_id, token)
    result = await db_delete("generated_reports", {"id": report_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete report"))
    return None


async def _run_report_generation(
    job_id: str,
    user_id: str,
    report_type: str,
    parameters: dict[str, Any],
    file_format: str,
    token: Optional[str],
):
    try:
        await db_update("generated_reports", {"status": "processing"}, {"id": job_id}, token=token)

        scope_days = int(parameters.get("scope_days", 365))
        sections = parameters.get("sections", ["apiaries", "hives", "harvests", "overview"])
        place_id = parameters.get("place_id")
        user_name = parameters.get("user_name", "Beekeeper")

        agg = DataAggregator(user_id, token)
        kpis = await agg.compute_kpis(scope_days)
        apiaries = await agg.get_apiaries(place_id)
        hives = await agg.get_hives()
        harvests = await agg.get_harvests(scope_days)
        billing = await agg.get_billing(scope_days)
        inspections = await agg.get_inspections(scope_days)

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
        from app.services.report_worker import _upload_to_storage

        file_url = await _upload_to_storage(file_bytes, filename, content_type, token)
        await db_update(
            "generated_reports",
            {"status": "completed", "file_url": file_url, "file_name": filename},
            {"id": job_id},
            token=token,
        )
        print(f"[REPORT] completed {job_id}: {filename}")
    except Exception as e:
        print(f"[REPORT] failed {job_id}: {str(e)}")
        await db_update("generated_reports", {"status": "failed"}, {"id": job_id}, token=token)
