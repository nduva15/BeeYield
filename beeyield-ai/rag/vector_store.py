"""
Vector Store for BeeYield AI
=============================
Qdrant-based vector storage for document embeddings.
"""

import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance, VectorParams, PointStruct, 
        Filter, FieldCondition, MatchValue
    )
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False


@dataclass
class SearchResult:
    """A single search result from the vector store."""
    id: str
    content: str
    score: float
    metadata: Dict[str, Any]
    source: str
    source_type: str  # 'company', 'research', 'live'


class VectorStore:
    """
    Vector store for BeeYield AI RAG layer.
    
    Supports both Qdrant server mode and local file storage.
    """
    
    COLLECTION_NAME = "beeyield_knowledge"
    VECTOR_DIM = 384  # all-MiniLM-L6-v2 dimension
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6333,
        path: Optional[str] = None,  # For local file storage
    ):
        if not QDRANT_AVAILABLE:
            raise ImportError("qdrant-client not installed. Run: pip install qdrant-client")
        
        # Use local storage if path provided, otherwise connect to server
        if path:
            self.client = QdrantClient(path=path)
            self.mode = "local"
        else:
            self.client = QdrantClient(host=host, port=port)
            self.mode = "server"
        
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Create collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        exists = any(c.name == self.COLLECTION_NAME for c in collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=self.VECTOR_DIM,
                    distance=Distance.COSINE,
                ),
            )
            print(f"Created collection: {self.COLLECTION_NAME}")
    
    def add_documents(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        contents: List[str],
        metadatas: List[Dict[str, Any]],
    ) -> None:
        """Add documents to the vector store."""
        points = []
        for i, (doc_id, embedding, content, metadata) in enumerate(
            zip(ids, embeddings, contents, metadatas)
        ):
            payload = {
                "content": content,
                "source": metadata.get("source", "unknown"),
                "source_type": metadata.get("source_type", "research"),
                "verified": metadata.get("verified", False),
                "date": metadata.get("date"),
                "url": metadata.get("url"),
                "is_company": metadata.get("is_company", False),
                **{k: v for k, v in metadata.items() if k not in 
                   ["source", "source_type", "verified", "date", "url", "is_company"]}
            }
            
            points.append(PointStruct(
                id=i if doc_id is None else hash(doc_id) % (2**63),
                vector=embedding,
                payload=payload,
            ))
        
        self.client.upsert(
            collection_name=self.COLLECTION_NAME,
            points=points,
        )
        print(f"Added {len(points)} documents to vector store")
    
    def search(
        self,
        query_embedding: List[float],
        limit: int = 5,
        source_type: Optional[str] = None,
        company_only: bool = False,
    ) -> List[SearchResult]:
        """Search for similar documents."""
        # Build filter
        filter_conditions = []
        
        if source_type:
            filter_conditions.append(
                FieldCondition(key="source_type", match=MatchValue(value=source_type))
            )
        
        if company_only:
            filter_conditions.append(
                FieldCondition(key="is_company", match=MatchValue(value=True))
            )
        
        query_filter = Filter(must=filter_conditions) if filter_conditions else None
        
        # Use internal client for local mode to bypass wrapper bugs
        target = self.client._client if self.mode == "local" else self.client
        
        try:
            results = target.search(
                collection_name=self.COLLECTION_NAME,
                query_vector=query_embedding,
                limit=limit,
                query_filter=query_filter,
            )
        except AttributeError:
            # Fallback for some versions
            from qdrant_client.models import QueryRequest
            if hasattr(target, "query_points"):
                results = target.query_points(
                    collection_name=self.COLLECTION_NAME,
                    query=query_embedding,
                    limit=limit,
                    query_filter=query_filter,
                ).points
            else:
                raise
        
        return [
            SearchResult(
                id=str(r.id),
                content=r.payload.get("content", ""),
                score=r.score,
                metadata={k: v for k, v in r.payload.items() if k != "content"},
                source=r.payload.get("source", "unknown"),
                source_type=r.payload.get("source_type", "research"),
            )
            for r in results
        ]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        target = self.client._client if self.mode == "local" else self.client
        info = target.get_collection(self.COLLECTION_NAME)
        # Handle different response types (local vs server)
        points_count = getattr(info, "points_count", 0)
        return {
            "vectors_count": getattr(info, "vectors_count", points_count),
            "points_count": points_count,
            "status": info.status if isinstance(info.status, str) else info.status.name,
        }
    
    def delete_by_source(self, source: str) -> None:
        """Delete all documents from a specific source."""
        self.client.delete(
            collection_name=self.COLLECTION_NAME,
            points_selector=Filter(
                must=[FieldCondition(key="source", match=MatchValue(value=source))]
            ),
        )
        print(f"Deleted documents from source: {source}")


# Singleton instance
_store: Optional[VectorStore] = None


def get_vector_store(path: Optional[str] = None) -> VectorStore:
    """Get or create the vector store instance."""
    global _store
    if _store is None:
        # Default to local storage in beeyield-ai/rag/db_v2
        if path is None:
            path = str(Path(__file__).parent / "db_v2")
        _store = VectorStore(path=path)
    return _store
