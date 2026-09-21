"""
Tasks Endpoint — Full CRUD API with Multi-User & Auto-Provisioning Support
Allows any user to create, read, update, and delete apiary tasks seamlessly.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from typing import List, Optional, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID
import uuid
import logging
from pathlib import Path
import json

from app.core import security
from app.db.supabase_db import db_insert, db_select, db_update, db_delete

logger = logging.getLogger(__name__)

router = APIRouter()

TASKS_STORAGE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "user_tasks.json"

def _read_local_tasks() -> List[dict]:
    try:
        if TASKS_STORAGE_FILE.exists():
            with open(TASKS_STORAGE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Error reading local tasks storage: {e}")
    return []

def _write_local_tasks(tasks: List[dict]):
    try:
        TASKS_STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TASKS_STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(tasks, f, indent=2, default=str)
    except Exception as e:
        logger.warning(f"Error writing local tasks storage: {e}")


def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


def resolve_user_id(
    current_user: Optional[dict],
    request: Request,
    body_user_id: Optional[str] = None
) -> str:
    """Resolve user ID with priority: authenticated JWT -> request header -> body -> device ID -> fallback"""
    if current_user and current_user.get("sub"):
        return str(current_user.get("sub"))

    header_uid = request.headers.get("x-user-id") or request.headers.get("X-User-Id")
    if header_uid:
        return str(header_uid)

    device_id = request.headers.get("x-device-id") or request.headers.get("X-Device-Id")
    if device_id:
        return str(device_id)

    if body_user_id:
        return str(body_user_id)

    return "timothy-nduva"


class TaskCreate(BaseModel):
    title: str = Field(..., description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed task description")
    due_date: Optional[Union[date, str]] = Field(None, description="Due date (YYYY-MM-DD)")
    status: Optional[str] = Field("pending", description="pending, in_progress, completed")
    priority: Optional[str] = Field("medium", description="low, medium, high")
    category: Optional[str] = Field("General", description="Inspection, Feeding, Treatment, Harvest, Hive Maintenance, General")
    apiary_id: Optional[Union[UUID, str]] = None
    hive_id: Optional[Union[UUID, str]] = None
    apiary_name: Optional[str] = None
    hive_label: Optional[str] = None
    location: Optional[str] = None
    is_completed: Optional[bool] = False
    completed_at: Optional[Union[datetime, str]] = None
    notes: Optional[str] = None
    ai_insights: Optional[str] = None
    user_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[Union[date, str]] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    apiary_id: Optional[Union[UUID, str]] = None
    hive_id: Optional[Union[UUID, str]] = None
    apiary_name: Optional[str] = None
    hive_label: Optional[str] = None
    location: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[Union[datetime, str]] = None
    notes: Optional[str] = None
    ai_insights: Optional[str] = None
    user_id: Optional[str] = None


@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
async def list_tasks(
    request: Request,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    category_filter: Optional[str] = Query(None, alias="category"),
    apiary_id: Optional[str] = None,
    hive_id: Optional[str] = None,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Get all tasks for the requesting user with optional filtering by status, priority, and category.
    """
    user_id = resolve_user_id(current_user, request)
    tasks: List[dict] = []

    # 1. Try Supabase DB
    try:
        filters: dict[str, Any] = {}
        if user_id and user_id != "anonymous":
            filters["user_id"] = user_id
        if status_filter:
            filters["status"] = status_filter
        if priority_filter:
            filters["priority"] = priority_filter
        if category_filter:
            filters["category"] = category_filter
        if apiary_id:
            filters["apiary_id"] = apiary_id
        if hive_id:
            filters["hive_id"] = hive_id

        db_rows = await db_select("tasks", filters=filters, order_by="due_date", ascending=True, limit=500, token=token)
        if isinstance(db_rows, list):
            tasks.extend(db_rows)
    except Exception as e:
        logger.warning(f"Supabase tasks select fallback: {e}")

    # 2. Merge local cache
    local_items = _read_local_tasks()
    seen_ids = {str(t.get("id")) for t in tasks if t.get("id")}
    for item in local_items:
        i_user = str(item.get("user_id") or "")
        if (not user_id or i_user == user_id or not i_user) and str(item.get("id")) not in seen_ids:
            if status_filter and item.get("status") != status_filter:
                continue
            if priority_filter and item.get("priority") != priority_filter:
                continue
            if category_filter and item.get("category") != category_filter:
                continue
            tasks.append(item)
            seen_ids.add(str(item.get("id")))

    # Sort tasks by due date
    tasks.sort(key=lambda t: str(t.get("due_date") or t.get("created_at") or ""), reverse=False)
    return tasks


