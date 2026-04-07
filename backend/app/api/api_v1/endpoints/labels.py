from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import List, Optional
from app.db.supabase_db import db_select, db_delete, db_insert, db_update
from app.core.config import settings
from app.core import security
from app.services import label_studio_service
from pydantic import BaseModel
from uuid import UUID, uuid4
import datetime
import json
from pathlib import Path

router = APIRouter()
OFFLINE_LABELS_PATH = Path(__file__).resolve().parents[5] / "tmp" / "saved_labels_offline.json"

# ============================================
# SCHEMAS
# ============================================

class LabelDesignSchema(BaseModel):
    id: Optional[str] = None
    # Linkages (traceability context)
    harvestId: Optional[str] = None
    hiveId: Optional[str] = None
    apiaryId: Optional[str] = None
    traceUrl: Optional[str] = None

    name: str
    productName: str
    honeyType: str
    harvestYear: str
    weight: str
    weightUnit: str
    countryOfOrigin: Optional[str] = None
    country: str
    producer: str
    address: str
    marketingNote: Optional[str] = None
    
    # Optional fields
    showBatchNumber: bool = True
    batchNumber: Optional[str] = None
    showBottlingDate: bool = True
    bottlingDate: Optional[str] = None
    showBestBefore: bool = True
    bestBeforeDate: Optional[str] = None
    showStorageConditions: bool = True
    storageConditions: Optional[str] = None
    showContact: bool = True
    contactInfo: Optional[str] = None
    showQRCode: bool = False
    showFooter: bool = True
    showLogo: bool = True
    logoUrl: Optional[str] = None
    logoScale: float = 1.0

    # Style & Template
    template: str
    labelSize: str
    customWidth: str
    customHeight: str
    customShape: str
    backgroundColor: str
    textColor: str
    accentColor: str
    borderStyle: str
    
    # Export
    exportFormat: str = "PDF"
    exportDPI: str = "300"
    exportBleed: str = "3"
    showCropMarks: bool = True
    useA4Sheet: bool = False

    certifications: List[str] = []

