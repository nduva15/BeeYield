from fastapi import APIRouter, Depends, HTTPException, status, Request
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

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

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
    token: Optional[str] = Depends(get_token)
):
    """
    Get all requests submitted by the current user.
    """
    return await db_select("requests", filters={"user_id": user_id}, order_by="created_at", ascending=False, token=token)

@router.get("/{request_id}", response_model=RequestResponse)
async def get_request_details(
    request_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Get details of a specific request.
    """
    requests = await db_select("requests", filters={"id": request_id, "user_id": user_id}, token=token)
    
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return requests[0]

@router.post("/{request_id}/comments", response_model=CommentResponse)
async def add_comment(
    request_id: str,
    comment_in: RequestCommentCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Add a comment/reply to a request.
    """
    # Verify request exists and belongs to user
    requests = await db_select("requests", filters={"id": request_id, "user_id": user_id}, token=token)
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
    token: Optional[str] = Depends(get_token)
):
    """
    Get all comments for a specific request.
    """
    # Verify request exists and belongs to user
    requests = await db_select("requests", filters={"id": request_id, "user_id": user_id}, token=token)
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")
        
    comments = await db_select("request_comments", filters={"request_id": request_id}, order_by="created_at", ascending=True, token=token)
    return comments

