from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.supabase_db import init_db_client, close_db_client

# Import and apply DNS Patch if needed (Fixes [Errno 11001] getaddrinfo failed on some Windows/Network setups)
try:
    import sys
    import os
    # Add project root to path to find dns_fix
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from dns_fix import patch_dns
    patch_dns()
except Exception as e:
    print(f"[WARNING] Could not apply DNS patch: {e}")

import asyncio


def _is_testing() -> bool:
    # Pytest sets PYTEST_CURRENT_TEST for each test, and we also allow an explicit env flag.
    return bool(os.environ.get("PYTEST_CURRENT_TEST")) or os.environ.get("BEEYIELD_TESTING") == "1"


def ensure_rust_core():
    """
    Fail fast if the PyO3 module isn't built, and log the loaded version when present.
    """
    if _is_testing():
        print("[Oxidize] Skipping Rust core check (testing mode).")
        return
    try:
        import beeyield_core as rust_core  # triggers honey_rust shim
        version = getattr(rust_core, "__version__", "unknown")
        print(f"[Oxidize] Rust core loaded (honey_rust version: {version})")
    except Exception as exc:
        raise RuntimeError(
            "Rust core module 'honey_rust' is missing. "
            "Run `cd backend/beeyield_core && ..\\\\venv\\\\Scripts\\\\maturin develop --release` before starting the API."
        ) from exc

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_rust_core()

    # Startup: Initialize shared DB client
    if not _is_testing():
        init_db_client()

        # Start the persistent background worker for task recurrence
        from app.services.task_worker import chrono_worker

        async def run_worker_loop():
            while True:
                await chrono_worker.run_automation_cycle()
                # Run every hour (3600 seconds) as per PRD
                await asyncio.sleep(3600)

        # Keep a reference to the task so it isn't garbage collected
        app.state.chrono_task = asyncio.create_task(run_worker_loop())
    
    yield
    # Shutdown: Close shared DB client
    if not _is_testing():
        await close_db_client()
        if hasattr(app.state, "chrono_task"):
            app.state.chrono_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend API for BeeYield - Honey Traceability and E-commerce Platform",
    lifespan=lifespan
)

# Mount static files for reports
os.makedirs("backend/app/static/reports", exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/app/static"), name="static")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    from app.db.supabase_db import get_supabase
    supabase_status = "connected" if get_supabase() is not None else "not configured"
    
    return {
        "message": "Welcome to BeeYield API",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "status": "online",
        "connections": {
            "supabase": supabase_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
