# try:
#     import dns_fix
#     dns_fix.patch_dns()
# except ImportError:
#     print("Could not load DNS patch")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend API for BeeYield - Honey Traceability and E-commerce Platform"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    """
    Initialize the BeeYield AI infrastructure on startup:
    1. Start the 12-hour knowledge sync scheduler
    2. Initialize Qdrant vector store (if available)
    """
    import asyncio
    
    # 1. Start the Knowledge Sync Scheduler (12-hour interval)
    try:
        from app.services.sync_scheduler import KnowledgeSyncScheduler
        await KnowledgeSyncScheduler.start(interval_hours=12)
        print("[STARTUP] Knowledge sync scheduler started (12h interval)")
    except Exception as e:
        print(f"[STARTUP] Scheduler error (non-fatal): {e}")
    
    # 2. Initialize Qdrant Vector Store in background (don't block startup)
    async def _init_vector_store():
        try:
            from app.services.vector_store import QdrantVectorStore
            init_result = await QdrantVectorStore.initialize()
            print(f"[STARTUP] Vector store: {init_result}")
        except ImportError:
            print("[STARTUP] Qdrant not installed - using JSON search")
        except Exception as e:
            print(f"[STARTUP] Vector store error (non-fatal): {e}")
    
    asyncio.create_task(_init_vector_store())


@app.get("/")
def read_root():
    from app.db.supabase_db import get_supabase
    from app.db.clickhouse_db import ClickHouseService
    
    print("DEBUG: Checking Supabase status...")
    supabase_status = "connected" if get_supabase() is not None else "not configured"
    
    print("DEBUG: Checking ClickHouse status...")
    clickhouse_status = "connected" if ClickHouseService.get_client() is not None else "not configured"
    
    print("DEBUG: Root endpoint request complete.")
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "version": "1.0.0",
        "status": "online",
        "connections": {
            "supabase": supabase_status,
            "clickhouse": clickhouse_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)