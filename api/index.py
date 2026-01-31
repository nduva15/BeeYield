import sys
import os

# Add backend directory to Python path for imports
# On Vercel, the directory structure is preserved relative to the root
backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, backend_path)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_path, ".env"))
load_dotenv()  # Also load from root .env

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import the app components
# Note: Use try/except to handle import errors gracefully during deployment initialization
try:
    from app.core.config import settings
    from app.api.api_v1.api import api_router
    PROJECT_NAME = settings.PROJECT_NAME
except ImportError as e:
    print(f"Import error: {e}")
    PROJECT_NAME = "BeeYield API"

# Create FastAPI app for Vercel
app = FastAPI(
    title=PROJECT_NAME,
    description="BeeYield API - Honey Traceability and E-commerce Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration  
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Tighten this in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes with /api/v1 prefix
try:
    from app.api.api_v1.api import api_router
    app.include_router(api_router, prefix="/api/v1")
except Exception as e:
    print(f"Error including router: {e}")

@app.get("/api")
@app.get("/api/")
def api_root():
    return {
        "message": "BeeYield API",
        "version": "1.1.0",
        "status": "online",
        "docs": "/api/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "BeeYield API is running on Vercel"}

# Handle OPTIONS requests for CORS
@app.options("/{path:path}")
async def options_handler(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Export the handler - Vercel uses the 'app' variable
handler = app
