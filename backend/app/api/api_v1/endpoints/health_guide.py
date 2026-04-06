"""
BeeYield Health Guide Endpoints
===============================
Serves curated health guide content (diseases + species) from a backend data file.

Why:
- Avoid shipping large hardcoded datasets in the UI.
- Keep the content centrally maintainable and versionable.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Literal, Optional, Any
import json
from pathlib import Path
from app.db.supabase_db import db_select


router = APIRouter()


def _load_health_guide() -> dict[str, Any]:
    data_path = Path(__file__).resolve().parents[3] / "data" / "health_guide.json"
    if not data_path.exists():
        return {"diseases": [], "species": []}
    try:
        return json.loads(data_path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Health guide data load failed: {exc}")


async def _load_live_disease_rows() -> list[dict[str, Any]]:
    try:
        rows = await db_select(
            "health_knowledge_base",
            columns="id,title,category,severity,symptoms,description,treatment_options,prevention_tips,image_url,source_references,is_published",
            filters={"is_published": True},
            limit=500,
            order_by="updated_at",
            ascending=False,
        )
    except Exception:
        return []

    live_rows: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict):
            continue

        live_rows.append({
            "id": row.get("id"),
            "name": row.get("title"),
            "type": row.get("category"),
            "riskLevel": row.get("severity"),
            "causes": row.get("description"),
            "effects": row.get("description"),
            "symptoms": row.get("symptoms") or [],
            "treatment": "; ".join(row.get("treatment_options") or []),
            "prevention": "; ".join(row.get("prevention_tips") or []),
            "image_url": row.get("image_url"),
            "sourceReferences": row.get("source_references") or [],
        })

    return [row for row in live_rows if row.get("name")]


@router.get("/knowledge", response_model=dict)
async def get_health_knowledge(
    kind: Literal["diseases", "species"] = Query(..., description="Which dataset to return"),
    q: Optional[str] = Query(None, description="Optional substring filter (name/commonName)"),
):
    """
    GET /api/v1/beeyield/health/knowledge?kind=diseases|species&q=...
    """
    if kind == "diseases":
        rows = await _load_live_disease_rows()
        if not rows:
            data = _load_health_guide()
            rows = data.get(kind, [])
    else:
        data = _load_health_guide()
        rows = data.get(kind, [])
    if not isinstance(rows, list):
        rows = []

    if q:
        needle = q.strip().lower()
        if needle:
            def hit(r: dict) -> bool:
                name = str(r.get("name", "")).lower()
                common = str(r.get("commonName", "")).lower()
                return needle in name or needle in common

            rows = [r for r in rows if isinstance(r, dict) and hit(r)]

    return {"kind": kind, "count": len(rows), "items": rows}

