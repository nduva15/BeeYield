"""
BeeYield Metadata Standardizer v5.0
=====================================
Normalizes datasets from all 5 Knowledge Domains into a unified schema
with Global IDs, ensuring 25,000 nodes stay perfectly synced.

Knowledge Domains:
  1. University & Peer-Reviewed Papers   (8,000+)
  2. IoT & Acoustic Benchmarks           (5,000+)
  3. Geospatial & Biodiversity Data      (6,000+)
  4. Disease & Stressor Repositories     (4,000+)
  5. Traceability & Quality Standards    (2,000+)

Every node receives a deterministic Global ID:
  BY-{domain_prefix}-{sha256_short}-{seq}
"""

import hashlib
import json
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum

# ── Knowledge Domain Taxonomy ─────────────────────────────────

class KnowledgeDomain(str, Enum):
    ACADEMIC       = "ACAD"    # University & Peer-Reviewed
    IOT_ACOUSTIC   = "IOT"     # Sensor / Audio benchmarks
    GEOSPATIAL     = "GEO"     # Biodiversity / occurrence records
    DISEASE        = "DIS"     # Stressor / pathogen repositories
    TRACEABILITY   = "TRC"     # Quality standards / authentication

DOMAIN_TARGETS = {
    KnowledgeDomain.ACADEMIC:     8_000,
    KnowledgeDomain.IOT_ACOUSTIC: 5_000,
    KnowledgeDomain.GEOSPATIAL:   6_000,
    KnowledgeDomain.DISEASE:      4_000,
    KnowledgeDomain.TRACEABILITY: 2_000,
}

# ── Unified Node Schema ──────────────────────────────────────

class StandardizedNode:
    """
    The canonical representation of every knowledge node in the
    BeeYield Vector-Lakehouse.
    """

    __slots__ = (
        "global_id", "content", "title", "domain", "source",
        "source_type", "continent", "country", "doi", "url",
        "authors", "publication_date", "reliability_score",
        "is_internal", "tags", "linked_nodes", "raw_metadata",
        "created_at", "updated_at", "content_hash",
    )

    def __init__(
        self,
        content: str,
        domain: KnowledgeDomain,
        source: str,
        *,
        title: str = "",
        source_type: str = "General_Research",
        continent: str = "Global",
        country: str = "",
        doi: str = "",
        url: str = "",
        authors: Optional[List[str]] = None,
        publication_date: str = "",
        reliability_score: float = 0.8,
        is_internal: bool = False,
        tags: Optional[List[str]] = None,
        linked_nodes: Optional[List[str]] = None,
        raw_metadata: Optional[Dict[str, Any]] = None,
        global_id: Optional[str] = None,
        seq: int = 0,
    ):
        self.content = content.strip()
        self.title = title or self._extract_title(content)
        self.domain = domain
        self.source = source
        self.source_type = source_type
        self.continent = continent
        self.country = country
        self.doi = doi
        self.url = url
        self.authors = authors or []
        self.publication_date = publication_date
        self.reliability_score = min(max(reliability_score, 0.0), 1.0)
        self.is_internal = is_internal
        self.tags = tags or []
        self.linked_nodes = linked_nodes or []
        self.raw_metadata = raw_metadata or {}
        self.content_hash = hashlib.sha256(self.content.encode()).hexdigest()[:12]
        self.global_id = global_id or f"BY-{domain.value}-{self.content_hash}-{seq:05d}"
        now = datetime.now(timezone.utc).isoformat()
        self.created_at = now
        self.updated_at = now

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.global_id,
            "content": self.content,
            "title": self.title,
            "domain": self.domain.value,
            "metadata": {
                "source": self.source,
                "source_type": self.source_type,
                "continent": self.continent,
                "country": self.country,
                "doi": self.doi,
                "url": self.url,
                "authors": self.authors,
                "publication_date": self.publication_date,
                "reliability_score": self.reliability_score,
                "is_internal": self.is_internal,
                "tags": self.tags,
                "linked_nodes": self.linked_nodes,
                "content_hash": self.content_hash,
                "created_at": self.created_at,
                "updated_at": self.updated_at,
            },
            "raw_metadata": self.raw_metadata,
        }

    @staticmethod
    def _extract_title(content: str) -> str:
        """Pull a reasonable title from the first line / sentence."""
        first_line = content.split("\n")[0].strip()
        if len(first_line) > 120:
            first_line = first_line[:117] + "..."
        return first_line or "Untitled Node"


# ── Metadata Standardizer ────────────────────────────────────

