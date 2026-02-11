"""
DATASET INGESTION PIPELINES (v1.0)
Batch ingest for the 5 Knowledge Domains targeting 25,000 nodes.

Domain targets:
  1. Academic & Peer-Reviewed    →  8,000 nodes
  2. IoT & Acoustic Benchmarks   →  5,000 nodes
  3. Geospatial & Biodiversity   →  6,000 nodes
  4. Disease & Stressor          →  4,000 nodes
  5. Traceability & Quality      →  2,000 nodes

Each pipeline:
  - Accepts raw data in domain-specific format
  - Runs it through MetadataStandardizer
  - Embeds via sentence-transformers
  - Upserts into Qdrant vector store
  - Persists to standardized_lakehouse.json
"""

import asyncio
import json
import os
import time
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel, Field

from app.services.metadata_standardizer import (
    KnowledgeDomain,
    MetadataStandardizer,
    SourceRepository,
    StandardizedNode,
)


# ── Pipeline Result Models ──────────────────────────────────

class IngestionResult(BaseModel):
    domain: str
    raw_count: int
    nodes_created: int
    nodes_embedded: int
    nodes_indexed: int
    errors: List[str] = Field(default_factory=list)
    elapsed_ms: float = 0.0


class LakehouseStats(BaseModel):
    total_nodes: int = 0
    by_domain: Dict[str, int] = Field(default_factory=dict)
    by_repository: Dict[str, int] = Field(default_factory=dict)
    by_continent: Dict[str, int] = Field(default_factory=dict)
    avg_reliability: float = 0.0
    last_sync: Optional[str] = None


# ── Lakehouse Persistence ───────────────────────────────────

LAKEHOUSE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../data/standardized_lakehouse.json")
)


def _load_lakehouse() -> Dict[str, Any]:
    """Load the current lakehouse state from disk."""
    if os.path.exists(LAKEHOUSE_PATH):
        try:
            with open(LAKEHOUSE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"version": "5.0", "lakehouse_nodes": [], "stats": {}}


def _save_lakehouse(data: Dict[str, Any]) -> None:
    """Persist lakehouse to disk."""
    os.makedirs(os.path.dirname(LAKEHOUSE_PATH), exist_ok=True)
    with open(LAKEHOUSE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)


def _node_to_dict(node: StandardizedNode) -> Dict[str, Any]:
    """Convert a StandardizedNode to a lakehouse-compatible dict."""
    return {
        "content": node.content,
        "content_hash": node.content_hash,
        "chunk_index": node.chunk_index,
        "total_chunks": node.total_chunks,
        "metadata": {
            "global_id": node.metadata.global_id,
            "title": node.metadata.title,
            "knowledge_domain": node.metadata.knowledge_domain.value,
            "source_repository": node.metadata.source_repository.value,
            "reliability_tier": node.metadata.reliability_tier.value,
            "reliability_score": node.metadata.reliability_score,
            "authors": node.metadata.authors,
            "doi": node.metadata.doi,
            "url": node.metadata.url,
            "publication_date": node.metadata.publication_date,
            "continent": node.metadata.continent,
            "country": node.metadata.country,
            "region": node.metadata.region,
            "tags": node.metadata.tags,
            "economic_impact_usd": node.metadata.economic_impact_usd,
            "word_count": node.metadata.word_count,
            "language": node.metadata.language,
            "source": f"{node.metadata.source_repository.value}",
        },
    }


# ── Embedding Helper ────────────────────────────────────────

def _embed_batch(texts: List[str], batch_size: int = 128) -> List[List[float]]:
    """Embed texts using sentence-transformers (synchronous)."""
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False)
        return [e.tolist() for e in embeddings]
    except ImportError:
        return []


# ── Qdrant Upsert Helper ────────────────────────────────────

def _upsert_to_qdrant(
    nodes: List[StandardizedNode],
    embeddings: List[List[float]],
    start_id: int = 0,
) -> int:
    """Insert embedded nodes into Qdrant. Returns count indexed."""
    try:
        from qdrant_client.http.models import PointStruct
        from app.services.vector_store import QdrantVectorStore, COLLECTION_NAME

        client = QdrantVectorStore.get_client()
        points = []

        for i, (node, emb) in enumerate(zip(nodes, embeddings)):
            point_id = start_id + i
            points.append(PointStruct(
                id=point_id,
                vector=emb,
                payload={
                    "content": node.content[:2000],
                    "source": node.metadata.source_repository.value,
                    "subtopic": node.metadata.title,
                    "continent": node.metadata.continent,
                    "source_type": node.metadata.knowledge_domain.value,
                    "reliability_score": node.metadata.reliability_score,
                    "is_internal": node.metadata.source_repository == SourceRepository.BEEYIELD_INTERNAL,
                    "url": node.metadata.url or "",
                    "global_id": node.metadata.global_id,
                    "domain": node.metadata.knowledge_domain.value,
                    "country": node.metadata.country or "",
                    "tags": ",".join(node.metadata.tags),
                },
            ))

        if points:
            batch_size = 100
            for i in range(0, len(points), batch_size):
                client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=points[i:i + batch_size],
                )

        return len(points)
    except Exception as e:
        print(f"[Ingestion] Qdrant upsert error: {e}")
        return 0


