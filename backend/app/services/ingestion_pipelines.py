"""
DATASET INGESTION PIPELINES (v2.0 — Rust Powered)
Batch ingest for the 5 Knowledge Domains targeting 25,000 nodes.
Transformation, Stats, and Deduplication now handled in `beeyield_core.IngestionEngine`.
"""
import asyncio
import json
import os
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.services.metadata_standardizer import MetadataStandardizer, KnowledgeDomain

try:
    from beeyield_core import IngestionEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False

_engine = _RustEngine() if _RUST_AVAILABLE else None

class IngestionResult(BaseModel):
    domain: str
    raw_count: int
    nodes_created: int
    nodes_embedded: int
    nodes_indexed: int
    errors: List[str] = Field(default_factory=list)
    elapsed_ms: float = 0.0

LAKEHOUSE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/standardized_lakehouse.json"))

def _load_lakehouse() -> Dict[str, Any]:
    if os.path.exists(LAKEHOUSE_PATH):
        try:
            with open(LAKEHOUSE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception: pass
    return {"version": "5.0", "lakehouse_nodes": [], "stats": {}}

def _save_lakehouse(data: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(LAKEHOUSE_PATH), exist_ok=True)
    with open(LAKEHOUSE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)

async def ingest_domain(
    domain_str: str,
    raw_items: List[Dict[str, Any]],
    persist: bool = True,
    index: bool = True,
) -> IngestionResult:
    """Uses Rust IngestionEngine for core logic."""
    start = time.perf_counter()
    errors: List[str] = []
    
    if not _engine:
        return IngestionResult(domain=domain_str, raw_count=len(raw_items), nodes_created=0, nodes_embedded=0, nodes_indexed=0, errors=["Rust IngestionEngine not available"])

    # 1. RUST TRANSFORM
    try:
        nodes_dicts = _engine.transform_batch(domain_str, raw_items)
    except Exception as e:
        return IngestionResult(domain=domain_str, raw_count=len(raw_items), nodes_created=0, nodes_embedded=0, nodes_indexed=0, errors=[f"Rust Transform failed: {e}"])

    # 2. STANDARDIZE (Remaining metadata enrichment)
    standardizer = MetadataStandardizer()
    nodes, std_errors = standardizer.standardize_batch(nodes_dicts, force_domain=KnowledgeDomain(domain_str))
    
    # 3. EMBED (Sync for now)
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    texts = [n.content[:512] for n in nodes]
    embeddings = model.encode(texts, batch_size=64) if texts else []

    # 4. INDEX & PERSIST
    lakehouse = _load_lakehouse()
    indexed_count = 0
    
    if persist and nodes:
        existing_hashes = {n.get("content_hash", "") for n in lakehouse.get("lakehouse_nodes", [])}
        keep_indices = _engine.filter_duplicates(existing_hashes, nodes_dicts)
        
        new_nodes = []
        for idx in keep_indices:
            n = nodes[idx]
            node_dict = {
                "content": n.content,
                "content_hash": n.content_hash,
                "metadata": {
                    "global_id": n.metadata.global_id,
                    "title": n.metadata.title,
                    "knowledge_domain": n.metadata.knowledge_domain.value,
                    "source_repository": n.metadata.source_repository.value,
                    "reliability_score": n.metadata.reliability_score,
                    "continent": n.metadata.continent,
                }
            }
            new_nodes.append(node_dict)
            
        lakehouse["lakehouse_nodes"].extend(new_nodes)
        lakehouse["stats"] = _engine.calculate_stats(lakehouse["lakehouse_nodes"])
        _save_lakehouse(lakehouse)

    elapsed = (time.perf_counter() - start) * 1000
    return IngestionResult(
        domain=domain_str,
        raw_count=len(raw_items),
        nodes_created=len(nodes),
        nodes_embedded=len(embeddings),
        nodes_indexed=indexed_count,
        errors=errors,
        elapsed_ms=round(elapsed, 1),
    )

def get_lakehouse_stats() -> Dict[str, Any]:
    lakehouse = _load_lakehouse()
    if not _engine: return {}
    return _engine.calculate_stats(lakehouse.get("lakehouse_nodes", []))