class MetadataStandardizer:
    """
    Ingestion pipeline that normalizes raw datasets from heterogeneous
    sources into StandardizedNodes with Global IDs.
    """

    # Domain detection keywords
    _DOMAIN_SIGNALS: Dict[KnowledgeDomain, List[str]] = {
        KnowledgeDomain.ACADEMIC: [
            "doi", "journal", "abstract", "peer-review", "university",
            "frontiers", "plos", "researchgate", "elsevier", "springer",
            "wiley", "pubmed", "scopus", "citation",
        ],
        KnowledgeDomain.IOT_ACOUSTIC: [
            "sensor", "temperature", "humidity", "acoustic", "audio",
            "iot", "lorawan", "nu-hive", "buzz", "osbh", "queenright",
            "queenless", "spectrogram", "weight",
        ],
        KnowledgeDomain.GEOSPATIAL: [
            "latitude", "longitude", "gbif", "inaturalist", "occurrence",
            "forage", "land cover", "sentinel-2", "ndvi", "geospatial",
            "habitat", "biodiversity", "species",
        ],
        KnowledgeDomain.DISEASE: [
            "varroa", "nosema", "foulbrood", "pathogen", "efsa", "must-b",
            "apisram", "pesticide", "neonicotinoid", "stressor", "mortality",
            "colony loss", "disease", "virus", "mite",
        ],
        KnowledgeDomain.TRACEABILITY: [
            "traceability", "authentication", "dna", "protein", "melissopalynology",
            "quality", "nir", "spectroscopy", "adulteration", "honeychain",
            "blockchain", "batch", "certification",
        ],
    }

    # Continent detection
    _CONTINENT_MAP = {
        "africa": ("Africa", ["kenya", "nairobi", "kibwezi", "makueni",
                              "ethiopia", "tanzania", "uganda", "nigeria",
                              "south africa", "pretoria", "ghana", "cameroon",
                              "sub-saharan", "icipe"]),
        "europe": ("Europe", ["eu", "efsa", "portugal", "denmark", "germany",
                              "hohenheim", "france", "spain", "italy", "uk",
                              "european"]),
        "north_america": ("North America", ["usa", "usda", "canada", "mexico"]),
        "asia": ("Asia", ["china", "india", "japan", "apis cerana", "vietnam"]),
        "oceania": ("Oceania", ["australia", "new zealand"]),
        "south_america": ("South America", ["brazil", "argentina", "chile"]),
    }

    # DOI extraction pattern
    _DOI_PATTERN = re.compile(r'10\.\d{4,}/[^\s,;"\'\]]+')

    def __init__(self):
        self._seq_counters: Dict[str, int] = {}

    def _next_seq(self, domain: KnowledgeDomain) -> int:
        key = domain.value
        self._seq_counters[key] = self._seq_counters.get(key, 0) + 1
        return self._seq_counters[key]

    # ── Core standardization ──────────────────────────────

    def standardize(
        self,
        raw: Dict[str, Any],
        *,
        force_domain: Optional[KnowledgeDomain] = None,
    ) -> StandardizedNode:
        """
        Convert a raw dict (from any source) into a StandardizedNode.
        Auto-detects domain, continent, DOI, and reliability if not provided.
        """
        content = raw.get("content", "") or raw.get("text", "") or raw.get("abstract", "") or ""
        meta = raw.get("metadata", {})
        combined_text = f"{content} {json.dumps(meta)}".lower()

        # Domain detection
        domain = force_domain or self._detect_domain(combined_text)

        # Continent detection
        continent = meta.get("continent") or self._detect_continent(combined_text)

        # Country detection
        country = meta.get("country", "")

        # DOI extraction
        doi = meta.get("doi", "")
        if not doi:
            doi_match = self._DOI_PATTERN.search(content)
            if doi_match:
                doi = doi_match.group(0)

        # Source type classification
        source_type = meta.get("source_type", "")
        if not source_type:
            source_type = self._classify_source_type(combined_text, domain)

        # Reliability scoring
        reliability = meta.get("reliability_score", 0.0)
        if not reliability:
            reliability = self._compute_reliability(doi, source_type, domain, content)

        # Tags
        tags = meta.get("tags", [])
        if not tags:
            tags = self._auto_tag(combined_text, domain)

        # Authors
        authors = meta.get("authors", [])
        if isinstance(authors, str):
            authors = [a.strip() for a in authors.split(",") if a.strip()]

        seq = self._next_seq(domain)

        return StandardizedNode(
            content=content,
            domain=domain,
            source=meta.get("source", raw.get("source", "Unknown")),
            title=raw.get("title", meta.get("title", "")),
            source_type=source_type,
            continent=continent,
            country=country,
            doi=doi,
            url=meta.get("url", raw.get("url", "")),
            authors=authors,
            publication_date=meta.get("publication_date", meta.get("timestamp", "")),
            reliability_score=reliability,
            is_internal=meta.get("is_internal", False),
            tags=tags,
            linked_nodes=meta.get("linked_nodes", []),
            raw_metadata=meta,
            seq=seq,
        )

    def standardize_batch(
        self,
        raw_nodes: List[Dict[str, Any]],
        *,
        force_domain: Optional[KnowledgeDomain] = None,
    ) -> Tuple[List[StandardizedNode], List[Dict[str, str]]]:
        """Standardize many nodes. Returns (successes, errors)."""
        ok: List[StandardizedNode] = []
        errors: List[Dict[str, str]] = []

        for i, raw in enumerate(raw_nodes):
            try:
                node = self.standardize(raw, force_domain=force_domain)
                ok.append(node)
            except Exception as e:
                errors.append({"index": str(i), "error": str(e)})

        return ok, errors

    # ── Detection helpers ─────────────────────────────────

    def _detect_domain(self, text: str) -> KnowledgeDomain:
        """Score text against each domain's keyword set."""
        scores = {}
        for domain, keywords in self._DOMAIN_SIGNALS.items():
            score = sum(1 for kw in keywords if kw in text)
            scores[domain] = score
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else KnowledgeDomain.ACADEMIC

    def _detect_continent(self, text: str) -> str:
        for _, (continent, keywords) in self._CONTINENT_MAP.items():
            if any(kw in text for kw in keywords):
                return continent
        return "Global"

    def _classify_source_type(self, text: str, domain: KnowledgeDomain) -> str:
        type_map = {
            "peer_reviewed": ["journal", "doi", "peer-review", "abstract",
                              "frontiers", "plos", "elsevier", "springer"],
            "government": ["usda", "efsa", "fao", "government", "ministry"],
            "dataset": ["gbif", "inaturalist", "dataset", "csv", "occurrence"],
            "iot_telemetry": ["sensor", "reading", "temperature", "lorawan"],
            "internal": ["beeyield", "honeychain", "harvest log"],
            "news": ["news", "press", "announcement", "blog"],
        }
        for stype, signals in type_map.items():
            if any(s in text for s in signals):
                return stype
        return "general_research"

    def _compute_reliability(
        self, doi: str, source_type: str, domain: KnowledgeDomain, content: str
    ) -> float:
        """Heuristic reliability score 0.0 – 1.0."""
        base = 0.5
        if doi:
            base += 0.2
        if source_type == "peer_reviewed":
            base += 0.15
        elif source_type == "government":
            base += 0.12
        elif source_type == "iot_telemetry":
            base += 0.10
        elif source_type == "internal":
            base += 0.05
        if len(content) > 500:
            base += 0.05
        if domain == KnowledgeDomain.ACADEMIC:
            base += 0.03
        return min(base, 1.0)

    def _auto_tag(self, text: str, domain: KnowledgeDomain) -> List[str]:
        """Generate up to 8 tags from content signals."""
        tag_bank = {
            "varroa": "varroa",
            "nosema": "nosema",
            "foulbrood": "foulbrood",
            "pollination": "pollination",
            "honey quality": "quality",
            "traceability": "traceability",
            "blockchain": "blockchain",
            "iot": "iot",
            "acoustic": "acoustic",
            "sentinel": "satellite",
            "climate": "climate",
            "pesticide": "pesticide",
            "apis mellifera": "apis-mellifera",
            "apis cerana": "apis-cerana",
            "queen": "queen-status",
            "swarm": "swarming",
            "colony loss": "colony-loss",
            "biodiversity": "biodiversity",
            "gbif": "gbif",
            "inaturalist": "inaturalist",
            "kibwezi": "kibwezi",
            "kenya": "kenya",
            "africa": "africa",
        }
        tags = [tag for kw, tag in tag_bank.items() if kw in text]
        tags.append(domain.value.lower())
        return list(dict.fromkeys(tags))[:8]  # deduplicate, limit


