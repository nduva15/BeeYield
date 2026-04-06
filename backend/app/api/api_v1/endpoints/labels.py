from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import List, Optional
from app.db.supabase_db import db_select, db_delete, db_upsert
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

def get_token(token: str = Depends(security.oauth2_scheme)) -> str:
    """Extract raw token from request headers"""
    return token

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id


def _coerce_uuid(value: Optional[str]) -> Optional[str]:
    """Return a normalized UUID string or None when the value is blank/invalid."""
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    try:
        return str(UUID(raw))
    except (ValueError, TypeError, AttributeError):
        return None

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

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def save_label_design(
    label_in: LabelDesignSchema,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Save or update a label design"""
    design_data = label_in.dict()
    label_id = _coerce_uuid(design_data.get("id"))
    
    payload = {
        "user_id": user_id,
        "design_json": design_data,
        # Store trace batch code (what ends up on jars / QR)
        "harvest_batch_id": design_data.get("batchNumber") or design_data.get("harvestId"),
        "include_qr": design_data.get("showQRCode", False),
        "custom_text": design_data.get("marketingNote"),
    }
    
    # Only include ID when it is a valid UUID accepted by the DB.
    if label_id:
        payload["id"] = label_id

    print(
        f"[LABELS] Saving label for user {user_id}, id={label_id}, "
        f"product={design_data.get('productName') or design_data.get('name') or 'Untitled Label'}"
    )

    # Use db_upsert for both insert and update
    result = await db_upsert("saved_labels", payload, token=token)
    
    if not result.get("success"):
        error_detail = result.get("error", "Failed to save label design")
        print(f"[LABELS] Save failed: {error_detail}")
        raise HTTPException(status_code=500, detail=str(error_detail))
    
    data = result.get("data")
    if not data or not isinstance(data, list) or len(data) == 0:
        # Fallback: return what we have so the frontend doesn't break
        return {"id": label_id or str(datetime.datetime.now().timestamp()), "design_json": design_data, "user_id": user_id}

    return data[0]

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label_design(
    label_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Delete a saved label design"""
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

