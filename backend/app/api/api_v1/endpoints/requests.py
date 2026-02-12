from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

from app.core import security
from app.db.supabase_db import db_insert, db_select, db_get_by_id
from app.services.email_service import email_service
from app.core.config import settings

router = APIRouter()

# ============================================
# SCHEMAS
# ============================================

class RequestCreate(BaseModel):
    subject: str = Field(..., description="Short summary of the issue")
    description: str = Field(..., description="Detailed explanation")
    category: str = Field("General", description="Hardware, Software, Traceability, General")
    priority: str = Field("Medium", description="Low, Medium, High, Critical")
    status: str = Field("Open", description="Draft, Open")

class RequestCommentCreate(BaseModel):
    message: str = Field(..., description="Content of the comment")

class RequestResponse(BaseModel):
    id: str
    user_id: str
    subject: str
    description: str
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

# ============================================
# ENDPOINTS
# ============================================

@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_in: RequestCreate,
    user_id: str = Depends(get_user_id)
):
    """
    Submit a new support request.
    Triggers an email notification to the admin.
    """
    data = request_in.dict() # pydantic v1
    data["user_id"] = user_id
    
    # Insert into database
    result = db_insert("requests", data)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create request")
        )
    
    new_request = result["data"][0] if result.get("data") else data
    
    # Send Email Notification
    try:
        # Determine admin email - checking config or defaulting
        # For now, we'll send to the configured generic FROM address or specific admin
        admin_email = "support@beeyield.com" # Could be configurable
        
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
        
        # We send this to the admin. 
        # Using the email service which might default to SMTP or Resend based on impl.
        # Ideally we send to a support email.
        # For now, let's send to the 'from_email' itself if it acts as admin, or a hardcoded one.
        # Since I can't easily change the recipient in 'email_service' without knowing who receives, 
        # I'll rely on the assumption that support@beeyield.com is monitored.
        
        email_service.send_email(
            to_email=admin_email, 
            subject=subject, 
            html_content=html_content
        )
        
        # Also confirm to user?
        # email_service.send_email(user_email, "Request Received", ...) 
        # (Need to fetch user email first, skipping for now as per immediate prompt)
        
    except Exception as e:
        print(f"Failed to send notification email: {e}")
        # Don't fail the request if email fails
        
    return new_request

@router.get("/", response_model=List[RequestResponse])
def get_my_requests(
    user_id: str = Depends(get_user_id)
):
    """
    Get all requests submitted by the current user.
    """
    # RLS should handle isolation, but we filter here too for double safety/performance
    requests = db_select("requests", filters={"user_id": user_id}, order_by="created_at", ascending=False)
    return requests

@router.get("/{request_id}", response_model=RequestResponse)
def get_request_details(
    request_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Get details of a specific request.
    """
    # Verify ownership via logic or trust RLS policies (db_select usually uses service role if not careful, 
    # but wrapper might utilize headers. 'db_select' in this codebase seems to use service_role client 
    # so we MUST filter manually).
    requests = db_select("requests", filters={"id": request_id, "user_id": user_id})
    
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return requests[0]

@router.post("/{request_id}/comments", response_model=CommentResponse)
def add_comment(
    request_id: str,
    comment_in: RequestCommentCreate,
    user_id: str = Depends(get_user_id)
):
    """
    Add a comment/reply to a request.
    """
    # Verify request exists and belongs to user
    requests = db_select("requests", filters={"id": request_id, "user_id": user_id})
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    data = {
        "request_id": request_id,
        "author_id": user_id,
        "message": comment_in.message
    }
    
    result = db_insert("request_comments", data)
    
    if not result.get("success"):
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to add comment")
        )
        
    return result["data"][0] if result.get("data") else data

@router.get("/{request_id}/comments", response_model=List[CommentResponse])
def get_request_comments(
    request_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Get all comments for a specific request.
    """
    # Verify request exists and belongs to user
    requests = db_select("requests", filters={"id": request_id, "user_id": user_id})
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    comments = db_select("request_comments", filters={"request_id": request_id}, order_by="created_at", ascending=True)
    return comments
