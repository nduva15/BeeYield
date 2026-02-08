"""
Reports & Exports API: generate (background), list history, download.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from fastapi.responses import RedirectResponse
from typing import Optional, List
from pydantic import BaseModel, Field
from app.db.supabase_db import db_select, db_insert
from app.api.api_v1.endpoints.beeyield import get_user_id
from app.services.reports_service import process_report_logic, REPORT_TYPES, FILE_FORMATS

router = APIRouter()


class ReportGenerateRequest(BaseModel):
    report_type: str = Field(..., description="harvest_yield, health_audit, sensor_logs, pollination_cert, financial")
    file_format: str = Field("pdf", description="pdf, csv, xlsx")
    apiary_id: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None


@router.post("/generate")
async def generate_report(
    request: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_user_id),
):
    """Start report generation in the background. Returns report id; poll list or download when status=completed."""
    report_type = (request.report_type or "harvest_yield").strip()
    file_format = (request.file_format or "pdf").lower()
    if report_type not in REPORT_TYPES:
        report_type = "harvest_yield"
    if file_format not in FILE_FORMATS:
        file_format = "pdf"

    record = {
        "user_id": user_id,
        "report_type": report_type,
        "parameters": {
            "report_type": report_type,
            "file_format": file_format,
            "apiary_id": request.apiary_id,
            "start": request.start,
            "end": request.end,
        },
        "file_format": file_format,
        "status": "pending",
    }
    result = db_insert("generated_reports", record)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error", "Failed to create report record"))
    report_id = result["data"][0]["id"]

    background_tasks.add_task(
        process_report_logic,
        report_id=report_id,
        user_id=user_id,
        params=record["parameters"],
    )
    return {"message": "Report generation started", "id": report_id}


@router.get("", response_model=List[dict])
def list_reports(
    user_id: str = Depends(get_user_id),
    limit: int = 50,
):
    """List generated reports for the current user (history)."""
    rows = db_select(
        "generated_reports",
        filters={"user_id": user_id},
        limit=limit,
        order_by="created_at",
        ascending=False,
    )
    return rows


@router.get("/download/{report_id}")
def download_report(
    report_id: str,
    user_id: str = Depends(get_user_id),
):
    """Return a signed URL or redirect to the report file. If storage is Supabase, returns signed URL; else redirect to static."""
    rows = db_select("generated_reports", filters={"id": report_id, "user_id": user_id}, limit=1)
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")
    report = rows[0]
    if report.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Report not ready yet; status=" + (report.get("status") or "pending"))
    storage_path = report.get("storage_path")
    if not storage_path:
        raise HTTPException(status_code=404, detail="Report file not found")

    # If path is static/reports/... serve from backend static mount
    if storage_path.startswith("static/"):
        return RedirectResponse(url=f"/{storage_path}")

    # Supabase Storage: create signed URL
    try:
        from app.db.supabase_db import get_supabase
        supabase = get_supabase()
        if supabase:
            signed = supabase.storage.from_("user-reports").create_signed_url(storage_path, 60)
            url = (signed or {}).get("signed_url") or (signed or {}).get("signedURL")
            if url:
                return RedirectResponse(url=url)
    except Exception:
        pass

    return RedirectResponse(url=f"/static/reports/{report_id}.{report.get('file_format', 'pdf')}")


@router.get("/{report_id}", response_model=dict)
def get_report(
    report_id: str,
    user_id: str = Depends(get_user_id),
):
    """Get a single report record (for polling status)."""
    rows = db_select("generated_reports", filters={"id": report_id, "user_id": user_id}, limit=1)
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")
    return rows[0]
