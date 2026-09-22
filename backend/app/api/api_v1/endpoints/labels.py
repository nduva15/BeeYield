from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import uuid4
import datetime
import json
from pathlib import Path

from app.core import security
from app.db.supabase_db import db_select, db_delete, db_insert, db_update
from app.services import label_studio_service

router = APIRouter()

# Durable persistent JSON storage in backend/app/data/saved_labels.json
DATA_FILE_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "saved_labels.json"


# ============================================
# SCHEMAS
# ============================================

class LabelDesignSchema(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: Optional[str] = None
    harvestId: Optional[str] = None
    hiveId: Optional[str] = None
    apiaryId: Optional[str] = None
    traceUrl: Optional[str] = None

    name: Optional[str] = "Untitled Label"
    productName: Optional[str] = "BeeYield Pure Honey"
    honeyType: Optional[str] = "Raw Organic Honey"
    harvestYear: Optional[str] = "2026"
    weight: Optional[str] = "500"
    weightUnit: Optional[str] = "g"
    countryOfOrigin: Optional[str] = "Kenya"
    country: Optional[str] = "Kenya"
    producer: Optional[str] = "BeeYield Partners"
    address: Optional[str] = "Nairobi, Kenya"
    marketingNote: Optional[str] = "Cold-extracted from native floral sources. 100% natural goodness."

    showBatchNumber: bool = True
    batchNumber: Optional[str] = None
    showBottlingDate: bool = True
    bottlingDate: Optional[str] = None
    showBestBefore: bool = True
    bestBeforeDate: Optional[str] = None
    showStorageConditions: bool = True
    storageConditions: Optional[str] = "Store in a cool, dry place away from direct sunlight."
    showContact: bool = True
    contactInfo: Optional[str] = "www.beeyield.com • hello@beeyield.com"
    showQRCode: bool = False
    showFooter: bool = True
    showLogo: bool = True
    logoUrl: Optional[str] = None
    logoScale: float = 1.0

    template: Optional[str] = "minimal-amber"
    labelSize: Optional[str] = "99x57"
    customWidth: Optional[str] = "99.1"
    customHeight: Optional[str] = "57"
    customShape: Optional[str] = "Rectangle"
    backgroundColor: Optional[str] = "#FFFBF0"
    textColor: Optional[str] = "#2D241E"
    accentColor: Optional[str] = "#D97706"
    borderStyle: Optional[str] = "elegant"

    exportFormat: Optional[str] = "PDF"
    exportDPI: Optional[str] = "300"
    exportBleed: Optional[str] = "3"
    showCropMarks: bool = True
    useA4Sheet: bool = False

    certifications: List[str] = Field(default_factory=list)


# ============================================
# AUTHENTICATION & USER RESOLUTION
# ============================================

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header."""
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split(" ", 1)[1]
    except Exception:
        pass
    return None


def _clean_token(token: Any) -> Optional[str]:
    if token is None:
        return None
    if isinstance(token, str) and not token.startswith("Depends("):
        return token
    return None


async def resolve_user_id(
    request: Request,
    current_user: Optional[dict] = Depends(security.get_optional_current_user)
) -> str:
    """
    Robust user identity resolution:
    1. Authenticated user from verified token (sub or id)
    2. Explicit X-User-Id header
    3. Hardware/Device identity X-Device-Id
    4. Fallback default user UUID (prevents 401/422 for unauthenticated/guest sessions)
    """
    if current_user and (current_user.get("sub") or current_user.get("id")):
        return str(current_user.get("sub") or current_user.get("id"))

    x_user = request.headers.get("X-User-Id")
    if x_user:
        return x_user

    x_device = request.headers.get("X-Device-Id")
    if x_device:
        return x_device

    # Also inspect authorization token payload if available without raising
    token = get_token(request)
    if token:
        try:
            payload = security.decode_access_token(token)
            if payload and (payload.get("sub") or payload.get("id")):
                return str(payload.get("sub") or payload.get("id"))
        except Exception:
            pass

    return "00000000-0000-0000-0000-000000000001"


# ============================================
# PERSISTENCE HELPERS
# ============================================

def _read_data_file() -> List[dict]:
    if not DATA_FILE_PATH.exists():
        return []
    try:
        content = DATA_FILE_PATH.read_text(encoding="utf-8")
        if not content.strip():
            return []
        data = json.loads(content)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[LABELS] Error reading data file {DATA_FILE_PATH}: {e}")
        return []


def _write_data_file(rows: List[dict]) -> None:
    try:
        DATA_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        # Atomic write via temporary file
        tmp_file = DATA_FILE_PATH.with_suffix(".tmp")
        tmp_file.write_text(json.dumps(rows, indent=2, default=str), encoding="utf-8")
        tmp_file.replace(DATA_FILE_PATH)
    except Exception as e:
        print(f"[LABELS] Error writing data file {DATA_FILE_PATH}: {e}")


def _normalize_saved_label(row: dict) -> dict:
    """Ensure output format satisfies frontend LabelDesign contract."""
    design_json = row.get("design_json") if isinstance(row.get("design_json"), dict) else {}
    record_id = str(row.get("id") or design_json.get("id") or uuid4())
    name = str(row.get("name") or design_json.get("name") or design_json.get("productName") or "Untitled Label").strip() or "Untitled Label"

    combined = {
        **design_json,
        "id": record_id,
        "name": name,
        "productName": design_json.get("productName") or name,
        "user_id": str(row.get("user_id") or ""),
        "created_at": row.get("created_at") or datetime.datetime.utcnow().isoformat(),
        "updated_at": row.get("updated_at") or datetime.datetime.utcnow().isoformat(),
    }
    return combined


# ============================================
# ENDPOINTS
# ============================================

@router.get("", response_model=List[dict])
async def get_user_labels(
    request: Request,
    user_id: str = Depends(resolve_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all saved label designs for the current user."""
    # 1. First read local durable store
    all_local = _read_data_file()
    user_rows = [r for r in all_local if r.get("user_id") == user_id]

    # If no rows for this specific user_id, also allow default/anonymous rows if user is default
    if not user_rows and user_id == "00000000-0000-0000-0000-000000000001":
        user_rows = all_local

    # 2. Try Supabase merge if available
    try:
        sb_rows = await db_select("saved_labels", filters={"user_id": user_id}, order_by="updated_at", ascending=False, token=_clean_token(token))
        if sb_rows:
            seen_ids = {r.get("id") for r in user_rows}
            for row in sb_rows:
                if row.get("id") not in seen_ids:
                    user_rows.append(row)
    except Exception:
        pass

    user_rows.sort(key=lambda r: str(r.get("updated_at") or r.get("created_at") or ""), reverse=True)
    return [_normalize_saved_label(r) for r in user_rows]


@router.get("/templates", response_model=List[dict])
async def get_label_templates(token: Optional[str] = Depends(get_token)):
    """List label templates available to the generator."""
    default_templates = [
        {"id": "minimal-amber", "name": "Minimal Amber", "description": "Clean typography, warm honey gold.", "color": "#FFFBF0", "textColor": "#2D241E", "accent": "#D97706"},
        {"id": "minimal-ink", "name": "Minimal Ink", "description": "Deep obsidian dark contrast.", "color": "#1A1A1A", "textColor": "#FFFFFF", "accent": "#F5A623"},
        {"id": "minimal-cream", "name": "Minimal Cream", "description": "Soft organic artisan cream palette.", "color": "#FFF8E7", "textColor": "#2D241E", "accent": "#D97706"},
        {"id": "apiary-forest", "name": "Forest Dark", "description": "Wildflower deep woodland green.", "color": "#0F291E", "textColor": "#F0FDF4", "accent": "#34D399"},
        {"id": "apiary-hex", "name": "Apiary Hex", "description": "Geometric honey cell patterning.", "color": "#FFFFFF", "textColor": "#1A1A1A", "accent": "#E67E22"},
        {"id": "royal-blue", "name": "Royal Blue", "description": "Export grade premium gold and royal indigo.", "color": "#1E3A8A", "textColor": "#FFFFFF", "accent": "#FCD34D"},
    ]
    try:
        sb_rows = await db_select("label_templates", order_by="name", ascending=True, token=_clean_token(token))
        if sb_rows:
            return sb_rows
    except Exception:
        pass
    return default_templates


@router.get("/{label_id}", response_model=dict)
async def get_label_design(
    label_id: str,
    user_id: str = Depends(resolve_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get a single saved label design by ID."""
    all_rows = _read_data_file()
    for row in all_rows:
        if str(row.get("id")) == label_id:
            return _normalize_saved_label(row)

    # Try Supabase fallback
    try:
        sb_rows = await db_select("saved_labels", filters={"id": label_id}, limit=1, token=_clean_token(token))
        if sb_rows:
            return _normalize_saved_label(sb_rows[0])
    except Exception:
        pass

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Label design not found")


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_label_design(
    label_in: LabelDesignSchema,
    user_id: str = Depends(resolve_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Create a new saved label design (Full CRUD)."""
    design_dict = label_in.model_dump()
    label_id = str(design_dict.get("id") or uuid4())
    design_dict["id"] = label_id
    design_name = str(design_dict.get("name") or design_dict.get("productName") or "Untitled Label").strip()

    now = datetime.datetime.utcnow().isoformat()
    record = {
        "id": label_id,
        "user_id": user_id,
        "name": design_name,
        "design_json": design_dict,
        "harvest_batch_id": design_dict.get("batchNumber") or design_dict.get("harvestId"),
        "include_qr": bool(design_dict.get("showQRCode")),
        "custom_text": design_dict.get("marketingNote"),
        "created_at": now,
        "updated_at": now,
    }

    # 1. Save in local durable store
    all_rows = _read_data_file()
    existing_idx = next((i for i, r in enumerate(all_rows) if str(r.get("id")) == label_id), None)
    if existing_idx is not None:
        all_rows[existing_idx] = {**all_rows[existing_idx], **record, "updated_at": now}
    else:
        all_rows.insert(0, record)
    _write_data_file(all_rows)
    print(f"[LABELS] Saved label '{design_name}' (id: {label_id}) to durable store for user {user_id}")

    # 2. Mirror to Supabase if table exists
    try:
        sb_payload = {
            "id": label_id,
            "user_id": user_id,
            "name": design_name,
            "design_json": design_dict,
            "harvest_batch_id": record["harvest_batch_id"],
            "include_qr": record["include_qr"],
            "custom_text": record["custom_text"],
        }
        await db_insert("saved_labels", sb_payload, token=_clean_token(token))
    except Exception:
        pass

    return _normalize_saved_label(record)


@router.put("/{label_id}", response_model=dict)
@router.patch("/{label_id}", response_model=dict)
async def update_label_design(
    label_id: str,
    label_in: LabelDesignSchema,
    user_id: str = Depends(resolve_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update an existing saved label design (Full CRUD)."""
    design_dict = label_in.model_dump()
    design_dict["id"] = label_id
    design_name = str(design_dict.get("name") or design_dict.get("productName") or "Untitled Label").strip()
    now = datetime.datetime.utcnow().isoformat()

    all_rows = _read_data_file()
    existing_idx = next((i for i, r in enumerate(all_rows) if str(r.get("id")) == label_id), None)

    record = {
        "id": label_id,
        "user_id": user_id,
        "name": design_name,
        "design_json": design_dict,
        "harvest_batch_id": design_dict.get("batchNumber") or design_dict.get("harvestId"),
        "include_qr": bool(design_dict.get("showQRCode")),
        "custom_text": design_dict.get("marketingNote"),
        "updated_at": now,
    }

    if existing_idx is not None:
        created_at = all_rows[existing_idx].get("created_at") or now
        record["created_at"] = created_at
        all_rows[existing_idx] = {**all_rows[existing_idx], **record}
    else:
        record["created_at"] = now
        all_rows.insert(0, record)

    _write_data_file(all_rows)
    print(f"[LABELS] Updated label '{design_name}' (id: {label_id}) in durable store")

    # Mirror to Supabase if table exists
    try:
        sb_payload = {
            "name": design_name,
            "design_json": design_dict,
            "harvest_batch_id": record["harvest_batch_id"],
            "include_qr": record["include_qr"],
            "custom_text": record["custom_text"],
        }
        await db_update("saved_labels", sb_payload, {"id": label_id}, token=_clean_token(token))
    except Exception:
        pass

    return _normalize_saved_label(record)


@router.delete("/{label_id}", status_code=status.HTTP_200_OK)
async def delete_label_design(
    label_id: str,
    user_id: str = Depends(resolve_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a saved label design (Full CRUD)."""
    all_rows = _read_data_file()
    kept_rows = [r for r in all_rows if str(r.get("id")) != label_id]
    deleted = len(kept_rows) < len(all_rows)

    _write_data_file(kept_rows)
    print(f"[LABELS] Deleted label {label_id} from durable store (deleted={deleted})")

    # Mirror delete to Supabase if table exists
    try:
        await db_delete("saved_labels", {"id": label_id}, token=_clean_token(token))
    except Exception:
        pass

    return {"success": True, "deleted_id": label_id}


@router.post("/export")
async def export_label_pdf(
    label_in: LabelDesignSchema,
    user_id: str = Depends(resolve_user_id)
):
    """Generate and return a high-quality PDF for the label design."""
    try:
        pdf_bytes = label_studio_service.generate_advanced_label_pdf(label_in.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(exc)}")

    prod_name = (label_in.productName or "honey").replace(" ", "_")
    filename = f"label_{prod_name}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
