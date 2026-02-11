"""
METADATA STANDARDIZER (v5.0)
Global ID tagging system for 25,000+ datasets.

Every dataset gets:
  - A deterministic Global ID (GID) based on content hash
  - Knowledge Domain classification
  - Provenance chain (source → repository → DOI)
  - Reliability scoring (0.0 → 1.0)
  - Temporal tagging (publication date, ingestion date)
  - Geographic tagging (continent, country, region)

Ensures zero sync errors across the Vector-Lakehouse.
"""

import hashlib
import json
import re
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel, Field


# ─── Knowledge Domains ──────────────────────────────────────

class KnowledgeDomain(str, Enum):
    ACADEMIC = "academic"                    # 8,000+ papers
    IOT_ACOUSTIC = "iot_acoustic"            # 5,000+ sensor/audio benchmarks
    GEOSPATIAL_BIODIVERSITY = "geospatial"   # 6,000+ occurrence records
    DISEASE_STRESSOR = "disease_stressor"    # 4,000+ pathogen/stressor data
    TRACEABILITY_QUALITY = "traceability"    # 2,000+ authentication records
    INTERNAL_OPS = "internal_ops"            # BeeYield harvest/team data
    GENERAL = "general"


class SourceRepository(str, Enum):
    RESEARCHGATE = "researchgate"
    FRONTIERS = "frontiers"
    PLOS_ONE = "plos_one"
    SPRINGER = "springer"
    ELSEVIER = "elsevier"
    EU_POLLINATOR_HUB = "eu_pollinator_hub"
    MUST_B = "must_b_efsa"
    ICIPE = "icipe_african_ref_lab"
    INATURALIST = "inaturalist"
    GBIF = "gbif"
    NU_HIVE = "nu_hive"
    BUZZ_DATASET = "buzz_dataset"
    OSBH = "osbh"
    BEEYIELD_INTERNAL = "beeyield_internal"
    SENTINEL2 = "sentinel2_satellite"
    CUSTOM = "custom"


class ReliabilityTier(str, Enum):
    PEER_REVIEWED = "peer_reviewed"       # 0.95
    INSTITUTIONAL = "institutional"       # 0.85
    GOVERNMENT = "government"             # 0.90
    COMMUNITY = "community"              # 0.70
    INTERNAL = "internal"                 # 0.80
    UNVERIFIED = "unverified"            # 0.50


# ─── Standardized Node Schema ───────────────────────────────

class StandardizedMetadata(BaseModel):
    """Every node in the 25k lakehouse carries this envelope."""
    
    global_id: str = Field(
        ..., description="Deterministic SHA-256 hash of content + source"
    )
    knowledge_domain: KnowledgeDomain
    source_repository: SourceRepository
    reliability_tier: ReliabilityTier
    reliability_score: float = Field(ge=0.0, le=1.0)
    
    # Provenance
    title: str
    authors: List[str] = Field(default_factory=list)
    doi: Optional[str] = None
    url: Optional[str] = None
    publication_date: Optional[str] = None  # ISO 8601
    
    # Geographic
    continent: str = "Global"
    country: Optional[str] = None
    region: Optional[str] = None
    
    # Temporal
    ingestion_timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    data_vintage: Optional[str] = None  # e.g. "2024-2025"
    
    # Linkage
    related_gids: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    
    # Economics (for cost-bearing records)
    economic_impact_usd: Optional[float] = None
    
    # Content stats
    word_count: int = 0
    language: str = "en"


class StandardizedNode(BaseModel):
    """A fully standardized node ready for vector embedding."""
    metadata: StandardizedMetadata
    content: str
    content_hash: str  # SHA-256 of raw content
    embedding: Optional[List[float]] = None
    chunk_index: int = 0  # For multi-chunk documents
    total_chunks: int = 1


# ─── Reliability Scoring ────────────────────────────────────

RELIABILITY_SCORES = {
    ReliabilityTier.PEER_REVIEWED: 0.95,
    ReliabilityTier.INSTITUTIONAL: 0.85,
    ReliabilityTier.GOVERNMENT: 0.90,
    ReliabilityTier.COMMUNITY: 0.70,
    ReliabilityTier.INTERNAL: 0.80,
    ReliabilityTier.UNVERIFIED: 0.50,
}


