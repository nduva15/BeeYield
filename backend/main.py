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
    """Run knowledge sync on startup and potentially in background."""
    from app.services.content_service import ContentService
    import asyncio
    
    async def periodic_sync():
        from scripts.knowledge_sync import sync_all
        while True:
            try:
                await sync_all()
            except Exception as e:
                print(f"Startup Sync Error: {e}")
            await asyncio.sleep(600) # Sync every 10 minutes
    
    # Run first sync immediately without blocking startup
    asyncio.create_task(periodic_sync())


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