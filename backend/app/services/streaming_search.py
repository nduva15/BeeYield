"""
STREAMING VECTOR SEARCH ENGINE (v1.0)
Zero-lag progressive retrieval across 25,000+ knowledge nodes.

Architecture:
  1. Query arrives → immediate embedding via sentence-transformers
  2. Phase 1 (0-50ms):   BM25 keyword scan yields first results (streamed)
  3. Phase 2 (50-200ms): Qdrant HNSW returns semantic matches (streamed)
  4. Phase 3 (200-500ms): Cross-encoder re-ranking + dedup (streamed)
  5. Phase 4 (500ms+):    Gemini 2.0 Flash synthesis (streamed tokens)

Each phase streams results via SSE as they become available.
"""

import asyncio
import json
import time
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

from pydantic import BaseModel, Field


class StreamSearchResult(BaseModel):
    """A single search result streamed to the client."""
    phase: str                       # "keyword" | "semantic" | "reranked" | "synthesis"
    rank: int
    global_id: str
    title: str
    content: str
    score: float
    domain: str = "general"
    source: str = "Unknown"
    reliability: float = 0.5
    url: Optional[str] = None
    continent: Optional[str] = None


class StreamSearchMeta(BaseModel):
    """Metadata sent at the start and end of a stream."""
    event: str                       # "start" | "phase_done" | "complete"
    phase: Optional[str] = None
    total_results: int = 0
    elapsed_ms: float = 0.0
    query: str = ""
    filters: Dict[str, Any] = Field(default_factory=dict)


