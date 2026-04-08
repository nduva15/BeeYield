from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.core import security
from app.db.supabase_db import db_insert, db_select, db_update, db_delete
from app.services.email_service import email_service
from app.core.config import settings

router = APIRouter()


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
    status: Optional[str] = None


class RequestCommentCreate(BaseModel):
    message: str = Field(..., description="Content of the comment")


class RequestResponse(BaseModel):
    id: str
    user_id: str
    reference_id: Optional[str] = None
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
    is_internal: Optional[bool] = None


def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token",
        )
    return user_id


def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


def _is_admin(current_user: dict) -> bool:
    email = (current_user.get("email") or "").lower()
    admin_email = (settings.ADMIN_EMAIL or "").lower()
    role = str(
        current_user.get("role")
        or current_user.get("user_metadata", {}).get("role")
        or current_user.get("app_metadata", {}).get("role")
        or ""
    ).lower()
    return email == admin_email or role in {"admin", "super_admin"}


def _normalize_status(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    normalized = raw.lower().replace("_", " ")
    if normalized in {"open", "opened", "new"}:
        return "Open"
    if normalized in {"in progress", "inprogress", "progress"}:
        return "In Progress"
    if normalized in {"resolved", "done", "closed"}:
        return "Resolved"
    if normalized == "draft":
        return "Draft"
    return raw


def _normalize_priority(value: Optional[str]) -> str:
    raw = str(value or "Medium").strip().lower()
    if raw == "low":
        return "Low"
    if raw == "high":
        return "High"
    if raw == "critical":
        return "Critical"
    return "Medium"


def _request_category(type_value: Optional[str], category_value: Optional[str]) -> str:
    chosen = category_value or type_value or "General"
    return str(chosen).strip() or "General"


def _request_reference(request_id: Optional[str]) -> Optional[str]:
    if not request_id:
        return None
    return f"REQ-{str(request_id)[:8].upper()}"


def _serialize_request(row: dict[str, Any]) -> dict[str, Any]:
    payload = dict(row)
    payload["status"] = _normalize_status(payload.get("status")) or "Open"
    payload["priority"] = _normalize_priority(payload.get("priority"))
    payload["category"] = _request_category(payload.get("type"), payload.get("category"))
    payload["type"] = payload.get("type") or payload.get("category") or "support"
    payload["reference_id"] = payload.get("reference_id") or _request_reference(payload.get("id"))
    return payload


def _serialize_comment(row: dict[str, Any], request_owner_id: Optional[str]) -> dict[str, Any]:
    payload = dict(row)
    payload["is_internal"] = bool(
        request_owner_id and payload.get("author_id") and payload.get("author_id") != request_owner_id
    )
    return payload


def _validate_status_transition(existing: str, desired: str, is_admin: bool) -> None:
    allowed = {"Draft", "Open", "In Progress", "Resolved"}
    if desired not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status '{desired}'. Allowed: {sorted(allowed)}")
    if is_admin:
        return
    if desired not in {"Draft", "Open"}:
        raise HTTPException(status_code=403, detail="Only admins can set this status")
    if existing not in {"Draft", "Open"}:
        raise HTTPException(status_code=403, detail="Request can no longer be modified")


@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_in: RequestCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    data = request_in.dict()
    normalized_status = _normalize_status(data.get("status")) or "Open"
    if normalized_status not in {"Draft", "Open"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New requests can only start as Draft or Open",
        )

    insert_payload = {
        "subject": data.get("subject"),
        "description": data.get("description"),
        "apiary_id": data.get("apiary_id"),
        "hive_id": data.get("hive_id"),
        "category": _request_category(data.get("type"), data.get("category")),
        "priority": _normalize_priority(data.get("priority")),
        "status": normalized_status,
        "user_id": user_id,
    }

    result = await db_insert("requests", insert_payload, token=token)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create request"),
        )

    new_request = result["data"][0] if result.get("data") else insert_payload

    try:
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
        email_service.send_email(to_email=admin_email, subject=subject, html_content=html_content)
    except Exception as exc:
        print(f"Failed to send notification email: {exc}")

    return _serialize_request(new_request)


@router.get("/", response_model=List[RequestResponse])
async def get_my_requests(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    is_admin = _is_admin(current_user)
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters = None if is_admin else {"user_id": user_id}
    rows = await db_select("requests", filters=filters, order_by="created_at", ascending=False, token=token)
    return [_serialize_request(row) for row in rows]


@router.get("/{request_id}", response_model=RequestResponse)
async def get_request_details(
    request_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    is_admin = _is_admin(current_user)
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    rows = await db_select("requests", filters=filters, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Request not found")
    return _serialize_request(rows[0])


@router.patch("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: str,
    patch: RequestUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    is_admin = _is_admin(current_user)
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")

    existing_filters: dict[str, Any] = {"id": request_id}
    if not is_admin:
        existing_filters["user_id"] = user_id

    rows = await db_select("requests", filters=existing_filters, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Request not found")
    existing = rows[0]

    payload = patch.dict(exclude_unset=True)
    if "status" in payload:
        desired = _normalize_status(payload.get("status"))
        if desired is None:
            payload.pop("status", None)
        else:
            current = _normalize_status(existing.get("status") or "Open") or "Open"
            _validate_status_transition(current, desired, is_admin=is_admin)
            payload["status"] = desired

    if "priority" in payload:
        payload["priority"] = _normalize_priority(payload.get("priority"))

    if "type" in payload or "category" in payload:
        payload["category"] = _request_category(payload.get("type"), payload.get("category"))
    payload.pop("type", None)

    if not is_admin:
        current = _normalize_status(existing.get("status") or "Open") or "Open"
        if current not in {"Draft", "Open"}:
            raise HTTPException(status_code=403, detail="Request can no longer be modified")

    if not payload:
        return _serialize_request(existing)

    payload["updated_at"] = datetime.utcnow().isoformat()

    update_filters: dict[str, Any] = {"id": request_id}
    if not is_admin:
        update_filters["user_id"] = user_id

    result = await db_update("requests", payload, update_filters, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update request"))

    updated_rows = await db_select("requests", filters=existing_filters, token=token)
    return _serialize_request(updated_rows[0] if updated_rows else {**existing, **payload})


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
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

    result = await db_delete("requests", filters=filters, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to delete request"))
    return None


@router.post("/{request_id}/comments", response_model=CommentResponse)
async def add_comment(
    request_id: str,
    comment_in: RequestCommentCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")
    is_admin = _is_admin(current_user)

    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    requests = await db_select("requests", filters=filters, token=token)
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")

    insert_payload = {
        "request_id": request_id,
        "author_id": user_id,
        "message": comment_in.message,
    }
    result = await db_insert("request_comments", insert_payload, token=token)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to add comment"),
        )

    created = result["data"][0] if result.get("data") else insert_payload
    return _serialize_comment(created, requests[0].get("user_id"))


@router.get("/{request_id}/comments", response_model=List[CommentResponse])
async def get_request_comments(
    request_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")
    is_admin = _is_admin(current_user)

    filters = {"id": request_id} if is_admin else {"id": request_id, "user_id": user_id}
    requests = await db_select("requests", filters=filters, token=token)
    if not requests:
        raise HTTPException(status_code=404, detail="Request not found")

    comments = await db_select(
        "request_comments",
        filters={"request_id": request_id},
        order_by="created_at",
        ascending=True,
        token=token,
    )
    owner_id = requests[0].get("user_id")
    return [_serialize_comment(comment, owner_id) for comment in comments]
