"""
AI ADMIN ENDPOINTS (v4.0)
Administrative endpoints for managing the BeeYield AI infrastructure.
"""
from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter()

@router.get("/status")
async def get_ai_status():
    """Get the status of all AI infrastructure components."""
    status = {
        "version": "4.0.0",
        "components": {}
    }
    
    # Check Vector Store
    try:
        from app.services.vector_store import QdrantVectorStore
        status["components"]["vector_store"] = QdrantVectorStore.get_stats()
    except ImportError:
        status["components"]["vector_store"] = {"status": "not_installed"}
    except Exception as e:
        status["components"]["vector_store"] = {"status": "error", "message": str(e)}
    
    # Check Scheduler
    try:
        from app.services.sync_scheduler import KnowledgeSyncScheduler
        status["components"]["sync_scheduler"] = KnowledgeSyncScheduler.get_status()
    except Exception as e:
        status["components"]["sync_scheduler"] = {"status": "error", "message": str(e)}
    
    # Check Rate Limits
    try:
        from app.services.rate_limit_manager import RateLimitManager
        status["components"]["rate_limits"] = RateLimitManager.get_stats()
    except Exception as e:
        status["components"]["rate_limits"] = {"status": "error", "message": str(e)}
    
    # Check Lakehouse
    try:
        from app.services.content_service import ContentService
        lakehouse = await ContentService.get_lakehouse_data()
        status["components"]["lakehouse"] = {
            "status": "active",
            "total_nodes": lakehouse.get("total_count", len(lakehouse.get("lakehouse_nodes", [])))
        }
    except Exception as e:
        status["components"]["lakehouse"] = {"status": "error", "message": str(e)}
    
    return status

@router.post("/sync/trigger")
async def trigger_sync():
    """Manually trigger a knowledge sync."""
    try:
        from app.services.sync_scheduler import KnowledgeSyncScheduler
        result = await KnowledgeSyncScheduler.run_sync()
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vector-store/rebuild")
async def rebuild_vector_store():
    """Rebuild the Qdrant vector store from the lakehouse data."""
    try:
        from app.services.vector_store import QdrantVectorStore
        result = await QdrantVectorStore.initialize(force_rebuild=True)
        return {"status": "success", "result": result}
    except ImportError:
        raise HTTPException(status_code=501, detail="Qdrant not installed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_knowledge(
    query: str,
    limit: int = 15,
    continent: Optional[str] = None,
    use_vector: bool = True
):
    """
    Search the knowledge lakehouse.
    
    Args:
        query: Search query
        limit: Maximum results
        continent: Filter by continent (Africa, Europe, North America, Global)
        use_vector: Use Qdrant vector search if available
    """
    if use_vector:
        try:
            from app.services.vector_store import QdrantVectorStore
            results = await QdrantVectorStore.search(query, limit=limit, continent=continent)
            return {"engine": "qdrant", "results": results}
        except ImportError:
            pass
        except Exception as e:
            print(f"Vector search failed, falling back to JSON: {e}")
    
    from app.services.content_service import ContentService
    results = await ContentService.search_knowledge(query, limit=limit, continent=continent)
    return {"engine": "json", "results": results}
