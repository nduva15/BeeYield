from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from pydantic import BaseModel, Field

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
    type: str = Field("support", description="support, maintenance, inspection, other")
    category: str = Field("General", description="Hardware, Software, Traceability, General")
    priority: str = Field("medium", description="low, medium, high, critical")
    status: str = Field("new", description="new, open, in_progress, resolved, closed")
    apiary_id: Optional[str] = Field(None, description="Optional apiary reference")
    hive_id: Optional[str] = Field(None, description="Optional hive reference")

class RequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    apiary_id: Optional[str] = None
    hive_id: Optional[str] = None

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

def get_user_payload(current_user: dict = Depends(security.get_current_user)) -> dict:
    return current_user

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# ============================================
# ENDPOINTS
# ============================================

ALLOWED_STATUSES = {"new", "open", "in_progress", "resolved", "closed"}
ALLOWED_PRIORITIES = {"low", "medium", "high", "critical"}

def _normalize_status(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    return str(s).strip().lower()

def _normalize_priority(p: Optional[str]) -> Optional[str]:
    if p is None:
        return None
    return str(p).strip().lower()

def _validate_status_transition(old_status: Optional[str], new_status: Optional[str]) -> None:
    """
    Minimal guardrails:
    - Only allow known statuses
    - Don't allow reopening closed/resolved requests to earlier states
    """
    if new_status is None:
        return
    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
    if old_status in {"resolved", "closed"} and new_status in {"new", "open", "in_progress"}:
        raise HTTPException(status_code=400, detail=f"Cannot transition from {old_status} to {new_status}")

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
    data["status"] = _normalize_status(data.get("status")) or "new"
    data["priority"] = _normalize_priority(data.get("priority")) or "medium"
    if data["status"] not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data['status']}")
    if data["priority"] not in ALLOWED_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"Invalid priority: {data['priority']}")
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
    user_id: str = Depends(get_user_id),
    user: dict = Depends(get_user_payload),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all requests submitted by the current user.
    """
    is_admin = (user.get("email") == settings.ADMIN_EMAIL)
    filters = {} if is_admin else {"user_id": user_id}
    return await db_select("requests", filters=filters, order_by="created_at", ascending=False, token=token)

@router.get("/{request_id}", response_model=RequestResponse)
async def get_request_details(
    request_id: str,
    user_id: str = Depends(get_user_id),
    user: dict = Depends(get_user_payload),
    token: Optional[str] = Depends(get_token)
):
    """
    Get details of a specific request.
    """
    is_admin = (user.get("email") == settings.ADMIN_EMAIL)
    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    requests = await db_select("requests", filters=filters, token=token, limit=1)
    
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return requests[0]

@router.patch("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: str,
    patch: RequestUpdate,
    user_id: str = Depends(get_user_id),
    user: dict = Depends(get_user_payload),
    token: Optional[str] = Depends(get_token),
):
    """
    Update a support request (owner or admin).
    """
    is_admin = (user.get("email") == settings.ADMIN_EMAIL)
    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    rows = await db_select("requests", filters=filters, token=token, limit=1)
    if not rows:
        raise HTTPException(status_code=404, detail="Request not found")

    existing = rows[0]
    data = patch.dict(exclude_unset=True)

    if "status" in data:
        data["status"] = _normalize_status(data.get("status"))
        _validate_status_transition(_normalize_status(existing.get("status")), data["status"])

    if "priority" in data:
        data["priority"] = _normalize_priority(data.get("priority"))
        if data["priority"] not in ALLOWED_PRIORITIES:
            raise HTTPException(status_code=400, detail=f"Invalid priority: {data['priority']}")

    if not data:
        return existing

    result = await db_update("requests", data, {"id": request_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update request"))

    updated_rows = result.get("data") or []
    if isinstance(updated_rows, list) and updated_rows:
        return updated_rows[0]

    # Fallback: re-fetch
    rows2 = await db_select("requests", filters={"id": request_id}, token=token, limit=1)
    if not rows2:
        raise HTTPException(status_code=500, detail="Failed to load updated request")
    return rows2[0]

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: str,
    user_id: str = Depends(get_user_id),
    user: dict = Depends(get_user_payload),
    token: Optional[str] = Depends(get_token),
):
    """
    Delete a support request (owner or admin).
    """
    is_admin = (user.get("email") == settings.ADMIN_EMAIL)
    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    rows = await db_select("requests", filters=filters, token=token, limit=1)
    if not rows:
        raise HTTPException(status_code=404, detail="Request not found")

    res = await db_delete("requests", {"id": request_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete request"))
    return None

@router.post("/{request_id}/comments", response_model=CommentResponse)
async def add_comment(
    request_id: str,
    comment_in: RequestCommentCreate,
    user_id: str = Depends(get_user_id),
    user: dict = Depends(get_user_payload),
    token: Optional[str] = Depends(get_token)
):
    """
    Add a comment/reply to a request.
    """
    # Verify request exists and belongs to user
    is_admin = (user.get("email") == settings.ADMIN_EMAIL)
    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    requests = await db_select("requests", filters=filters, token=token, limit=1)
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
    user_id: str = Depends(get_user_id),
    user: dict = Depends(get_user_payload),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all comments for a specific request.
    """
    # Verify request exists and belongs to user
    is_admin = (user.get("email") == settings.ADMIN_EMAIL)
    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    requests = await db_select("requests", filters=filters, token=token, limit=1)
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    comments = await db_select("request_comments", filters={"request_id": request_id}, order_by="created_at", ascending=True, token=token)
    return comments

