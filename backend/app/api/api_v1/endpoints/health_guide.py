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


router = APIRouter()


def _load_health_guide() -> dict[str, Any]:
    data_path = Path(__file__).resolve().parents[3] / "data" / "health_guide.json"
    if not data_path.exists():
        return {"diseases": [], "species": []}
    try:
        return json.loads(data_path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Health guide data load failed: {exc}")


@router.get("/knowledge", response_model=dict)
async def get_health_knowledge(
    kind: Literal["diseases", "species"] = Query(..., description="Which dataset to return"),
    q: Optional[str] = Query(None, description="Optional substring filter (name/commonName)"),
):
    """
    GET /api/v1/beeyield/health/knowledge?kind=diseases|species&q=...
    """
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

