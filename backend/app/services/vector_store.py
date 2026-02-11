"""
QDRANT VECTOR STORE SERVICE (v4.0)
Sub-second semantic search across 15,000+ knowledge nodes.
Uses HNSW indexing for O(log n) retrieval.
"""
import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams, PointStruct

# Use a lightweight embedding model for speed (lazy loaded)
EMBEDDER = None
_EMBEDDER_LOADED = False

def _get_embedder():
    global EMBEDDER, _EMBEDDER_LOADED
    if not _EMBEDDER_LOADED:
        _EMBEDDER_LOADED = True
        try:
            from sentence_transformers import SentenceTransformer
            EMBEDDER = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dimensions, fast
        except ImportError:
            EMBEDDER = None
    return EMBEDDER

COLLECTION_NAME = "beeyield_lakehouse"
VECTOR_SIZE = 384

class QdrantVectorStore:
    _client: Optional[QdrantClient] = None
    _initialized: bool = False

    @classmethod
    def get_client(cls) -> QdrantClient:
        """Get or create Qdrant client (in-memory for local dev)."""
        if cls._client is None:
            # Use in-memory storage for development
            # For production, use: QdrantClient(host="localhost", port=6333)
            cls._client = QdrantClient(":memory:")
        return cls._client

    @classmethod
    async def initialize(cls, force_rebuild: bool = False) -> Dict[str, Any]:
        """Initialize the vector store with knowledge lakehouse data."""
        if cls._initialized and not force_rebuild:
            return {"status": "already_initialized"}
        
        embedder = _get_embedder()
        if embedder is None:
            return {"status": "error", "message": "sentence-transformers not installed"}

        client = cls.get_client()
        
        # Load lakehouse data (fallback to knowledge_base)
        lakehouse_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../data/standardized_lakehouse.json")
        )
        kb_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json")
        )

        nodes = []
        if os.path.exists(lakehouse_path):
            with open(lakehouse_path, 'r', encoding='utf-8') as f:
                nodes = json.load(f).get("lakehouse_nodes", [])
        elif os.path.exists(kb_path):
            with open(kb_path, 'r', encoding='utf-8') as f:
                kb = json.load(f)
            for n in kb.get("knowledge_nodes", []):
                nodes.append({
                    "content": n.get("content", ""),
                    "metadata": {
                        "source": n.get("source", "Unknown"),
                        "subtopic": n.get("subtopic", "General"),
                        "continent": "Global",
                        "source_type": "General",
                        "reliability_score": 0.8,
                        "is_internal": "BeeYield" in str(n.get("source", "")),
                        "url": ""
                    }
                })
        if not nodes:
            return {"status": "error", "message": "No knowledge data found"}
        
        # Create collection
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
        
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )

        # Batch embed and upsert
        batch_size = 100
        total_indexed = 0
        
        for i in range(0, len(nodes), batch_size):
            batch = nodes[i:i + batch_size]
            texts = [n.get("content", "")[:512] for n in batch]  # Truncate for speed
            
            embeddings = _get_embedder().encode(texts, show_progress_bar=False)
            
            points = []
            for j, (node, embedding) in enumerate(zip(batch, embeddings)):
                point_id = i + j
                meta = node.get("metadata", {})
                points.append(PointStruct(
                    id=point_id,
                    vector=embedding.tolist(),
                    payload={
                        "content": node.get("content", "")[:2000],
                        "source": meta.get("source", "Unknown"),
                        "subtopic": meta.get("subtopic", "General"),
                        "continent": meta.get("continent", "Global"),
                        "source_type": meta.get("source_type", "General"),
                        "reliability_score": meta.get("reliability_score", 0.7),
                        "is_internal": meta.get("is_internal", False),
                        "url": meta.get("url", "")
                    }
                ))
            
            client.upsert(collection_name=COLLECTION_NAME, points=points)
            total_indexed += len(points)

        cls._initialized = True
        return {"status": "success", "total_indexed": total_indexed}

    @classmethod
    async def search(
        cls, 
        query: str, 
        limit: int = 15,
        continent: Optional[str] = None,
        source_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sub-second semantic search with metadata filtering.
        """
        if _get_embedder() is None:
            return {"summary": "", "sources": []}
        
        if not cls._initialized:
            await cls.initialize()

        client = cls.get_client()
        
        # Embed query
        query_vector = _get_embedder().encode(query).tolist()
        
        # Build filter
        must_filters = []
        if continent:
            must_filters.append(
                models.FieldCondition(key="continent", match=models.MatchValue(value=continent))
            )
        if source_type:
            must_filters.append(
                models.FieldCondition(key="source_type", match=models.MatchValue(value=source_type))
            )
        
        query_filter = models.Filter(must=must_filters) if must_filters else None
        
        # Search
        results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit,
            with_payload=True
        )

        # Format results
        summary = ""
        sources = []
        for hit in results:
            payload = hit.payload
            summary += f"{payload.get('content', '')}\n\n"
            if payload.get('url'):
                sources.append({
                    "name": f"{payload['source']} ({payload['subtopic']})",
                    "url": payload['url'],
                    "score": hit.score
                })
        
        return {
            "summary": summary.strip(),
            "sources": sources[:5]
        }

    @classmethod
    def get_stats(cls) -> Dict[str, Any]:
        """Get collection statistics."""
        if not cls._initialized:
            return {"status": "not_initialized"}
        
        client = cls.get_client()
        info = client.get_collection(COLLECTION_NAME)
        return {
            "status": "active",
            "vectors_count": info.vectors_count,
            "points_count": info.points_count
        }