@router.get("/{task_id}", response_model=dict)
async def get_task(
    task_id: str,
    request: Request,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Get a specific task by ID.
    """
    try:
        rows = await db_select("tasks", filters={"id": task_id}, limit=1, token=token)
        if rows and isinstance(rows, list):
            return rows[0]
    except Exception:
        pass

    local_items = _read_local_tasks()
    for item in local_items:
        if str(item.get("id")) == str(task_id):
            return item

    raise HTTPException(status_code=404, detail="Task not found")


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    request: Request,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Create a new task with full database and local persistence.
    """
    user_id = resolve_user_id(current_user, request, body.user_id)
    task_id = str(uuid.uuid4())
    due_str = str(body.due_date) if body.due_date else datetime.now().strftime("%Y-%m-%d")

    task_dict = {
        "id": task_id,
        "user_id": user_id,
        "title": body.title.strip(),
        "description": body.description or "",
        "due_date": due_str,
        "status": body.status or "pending",
        "priority": body.priority or "medium",
        "category": body.category or "General",
        "apiary_id": str(body.apiary_id) if body.apiary_id else None,
        "hive_id": str(body.hive_id) if body.hive_id else None,
        "apiary_name": body.apiary_name,
        "hive_label": body.hive_label,
        "location": body.location,
        "is_completed": bool(body.is_completed or body.status == "completed"),
        "completed_at": str(body.completed_at) if body.completed_at else None,
        "notes": body.notes,
        "ai_insights": body.ai_insights,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    # 1. Persist to Supabase
    try:
        res = await db_insert("tasks", task_dict, token=token)
        if res.get("success"):
            rows = res.get("data") or []
            if isinstance(rows, list) and rows:
                task_dict = rows[0]
    except Exception as e:
        logger.warning(f"Supabase task insert notice: {e}")

    # 2. Persist to local backup storage
    local_items = _read_local_tasks()
    local_items.insert(0, task_dict)
    _write_local_tasks(local_items)

    return task_dict


@router.put("/{task_id}", response_model=dict)
@router.patch("/{task_id}", response_model=dict)
async def update_task(
    task_id: str,
    body: TaskUpdate,
    request: Request,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Update an existing task.
    """
    user_id = resolve_user_id(current_user, request, body.user_id)
    patch_data = body.model_dump(exclude_unset=True)
    if not patch_data:
        existing = await get_task(task_id, request, current_user, token)
        return existing

    patch_data["updated_at"] = datetime.utcnow().isoformat()
    if patch_data.get("status") == "completed" and "is_completed" not in patch_data:
        patch_data["is_completed"] = True
        patch_data["completed_at"] = datetime.utcnow().isoformat()
    elif patch_data.get("is_completed") is True and "status" not in patch_data:
        patch_data["status"] = "completed"
        patch_data["completed_at"] = datetime.utcnow().isoformat()
    elif patch_data.get("is_completed") is False and "status" not in patch_data:
        patch_data["status"] = "pending"
        patch_data["completed_at"] = None

    # 1. Update in Supabase
    updated_record: Optional[dict] = None
    try:
        res = await db_update("tasks", patch_data, filters={"id": task_id}, token=token)
        if res.get("success"):
            rows = res.get("data") or []
            if isinstance(rows, list) and rows:
                updated_record = rows[0]
    except Exception as e:
        logger.warning(f"Supabase task update notice: {e}")

    # 2. Update in local storage
    local_items = _read_local_tasks()
    found = False
    for i, item in enumerate(local_items):
        if str(item.get("id")) == str(task_id):
            local_items[i] = {**item, **patch_data}
            updated_record = local_items[i]
            found = True
            break
    if not found and updated_record:
        local_items.insert(0, updated_record)
    _write_local_tasks(local_items)

    if updated_record:
        return updated_record

    return {"id": task_id, **patch_data}


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    request: Request,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Delete a task by ID.
    """
    # 1. Delete in Supabase
    try:
        await db_delete("tasks", filters={"id": task_id}, token=token)
    except Exception as e:
        logger.warning(f"Supabase task delete notice: {e}")

    # 2. Delete in local storage
    local_items = _read_local_tasks()
    next_items = [t for t in local_items if str(t.get("id")) != str(task_id)]
    _write_local_tasks(next_items)

    return None


@router.post("/{task_id}/toggle", response_model=dict)
async def toggle_task_completion(
    task_id: str,
    request: Request,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Quick toggle task between pending and completed.
    """
    existing = await get_task(task_id, request, current_user, token)
    is_now_completed = not existing.get("is_completed", False)
    new_status = "completed" if is_now_completed else "pending"
    completed_at = datetime.utcnow().isoformat() if is_now_completed else None

    patch = TaskUpdate(
        is_completed=is_now_completed,
        status=new_status,
        completed_at=completed_at
    )
    return await update_task(task_id, patch, request, current_user, token)
