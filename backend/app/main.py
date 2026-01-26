from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api_v1.api import api_router

# Import and apply DNS Patch if needed (Fixes [Errno 11001] getaddrinfo failed on some Windows/Network setups)
try:
    import sys
    import os
    # Add project root to path to find dns_fix
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from dns_fix import patch_dns
    patch_dns()
except Exception as e:
    print(f"⚠️ Could not apply DNS patch: {e}")

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

@app.get("/")
def root():
    from app.db.supabase_db import get_supabase
    from app.db.clickhouse_db import ClickHouseService
    
    supabase_status = "connected" if get_supabase() is not None else "not configured"
    clickhouse_status = "connected" if ClickHouseService.get_client() is not None else "not configured"
    
    return {
        "message": "Welcome to BeeYield API",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "status": "online",
        "connections": {
            "supabase": supabase_status,
            "clickhouse": clickhouse_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
