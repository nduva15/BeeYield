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
    """Boot sequence — Rust bridge validation then Python gateway confirmation."""
    # Validate the Rust core is linked and importable
    try:
        import honey_rust  # noqa: F401
        print("Rust Core: Online")
    except ImportError:
        print("Rust Core: OFFLINE — run 'maturin develop' inside backend/beeyield_core")

    # Signal that the Python gateway (FastAPI) is up
    print("Python Gateway: Online")


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
    import logging
    import uvicorn

    # Silence WatchFiles / uvicorn reload chatter — only our startup prints will show.
    logging.getLogger("watchfiles").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="warning",
    )