# ─── Domain Detection Heuristics ────────────────────────────

DOMAIN_KEYWORDS = {
    KnowledgeDomain.ACADEMIC: [
        "study", "research", "paper", "journal", "doi", "abstract",
        "methodology", "findings", "peer-reviewed", "university",
        "hypothesis", "conclusion", "p-value", "sample size",
    ],
    KnowledgeDomain.IOT_ACOUSTIC: [
        "sensor", "temperature", "humidity", "acoustic", "audio",
        "queenright", "queenless", "nu-hive", "buzz", "osbh",
        "decibel", "frequency", "spectrogram", "iot", "telemetry",
    ],
    KnowledgeDomain.GEOSPATIAL_BIODIVERSITY: [
        "latitude", "longitude", "gbif", "inaturalist", "occurrence",
        "species", "forage", "habitat", "land cover", "sentinel",
        "satellite", "ndvi", "geospatial", "biodiversity",
    ],
    KnowledgeDomain.DISEASE_STRESSOR: [
        "varroa", "nosema", "foulbrood", "pesticide", "neonicotinoid",
        "pathogen", "virus", "deformed wing", "acaricide", "must-b",
        "apis", "melissococcus", "paenibacillus", "mortality",
    ],
    KnowledgeDomain.TRACEABILITY_QUALITY: [
        "authentication", "dna", "protein", "melissopalynology",
        "adulteration", "traceability", "batch", "certification",
        "quality", "standard", "iso", "haccp", "chain of custody",
    ],
    KnowledgeDomain.INTERNAL_OPS: [
        "beeyield", "harvest", "farmer", "apiary", "kibwezi",
        "nairobi", "team", "season", "production", "yield",
    ],
}

SOURCE_PATTERNS = {
    SourceRepository.RESEARCHGATE: [r"researchgate\.net"],
    SourceRepository.FRONTIERS: [r"frontiersin\.org"],
    SourceRepository.PLOS_ONE: [r"plos\.org", r"plosone"],
    SourceRepository.SPRINGER: [r"springer\.com", r"link\.springer"],
    SourceRepository.ELSEVIER: [r"elsevier\.com", r"sciencedirect"],
    SourceRepository.INATURALIST: [r"inaturalist\.org"],
    SourceRepository.GBIF: [r"gbif\.org"],
    SourceRepository.EU_POLLINATOR_HUB: [r"pollinatorhub", r"eu.pollinator"],
    SourceRepository.MUST_B: [r"must-b", r"efsa.*sentinel", r"apisram"],
    SourceRepository.ICIPE: [r"icipe", r"african.*reference.*lab"],
}


# ─── The Standardizer ───────────────────────────────────────

