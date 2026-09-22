"""
Reports API Endpoints
======================
Handles PDF/Excel report generation, status polling, download,
and scheduled report management.
Multi-method (POST + GET) support eliminates 405 Method Not Allowed errors.
Durable local JSON and file caching ensures seamless operation even offline.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from pathlib import Path
import io
import uuid
import json

from app.core.security import get_optional_current_user
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.services.report_worker import DataAggregator, PDFReportGenerator, ExcelReportGenerator

router = APIRouter()

# =======================
# DURABLE STORAGE
# =======================
DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
REPORTS_FILE_PATH = DATA_DIR / "generated_reports.json"
REPORTS_FILES_DIR = DATA_DIR / "generated_reports_files"

def _ensure_dirs():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_FILES_DIR.mkdir(parents=True, exist_ok=True)
    if not REPORTS_FILE_PATH.exists():
        REPORTS_FILE_PATH.write_text("[]", encoding="utf-8")

def load_local_reports() -> List[dict]:
    _ensure_dirs()
    try:
        data = json.loads(REPORTS_FILE_PATH.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except Exception:
        pass
    return []

def save_local_report(record: dict):
    _ensure_dirs()
    try:
        items = load_local_reports()
        idx = next((i for i, r in enumerate(items) if r.get("id") == record.get("id")), None)
        if idx is not None:
            items[idx] = {**items[idx], **record}
        else:
            items.insert(0, record)
        REPORTS_FILE_PATH.write_text(json.dumps(items[:200], indent=2, default=str), encoding="utf-8")
    except Exception as e:
        print(f"[REPORTS] Error saving local report: {e}")

def get_local_report(job_id: str) -> Optional[dict]:
    items = load_local_reports()
    for r in items:
        if r.get("id") == job_id:
            return r
    return None

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

class ScheduledReportUpdate(BaseModel):
    name: Optional[str] = None
    report_type: Optional[str] = None
    frequency: Optional[str] = None
    recipients: Optional[List[str]] = None
    is_active: Optional[bool] = None
    report_config: Optional[dict] = None

# =======================
# HELPERS
# =======================

def resolve_user_id(
    current_user: Optional[dict] = Depends(get_optional_current_user),
    request: Optional[Request] = None
) -> str:
    if current_user and current_user.get("sub"):
        return current_user["sub"]
    if request:
        device_id = request.headers.get("X-Device-Id") or request.headers.get("X-User-Id")
        if device_id:
            return device_id
        qp_uid = request.query_params.get("user_id")
        if qp_uid:
            return qp_uid
    return "guest-beekeeper"

def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# =======================
# CORE ENDPOINTS
# =======================

@router.post("/generate")
@router.post("/generate/")
async def generate_report_post_endpoint(
    request: Request,
    background_tasks: BackgroundTasks,
    body: ReportGenerateRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    POST /api/v1/reports/generate
    Triggers async report generation.
    Returns { job_id, status: 'pending' }
    """
    user_id = resolve_user_id(current_user, request)
    job_id = str(uuid.uuid4())
    parameters = body.parameters or {}

    job_record = {
        "id": job_id,
        "user_id": user_id,
        "report_type": body.type,
        "file_format": body.file_format or "PDF",
        "parameters": parameters,
        "status": "pending",
        "file_url": None,
        "created_at": datetime.now().isoformat()
    }
    save_local_report(job_record)
    try:
        await db_insert("generated_reports", job_record, token=token)
    except Exception as db_err:
        print(f"[REPORTS] db_insert notice: {db_err}")

    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=user_id,
        report_type=body.type,
        parameters=parameters,
        file_format=body.file_format or "PDF",
        token=token
    )

    return {"job_id": job_id, "status": "pending"}


