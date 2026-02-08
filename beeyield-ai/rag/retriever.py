"""
BeeYield AI Retriever
======================
Retrieval-Augmented Generation retriever with company prioritization.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from .vector_store import get_vector_store, SearchResult
from .embeddings import get_embedding_model


@dataclass
class RetrievalResult:
    """Result from the retriever with context and sources."""
    context: str
    sources: List[Dict[str, Any]]
    company_sources: int
    research_sources: int


class BeeYieldRetriever:
    """
    Intelligent retriever for BeeYield AI.
    
    Prioritizes:
    1. Company data for business queries
    2. Peer-reviewed research for biological queries
    3. Recent news for current events
    """
    
    # Keywords that trigger company-first retrieval
    COMPANY_KEYWORDS = [
        "our", "we", "beeyield", "protocol", "sop", "policy",
        "procedure", "internal", "company", "staff", "employee",
        "price", "product", "service", "order", "customer"
    ]
    
    # Keywords that trigger research-first retrieval
    RESEARCH_KEYWORDS = [
        "disease", "treatment", "varroa", "nosema", "foulbrood",
        "queen", "brood", "larvae", "pathogen", "infection",
        "research", "study", "scientific", "journal", "paper"
    ]
    
    def __init__(self):
        self.vector_store = get_vector_store()
        self.embedding_model = get_embedding_model()
    
    def classify_query(self, query: str) -> str:
        """Classify query as 'company', 'research', or 'mixed'."""
        query_lower = query.lower()
        
        company_score = sum(1 for kw in self.COMPANY_KEYWORDS if kw in query_lower)
        research_score = sum(1 for kw in self.RESEARCH_KEYWORDS if kw in query_lower)
        
        if company_score > research_score:
            return "company"
        elif research_score > company_score:
            return "research"
        return "mixed"
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        force_type: Optional[str] = None,  # 'company' or 'research'
    ) -> RetrievalResult:
        """
        Retrieve relevant documents for a query.
        
        Uses smart routing to prioritize company or research sources.
        """
        # Classify query
        query_type = force_type or self.classify_query(query)
        
        # Embed query
        query_embedding = self.embedding_model.embed_query(query)
        
        # Search strategy based on query type
        if query_type == "company":
            # Get company docs first, then research
            company_results = self.vector_store.search(
                query_embedding, limit=3, company_only=True
            )
            research_results = self.vector_store.search(
                query_embedding, limit=2, source_type="research"
            )
            results = company_results + research_results
            
        elif query_type == "research":
            # Get research first, then company
            research_results = self.vector_store.search(
                query_embedding, limit=4, source_type="research"
            )
            company_results = self.vector_store.search(
                query_embedding, limit=1, company_only=True
            )
            results = research_results + company_results
            
        else:
            # Mixed: balanced retrieval
            results = self.vector_store.search(query_embedding, limit=top_k)
        
        # Build context string
        context_parts = []
        sources = []
        company_count = 0
        research_count = 0
        
        for r in results:
            # Build source citation
            source_info = {
                "source": r.source,
                "type": r.source_type,
                "score": round(r.score, 3),
                "verified": r.metadata.get("verified", False),
            }
            if r.metadata.get("url"):
                source_info["url"] = r.metadata["url"]
            if r.metadata.get("date"):
                source_info["date"] = r.metadata["date"]
            
            sources.append(source_info)
            
            # Count by type
            if r.source_type == "company" or r.metadata.get("is_company"):
                company_count += 1
            else:
                research_count += 1
            
            # Add to context with source tag
            context_parts.append(
                f"[Source: {r.source}]\n{r.content}"
            )
        
        context = "\n\n---\n\n".join(context_parts)
        
        return RetrievalResult(
            context=context,
            sources=sources,
            company_sources=company_count,
            research_sources=research_count,
        )
    
    def format_prompt(
        self,
        query: str,
        retrieval: RetrievalResult,
        include_sources: bool = True,
    ) -> str:
        """Format the RAG prompt for the LLM."""
        prompt_parts = [
            "# BeeYield AI Knowledge Assistant",
            "",
            "You are BeeYield AI, an expert assistant for beekeeping and apiculture.",
            "You prioritize BeeYield internal data for business queries and peer-reviewed research for biological queries.",
            "",
            "## Retrieved Context",
            "",
            retrieval.context,
            "",
            "## User Question",
            "",
            query,
            "",
            "## Instructions",
            "",
            "Answer the question based on the retrieved context above.",
            "If the context doesn't contain relevant information, say so clearly.",
            "Always cite your sources when making specific claims.",
        ]
        
        if include_sources:
            prompt_parts.extend([
                "",
                "## Sources Available",
                f"- Company sources: {retrieval.company_sources}",
                f"- Research sources: {retrieval.research_sources}",
            ])
        
        return "\n".join(prompt_parts)


# Singleton instance
_retriever: Optional[BeeYieldRetriever] = None


def get_retriever() -> BeeYieldRetriever:
    """Get or create the retriever instance."""
    global _retriever
    if _retriever is None:
        _retriever = BeeYieldRetriever()
    return _retriever
