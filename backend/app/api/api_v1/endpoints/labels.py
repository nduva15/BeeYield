from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import List, Optional
from app.db.supabase_db import db_select, db_delete, db_insert, db_update
from app.core import security
from app.services import label_studio_service
from pydantic import BaseModel
from uuid import UUID
import datetime

router = APIRouter()

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


def _build_label_payload(design_data: dict, *, include_user_id: Optional[str] = None) -> dict:
    payload = {
        "name": _resolve_label_name(design_data),
        "design_json": design_data,
        "harvest_batch_id": design_data.get("batchNumber") or design_data.get("harvestId"),
        "include_qr": design_data.get("showQRCode", False),
    }
    if include_user_id:
        payload["user_id"] = include_user_id
    return payload


async def _get_saved_label(label_id: str, user_id: str, token: Optional[str]) -> dict:
    labels = await db_select(
        "saved_labels",
        filters={"id": label_id, "user_id": user_id},
        limit=1,
        token=token,
    )
    if not labels:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Label design not found")
    return labels[0]

# ============================================
# ENDPOINTS
# ============================================

@router.get("", response_model=List[dict])
async def get_user_labels(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all saved label designs for the current user"""
    return await db_select("saved_labels", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)


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
    label_id = str(design_data.get("id") or "").strip()
    payload = _build_label_payload(design_data, include_user_id=user_id)

    if label_id:
        payload["id"] = label_id
        design_data["id"] = label_id

    print(f"[LABELS] Creating label for user {user_id}, id={label_id or '<generated>'}, name={payload['name']}")

    result = await db_insert("saved_labels", payload, token=token)

    if not result.get("success"):
        error_detail = result.get("error", "Failed to create label design")
        print(f"[LABELS] Create failed: {error_detail}")
        raise HTTPException(status_code=500, detail=str(error_detail))

    data = result.get("data")
    if not data or not isinstance(data, list) or len(data) == 0:
        fallback_id = label_id or str(datetime.datetime.now().timestamp())
        return {
            "id": fallback_id,
            "name": payload["name"],
            "design_json": {**design_data, "id": fallback_id, "name": payload["name"]},
            "user_id": user_id
        }

    return data[0]


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

    print(f"[LABELS] Updating label for user {user_id}, id={label_id}, name={payload['name']}")

    result = await db_update("saved_labels", payload, {"id": label_id, "user_id": user_id}, token=token)
    if not result.get("success"):
        error_detail = result.get("error", "Failed to update label design")
        print(f"[LABELS] Update failed: {error_detail}")
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
    result = await db_delete("saved_labels", {"id": label_id, "user_id": user_id}, token=token)
    if not result.get("success"):
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

