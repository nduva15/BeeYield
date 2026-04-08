from typing import Any, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status

from app.core import security
from app.db.supabase_db import db_delete, db_insert, db_select, db_update, db_upsert
from app.schemas.user_settings import (
    FullSettingsResponse,
    GlobalIoTSettingsSchema,
    HiveAlertSettingsView,
    IoTSettingsUpdate,
    NotificationUpdate,
    ThresholdSchema,
    UserNotificationSettingsSchema,
    UserPreferencesUpdate,
)

router = APIRouter()


DEFAULT_PROFILE = {
    "first_name": None,
    "last_name": None,
    "phone": None,
    "avatar_url": None,
    "language": "en-GB",
    "unit_system": "metric",
    "theme": "auto",
}

DEFAULT_PREFERENCES = {
    "email_device_alerts": True,
    "email_ai_tips": True,
    "email_marketing": False,
    "app_tips_enabled": True,
}

DEFAULT_GLOBAL_THRESHOLDS = {
    "temp_high": 38.0,
    "temp_low": 15.0,
    "weight_drop": 1.0,
}

DEFAULT_NOTIFICATION_SETTINGS = {
    "email_alerts_enabled": True,
    "sms_alerts_enabled": False,
    "push_notifications_enabled": True,
    "notify_on_swarm": True,
    "notify_on_low_battery": True,
    "notify_on_theft": True,
}

DEFAULT_IOT_SETTINGS = {
    "temp_min_threshold": 15.0,
    "temp_max_threshold": 38.0,
    "weight_drop_alert_kg": 2.0,
    "humidity_min_threshold": 40,
    "humidity_max_threshold": 80,
}