@router.get("/generate")
@router.get("/generate/")
async def generate_report_get_endpoint(
    request: Request,
    background_tasks: BackgroundTasks,
    type: str = "season",
    file_format: str = "PDF",
    scope_days: int = 365,
    place_id: Optional[str] = None,
    hive_id: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    GET /api/v1/reports/generate (Eliminates 405 Method Not Allowed)
    """
    resolved_uid = user_id or resolve_user_id(current_user, request)
    job_id = str(uuid.uuid4())
    params = {"scope_days": scope_days}
    if place_id:
        params["place_id"] = place_id
    if hive_id:
        params["hive_id"] = hive_id

    job_record = {
        "id": job_id,
        "user_id": resolved_uid,
        "report_type": type,
        "file_format": file_format or "PDF",
        "parameters": params,
        "status": "pending",
        "file_url": None,
        "created_at": datetime.now().isoformat()
    }
    save_local_report(job_record)
    try:
        await db_insert("generated_reports", job_record, token=token)
    except Exception as db_err:
        print(f"[REPORTS] db_insert notice: {db_err}")

    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=resolved_uid,
        report_type=type,
        parameters=params,
        file_format=file_format or "PDF",
        token=token
    )

    return {"job_id": job_id, "status": "pending"}


@router.get("/status/{job_id}")
@router.get("/status/{job_id}/")
@router.post("/status/{job_id}")
@router.post("/status/{job_id}/")
async def get_report_status(
    job_id: str,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    GET/POST /api/v1/reports/status/{job_id}
    Returns { status, file_url, file_name }
    """
    report = get_local_report(job_id)
    if not report:
        try:
            reports = await db_select("generated_reports", filters={"id": job_id}, token=token)
            if reports:
                report = reports[0]
        except Exception:
            pass

    if not report:
        raise HTTPException(status_code=404, detail="Report job not found")

    return {
        "job_id": job_id,
        "status": report.get("status", "completed"),
        "file_url": report.get("file_url"),
        "file_name": report.get("file_name"),
        "file_format": report.get("file_format", "PDF"),
        "report_type": report.get("report_type", "season"),
        "created_at": report.get("created_at")
    }


@router.get("/download/{filename}")
@router.get("/download/{filename}/")
@router.post("/download/{filename}")
@router.post("/download/{filename}/")
async def download_report(
    filename: str,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Download report file by filename. Streams local file if cached, or regenerates dynamically.
    """
    user_id = resolve_user_id(current_user, request)
    is_excel = filename.endswith(".xlsx")
    content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if is_excel else "application/pdf"

    # 1. Check local cached file on disk
    _ensure_dirs()
    local_file = REPORTS_FILES_DIR / filename
    if local_file.exists():
        file_bytes = local_file.read_bytes()
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    # 2. Generate on-the-fly using current user's aggregated data
    try:
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
        else:
            gen = PDFReportGenerator()
            file_bytes = gen.generate(kpis, apiaries, hives, harvests, billing, inspections, sections)

        try:
            local_file.write_bytes(file_bytes)
        except Exception:
            pass

        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as gen_err:
        raise HTTPException(status_code=500, detail=f"Failed generating report download: {gen_err}")


# =======================
# LEGACY & ROOT ENDPOINTS
# =======================

@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
async def get_generated_reports(
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get all generated reports for the current user"""
    user_id = resolve_user_id(current_user, request)
    local_items = [r for r in load_local_reports() if r.get("user_id") == user_id or user_id in ("guest-beekeeper", "local-user")]
    try:
        db_items = await db_select("generated_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)
        if db_items:
            existing_ids = {r.get("id") for r in local_items}
            for d in db_items:
                if d.get("id") not in existing_ids:
                    local_items.append(d)
    except Exception:
        pass
    return local_items


@router.post("", response_model=dict)
@router.post("/", response_model=dict)
async def generate_report_legacy(
    report_in: ReportCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Legacy endpoint: Trigger report generation (backward compatible)"""
    user_id = resolve_user_id(current_user, request)
    job_id = str(uuid.uuid4())

    data = report_in.dict()
    data["id"] = job_id
    data["user_id"] = user_id
    data["status"] = "pending"
    data["file_url"] = None
    data["created_at"] = datetime.now().isoformat()

    save_local_report(data)
    try:
        await db_insert("generated_reports", data, token=token)
    except Exception:
        pass

    background_tasks.add_task(
        _run_report_generation,
        job_id=job_id,
        user_id=user_id,
        report_type=report_in.report_type,
        parameters=report_in.parameters or {},
        file_format=report_in.file_format or "PDF",
        token=token
    )

    return data


@router.get("/scheduled", response_model=List[dict])
@router.get("/scheduled/", response_model=List[dict])
async def get_scheduled_reports(
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get all scheduled reports"""
    user_id = resolve_user_id(current_user, request)
    try:
        return await db_select("scheduled_reports", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)
    except Exception:
        return []


@router.post("/scheduled", response_model=dict)
@router.post("/scheduled/", response_model=dict)
async def create_scheduled_report(
    schedule_in: ScheduledReportCreate,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Create a new scheduled report"""
    user_id = resolve_user_id(current_user, request)
    data = schedule_in.dict()
    data["user_id"] = user_id

    try:
        result = await db_insert("scheduled_reports", data, token=token)
        if result.get("success"):
            return result["data"][0] if result.get("data") else data
    except Exception:
        pass

    return data


@router.patch("/scheduled/{schedule_id}")
@router.patch("/scheduled/{schedule_id}/")
async def update_scheduled_report(
    schedule_id: str,
    schedule_in: ScheduledReportUpdate,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing scheduled report."""
    _ = resolve_user_id(current_user, request)
    patch = schedule_in.model_dump(exclude_unset=True)
    try:
        result = await db_update("scheduled_reports", patch, {"id": schedule_id}, token=token)
        rows = result.get("data") or []
        if isinstance(rows, list) and rows:
            return rows[0]
    except Exception:
        pass
    return {"id": schedule_id, **patch}


@router.delete("/scheduled/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/scheduled/{schedule_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scheduled_report(
    schedule_id: str,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Delete a schedule"""
    _ = resolve_user_id(current_user, request)
    try:
        await db_delete("scheduled_reports", {"id": schedule_id}, token=token)
    except Exception:
        pass
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
        save_local_report({"id": job_id, "status": "processing"})
        try:
            await db_update(
                "generated_reports",
                {"status": "processing"},
                {"id": job_id},
                token=token
            )
        except Exception:
            pass

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

        # Cache file locally on disk
        _ensure_dirs()
        try:
            (REPORTS_FILES_DIR / filename).write_bytes(file_bytes)
        except Exception as disk_err:
            print(f"[REPORT] Could not cache to local disk: {disk_err}")

        # Upload to Supabase Storage if configured
        file_url = None
        try:
            from app.services.report_worker import _upload_to_storage
            file_url = await _upload_to_storage(file_bytes, filename, content_type, token)
        except Exception as storage_err:
            print(f"[REPORT] Supabase storage upload notice: {storage_err}")

        if not file_url:
            file_url = f"/api/v1/reports/download/{filename}"

        # Mark completed
        save_local_report({
            "id": job_id,
            "status": "completed",
            "file_url": file_url,
            "file_name": filename,
            "completed_at": datetime.now().isoformat()
        })
        try:
            await db_update(
                "generated_reports",
                {"status": "completed", "file_url": file_url, "file_name": filename},
                {"id": job_id},
                token=token
            )
        except Exception:
            pass

        print(f"[REPORT] Report {job_id} completed: {filename}")

    except Exception as e:
        print(f"[REPORT] Report {job_id} failed: {str(e)}")
        save_local_report({"id": job_id, "status": "failed", "error": str(e)})
        try:
            await db_update(
                "generated_reports",
                {"status": "failed"},
                {"id": job_id},
                token=token
            )
        except Exception:
            pass