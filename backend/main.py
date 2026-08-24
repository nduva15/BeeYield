# try:
#     import dns_fix
#     dns_fix.patch_dns()
# except ImportError:
#     print("Could not load DNS patch")

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.supabase_db import close_db_client, init_db_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db_client()
    try:
        yield
    finally:
        await close_db_client()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend API for BeeYield - Honey Traceability and E-commerce Platform",
    lifespan=lifespan,
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
    print(f"Supabase URL: {settings.SUPABASE_URL}")
    print("Python Gateway: Online")


@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "version": "2.0.0",
        "status": "online"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": "2.0.0",
    }

if __name__ == "__main__":
    import logging
    import uvicorn

    # Silence WatchFiles / uvicorn reload chatter — only our startup prints will show.
    logging.getLogger("watchfiles").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)

    import os
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=False,
        log_level="info"
    )