def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    if isinstance(current_user, dict):
        user_id = current_user.get("sub") or current_user.get("id")
    else:
        user_id = getattr(current_user, "id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
    return str(user_id)


def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


async def _ensure_profile(user_id: str, token: Optional[str]) -> dict[str, Any]:
    profiles = await db_select("profiles", filters={"id": user_id}, token=token)
    if profiles:
        return profiles[0]
    payload = {"id": user_id, **DEFAULT_PROFILE}
    result = await db_insert("profiles", payload, token=token)
    if result.get("success") and result.get("data"):
        return result["data"][0]
    return payload


async def _ensure_preferences(user_id: str, token: Optional[str]) -> dict[str, Any]:
    rows = await db_select("user_preferences", filters={"user_id": user_id}, token=token)
    if rows:
        return rows[0]
    payload = {"user_id": user_id, **DEFAULT_PREFERENCES}
    result = await db_upsert("user_preferences", payload, on_conflict="user_id", token=token)
    if result.get("success") and result.get("data"):
        return result["data"][0]
    return payload


async def _get_global_threshold_row(user_id: str, token: Optional[str]) -> Optional[dict[str, Any]]:
    rows = await db_select("alert_thresholds", filters={"user_id": user_id, "hive_id": "is.null"}, token=token)
    return rows[0] if rows else None


async def _get_global_thresholds(user_id: str, token: Optional[str]) -> dict[str, Any]:
    row = await _get_global_threshold_row(user_id, token)
    return row or {"user_id": user_id, "hive_id": None, **DEFAULT_GLOBAL_THRESHOLDS}


async def _ensure_notification_settings(user_id: str, token: Optional[str]) -> dict[str, Any]:
    rows = await db_select("user_notification_settings", filters={"user_id": user_id}, token=token)
    if rows:
        return rows[0]
    return {"user_id": user_id, **DEFAULT_NOTIFICATION_SETTINGS}


async def _ensure_iot_settings(user_id: str, token: Optional[str]) -> dict[str, Any]:
    rows = await db_select("global_iot_settings", filters={"user_id": user_id}, token=token)
    if rows:
        return rows[0]
    return {"user_id": user_id, **DEFAULT_IOT_SETTINGS}


async def _upsert_singleton(
    table: str,
    user_id: str,
    payload: dict[str, Any],
    token: Optional[str],
    on_conflict: str = "user_id",
) -> dict[str, Any]:
    result = await db_upsert(table, {"user_id": user_id, **payload}, on_conflict=on_conflict, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error") or f"Failed to save {table}")
    rows = result.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else {"user_id": user_id, **payload}


async def _upsert_profile(user_id: str, payload: dict[str, Any], token: Optional[str]) -> dict[str, Any]:
    result = await db_upsert("profiles", {"id": user_id, **payload}, on_conflict="id", token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error") or "Failed to save profile")
    rows = result.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else {"id": user_id, **payload}


@router.get("/full", response_model=FullSettingsResponse)
async def get_full_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return {
        "profile": await _ensure_profile(user_id, token),
        "preferences": await _ensure_preferences(user_id, token),
        "global_thresholds": await _get_global_thresholds(user_id, token),
    }


@router.get("/profile", response_model=dict)
async def get_profile(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _ensure_profile(user_id, token)


@router.put("/profile", response_model=dict)
@router.patch("/profile", response_model=dict)
async def update_profile(
    data: dict = Body(...),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    allowed = {"first_name", "last_name", "phone", "language", "unit_system", "theme", "avatar_url", "location_name"}
    clean_data = {k: v for k, v in data.items() if k in allowed}
    if not clean_data:
        raise HTTPException(status_code=400, detail="No valid fields provided")
    return {"message": "Profile updated", "data": await _upsert_profile(user_id, clean_data, token)}


@router.get("/preferences", response_model=dict)
async def get_preferences(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _ensure_preferences(user_id, token)


@router.put("/preferences", response_model=dict)
@router.patch("/preferences", response_model=dict)
async def update_preferences(
    data: UserPreferencesUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data")
    return {"message": "Preferences updated", "data": await _upsert_singleton("user_preferences", user_id, payload, token)}


@router.get("/thresholds/global", response_model=dict)
async def get_global_thresholds(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _get_global_thresholds(user_id, token)


@router.put("/thresholds/global", response_model=dict)
@router.patch("/thresholds/global", response_model=dict)
async def update_global_thresholds(
    data: ThresholdSchema,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")
    row = await db_upsert(
        "alert_thresholds",
        {"user_id": user_id, "hive_id": None, **payload},
        on_conflict="user_id,hive_id",
        token=token,
    )
    if not row.get("success"):
        raise HTTPException(status_code=500, detail=row.get("error") or "Failed to save global thresholds")
    rows = row.get("data") or []
    return {"message": "Global thresholds updated", "data": rows[0] if rows else {"user_id": user_id, "hive_id": None, **payload}}


@router.delete("/thresholds/global", response_model=dict)
async def delete_global_thresholds(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await _get_global_threshold_row(user_id, token)
    if existing:
        result = await db_delete("alert_thresholds", {"id": existing["id"]}, token=token)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error") or "Failed to reset global thresholds")
    return {"message": "Global thresholds reset", "data": {"user_id": user_id, "hive_id": None, **DEFAULT_GLOBAL_THRESHOLDS}}


@router.get("/hives", response_model=List[HiveAlertSettingsView])
async def get_hive_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    hives = await db_select("hives", columns="id,apiary_id,hive_code,user_id", filters={"user_id": user_id}, limit=1000, token=token)
    apiaries = await db_select("apiaries", columns="id,name", filters={"user_id": user_id}, limit=1000, token=token)
    apiary_map = {a["id"]: a["name"] for a in apiaries}
    thresholds = await db_select("alert_thresholds", filters={"user_id": user_id}, limit=1000, token=token)

    global_t = next((t for t in thresholds if t.get("hive_id") is None), {})
    specific_t_map = {t["hive_id"]: t for t in thresholds if t.get("hive_id")}

    results = []
    for hive in hives:
        hive_id = hive.get("id")
        specific = specific_t_map.get(hive_id, {})
        results.append(
            {
                "hive_id": hive_id,
                "hive_name": apiary_map.get(hive.get("apiary_id"), "Main Apiary"),
                "hive_code": hive.get("hive_code"),
                "user_id": user_id,
                "threshold_id": specific.get("id"),
                "override_temp_high": specific.get("temp_high"),
                "override_temp_low": specific.get("temp_low"),
                "override_weight_drop": specific.get("weight_drop"),
                "global_temp_high": global_t.get("temp_high", DEFAULT_GLOBAL_THRESHOLDS["temp_high"]),
                "global_temp_low": global_t.get("temp_low", DEFAULT_GLOBAL_THRESHOLDS["temp_low"]),
                "global_weight_drop": global_t.get("weight_drop", DEFAULT_GLOBAL_THRESHOLDS["weight_drop"]),
                "effective_temp_high": specific.get("temp_high", global_t.get("temp_high", DEFAULT_GLOBAL_THRESHOLDS["temp_high"])),
                "effective_temp_low": specific.get("temp_low", global_t.get("temp_low", DEFAULT_GLOBAL_THRESHOLDS["temp_low"])),
                "effective_weight_drop": specific.get("weight_drop", global_t.get("weight_drop", DEFAULT_GLOBAL_THRESHOLDS["weight_drop"])),
            }
        )
    return results


@router.get("/hives/{hive_id}/thresholds", response_model=dict)
async def get_hive_threshold(
    hive_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    if hive_id == "global":
        return await _get_global_thresholds(user_id, token)

    hive_rows = await db_select("hives", filters={"id": hive_id, "user_id": user_id}, limit=1, token=token)
    if not hive_rows:
        raise HTTPException(status_code=404, detail="Hive not found")

    specific_rows = await db_select("alert_thresholds", filters={"user_id": user_id, "hive_id": hive_id}, limit=1, token=token)
    specific = specific_rows[0] if specific_rows else {}
    global_t = await _get_global_thresholds(user_id, token)
    return {
        "hive_id": hive_id,
        "threshold_id": specific.get("id"),
        "override_temp_high": specific.get("temp_high"),
        "override_temp_low": specific.get("temp_low"),
        "override_weight_drop": specific.get("weight_drop"),
        "effective_temp_high": specific.get("temp_high", global_t.get("temp_high")),
        "effective_temp_low": specific.get("temp_low", global_t.get("temp_low")),
        "effective_weight_drop": specific.get("weight_drop", global_t.get("weight_drop")),
        "global_temp_high": global_t.get("temp_high"),
        "global_temp_low": global_t.get("temp_low"),
        "global_weight_drop": global_t.get("weight_drop"),
    }


@router.post("/hives/{hive_id}/thresholds", response_model=dict)
@router.put("/hives/{hive_id}/thresholds", response_model=dict)
@router.patch("/hives/{hive_id}/thresholds", response_model=dict)
async def update_hive_threshold(
    hive_id: str,
    data: ThresholdSchema,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    if hive_id == "global":
        return await update_global_thresholds(data, user_id, token)

    hive_rows = await db_select("hives", filters={"id": hive_id, "user_id": user_id}, limit=1, token=token)
    if not hive_rows:
        raise HTTPException(status_code=404, detail="Hive not found")

    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")

    result = await db_upsert(
        "alert_thresholds",
        {"user_id": user_id, "hive_id": hive_id, **payload},
        on_conflict="user_id,hive_id",
        token=token,
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error") or "Failed to update threshold")
    rows = result.get("data") or []
    return {"message": "Threshold updated", "data": rows[0] if rows else {"user_id": user_id, "hive_id": hive_id, **payload}}


@router.delete("/hives/{hive_id}/thresholds", response_model=dict)
async def delete_hive_threshold(
    hive_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    if hive_id == "global":
        return await delete_global_thresholds(user_id, token)

    existing = await db_select("alert_thresholds", filters={"user_id": user_id, "hive_id": hive_id}, limit=1, token=token)
    if existing:
        result = await db_delete("alert_thresholds", {"id": existing[0]["id"]}, token=token)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error") or "Failed to delete hive threshold override")
    return {"message": "Hive threshold override removed", "data": await get_hive_threshold(hive_id, user_id, token)}


@router.get("/notifications", response_model=UserNotificationSettingsSchema)
async def get_notifications(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _ensure_notification_settings(user_id, token)


@router.patch("/notifications", response_model=dict)
@router.put("/notifications", response_model=dict)
async def update_notifications(
    data: NotificationUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")
    return {"status": "updated", "data": await _upsert_singleton("user_notification_settings", user_id, payload, token)}


@router.delete("/notifications", response_model=dict)
async def delete_notifications(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("user_notification_settings", filters={"user_id": user_id}, limit=1, token=token)
    if existing:
        result = await db_delete("user_notification_settings", {"user_id": user_id}, token=token)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error") or "Failed to reset notification settings")
    return {"status": "reset", "data": {"user_id": user_id, **DEFAULT_NOTIFICATION_SETTINGS}}


@router.get("/iot", response_model=GlobalIoTSettingsSchema)
async def get_iot_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    return await _ensure_iot_settings(user_id, token)


@router.patch("/iot", response_model=dict)
@router.put("/iot", response_model=dict)
async def update_iot_thresholds(
    data: IoTSettingsUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")
    return {"status": "thresholds_updated", "data": await _upsert_singleton("global_iot_settings", user_id, payload, token)}


@router.delete("/iot", response_model=dict)
async def delete_iot_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("global_iot_settings", filters={"user_id": user_id}, limit=1, token=token)
    if existing:
        result = await db_delete("global_iot_settings", {"user_id": user_id}, token=token)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error") or "Failed to reset IoT settings")
    return {"status": "reset", "data": {"user_id": user_id, **DEFAULT_IOT_SETTINGS}}