# ── Lakehouse Upgrader ────────────────────────────────────────

class LakehouseUpgrader:
    """
    Reads the existing standardized_lakehouse.json, re-standardizes
    every node with Global IDs and domain tagging, and writes back.
    """

    def __init__(self):
        self.standardizer = MetadataStandardizer()
        self.data_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../data")
        )

    def upgrade(self) -> Dict[str, Any]:
        """Run the full upgrade pipeline."""
        src = os.path.join(self.data_dir, "standardized_lakehouse.json")
        if not os.path.exists(src):
            return {"error": f"Not found: {src}"}

        with open(src, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_nodes = data.get("lakehouse_nodes", [])
        nodes, errors = self.standardizer.standardize_batch(raw_nodes)

        # Domain distribution
        domain_counts: Dict[str, int] = {}
        for n in nodes:
            domain_counts[n.domain.value] = domain_counts.get(n.domain.value, 0) + 1

        # Write upgraded lakehouse
        upgraded = {
            "version": "5.0.0",
            "total_nodes": len(nodes),
            "domain_distribution": domain_counts,
            "targets": {d.value: t for d, t in DOMAIN_TARGETS.items()},
            "upgraded_at": datetime.now(timezone.utc).isoformat(),
            "lakehouse_nodes": [n.to_dict() for n in nodes],
        }

        out_path = os.path.join(self.data_dir, "standardized_lakehouse_v5.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(upgraded, f, indent=2, ensure_ascii=False)

        return {
            "status": "upgraded",
            "total_nodes": len(nodes),
            "errors": len(errors),
            "domain_distribution": domain_counts,
            "output": out_path,
        }


# ── CLI runner ────────────────────────────────────────────────

if __name__ == "__main__":
    upgrader = LakehouseUpgrader()
    result = upgrader.upgrade()
    print(json.dumps(result, indent=2))
