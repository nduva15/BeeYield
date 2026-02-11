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
    2. Vector store is lazy-initialized on first AI request (not at startup)
    """
    # 1. Start the Knowledge Sync Scheduler (12-hour interval)
    try:
        from app.services.sync_scheduler import KnowledgeSyncScheduler
        await KnowledgeSyncScheduler.start(interval_hours=12)
        print("[STARTUP] Knowledge sync scheduler started (12h interval)")
    except Exception as e:
        print(f"[STARTUP] Scheduler error (non-fatal): {e}")
    
    # 2. Vector store (Qdrant + BERT model) is intentionally NOT loaded at startup
    #    It will be lazy-initialized when the AI assistant is first used.
    #    Loading the BERT model is CPU-intensive and blocks all requests due to Python's GIL.
    print("[STARTUP] Vector store will be lazy-loaded on first AI request")
    print("[STARTUP] BeeYield API ready to serve requests")


@app.get("/")
def read_root():
    from app.db.supabase_db import get_client
    from app.core.config import settings as cfg
    
    # Quick Supabase health check using httpx (never hangs)
    supabase_status = "not configured"
    try:
        if cfg.SUPABASE_URL and cfg.SUPABASE_KEY:
            client = get_client()
            resp = client.get("/", params={"select": "count"}, timeout=5.0)
            supabase_status = "connected" if resp.status_code in (200, 406) else f"error ({resp.status_code})"
    except Exception as e:
        supabase_status = f"error: {str(e)[:50]}"
    
    # ClickHouse: only check if host is configured
    clickhouse_status = "not configured"
    if cfg.CLICKHOUSE_HOST:
        try:
            from app.db.clickhouse_db import ClickHouseService
            clickhouse_status = "connected" if ClickHouseService.get_client() is not None else "connection failed"
        except Exception:
            clickhouse_status = "error"
    
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