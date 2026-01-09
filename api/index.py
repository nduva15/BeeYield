"""
Vercel Serverless Function Entry Point for BeeYield API
This file serves as the entry point for all API requests on Vercel.
"""
import sys
import os

# Add backend directory to Python path for imports
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
from app.core.config import settings
from app.api.api_v1.api import api_router

# Create FastAPI app for Vercel
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BeeYield API - Honey Traceability and E-commerce Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration  
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://beeyield.com",
        "https://www.beeyield.com",
        "https://beeyield.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes with /api/v1 prefix
app.include_router(api_router, prefix="/api/v1")

@app.get("/api")
@app.get("/api/")
def api_root():
    """
    API root endpoint
    """
    return {
        "message": "BeeYield API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/api/docs"
    }

@app.get("/api/health")
def health():
    """Health check"""
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
