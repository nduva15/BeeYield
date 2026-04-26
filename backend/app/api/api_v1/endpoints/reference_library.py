"""
Database-backed bee species and bee diseases reference library.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.api.api_v1.endpoints.admin import check_admin_role, get_token
from app.db.supabase_db import db_delete, db_insert, db_select, db_update, db_upsert


public_router = APIRouter()
admin_router = APIRouter()

ReferenceKind = Literal["diseases", "species"]

TABLES: dict[ReferenceKind, str] = {
    "diseases": "bee_disease_references",
    "species": "bee_species_references",
}

BUNDLED_KEYS: dict[ReferenceKind, str] = {
    "diseases": "diseases",
    "species": "species",
}


class ReferenceImportRequest(BaseModel):
    items: list[dict[str, Any]] = Field(default_factory=list)
    mode: Literal["upsert", "replace"] = "upsert"


def _load_bundled_health_guide() -> dict[str, Any]:
    data_path = Path(__file__).resolve().parents[3] / "data" / "health_guide.json"
    if not data_path.exists():
        return {"diseases": [], "species": []}
    try:
        return json.loads(data_path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Health guide data load failed: {exc}") from exc


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")
    return slug or "reference_entry"


def _normalize_string(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned or None
    cleaned = str(value).strip()
    return cleaned or None


def _normalize_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "published", "active"}
    return default


def _normalize_int(value: Any, default: int = 0) -> int:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_string_array(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        result: list[str] = []
        for item in value:
            normalized = _normalize_string(item)
            if normalized:
                result.append(normalized)
        return result
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        if stripped.startswith("[") and stripped.endswith("]"):
            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, list):
                    return _normalize_string_array(parsed)
            except json.JSONDecodeError:
                pass
        parts = re.split(r"[\n,;|]+", stripped)
        return [part.strip() for part in parts if part.strip()]
    normalized = _normalize_string(value)
    return [normalized] if normalized else []


def _infer_species_category(record: dict[str, Any]) -> str:
    existing = _normalize_string(record.get("category"))
    if existing:
        return existing

    haystack = " ".join(
        filter(
            None,
            [
                _normalize_string(record.get("name")),
                _normalize_string(record.get("common_name")),
                _normalize_string(record.get("commonName")),
                _normalize_string(record.get("scientific_name")),
                _normalize_string(record.get("scientificName")),
            ],
        )
    ).lower()

    if "bumble" in haystack:
        return "Bumblebee"
    if "stingless" in haystack:
        return "Stingless Bee"
    if "carpenter" in haystack:
        return "Carpenter Bee"
    if "leafcutter" in haystack:
        return "Leafcutter Bee"
    if "mason" in haystack or "orchard" in haystack:
        return "Mason Bee"
    if "mining" in haystack:
        return "Mining Bee"
    if "sweat" in haystack:
        return "Sweat Bee"
    if "honey bee" in haystack or "apis " in haystack:
        return "Honey Bee"
    return "Bee Species"


def _normalize_disease_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = {
        "id": _normalize_string(payload.get("id")),
        "name": _normalize_string(payload.get("name")) or _normalize_string(payload.get("title")),
        "type": _normalize_string(payload.get("type")) or _normalize_string(payload.get("category")),
        "risk_level": _normalize_string(payload.get("riskLevel")) or _normalize_string(payload.get("risk_level")) or _normalize_string(payload.get("severity")),
        "causes": _normalize_string(payload.get("causes")) or _normalize_string(payload.get("description")),
        "effects": _normalize_string(payload.get("effects")),
        "symptoms": _normalize_string_array(payload.get("symptoms")),
        "treatment": _normalize_string(payload.get("treatment")) or _normalize_string(payload.get("treatment_options")),
        "prevention": _normalize_string(payload.get("prevention")) or _normalize_string(payload.get("prevention_tips")),
        "detection": _normalize_string(payload.get("detection")),
        "transmission": _normalize_string(payload.get("transmission")),
        "host_species": _normalize_string_array(payload.get("hostSpecies") or payload.get("host_species")),
        "response_steps": _normalize_string_array(payload.get("responseSteps") or payload.get("response_steps")),
        "cure_status": _normalize_string(payload.get("cureStatus") or payload.get("cure_status")),
        "image_url": _normalize_string(payload.get("imageUrl") or payload.get("image_url") or payload.get("livePhotoUrl") or payload.get("live_photo_url")),
        "source_references": _normalize_string_array(payload.get("sourceReferences") or payload.get("source_references")),
        "tags": _normalize_string_array(payload.get("tags")),
        "is_published": _normalize_bool(payload.get("isPublished") if "isPublished" in payload else payload.get("is_published"), True),
        "sort_order": _normalize_int(payload.get("sortOrder") if "sortOrder" in payload else payload.get("sort_order"), 0),
    }

    if not normalized["id"] and normalized["name"]:
        normalized["id"] = _slugify(normalized["name"])

    return normalized


def _normalize_species_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = {
        "id": _normalize_string(payload.get("id")),
        "name": _normalize_string(payload.get("name")) or _normalize_string(payload.get("scientificName")) or _normalize_string(payload.get("scientific_name")),
        "common_name": _normalize_string(payload.get("commonName") or payload.get("common_name")),
        "scientific_name": _normalize_string(payload.get("scientificName") or payload.get("scientific_name") or payload.get("name")),
        "category": _normalize_string(payload.get("category")),
        "location": _normalize_string(payload.get("location")),
        "description": _normalize_string(payload.get("description")),
        "suitability": _normalize_string(payload.get("suitability")),
        "health_profile": _normalize_string(payload.get("healthProfile") or payload.get("health_profile")),
        "notes": _normalize_string(payload.get("notes")),
        "ideal_use": _normalize_string(payload.get("idealUse") or payload.get("ideal_use")),
        "common_diseases": _normalize_string_array(payload.get("commonDiseases") or payload.get("common_diseases")),
        "traits": _normalize_string_array(payload.get("traits")),
        "conservation_status": _normalize_string(payload.get("conservationStatus") or payload.get("conservation_status")),
        "is_extinct": _normalize_bool(payload.get("isExtinct") if "isExtinct" in payload else payload.get("is_extinct"), False),
        "image_url": _normalize_string(payload.get("imageUrl") or payload.get("image_url") or payload.get("livePhotoUrl") or payload.get("live_photo_url")),
        "source_references": _normalize_string_array(payload.get("sourceReferences") or payload.get("source_references")),
        "tags": _normalize_string_array(payload.get("tags")),
        "is_published": _normalize_bool(payload.get("isPublished") if "isPublished" in payload else payload.get("is_published"), True),
        "sort_order": _normalize_int(payload.get("sortOrder") if "sortOrder" in payload else payload.get("sort_order"), 0),
    }

    if not normalized["id"] and normalized["name"]:
        normalized["id"] = _slugify(normalized["name"])

    normalized["category"] = _infer_species_category(normalized)
    if not normalized["conservation_status"]:
        normalized["conservation_status"] = "Extinct" if normalized["is_extinct"] else "Active record"

    return normalized


def _normalize_payload(kind: ReferenceKind, payload: dict[str, Any]) -> dict[str, Any]:
    normalized = _normalize_disease_payload(payload) if kind == "diseases" else _normalize_species_payload(payload)
    if not normalized.get("name"):
        raise HTTPException(status_code=400, detail="Reference entries must include a name")
    if not normalized.get("id"):
        raise HTTPException(status_code=400, detail="Reference entries must include or derive an id")
    return normalized


def _disease_row_to_api(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "type": row.get("type"),
        "riskLevel": row.get("risk_level"),
        "causes": row.get("causes"),
        "effects": row.get("effects"),
        "symptoms": row.get("symptoms") or [],
        "treatment": row.get("treatment"),
        "prevention": row.get("prevention"),
        "detection": row.get("detection"),
        "transmission": row.get("transmission"),
        "hostSpecies": row.get("host_species") or [],
        "responseSteps": row.get("response_steps") or [],
        "cureStatus": row.get("cure_status"),
        "imageUrl": row.get("image_url"),
        "image_url": row.get("image_url"),
        "sourceReferences": row.get("source_references") or [],
        "tags": row.get("tags") or [],
        "isPublished": bool(row.get("is_published", False)),
        "sortOrder": row.get("sort_order") or 0,
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


def _species_row_to_api(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "commonName": row.get("common_name"),
        "common_name": row.get("common_name"),
        "scientificName": row.get("scientific_name"),
        "scientific_name": row.get("scientific_name"),
        "category": row.get("category"),
        "location": row.get("location"),
        "description": row.get("description"),
        "suitability": row.get("suitability"),
        "healthProfile": row.get("health_profile"),
        "health_profile": row.get("health_profile"),
        "notes": row.get("notes"),
        "idealUse": row.get("ideal_use"),
        "ideal_use": row.get("ideal_use"),
        "commonDiseases": row.get("common_diseases") or [],
        "common_diseases": row.get("common_diseases") or [],
        "traits": row.get("traits") or [],
        "conservationStatus": row.get("conservation_status"),
        "conservation_status": row.get("conservation_status"),
        "isExtinct": bool(row.get("is_extinct", False)),
        "is_extinct": bool(row.get("is_extinct", False)),
        "imageUrl": row.get("image_url"),
        "image_url": row.get("image_url"),
        "sourceReferences": row.get("source_references") or [],
        "tags": row.get("tags") or [],
        "isPublished": bool(row.get("is_published", False)),
        "sortOrder": row.get("sort_order") or 0,
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


def _row_to_api(kind: ReferenceKind, row: dict[str, Any]) -> dict[str, Any]:
    return _disease_row_to_api(row) if kind == "diseases" else _species_row_to_api(row)


async def _fetch_reference_rows(
    kind: ReferenceKind,
    *,
    token: Optional[str] = None,
    published_only: bool = False,
) -> list[dict[str, Any]]:
    filters: dict[str, Any] = {}
    if published_only:
        filters["is_published"] = True

    rows = await db_select(
        TABLES[kind],
        filters=filters or None,
        limit=5000,
        token=token,
    )

    return sorted(
        [row for row in rows if isinstance(row, dict)],
        key=lambda row: (
            _normalize_int(row.get("sort_order"), 0),
            str(row.get("name") or "").lower(),
        ),
    )


def _filter_public_items(kind: ReferenceKind, items: list[dict[str, Any]], q: Optional[str]) -> list[dict[str, Any]]:
    if not q:
        return items

    needle = q.strip().lower()
    if not needle:
        return items

    def matches(item: dict[str, Any]) -> bool:
        fields = [item.get("name")]
        if kind == "species":
            fields.extend([item.get("commonName"), item.get("scientificName"), item.get("category"), item.get("location")])
        else:
            fields.extend([item.get("type"), item.get("riskLevel"), item.get("causes")])
        return any(needle in str(field or "").lower() for field in fields)

    return [item for item in items if matches(item)]


async def _ensure_unique_id(kind: ReferenceKind, entry_id: str, token: Optional[str]) -> str:
    candidate = entry_id
    suffix = 2
    while True:
        existing = await db_select(TABLES[kind], filters={"id": candidate}, limit=1, token=token)
        if not existing:
            return candidate
        candidate = f"{entry_id}_{suffix}"
        suffix += 1


def _extract_inserted_row(result: dict[str, Any]) -> dict[str, Any]:
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error") or "Database operation failed")
    data = result.get("data") or []
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    raise HTTPException(status_code=500, detail="Database operation returned no data")


async def _upsert_many(kind: ReferenceKind, items: list[dict[str, Any]], token: Optional[str], mode: str) -> dict[str, Any]:
    normalized_items: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for raw_item in items:
        normalized = _normalize_payload(kind, raw_item)
        if normalized["id"] in seen_ids:
            raise HTTPException(status_code=400, detail=f"Duplicate id in import payload: {normalized['id']}")
        seen_ids.add(normalized["id"])
        normalized_items.append(normalized)

    for normalized in normalized_items:
        result = await db_upsert(TABLES[kind], normalized, on_conflict="id", token=token)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error") or "Import failed")

    deleted = 0
    if mode == "replace":
        existing_rows = await db_select(TABLES[kind], columns="id", limit=5000, token=token)
        existing_ids = {str(row.get("id")) for row in existing_rows if row.get("id")}
        for missing_id in existing_ids - seen_ids:
            result = await db_delete(TABLES[kind], {"id": missing_id}, token=token)
            if not result.get("success"):
                raise HTTPException(status_code=500, detail=result.get("error") or "Replace import cleanup failed")
            deleted += 1

    current_rows = await _fetch_reference_rows(kind, token=token, published_only=False)
    return {
        "imported": len(normalized_items),
        "deleted": deleted,
        "count": len(current_rows),
        "items": [_row_to_api(kind, row) for row in current_rows],
    }


@public_router.get("/knowledge", response_model=dict[str, Any])
async def get_health_knowledge(
    kind: ReferenceKind = Query(..., description="Which dataset to return"),
    q: Optional[str] = Query(None, description="Optional substring filter"),
):
    rows = await _fetch_reference_rows(kind, published_only=True)
    items = [_row_to_api(kind, row) for row in rows]

    if not items:
        bundled = _load_bundled_health_guide()
        items = bundled.get(BUNDLED_KEYS[kind], [])

    filtered = _filter_public_items(kind, items, q)
    return {"kind": kind, "count": len(filtered), "items": filtered}


@admin_router.get("/{kind}", response_model=dict[str, Any])
async def list_reference_entries(
    kind: ReferenceKind,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token),
):
    rows = await _fetch_reference_rows(kind, token=token, published_only=False)
    return {"kind": kind, "count": len(rows), "items": [_row_to_api(kind, row) for row in rows]}


@admin_router.post("/{kind}/bootstrap", response_model=dict[str, Any])
async def bootstrap_reference_entries(
    kind: ReferenceKind,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token),
):
    bundled = _load_bundled_health_guide()
    items = bundled.get(BUNDLED_KEYS[kind], [])
    if not isinstance(items, list) or not items:
        raise HTTPException(status_code=404, detail=f"No bundled {kind} data available to import")
    return await _upsert_many(kind, [item for item in items if isinstance(item, dict)], token, mode="upsert")


@admin_router.post("/{kind}/import", response_model=dict[str, Any])
async def import_reference_entries(
    kind: ReferenceKind,
    body: ReferenceImportRequest,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token),
):
    if not body.items:
        raise HTTPException(status_code=400, detail="Import payload must include at least one item")
    return await _upsert_many(kind, body.items, token, mode=body.mode)


@admin_router.post("/{kind}", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_reference_entry(
    kind: ReferenceKind,
    payload: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token),
):
    normalized = _normalize_payload(kind, payload)
    normalized["id"] = await _ensure_unique_id(kind, normalized["id"], token)
    inserted = _extract_inserted_row(await db_insert(TABLES[kind], normalized, token=token))
    return _row_to_api(kind, inserted)


@admin_router.put("/{kind}/{entry_id}", response_model=dict[str, Any])
async def update_reference_entry(
    kind: ReferenceKind,
    entry_id: str,
    payload: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select(TABLES[kind], filters={"id": entry_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Reference entry not found")

    normalized = _normalize_payload(kind, {**existing[0], **payload, "id": entry_id})
    updated = _extract_inserted_row(await db_update(TABLES[kind], normalized, {"id": entry_id}, token=token))
    return _row_to_api(kind, updated)


@admin_router.delete("/{kind}/{entry_id}", response_model=dict[str, Any])
async def delete_reference_entry(
    kind: ReferenceKind,
    entry_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token),
):
    result = await db_delete(TABLES[kind], {"id": entry_id}, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error") or "Delete failed")
    return {"success": True, "id": entry_id}
