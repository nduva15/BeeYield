"""
Streaming Search & Ingestion Endpoints

Provides:
  - GET  /api/v1/search/stream   → SSE streaming vector search
  - POST /api/v1/search/instant  → Collected (non-SSE) instant search
  - POST /api/v1/search/ingest   → Batch ingest into a knowledge domain
  - GET  /api/v1/search/stats    → Lakehouse statistics
"""

import json
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

router = APIRouter()


# ── Request / Response Models ────────────────────────────────

class InstantSearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=10, ge=1, le=100)
    domain_filter: Optional[str] = None
    include_synthesis: bool = False


class IngestRequest(BaseModel):
    domain: str = Field(
        ..., description="One of: academic, iot_acoustic, geospatial, disease_stressor, traceability"
    )
    items: list = Field(..., description="Array of raw items in domain-specific format")
    persist: bool = True
    index: bool = True


# ── SSE Stream Search ───────────────────────────────────────

@router.get("/stream")
async def stream_search(
    q: str = Query(..., min_length=2, description="Search query"),
    top_k: int = Query(10, ge=1, le=100, description="Max results"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    synthesize: bool = Query(False, description="Include Gemini synthesis phase"),
):
    """
    Server-Sent Events streaming search.

    4 phases streamed progressively:
      1. BM25 keyword scan (<50ms)
      2. Qdrant semantic search (<200ms)
      3. Cross-encoder re-ranking + dedup (<500ms)
      4. Gemini synthesis (optional)

    Each SSE event:
      data: {"phase": 1-4, "type": "result|meta|done", ...}
    """
    from app.services.streaming_search import StreamingVectorSearch

    engine = StreamingVectorSearch()

    async def event_generator():
        async for event in engine.search_stream(
            query=q,
            top_k=top_k,
            domain_filter=domain,
            include_synthesis=synthesize,
        ):
            yield f"data: {event}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Instant (Collected) Search ──────────────────────────────

@router.post("/instant")
async def instant_search(body: InstantSearchRequest):
    """
    Non-streaming search — returns all results at once.
    Useful for API clients and the Rust sidecar.
    """
    from app.services.streaming_search import streaming_search_collect

    results = await streaming_search_collect(
        query=body.query,
        top_k=body.top_k,
        domain_filter=body.domain_filter,
        include_synthesis=body.include_synthesis,
    )

    return {
        "query": body.query,
        "total": len(results),
        "results": [r.dict() for r in results],
    }


# ── Batch Ingestion ─────────────────────────────────────────

@router.post("/ingest")
async def batch_ingest(body: IngestRequest):
    """
    Ingest a batch of items into a specific knowledge domain.

    Domains:
      - academic          → papers, abstracts, DOIs
      - iot_acoustic       → sensor readings, audio features
      - geospatial         → GBIF/iNaturalist observations
      - disease_stressor   → pathogen records, treatment protocols
      - traceability       → quality standards, ISO methods

    Returns per-domain ingestion statistics.
    """
    from app.services.ingestion_pipelines import ingest_domain, PIPELINES

    valid_domains = list(PIPELINES.keys())
    if body.domain not in valid_domains:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown domain '{body.domain}'. Valid: {valid_domains}",
        )

    if not body.items:
        raise HTTPException(status_code=400, detail="No items to ingest")

    result = await ingest_domain(
        domain=body.domain,
        raw_items=body.items,
        persist=body.persist,
        index=body.index,
    )

    return result.dict()


# ── Lakehouse Stats ──────────────────────────────────────────

@router.get("/stats")
async def lakehouse_stats():
    """Lakehouse node counts grouped by domain, repository, continent."""
    from app.services.ingestion_pipelines import get_lakehouse_stats

    return get_lakehouse_stats().dict()
