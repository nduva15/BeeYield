from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.core import security
from app.db.supabase_db import db_insert, db_select, db_update, db_delete
from app.services.email_service import email_service
from app.core.config import settings

router = APIRouter()

# ============================================
# SCHEMAS
# ============================================

class RequestCreate(BaseModel):
    subject: str = Field(..., description="Short summary of the issue")
    description: str = Field(..., description="Detailed explanation")
    type: Optional[str] = Field(None, description="support, maintenance, inspection, other")
    apiary_id: Optional[str] = Field(None, description="Related apiary")
    hive_id: Optional[str] = Field(None, description="Related hive")
    category: str = Field("General", description="Hardware, Software, Traceability, General")
    priority: str = Field("Medium", description="Low, Medium, High, Critical")
    status: str = Field("Open", description="Draft, Open")

class RequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    apiary_id: Optional[str] = None
    hive_id: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # Open, In Progress, Resolved, Draft

class RequestCommentCreate(BaseModel):
    message: str = Field(..., description="Content of the comment")

class RequestResponse(BaseModel):
    id: str
    user_id: str
    subject: str
    description: str
    type: Optional[str] = None
    apiary_id: Optional[str] = None
    hive_id: Optional[str] = None
    category: str
    status: str
    priority: str
    created_at: str
    updated_at: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    request_id: str
    author_id: str
    message: str
    created_at: str

# ============================================
# DEPENDENCIES
# ============================================

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    """Extract user ID from JWT token"""
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

def _is_admin(current_user: dict) -> bool:
    return (current_user.get("email") or "").lower() == (settings.ADMIN_EMAIL or "").lower()

