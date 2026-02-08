"""
Embedding Model for BeeYield AI
================================
Lightweight embedding using fastembed or sentence-transformers.
"""

from typing import List, Optional, Union
import numpy as np

try:
    from fastembed import TextEmbedding
    FE_AVAILABLE = True
except ImportError:
    FE_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    ST_AVAILABLE = True
except ImportError:
    ST_AVAILABLE = False


class EmbeddingModel:
    """
    Embedding model for text vectorization.
    
    Tries FastEmbed (lightweight, optimized) first, 
    falls back to sentence-transformers if needed.
    """
    
    DEFAULT_MODEL = "BAAI/bge-small-en-v1.5"  # Optimal for FastEmbed
    FALLBACK_MODEL = "all-MiniLM-L6-v2"       # Optimal for SentenceTransformers
    
    def __init__(self, model_name: Optional[str] = None):
        if FE_AVAILABLE:
            self.engine = "fastembed"
            self.model_name = model_name or self.DEFAULT_MODEL
            self.model = TextEmbedding(model_name=self.model_name)
            # FastEmbed dimension is model dependent
            # Testing with a dummy to get dim if needed, but bge-small is 384
            self.dimension = 384 
        elif ST_AVAILABLE:
            self.engine = "sentence_transformers"
            self.model_name = model_name or self.FALLBACK_MODEL
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_sentence_embedding_dimension()
        else:
            raise ImportError(
                "Neither fastembed nor sentence-transformers installed. "
                "Run: pip install fastembed"
            )
        
        print(f"Loaded embedding model: {self.model_name} (engine={self.engine}, dim={self.dimension})")
    
    def embed(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """Embed a list of texts."""
        if self.engine == "fastembed":
            # fastembed.embed returns a generator
            embeddings = list(self.model.embed(texts, batch_size=batch_size))
            return np.array(embeddings)
        else:
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=len(texts) > 100,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            return embeddings
    
    def embed_query(self, query: str) -> List[float]:
        """Embed a single query string."""
        if self.engine == "fastembed":
            # fastembed.embed takes a list
            embedding = list(self.model.embed([query]))[0]
            return embedding.tolist()
        else:
            embedding = self.model.encode(
                query,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            return embedding.tolist()
    
    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """Embed a list of documents."""
        embeddings = self.embed(documents)
        return embeddings.tolist()


# Singleton instance
_model: Optional[EmbeddingModel] = None


def get_embedding_model() -> EmbeddingModel:
    """Get or create the embedding model instance."""
    global _model
    if _model is None:
        _model = EmbeddingModel()
    return _model