class LabelDesignInternal(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    design_json: dict
    created_at: datetime.datetime


class LabelTemplateSchema(BaseModel):
    id: UUID
    name: str
    dimensions_json: Optional[dict] = None
    css_style: Optional[str] = None
    is_premium: bool = False

# ============================================
# HELPERS
# ============================================

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    return None

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub") or current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id


def _model_to_dict(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _resolve_label_name(design_data: dict) -> str:
    name = str(design_data.get("name") or design_data.get("productName") or "").strip()
    return name or "Untitled Label"


def _normalize_label_id(value: Optional[str]) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    try:
        return str(UUID(raw))
    except (ValueError, TypeError):
        return ""


def _db_token(token: Optional[str]) -> Optional[str]:
    """
    In local DEBUG runs we sometimes test the UI with a synthetic JWT.
    Use the service key for DB access so label flows can still be verified end-to-end.
    """
    if settings.DEBUG:
        return settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY or token
    return token


def _build_label_payload(design_data: dict, *, include_user_id: Optional[str] = None) -> dict:
    payload = {
        "name": _resolve_label_name(design_data),
        "design_json": design_data,
        "harvest_batch_id": design_data.get("batchNumber") or design_data.get("harvestId"),
        "include_qr": design_data.get("showQRCode", False),
        "custom_text": design_data.get("marketingNote"),
    }
    if include_user_id:
        payload["user_id"] = include_user_id
    return payload


def _normalize_saved_label(row: dict) -> dict:
    design_json = row.get("design_json") if isinstance(row.get("design_json"), dict) else {}
    normalized_name = str(row.get("name") or design_json.get("name") or design_json.get("productName") or "Untitled Label").strip() or "Untitled Label"
    normalized_id = str(row.get("id") or design_json.get("id") or "")
    normalized_design = {
        **design_json,
        "id": normalized_id,
        "name": normalized_name,
    }
    return {
        **row,
        "id": normalized_id,
        "name": normalized_name,
        "design_json": normalized_design,
    }


def _read_offline_labels() -> list[dict]:
    if not OFFLINE_LABELS_PATH.exists():
        return []
    try:
        return json.loads(OFFLINE_LABELS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def _write_offline_labels(rows: list[dict]) -> None:
    OFFLINE_LABELS_PATH.parent.mkdir(parents=True, exist_ok=True)
    OFFLINE_LABELS_PATH.write_text(json.dumps(rows, indent=2), encoding="utf-8")


def _offline_user_labels(user_id: str) -> list[dict]:
    rows = [row for row in _read_offline_labels() if row.get("user_id") == user_id]
    rows.sort(key=lambda row: row.get("created_at") or "", reverse=True)
    return rows


def _offline_get_label(label_id: str, user_id: str) -> Optional[dict]:
    return next((row for row in _offline_user_labels(user_id) if row.get("id") == label_id), None)


def _offline_upsert_label(label_id: str, user_id: str, design_data: dict) -> dict:
    rows = _read_offline_labels()
    now = datetime.datetime.utcnow().isoformat()
    record = {
        "id": label_id,
        "user_id": user_id,
        "design_json": design_data,
        "harvest_batch_id": design_data.get("batchNumber") or design_data.get("harvestId"),
        "include_qr": design_data.get("showQRCode", False),
        "custom_text": design_data.get("marketingNote"),
        "created_at": now,
    }

    updated = False
    for idx, row in enumerate(rows):
        if row.get("id") == label_id and row.get("user_id") == user_id:
            rows[idx] = {**row, **record, "created_at": row.get("created_at") or now}
            record = rows[idx]
            updated = True
            break
    if not updated:
        rows.append(record)

    _write_offline_labels(rows)
    return record


def _offline_delete_label(label_id: str, user_id: str) -> bool:
    rows = _read_offline_labels()
    kept = [row for row in rows if not (row.get("id") == label_id and row.get("user_id") == user_id)]
    if len(kept) == len(rows):
        return False
    _write_offline_labels(kept)
    return True


async def _get_saved_label(label_id: str, user_id: str, token: Optional[str]) -> dict:
    labels = await db_select(
        "saved_labels",
        filters={"id": label_id, "user_id": user_id},
        limit=1,
        token=_db_token(token),
    )
    if not labels and settings.DEBUG:
        offline = _offline_get_label(label_id, user_id)
        if offline:
            return _normalize_saved_label(offline)
    if not labels:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Label design not found")
    return _normalize_saved_label(labels[0])

# ============================================
# ENDPOINTS
# ============================================

@router.get("", response_model=List[dict])
async def get_user_labels(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all saved label designs for the current user"""
    rows = await db_select(
        "saved_labels",
        filters={"user_id": user_id},
        order_by="updated_at",
        ascending=False,
        token=_db_token(token),
    )
    if rows:
        return [_normalize_saved_label(row) for row in rows]
    if settings.DEBUG:
        return [_normalize_saved_label(row) for row in _offline_user_labels(user_id)]
    return rows


@router.get("/templates", response_model=List[dict])
async def get_label_templates(token: Optional[str] = Depends(get_token)):
    """List label templates available to the generator."""
    rows = await db_select(
        "label_templates",
        order_by="name",
        ascending=True,
        token=_db_token(token),
    )
    return rows


@router.get("/{label_id}", response_model=dict)
async def get_label_design(
    label_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get a single saved label design for the current user."""
    return await _get_saved_label(label_id, user_id, token)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_label_design(
    label_in: LabelDesignSchema,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new saved label design."""
    design_data = _model_to_dict(label_in)
    label_id = _normalize_label_id(design_data.get("id"))
    payload = _build_label_payload(design_data, include_user_id=user_id)

    if label_id:
        payload["id"] = label_id
        design_data["id"] = label_id
    else:
        design_data.pop("id", None)

    print(f"[LABELS] Creating label for user {user_id}, id={label_id or '<generated>'}, name={_resolve_label_name(design_data)}")

    result = await db_insert("saved_labels", payload, token=_db_token(token))

    if not result.get("success"):
        error_detail = result.get("error", "Failed to create label design")
        print(f"[LABELS] Create failed: {error_detail}")
        if settings.DEBUG:
            offline = _offline_upsert_label(label_id or str(uuid4()), user_id, design_data)
            return _normalize_saved_label(offline)
        raise HTTPException(status_code=500, detail=str(error_detail))

    data = result.get("data")
    if not data or not isinstance(data, list) or len(data) == 0:
        fallback_id = label_id or str(datetime.datetime.now().timestamp())
        return _normalize_saved_label({
            "id": fallback_id,
            "name": _resolve_label_name(design_data),
            "design_json": {**design_data, "id": fallback_id, "name": _resolve_label_name(design_data)},
            "user_id": user_id
        })

    return _normalize_saved_label(data[0])


@router.put("/{label_id}", response_model=dict)
async def update_label_design(
    label_id: str,
    label_in: LabelDesignSchema,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing saved label design."""
    await _get_saved_label(label_id, user_id, token)

    design_data = _model_to_dict(label_in)
    design_data["id"] = label_id
    payload = _build_label_payload(design_data)

    print(f"[LABELS] Updating label for user {user_id}, id={label_id}, name={_resolve_label_name(design_data)}")

    result = await db_update("saved_labels", payload, {"id": label_id, "user_id": user_id}, token=_db_token(token))
    if not result.get("success"):
        error_detail = result.get("error", "Failed to update label design")
        print(f"[LABELS] Update failed: {error_detail}")
        if settings.DEBUG:
            return _normalize_saved_label(_offline_upsert_label(label_id, user_id, design_data))
        raise HTTPException(status_code=500, detail=str(error_detail))

    return await _get_saved_label(label_id, user_id, token)


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label_design(
    label_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a saved label design"""
    await _get_saved_label(label_id, user_id, token)
    result = await db_delete("saved_labels", {"id": label_id, "user_id": user_id}, token=_db_token(token))
    if not result.get("success"):
        if settings.DEBUG and _offline_delete_label(label_id, user_id):
            return None
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete label design"))
    return None

@router.post("/export")
async def export_label_pdf(
    label_in: LabelDesignSchema,
    current_user: dict = Depends(security.get_current_user)
):
    """Generate and return a high-quality PDF for the label design"""
    try:
        pdf_bytes = label_studio_service.generate_advanced_label_pdf(label_in.dict())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(exc)}")

    filename = f"label_{label_in.productName.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