class StreamingVectorSearch:
    """
    Progressive multi-phase search engine.
    
    Usage (FastAPI SSE):
        @app.get("/api/v1/search/stream")
        async def stream_search(query: str):
            searcher = StreamingVectorSearch()
            return StreamingResponse(
                searcher.search_stream(query),
                media_type="text/event-stream"
            )
    """

    def __init__(self):
        self._embedder = None
        self._qdrant = None
        self._kb_index = None

    def _get_embedder(self):
        if self._embedder is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
            except ImportError:
                pass
        return self._embedder

    def _get_qdrant(self):
        if self._qdrant is None:
            try:
                from app.services.vector_store import QdrantVectorStore
                self._qdrant = QdrantVectorStore
            except ImportError:
                pass
        return self._qdrant

    def _load_kb_index(self) -> List[Dict[str, Any]]:
        """Load the flat knowledge base for BM25 keyword scan."""
        if self._kb_index is not None:
            return self._kb_index

        import os
        paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/standardized_lakehouse.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json")),
        ]

        for path in paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    # Lakehouse format
                    if "lakehouse_nodes" in data:
                        self._kb_index = data["lakehouse_nodes"]
                    # Legacy format
                    elif "knowledge_nodes" in data:
                        self._kb_index = [
                            {
                                "content": n.get("content", ""),
                                "metadata": {
                                    "title": n.get("subtopic", n.get("source", "Untitled")),
                                    "source": n.get("source", "Unknown"),
                                    "global_id": str(i),
                                    "knowledge_domain": "general",
                                    "reliability_score": 0.8,
                                    "url": "",
                                    "continent": "Global",
                                },
                            }
                            for i, n in enumerate(data["knowledge_nodes"])
                        ]
                    return self._kb_index or []
                except Exception:
                    continue
        self._kb_index = []
        return self._kb_index

    # ── Phase 1: BM25 Keyword Scan ──────────────────────────

    def _bm25_scan(
        self,
        query: str,
        nodes: List[Dict[str, Any]],
        limit: int = 20,
        k1: float = 1.5,
        b: float = 0.75,
    ) -> List[Tuple[float, Dict[str, Any]]]:
        """
        BM25 scoring over in-memory nodes.
        Returns [(score, node), ...] sorted descending.
        """
        terms = set(query.lower().split())
        if not terms:
            return []

        # Average document length
        doc_lengths = [len(n.get("content", "").split()) for n in nodes]
        avg_dl = sum(doc_lengths) / max(len(doc_lengths), 1)

        # Document frequency
        df: Dict[str, int] = {}
        for n in nodes:
            doc_terms = set(n.get("content", "").lower().split())
            for t in terms:
                if t in doc_terms:
                    df[t] = df.get(t, 0) + 1

        N = len(nodes)
        scored = []

        for idx, node in enumerate(nodes):
            content_lower = node.get("content", "").lower()
            words = content_lower.split()
            dl = len(words)
            score = 0.0

            for term in terms:
                tf = words.count(term) if term in content_lower else 0
                if tf == 0:
                    continue
                d = df.get(term, 0)
                import math
                idf = math.log((N - d + 0.5) / (d + 0.5) + 1)
                tf_norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / max(avg_dl, 1)))
                score += idf * tf_norm

            if score > 0:
                scored.append((score, node))

        scored.sort(key=lambda x: x[0], reverse=True)
        return scored[:limit]

    # ── Phase 2: Qdrant Semantic Search ──────────────────────

    async def _semantic_search(
        self,
        query: str,
        limit: int = 20,
        continent: Optional[str] = None,
    ) -> List[Tuple[float, Dict[str, Any]]]:
        """Run Qdrant HNSW search, return [(score, node_dict)]."""
        qdrant = self._get_qdrant()
        if qdrant is None:
            return []

        try:
            results = await qdrant.search(query, limit=limit, continent=continent)
            hits = []
            # Parse Qdrant results into uniform dicts
            summary = results.get("summary", "")
            sources = results.get("sources", [])

            # If we have raw hits (extend the vector_store later)
            if "raw_hits" in results:
                for hit in results["raw_hits"]:
                    p = hit.get("payload", {})
                    hits.append((
                        hit.get("score", 0.0),
                        {
                            "content": p.get("content", ""),
                            "metadata": {
                                "title": p.get("subtopic", ""),
                                "source": p.get("source", "Unknown"),
                                "global_id": str(hit.get("id", "")),
                                "reliability_score": p.get("reliability_score", 0.7),
                                "url": p.get("url", ""),
                                "continent": p.get("continent", "Global"),
                                "knowledge_domain": p.get("source_type", "general"),
                            },
                        },
                    ))
            elif summary:
                # Fallback: create a single result from summary
                hits.append((
                    0.85,
                    {
                        "content": summary[:2000],
                        "metadata": {
                            "title": "Semantic Search Result",
                            "source": "Qdrant Vector Store",
                            "global_id": "qdrant-fused",
                            "reliability_score": 0.85,
                            "url": "",
                            "continent": "Global",
                            "knowledge_domain": "general",
                        },
                    },
                ))
            return hits
        except Exception as e:
            print(f"[StreamSearch] Semantic phase error: {e}")
            return []

    # ── Phase 3: Cross-encoder Re-ranking ────────────────────

    def _rerank(
        self,
        query: str,
        candidates: List[Tuple[float, Dict[str, Any]]],
        top_k: int = 15,
    ) -> List[Tuple[float, Dict[str, Any]]]:
        """
        Re-rank candidates using a lightweight heuristic scorer.
        (In production, swap for a cross-encoder model.)
        
        Scoring factors:
          - Original retrieval score (0.4 weight)
          - Term overlap boost (0.3 weight)
          - Reliability score (0.2 weight)
          - Recency bonus (0.1 weight)
        """
        terms = set(query.lower().split())
        reranked = []

        for orig_score, node in candidates:
            content_lower = node.get("content", "").lower()
            meta = node.get("metadata", {})

            # Term overlap
            words = set(content_lower.split())
            overlap = len(terms & words) / max(len(terms), 1)

            # Reliability
            reliability = meta.get("reliability_score", 0.5)

            # Recency (simple heuristic: nodes mentioning 2025/2026 get bonus)
            recency = 0.0
            if "2026" in content_lower:
                recency = 1.0
            elif "2025" in content_lower:
                recency = 0.8
            elif "2024" in content_lower:
                recency = 0.5

            # Combined score
            combined = (
                orig_score * 0.4
                + overlap * 0.3
                + reliability * 0.2
                + recency * 0.1
            )

            reranked.append((combined, node))

        reranked.sort(key=lambda x: x[0], reverse=True)
        return reranked[:top_k]

    # ── Deduplication ────────────────────────────────────────

    def _deduplicate(
        self,
        results: List[Tuple[float, Dict[str, Any]]],
    ) -> List[Tuple[float, Dict[str, Any]]]:
        """Remove near-duplicate results by content hash."""
        import hashlib
        seen: set = set()
        deduped = []

        for score, node in results:
            content = node.get("content", "")[:200]
            sig = hashlib.md5(content.encode()).hexdigest()
            if sig not in seen:
                seen.add(sig)
                deduped.append((score, node))

        return deduped

    # ── Main Streaming Generator ─────────────────────────────

    async def search_stream(
        self,
        query: str,
        limit: int = 25,
        continent: Optional[str] = None,
        include_synthesis: bool = False,
    ) -> AsyncGenerator[str, None]:
        """
        Server-Sent Events generator for progressive search.
        
        Yields SSE-formatted strings:
          data: {"type": "meta", ...}
          data: {"type": "result", ...}
        """
        start = time.perf_counter()
        all_results: List[Tuple[float, Dict[str, Any]]] = []
        seen_gids: set = set()

        # ── Emit start event ─────────────────────────────
        yield self._sse(StreamSearchMeta(
            event="start",
            query=query,
            filters={"continent": continent, "limit": limit},
        ).model_dump())

        # ── Phase 1: BM25 Keyword Scan (<50ms) ──────────
        nodes = self._load_kb_index()
        keyword_hits = self._bm25_scan(query, nodes, limit=limit)

        for rank, (score, node) in enumerate(keyword_hits):
            meta = node.get("metadata", {})
            gid = meta.get("global_id", str(rank))
            if gid in seen_gids:
                continue
            seen_gids.add(gid)
            all_results.append((score, node))

            yield self._sse(StreamSearchResult(
                phase="keyword",
                rank=rank,
                global_id=gid,
                title=meta.get("title", "Untitled"),
                content=node.get("content", "")[:500],
                score=round(score, 4),
                domain=meta.get("knowledge_domain", "general"),
                source=meta.get("source", "Unknown"),
                reliability=meta.get("reliability_score", 0.5),
                url=meta.get("url"),
                continent=meta.get("continent"),
            ).model_dump())

        elapsed_p1 = (time.perf_counter() - start) * 1000
        yield self._sse(StreamSearchMeta(
            event="phase_done",
            phase="keyword",
            total_results=len(all_results),
            elapsed_ms=round(elapsed_p1, 1),
        ).model_dump())

        # ── Phase 2: Qdrant Semantic (<200ms) ────────────
        semantic_hits = await self._semantic_search(query, limit=limit, continent=continent)

        for rank, (score, node) in enumerate(semantic_hits):
            meta = node.get("metadata", {})
            gid = meta.get("global_id", f"sem-{rank}")
            if gid in seen_gids:
                continue
            seen_gids.add(gid)
            all_results.append((score, node))

            yield self._sse(StreamSearchResult(
                phase="semantic",
                rank=len(all_results) - 1,
                global_id=gid,
                title=meta.get("title", "Untitled"),
                content=node.get("content", "")[:500],
                score=round(score, 4),
                domain=meta.get("knowledge_domain", "general"),
                source=meta.get("source", "Unknown"),
                reliability=meta.get("reliability_score", 0.7),
                url=meta.get("url"),
                continent=meta.get("continent"),
            ).model_dump())

        elapsed_p2 = (time.perf_counter() - start) * 1000
        yield self._sse(StreamSearchMeta(
            event="phase_done",
            phase="semantic",
            total_results=len(all_results),
            elapsed_ms=round(elapsed_p2, 1),
        ).model_dump())

        # ── Phase 3: Re-rank + Dedup (<500ms) ───────────
        deduped = self._deduplicate(all_results)
        reranked = self._rerank(query, deduped, top_k=limit)

        for rank, (score, node) in enumerate(reranked):
            meta = node.get("metadata", {})
            yield self._sse(StreamSearchResult(
                phase="reranked",
                rank=rank,
                global_id=meta.get("global_id", str(rank)),
                title=meta.get("title", "Untitled"),
                content=node.get("content", "")[:500],
                score=round(score, 4),
                domain=meta.get("knowledge_domain", "general"),
                source=meta.get("source", "Unknown"),
                reliability=meta.get("reliability_score", 0.7),
                url=meta.get("url"),
                continent=meta.get("continent"),
            ).model_dump())

        elapsed_p3 = (time.perf_counter() - start) * 1000
        yield self._sse(StreamSearchMeta(
            event="phase_done",
            phase="reranked",
            total_results=len(reranked),
            elapsed_ms=round(elapsed_p3, 1),
        ).model_dump())

        # ── Phase 4: Gemini Synthesis (optional) ─────────
        if include_synthesis and reranked:
            async for chunk in self._stream_synthesis(query, reranked[:10]):
                yield chunk

        # ── Complete ─────────────────────────────────────
        elapsed_total = (time.perf_counter() - start) * 1000
        yield self._sse(StreamSearchMeta(
            event="complete",
            total_results=len(reranked),
            elapsed_ms=round(elapsed_total, 1),
            query=query,
        ).model_dump())

    # ── Phase 4: Gemini Streaming Synthesis ──────────────────

    async def _stream_synthesis(
        self,
        query: str,
        top_results: List[Tuple[float, Dict[str, Any]]],
    ) -> AsyncGenerator[str, None]:
        """Stream Gemini 2.0 Flash synthesis token by token."""
        import os
        google_key = os.environ.get("GOOGLE_API_KEY", "")
        if not google_key:
            yield self._sse({
                "type": "synthesis",
                "content": "(Gemini API key not configured — synthesis skipped)",
                "done": True,
            })
            return

        context = "\n\n".join(
            f"[{i+1}] {n.get('metadata', {}).get('title', 'Untitled')}\n{n.get('content', '')[:800]}"
            for i, (_, n) in enumerate(top_results)
        )

        prompt = (
            "You are BeeYield AI, a Global Bee Intelligence Operating System.\n\n"
            f"## Retrieved Knowledge (top {len(top_results)} results)\n{context}\n\n"
            f"## User Query\n{query}\n\n"
            "Write a thorough, professional report (800-1200 words) with:\n"
            "- ## headers for each section\n"
            "- Bullet points for key metrics\n"
            "- Inline citations [1], [2] referencing the retrieved sources\n"
            "- Actionable recommendations\n"
        )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=google_key)

            # Use streaming generation
            response = client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=[prompt],
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=8192,
                ),
            )

            buffer = ""
            for chunk in response:
                text = chunk.text if hasattr(chunk, "text") else ""
                if text:
                    buffer += text
                    yield self._sse({
                        "type": "synthesis",
                        "content": text,
                        "done": False,
                    })
                    # Small yield to keep event loop responsive
                    await asyncio.sleep(0)

            yield self._sse({
                "type": "synthesis",
                "content": "",
                "done": True,
                "total_length": len(buffer),
            })

        except Exception as e:
            yield self._sse({
                "type": "synthesis",
                "content": f"(Synthesis error: {e})",
                "done": True,
            })

    # ── SSE Formatting ───────────────────────────────────────

    @staticmethod
    def _sse(data: dict) -> str:
        """Format a dict as an SSE data line."""
        return f"data: {json.dumps(data)}\n\n"


# ── Non-streaming convenience wrappers ───────────────────────

async def streaming_search_collect(
    query: str,
    limit: int = 25,
    continent: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run the full streaming pipeline but collect all results
    into a single dict (for non-SSE callers like the Rust sidecar).
    """
    searcher = StreamingVectorSearch()
    results = []
    meta_events = []

    async for sse_line in searcher.search_stream(query, limit, continent, include_synthesis=False):
        if not sse_line.startswith("data: "):
            continue
        payload = json.loads(sse_line[6:].strip())

        if "phase" in payload and "content" in payload:
            results.append(payload)
        elif "event" in payload:
            meta_events.append(payload)

    complete = next((m for m in meta_events if m.get("event") == "complete"), {})

    return {
        "query": query,
        "total_results": len(results),
        "elapsed_ms": complete.get("elapsed_ms", 0),
        "results": results,
        "phases": [m for m in meta_events if m.get("event") == "phase_done"],
    }