# ── Base Pipeline ────────────────────────────────────────────

class BaseIngestionPipeline:
    """
    Base class for all domain-specific ingestion pipelines.
    Subclasses override `transform()` to convert domain-specific
    raw data into the standard `{content, title, source, ...}` dict.
    """

    domain: KnowledgeDomain = KnowledgeDomain.GENERAL

    def __init__(self):
        self.standardizer = MetadataStandardizer()

    def transform(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """Override in subclass: convert raw to standardizer input."""
        return raw_item

    async def ingest(
        self,
        raw_items: List[Dict[str, Any]],
        persist: bool = True,
        index: bool = True,
    ) -> IngestionResult:
        """Full pipeline: transform → standardize → embed → index → persist."""
        start = time.perf_counter()
        errors: List[str] = []

        # 1. Transform
        transformed = []
        for i, item in enumerate(raw_items):
            try:
                transformed.append(self.transform(item))
            except Exception as e:
                errors.append(f"Transform[{i}]: {e}")

        # 2. Standardize
        nodes, std_errors = self.standardizer.standardize_batch(
            transformed, force_domain=self.domain
        )
        errors.extend([f"Standardize[{e['index']}]: {e['error']}" for e in std_errors])

        # 3. Embed
        texts = [n.content[:512] for n in nodes]
        embeddings = _embed_batch(texts) if texts else []
        embedded_count = len(embeddings)

        # 4. Index into Qdrant
        indexed_count = 0
        if index and embeddings and len(embeddings) == len(nodes):
            # Get current max ID from lakehouse
            lakehouse = _load_lakehouse()
            start_id = len(lakehouse.get("lakehouse_nodes", []))
            indexed_count = _upsert_to_qdrant(nodes, embeddings, start_id)

        # 5. Persist to lakehouse
        if persist and nodes:
            lakehouse = _load_lakehouse()
            existing_hashes = {
                n.get("content_hash") for n in lakehouse.get("lakehouse_nodes", [])
            }
            new_nodes = [
                _node_to_dict(n) for n in nodes
                if n.content_hash not in existing_hashes
            ]
            lakehouse["lakehouse_nodes"].extend(new_nodes)
            lakehouse["stats"] = self.standardizer.get_domain_stats(nodes)
            _save_lakehouse(lakehouse)

        elapsed = (time.perf_counter() - start) * 1000

        return IngestionResult(
            domain=self.domain.value,
            raw_count=len(raw_items),
            nodes_created=len(nodes),
            nodes_embedded=embedded_count,
            nodes_indexed=indexed_count,
            errors=errors,
            elapsed_ms=round(elapsed, 1),
        )


# ── Domain-Specific Pipelines ───────────────────────────────

class AcademicPipeline(BaseIngestionPipeline):
    """
    Pipeline for university & peer-reviewed papers (8,000+).
    
    Accepts:
        {
            "title": str,
            "abstract": str,
            "authors": [str],
            "doi": str,
            "journal": str,
            "url": str,
            "publication_date": str,
            "full_text": str (optional)
        }
    """
    domain = KnowledgeDomain.ACADEMIC

    def transform(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        abstract = raw.get("abstract", "")
        full_text = raw.get("full_text", "")
        content = full_text if full_text else abstract

        journal = raw.get("journal", "")
        source = f"{journal} ({raw.get('publication_date', 'n.d.')})" if journal else "Academic Paper"

        return {
            "content": content,
            "title": raw.get("title", "Untitled Paper"),
            "source": source,
            "url": raw.get("url", ""),
            "authors": raw.get("authors", []),
            "publication_date": raw.get("publication_date"),
            "metadata": {
                "doi": raw.get("doi"),
                "tags": [raw.get("journal", ""), "academic", "peer-reviewed"],
                "data_vintage": raw.get("publication_date", "")[:4] if raw.get("publication_date") else None,
            },
        }


class IoTAcousticPipeline(BaseIngestionPipeline):
    """
    Pipeline for IoT & acoustic benchmark datasets (5,000+).
    
    Accepts:
        {
            "dataset_name": str,      # e.g. "NU-Hive", "BUZZ", "OSBH"
            "description": str,
            "colony_state": str,       # "queenright" | "queenless" | "swarming"
            "sensor_type": str,        # "audio" | "temperature" | "weight"
            "sample_rate_hz": int,
            "location": str,
            "recording_date": str,
            "features": dict           # extracted audio features
        }
    """
    domain = KnowledgeDomain.IOT_ACOUSTIC

    def transform(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        desc = raw.get("description", "")
        features = raw.get("features", {})
        features_str = ", ".join(f"{k}={v}" for k, v in features.items()) if features else ""

        content = (
            f"Dataset: {raw.get('dataset_name', 'Unknown')}\n"
            f"Colony State: {raw.get('colony_state', 'unknown')}\n"
            f"Sensor: {raw.get('sensor_type', 'unknown')} at {raw.get('sample_rate_hz', 0)} Hz\n"
            f"Location: {raw.get('location', 'Unknown')}\n"
            f"{desc}\n"
            f"Features: {features_str}"
        )

        return {
            "content": content,
            "title": f"{raw.get('dataset_name', 'Unknown')} — {raw.get('colony_state', '')}",
            "source": raw.get("dataset_name", "IoT Dataset"),
            "publication_date": raw.get("recording_date"),
            "metadata": {
                "tags": [
                    raw.get("sensor_type", ""),
                    raw.get("colony_state", ""),
                    raw.get("dataset_name", ""),
                    "iot",
                    "acoustic",
                ],
            },
        }


class GeospatialBiodiversityPipeline(BaseIngestionPipeline):
    """
    Pipeline for geospatial & biodiversity data (6,000+).
    
    Accepts:
        {
            "species": str,
            "common_name": str,
            "latitude": float,
            "longitude": float,
            "country": str,
            "region": str,
            "observation_date": str,
            "source_db": str,          # "gbif" | "inaturalist"
            "occurrence_id": str,
            "habitat": str
        }
    """
    domain = KnowledgeDomain.GEOSPATIAL_BIODIVERSITY

    def transform(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        content = (
            f"Species: {raw.get('species', 'Unknown')} ({raw.get('common_name', '')})\n"
            f"Location: {raw.get('region', '')}, {raw.get('country', '')} "
            f"({raw.get('latitude', 0):.4f}, {raw.get('longitude', 0):.4f})\n"
            f"Habitat: {raw.get('habitat', 'Unknown')}\n"
            f"Observed: {raw.get('observation_date', 'Unknown')}\n"
            f"Source: {raw.get('source_db', 'Unknown')} #{raw.get('occurrence_id', '')}"
        )

        return {
            "content": content,
            "title": f"{raw.get('species', 'Unknown')} — {raw.get('country', '')}",
            "source": raw.get("source_db", "GBIF"),
            "url": f"https://www.gbif.org/occurrence/{raw.get('occurrence_id', '')}"
                   if raw.get("source_db") == "gbif" else "",
            "publication_date": raw.get("observation_date"),
            "metadata": {
                "tags": [
                    raw.get("species", ""),
                    raw.get("habitat", ""),
                    "biodiversity",
                    "geospatial",
                ],
            },
        }


class DiseaseStressorPipeline(BaseIngestionPipeline):
    """
    Pipeline for disease & stressor repositories (4,000+).
    
    Accepts:
        {
            "pathogen": str,           # e.g. "Varroa destructor"
            "disease": str,            # e.g. "European Foulbrood"
            "host_species": str,
            "treatment": str,
            "efficacy_pct": float,
            "recurrence_rate_pct": float,
            "cost_usd": float,
            "source_framework": str,   # e.g. "MUST-B"
            "study_location": str,
            "year": int,
            "notes": str
        }
    """
    domain = KnowledgeDomain.DISEASE_STRESSOR

    def transform(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        content = (
            f"Disease: {raw.get('disease', 'Unknown')}\n"
            f"Pathogen: {raw.get('pathogen', 'Unknown')}\n"
            f"Host: {raw.get('host_species', 'Apis mellifera')}\n"
            f"Treatment: {raw.get('treatment', 'None reported')}\n"
            f"Efficacy: {raw.get('efficacy_pct', 'N/A')}%\n"
            f"Recurrence Rate: {raw.get('recurrence_rate_pct', 'N/A')}%\n"
            f"Cost per Colony: ${raw.get('cost_usd', 0):.2f} USD\n"
            f"Framework: {raw.get('source_framework', 'Unknown')}\n"
            f"Location: {raw.get('study_location', 'Unknown')}\n"
            f"Year: {raw.get('year', 'Unknown')}\n"
            f"Notes: {raw.get('notes', '')}"
        )

        return {
            "content": content,
            "title": f"{raw.get('disease', 'Unknown')} — {raw.get('pathogen', '')}",
            "source": raw.get("source_framework", "Disease Repository"),
            "metadata": {
                "economic_impact_usd": raw.get("cost_usd"),
                "tags": [
                    raw.get("pathogen", ""),
                    raw.get("disease", ""),
                    raw.get("treatment", ""),
                    "disease",
                    "stressor",
                ],
                "data_vintage": str(raw.get("year", "")),
            },
        }


class TraceabilityQualityPipeline(BaseIngestionPipeline):
    """
    Pipeline for traceability & quality standards (2,000+).
    
    Accepts:
        {
            "standard_name": str,      # e.g. "ISO 12824:2022"
            "method": str,             # "DNA-barcoding" | "melissopalynology"
            "species_tested": str,
            "authentication_target": str,
            "accuracy_pct": float,
            "certifying_body": str,
            "region": str,
            "description": str
        }
    """
    domain = KnowledgeDomain.TRACEABILITY_QUALITY

    def transform(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        content = (
            f"Standard: {raw.get('standard_name', 'Unknown')}\n"
            f"Method: {raw.get('method', 'Unknown')}\n"
            f"Species: {raw.get('species_tested', 'Apis mellifera')}\n"
            f"Target: {raw.get('authentication_target', 'Unknown')}\n"
            f"Accuracy: {raw.get('accuracy_pct', 'N/A')}%\n"
            f"Certifying Body: {raw.get('certifying_body', 'Unknown')}\n"
            f"Region: {raw.get('region', 'Global')}\n"
            f"Description: {raw.get('description', '')}"
        )

        return {
            "content": content,
            "title": f"{raw.get('standard_name', 'Unknown')} — {raw.get('method', '')}",
            "source": raw.get("certifying_body", "Quality Standards"),
            "metadata": {
                "tags": [
                    raw.get("method", ""),
                    raw.get("standard_name", ""),
                    "traceability",
                    "authentication",
                    "quality",
                ],
            },
        }


# ── Master Ingestion Orchestrator ────────────────────────────

PIPELINES = {
    "academic": AcademicPipeline,
    "iot_acoustic": IoTAcousticPipeline,
    "geospatial": GeospatialBiodiversityPipeline,
    "disease_stressor": DiseaseStressorPipeline,
    "traceability": TraceabilityQualityPipeline,
}


async def ingest_domain(
    domain: str,
    raw_items: List[Dict[str, Any]],
    persist: bool = True,
    index: bool = True,
) -> IngestionResult:
    """Ingest a batch of items for a specific domain."""
    pipeline_cls = PIPELINES.get(domain)
    if pipeline_cls is None:
        return IngestionResult(
            domain=domain,
            raw_count=len(raw_items),
            nodes_created=0,
            nodes_embedded=0,
            nodes_indexed=0,
            errors=[f"Unknown domain: {domain}"],
        )

    pipeline = pipeline_cls()
    return await pipeline.ingest(raw_items, persist=persist, index=index)


async def ingest_all_domains(
    data: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, IngestionResult]:
    """
    Ingest across all domains simultaneously.
    
    Accepts:
        {
            "academic": [...],
            "iot_acoustic": [...],
            "geospatial": [...],
            "disease_stressor": [...],
            "traceability": [...]
        }
    """
    tasks = {
        domain: ingest_domain(domain, items)
        for domain, items in data.items()
        if items
    }

    results = {}
    for domain, task in tasks.items():
        results[domain] = await task

    return results


def get_lakehouse_stats() -> LakehouseStats:
    """Get current lakehouse statistics."""
    from collections import Counter
    from datetime import datetime, timezone

    lakehouse = _load_lakehouse()
    nodes = lakehouse.get("lakehouse_nodes", [])

    if not nodes:
        return LakehouseStats()

    domains = Counter(n.get("metadata", {}).get("knowledge_domain", "general") for n in nodes)
    repos = Counter(n.get("metadata", {}).get("source_repository", "custom") for n in nodes)
    continents = Counter(n.get("metadata", {}).get("continent", "Global") for n in nodes)
    reliabilities = [n.get("metadata", {}).get("reliability_score", 0.5) for n in nodes]

    return LakehouseStats(
        total_nodes=len(nodes),
        by_domain=dict(domains),
        by_repository=dict(repos),
        by_continent=dict(continents),
        avg_reliability=round(sum(reliabilities) / len(reliabilities), 3) if reliabilities else 0,
        last_sync=datetime.now(timezone.utc).isoformat(),
    )
