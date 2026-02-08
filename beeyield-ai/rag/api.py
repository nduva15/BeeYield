"""
BeeYield AI RAG API
====================
FastAPI endpoint for retrieval-augmented generation.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import traceback

from .retriever import get_retriever
from .ingestion import DocumentIngester

app = FastAPI(
    title="BeeYield AI RAG API",
    description="Retrieval-Augmented Generation for bee research",
    version="1.0.0",
)


class QueryRequest(BaseModel):
    """Request for RAG query."""
    query: str
    top_k: int = 5
    force_type: Optional[str] = None  # 'company' or 'research'
    include_sources: bool = True


class Source(BaseModel):
    """Source citation."""
    source: str
    type: str
    score: float
    verified: bool
    url: Optional[str] = None
    date: Optional[str] = None


class QueryResponse(BaseModel):
    """Response from RAG query."""
    context: str
    formatted_prompt: str
    sources: List[Source]
    company_sources: int
    research_sources: int
    query_type: str
    timestamp: str


class IngestRequest(BaseModel):
    """Request to ingest documents."""
    source_type: str  # 'json', 'markdown', 'scraped'
    filepath: Optional[str] = None
    content: Optional[str] = None
    source_name: str
    source_id: Optional[str] = None
    url: Optional[str] = None
    is_company: bool = False


class IngestResponse(BaseModel):
    """Response from ingestion."""
    chunks_added: int
    source: str
    timestamp: str


class StatsResponse(BaseModel):
    """Vector store statistics."""
    vectors_count: int
    points_count: int
    status: str


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "beeyield-ai-rag"}


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Query the RAG system."""
    try:
        retriever = get_retriever()
        
        # Classify and retrieve
        query_type = retriever.classify_query(request.query)
        result = retriever.retrieve(
            request.query,
            top_k=request.top_k,
            force_type=request.force_type,
        )
        
        # Format prompt
        formatted_prompt = retriever.format_prompt(
            request.query,
            result,
            include_sources=request.include_sources,
        )
        
        return QueryResponse(
            context=result.context,
            formatted_prompt=formatted_prompt,
            sources=[Source(**s) for s in result.sources],
            company_sources=result.company_sources,
            research_sources=result.research_sources,
            query_type=query_type,
            timestamp=datetime.now().isoformat(),
        )
        
    except Exception as e:
        with open("api_error.log", "a") as f:
            f.write(f"\n--- Query Error at {datetime.now()} ---\n")
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest", response_model=IngestResponse)
async def ingest(request: IngestRequest):
    """Ingest new documents."""
    try:
        ingester = DocumentIngester()
        
        if request.source_type == "json" and request.filepath:
            chunks = ingester.ingest_json_kb(
                request.filepath,
                request.source_name,
                is_company=request.is_company,
            )
        elif request.source_type == "markdown" and request.filepath:
            chunks = ingester.ingest_markdown(
                request.filepath,
                request.source_name,
                source_type="company" if request.is_company else "research",
                url=request.url,
            )
        elif request.source_type == "scraped" and request.content:
            chunks = ingester.ingest_scraped_content(
                request.content,
                request.source_id or request.source_name,
                request.source_name,
                request.url or "",
                source_type="company" if request.is_company else "research",
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid source_type or missing required fields"
            )
        
        return IngestResponse(
            chunks_added=chunks,
            source=request.source_name,
            timestamp=datetime.now().isoformat(),
        )
        
    except Exception as e:
        with open("api_error.log", "a") as f:
            f.write(f"\n--- Ingest Error at {datetime.now()} ---\n")
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get vector store statistics."""
    try:
        from .vector_store import get_vector_store
        store = get_vector_store()
        stats = store.get_stats()
        return StatsResponse(**stats)
    except Exception as e:
        with open("api_error.log", "a") as f:
            f.write(f"\n--- Stats Error at {datetime.now()} ---\n")
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