def _normalize_status(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    v = str(value).strip()
    if not v:
        return None
    # Normalize common variants
    v_lower = v.lower().replace("_", " ")
    if v_lower in {"open", "opened", "new"}:
        return "Open"
    if v_lower in {"in progress", "inprogress", "progress"}:
        return "In Progress"
    if v_lower in {"resolved", "done", "closed"}:
        return "Resolved"
    if v_lower in {"draft"}:
        return "Draft"
    # Keep as-is (but callers must validate)
    return v

def _validate_status_transition(existing: str, desired: str, is_admin: bool) -> None:
    allowed = {"Draft", "Open", "In Progress", "Resolved"}
    if desired not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status '{desired}'. Allowed: {sorted(allowed)}")

    if is_admin:
        return

    # Non-admin users can only keep requests in Draft/Open.
    if desired not in {"Draft", "Open"}:
        raise HTTPException(status_code=403, detail="Only admins can set this status")
    if existing not in {"Draft", "Open"}:
        raise HTTPException(status_code=403, detail="Request can no longer be modified")

# ============================================
# ENDPOINTS
# ============================================

@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_in: RequestCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Submit a new support request.
    Triggers an email notification to the admin.
    """
    data = request_in.dict() # pydantic v1
    normalized_status = _normalize_status(data.get("status")) or "Open"
    if normalized_status not in {"Draft", "Open"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New requests can only start as Draft or Open"
        )
    data["status"] = normalized_status
    data["user_id"] = user_id
    
    # Insert into database
    result = await db_insert("requests", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create request")
        )
    
    new_request = result["data"][0] if result.get("data") else data
    
    # Send Email Notification
    try:
        # Determine admin email - checking config or defaulting
        admin_email = "support@beeyield.com" 
        
        subject = f"New Support Request: {new_request.get('subject')} ({new_request.get('category')})"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>New Request Submitted</h2>
            <p><strong>User ID:</strong> {user_id}</p>
            <p><strong>Category:</strong> {new_request.get('category')}</p>
            <p><strong>Priority:</strong> {new_request.get('priority')}</p>
            <p><strong>Subject:</strong> {new_request.get('subject')}</p>
            <hr/>
            <p><strong>Description:</strong></p>
            <p>{new_request.get('description')}</p>
            <hr/>
            <p><a href="{settings.APP_URL}/admin/requests/{new_request.get('id')}">View in Admin Panel</a></p>
        </body>
        </html>
        """
        
        email_service.send_email(
            to_email=admin_email, 
            subject=subject, 
            html_content=html_content
        )
        
    except Exception as e:
        print(f"Failed to send notification email: {e}")
        
    return new_request

@router.get("/", response_model=List[RequestResponse])
async def get_my_requests(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get support requests.
    - Regular users receive only their own requests.
    - Admins receive the full support queue.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters = None if _is_admin(current_user) else {"user_id": user_id}
    return await db_select("requests", filters=filters, order_by="created_at", ascending=False, token=token)

@router.get("/{request_id}", response_model=RequestResponse)
async def get_request_details(
    request_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get details of a specific request.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters: dict[str, Any] = {"id": request_id}
    if not _is_admin(current_user):
        filters["user_id"] = user_id

    requests = await db_select("requests", filters=filters, token=token)
    
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return requests[0]

@router.patch("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: str,
    patch: RequestUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Update a support request.
    - Owners can edit subject/description/category/priority while status is Draft/Open.
    - Only admins can set status to In Progress/Resolved.
    """
    is_admin = _is_admin(current_user)
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    # Load existing request (admin can access any; users only their own)
    existing_filters: dict[str, Any] = {"id": request_id}
    if not is_admin:
        existing_filters["user_id"] = user_id

    rows = await db_select("requests", filters=existing_filters, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Request not found")
    existing = rows[0]

    payload = patch.dict(exclude_unset=True)
    # Normalize/validate status if provided
    if "status" in payload:
        desired = _normalize_status(payload.get("status"))
        if desired is None:
            payload.pop("status", None)
        else:
            current = _normalize_status(existing.get("status") or "Open") or "Open"
            _validate_status_transition(current, desired, is_admin=is_admin)
            payload["status"] = desired

    # Non-admin: block edits once the request is no longer editable
    if not is_admin:
        current = _normalize_status(existing.get("status") or "Open") or "Open"
        if current not in {"Draft", "Open"}:
            raise HTTPException(status_code=403, detail="Request can no longer be modified")

    # Nothing to update
    if not payload:
        return existing

    payload["updated_at"] = datetime.utcnow().isoformat()

    update_filters: dict[str, Any] = {"id": request_id}
    if not is_admin:
        update_filters["user_id"] = user_id

    res = await db_update("requests", payload, update_filters, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update request"))

    # Re-fetch for a stable response
    updated_rows = await db_select("requests", filters=existing_filters, token=token)
    return updated_rows[0] if updated_rows else {**existing, **payload}

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Delete a support request.
    - Owners can delete while status is Draft/Open.
    - Admins can delete any.
    """
    is_admin = _is_admin(current_user)
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters: dict[str, Any] = {"id": request_id}
    if not is_admin:
        filters["user_id"] = user_id

    rows = await db_select("requests", filters=filters, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Request not found")

    existing = rows[0]
    if not is_admin:
        current = _normalize_status(existing.get("status") or "Open") or "Open"
        if current not in {"Draft", "Open"}:
            raise HTTPException(status_code=403, detail="Only Draft/Open requests can be deleted")

    res = await db_delete("requests", filters=filters, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete request"))
    return None

@router.post("/{request_id}/comments", response_model=CommentResponse)
async def add_comment(
    request_id: str,
    comment_in: RequestCommentCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Add a comment/reply to a request.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters: dict[str, Any] = {"id": request_id}
    if not _is_admin(current_user):
        filters["user_id"] = user_id

    requests = await db_select("requests", filters=filters, token=token)
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    data = {
        "request_id": request_id,
        "author_id": user_id,
        "message": comment_in.message
    }
    
    result = await db_insert("request_comments", data, token=token)
    
    if not result.get("success"):
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to add comment")
        )
        
    return result["data"][0] if result.get("data") else data

@router.get("/{request_id}/comments", response_model=List[CommentResponse])
async def get_request_comments(
    request_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all comments for a specific request.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters: dict[str, Any] = {"id": request_id}
    if not _is_admin(current_user):
        filters["user_id"] = user_id

    requests = await db_select("requests", filters=filters, token=token)
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    comments = await db_select("request_comments", filters={"request_id": request_id}, order_by="created_at", ascending=True, token=token)
    return comments