class MetadataStandardizer:
    """
    Transforms raw heterogeneous data into standardized nodes
    with Global IDs, domain classification, and reliability scores.
    
    Usage:
        standardizer = MetadataStandardizer()
        node = standardizer.standardize(raw_data)
    """

    def __init__(self):
        self._gid_cache: Dict[str, str] = {}

    def compute_global_id(self, content: str, source: str) -> str:
        """Deterministic GID from content + source."""
        raw = f"{content.strip()[:500]}|{source.strip().lower()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]

    def compute_content_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def detect_domain(self, content: str, source: str = "") -> KnowledgeDomain:
        """Classify content into one of the 7 knowledge domains."""
        combined = f"{content} {source}".lower()
        scores: Dict[KnowledgeDomain, int] = {}

        for domain, keywords in DOMAIN_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in combined)
            if score > 0:
                scores[domain] = score

        if not scores:
            return KnowledgeDomain.GENERAL

        return max(scores, key=scores.get)

    def detect_source_repo(self, url: str = "", source: str = "") -> SourceRepository:
        """Identify the source repository from URL/source string."""
        combined = f"{url} {source}".lower()
        for repo, patterns in SOURCE_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, combined, re.IGNORECASE):
                    return repo

        if "beeyield" in combined or "internal" in combined:
            return SourceRepository.BEEYIELD_INTERNAL

        return SourceRepository.CUSTOM

    def detect_reliability(
        self,
        domain: KnowledgeDomain,
        source_repo: SourceRepository,
        has_doi: bool = False,
    ) -> Tuple[ReliabilityTier, float]:
        """Assign reliability tier and score."""
        if has_doi or source_repo in (
            SourceRepository.FRONTIERS,
            SourceRepository.PLOS_ONE,
            SourceRepository.SPRINGER,
            SourceRepository.ELSEVIER,
        ):
            tier = ReliabilityTier.PEER_REVIEWED
        elif source_repo in (
            SourceRepository.EU_POLLINATOR_HUB,
            SourceRepository.MUST_B,
            SourceRepository.ICIPE,
        ):
            tier = ReliabilityTier.INSTITUTIONAL
        elif source_repo == SourceRepository.BEEYIELD_INTERNAL:
            tier = ReliabilityTier.INTERNAL
        elif source_repo in (SourceRepository.INATURALIST, SourceRepository.GBIF):
            tier = ReliabilityTier.COMMUNITY
        else:
            tier = ReliabilityTier.UNVERIFIED

        return tier, RELIABILITY_SCORES[tier]

    def extract_doi(self, content: str, url: str = "") -> Optional[str]:
        """Extract DOI from content or URL."""
        combined = f"{content} {url}"
        match = re.search(r"10\.\d{4,9}/[^\s]+", combined)
        return match.group(0).rstrip(".,;)") if match else None

    def extract_authors(self, content: str) -> List[str]:
        """Simple heuristic author extraction."""
        # Look for "Author:" or "by" patterns
        match = re.search(
            r"(?:authors?|by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+(?:\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)*)",
            content,
        )
        if match:
            return [a.strip() for a in match.group(1).split(",")]
        return []

    def detect_geography(
        self, content: str
    ) -> Tuple[str, Optional[str], Optional[str]]:
        """Detect continent/country/region from content."""
        c = content.lower()

        # Africa
        african_countries = {
            "kenya": ("Africa", "Kenya", None),
            "kibwezi": ("Africa", "Kenya", "Makueni"),
            "nairobi": ("Africa", "Kenya", "Nairobi"),
            "ethiopia": ("Africa", "Ethiopia", None),
            "tanzania": ("Africa", "Tanzania", None),
            "south africa": ("Africa", "South Africa", None),
            "pretoria": ("Africa", "South Africa", "Gauteng"),
            "nigeria": ("Africa", "Nigeria", None),
            "ghana": ("Africa", "Ghana", None),
            "cameroon": ("Africa", "Cameroon", None),
            "uganda": ("Africa", "Uganda", None),
        }
        for key, geo in african_countries.items():
            if key in c:
                return geo

        if "europe" in c or "eu " in c:
            return ("Europe", None, None)
        if "portugal" in c:
            return ("Europe", "Portugal", None)
        if "denmark" in c:
            return ("Europe", "Denmark", None)
        if "germany" in c or "hohenheim" in c:
            return ("Europe", "Germany", None)

        return ("Global", None, None)

    def chunk_content(
        self, content: str, max_chunk_size: int = 1500, overlap: int = 200
    ) -> List[str]:
        """Split long content into overlapping chunks for embedding."""
        if len(content) <= max_chunk_size:
            return [content]

        chunks = []
        start = 0
        while start < len(content):
            end = start + max_chunk_size
            # Try to break at sentence boundary
            if end < len(content):
                last_period = content.rfind(".", start, end)
                if last_period > start + max_chunk_size // 2:
                    end = last_period + 1
            chunks.append(content[start:end].strip())
            start = end - overlap

        return chunks

    def standardize(
        self,
        raw_data: Dict[str, Any],
        force_domain: Optional[KnowledgeDomain] = None,
    ) -> List[StandardizedNode]:
        """
        Transform a raw data dict into one or more StandardizedNodes.
        
        Accepts:
            {
                "content": str,                    # required
                "title": str,                      # optional
                "source": str,                     # optional
                "url": str,                        # optional
                "authors": list[str],              # optional
                "publication_date": str,           # optional
                "metadata": {...}                  # optional extra fields
            }
        
        Returns a list because long content is chunked.
        """
        content = raw_data.get("content", "").strip()
        if not content:
            return []

        title = raw_data.get("title", "Untitled")
        source = raw_data.get("source", "Unknown")
        url = raw_data.get("url", "")
        extra_meta = raw_data.get("metadata", {})

        # Detect everything
        domain = force_domain or self.detect_domain(content, source)
        source_repo = self.detect_source_repo(url, source)
        doi = self.extract_doi(content, url)
        tier, score = self.detect_reliability(domain, source_repo, doi is not None)
        authors = raw_data.get("authors") or self.extract_authors(content)
        continent, country, region = self.detect_geography(content)
        pub_date = raw_data.get("publication_date")

        # Chunk content
        chunks = self.chunk_content(content)
        nodes: List[StandardizedNode] = []

        for i, chunk in enumerate(chunks):
            gid = self.compute_global_id(chunk, source)
            
            tags = extra_meta.get("tags", [])
            # Auto-tag based on domain
            if domain == KnowledgeDomain.DISEASE_STRESSOR:
                for disease in ["varroa", "foulbrood", "nosema", "virus"]:
                    if disease in chunk.lower() and disease not in tags:
                        tags.append(disease)

            meta = StandardizedMetadata(
                global_id=gid,
                knowledge_domain=domain,
                source_repository=source_repo,
                reliability_tier=tier,
                reliability_score=score,
                title=f"{title}" + (f" (Part {i+1}/{len(chunks)})" if len(chunks) > 1 else ""),
                authors=authors,
                doi=doi,
                url=url,
                publication_date=pub_date,
                continent=continent,
                country=country,
                region=region,
                data_vintage=extra_meta.get("data_vintage"),
                related_gids=extra_meta.get("related_gids", []),
                tags=tags,
                economic_impact_usd=extra_meta.get("economic_impact_usd"),
                word_count=len(chunk.split()),
                language=extra_meta.get("language", "en"),
            )

            nodes.append(
                StandardizedNode(
                    metadata=meta,
                    content=chunk,
                    content_hash=self.compute_content_hash(chunk),
                    chunk_index=i,
                    total_chunks=len(chunks),
                )
            )

        return nodes

    def standardize_batch(
        self,
        raw_items: List[Dict[str, Any]],
        force_domain: Optional[KnowledgeDomain] = None,
    ) -> Tuple[List[StandardizedNode], List[Dict[str, str]]]:
        """
        Standardize a batch of raw data items.
        Returns (nodes, errors).
        """
        all_nodes: List[StandardizedNode] = []
        errors: List[Dict[str, str]] = []

        for i, item in enumerate(raw_items):
            try:
                nodes = self.standardize(item, force_domain)
                all_nodes.extend(nodes)
            except Exception as e:
                errors.append({"index": str(i), "error": str(e)})

        return all_nodes, errors

    def get_domain_stats(
        self, nodes: List[StandardizedNode]
    ) -> Dict[str, Any]:
        """Breakdown of nodes by domain, repository, and geography."""
        from collections import Counter

        domains = Counter(n.metadata.knowledge_domain for n in nodes)
        repos = Counter(n.metadata.source_repository for n in nodes)
        continents = Counter(n.metadata.continent for n in nodes)
        tiers = Counter(n.metadata.reliability_tier for n in nodes)

        return {
            "total_nodes": len(nodes),
            "by_domain": dict(domains),
            "by_repository": dict(repos),
            "by_continent": dict(continents),
            "by_reliability": dict(tiers),
            "avg_reliability_score": (
                sum(n.metadata.reliability_score for n in nodes) / len(nodes)
                if nodes
                else 0
            ),
            "avg_word_count": (
                sum(n.metadata.word_count for n in nodes) / len(nodes)
                if nodes
                else 0
            ),
        }
