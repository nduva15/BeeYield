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

PUBLIC_TRACEABILITY_BATCHES = {
    "BEE-2026-01-0418": {
        "batch_code": "BEE-2026-01-0418",
        "product_name": "Kibwezi Acacia Gold (Apisense Batch)",
        "honey_type": "Kibwezi Acacia Gold (Apisense Batch)",
        "harvest_date": "2026-04-15",
        "verified": True,
        "blockchain_verified": True,
        "verification_url": "https://trace.beeyield.io/verify/BEE-2026-01-0418",
        "verification_status": "Verified by Apisense Node 04",
        "blockchain_status": {"overall": "verified"},
        "completeness": {"status": "complete", "present": 42, "derivable": 3, "missing": 0, "sections": {}},
    },
    "BEE-2026-01-0419": {
        "batch_code": "BEE-2026-01-0419",
        "product_name": "Kibwezi Acacia (Satellite Batch 19)",
        "honey_type": "Kibwezi Acacia (Satellite Batch 19)",
        "harvest_date": "2026-04-20",
        "verified": True,
        "blockchain_verified": True,
        "verification_url": "https://trace.beeyield.io/verify/BEE-2026-01-0419",
        "verification_status": "Verified by BeeHUB Central Node",
        "blockchain_status": {"overall": "verified"},
        "completeness": {"status": "complete", "present": 41, "derivable": 2, "missing": 0, "sections": {}},
    },
    "BEE-2026-01-0420": {
        "batch_code": "BEE-2026-01-0420",
        "product_name": "Kibwezi Premium Reserve",
        "honey_type": "Kibwezi Premium Reserve",
        "harvest_date": "2026-04-25",
        "verified": True,
        "blockchain_verified": True,
        "verification_url": "https://trace.beeyield.io/verify/BEE-2026-01-0420",
        "verification_status": "Verified by Premium Node",
        "blockchain_status": {"overall": "verified"},
        "completeness": {"status": "complete", "present": 40, "derivable": 1, "missing": 0, "sections": {}},
    },
}

def build_public_traceability_batch(code: str):
    batch = PUBLIC_TRACEABILITY_BATCHES.get(code.upper())
    if not batch:
        return None

    return {
        **batch,
        "farmer": {
            "farmer_id": "F-NDUVA-01",
            "name": "Timothy Nduva",
            "experience_years": 12,
            "story": "A pioneer in integrated IoT beekeeping with over a decade of experience in precision honey production.",
            "registration_date": "2020-01-01T00:00:00Z",
            "latitude": -2.4167,
            "longitude": 37.9667,
            "location_name": "Kibwezi Central",
            "region": "Makueni",
            "county": "Makueni",
        },
        "apiary": {
            "apiary_id": "API-CORRIDOR-04",
            "apiary_code": "KIB-04",
            "name": "Satellite Corridor Node 04",
            "environment_type": "Wild Acacia Scrub",
            "flora_types": ["Acacia", "Desert Date", "Commiphora"],
            "water_source": "Seasonal rainfall and groundwater",
            "established_date": "2024-05-12",
            "farmer_id": "F-NDUVA-01",
            "latitude": -2.4367,
            "longitude": 37.9467,
            "location_name": "Kibwezi Forest Edge",
            "region": "Makueni",
            "county": "Makueni",
        },
        "hive": {
            "hive_id": "H-KIB-04-001",
            "hive_code": f"HV-{code[-4:]}-001",
            "hive_type": "Top-bar",
            "bee_type": "Apis mellifera scutellata",
            "frame_count": 24,
            "material": "Sustainably harvested wood",
            "apiary_id": "API-CORRIDOR-04",
            "farmer_id": "F-NDUVA-01",
            "has_sensors": True,
            "installation_date": "2025-06-01",
            "status": "Active - Excellent",
        },
        "story_title": "Verified Kibwezi Harvest",
        "story_content": "This batch is verified through BeeYield public traceability records for Timothy Nduva's Kibwezi apiary.",
        "impact_stats": {
            "total_honey_kg": "28.5",
            "hive_count": "184",
            "beekeepers": "1",
            "farmers_served": "250+",
            "acres_pollinated": "1200+",
        },
        "sensor_snapshot": {
            "avg_temp": 34.2,
            "avg_humidity": 42,
            "weight_kg": 28.5,
            "acoustic_health": "Optimal",
            "activity_level": 92,
        },
        "weather": None,
        "sustainability": {
            "rule": "50_percent_left_for_bees",
            "ratio": 0.5,
            "status": "pass",
            "left_for_bees_kg": "28.5",
            "harvested_kg": "28.5",
        },
        "health_snapshot": {"status": "Excellent", "disease_risk": "Low"},
        "florage_type": "Acacia",
        "extra_metadata": {
            "production_lot_size": "500ml jar",
            "harvest_context": "Peak Acacia bloom cycle with optimal weather conditions",
        },
        "timeline": [
            {
                "title": "Inspection & Startup",
                "date": "2026-01-12",
                "location": "Kibwezi Central",
                "description": "Apisense node initialized and hive health monitoring confirmed.",
                "icon": "shield",
                "data": {},
            },
            {
                "title": "Bloom Detection",
                "date": "2026-03-20",
                "location": "Acacia Corridor",
                "description": "Peak Acacia bloom detected across the Kibwezi corridor.",
                "icon": "activity",
                "data": {},
            },
            {
                "title": "Harvest Day",
                "date": batch["harvest_date"],
                "location": "Kibwezi Forest Edge",
                "description": "Precision harvest completed with the BeeYield 50/50 sustainability protocol.",
                "icon": "check",
                "data": {},
            },
        ],
    }

@app.get("/api/v1/traceability/code/{code}")
def public_traceability_code(code: str):
    batch = build_public_traceability_batch(code)
    if not batch:
        return JSONResponse(
            status_code=404,
            content={"detail": f"Traceability code '{code}' not found. Please verify the code on your jar."},
        )
    return batch

@app.get("/api/v1/traceability/public-batches")
def public_traceability_batches(limit: int = 3, owner_name: str = "Timothy Nduva", verified_only: bool = True):
    batches = [
        {
            "batch_code": code,
            "harvest_date": batch["harvest_date"],
            "honey_type": batch["product_name"],
            "verification_status": batch["verification_status"],
            "farmer_name": owner_name,
            "apiary_name": "Satellite Corridor Node 04",
        }
        for code, batch in sorted(
            PUBLIC_TRACEABILITY_BATCHES.items(),
            key=lambda item: item[1]["harvest_date"],
            reverse=True,
        )
    ]
    return batches[:limit]

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
