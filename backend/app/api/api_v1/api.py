"""
API Router - Registers all API endpoints
"""
from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    company, auth, traceability, contact,
    forms, shop, blog, careers, media,
    services, jobs, analytics, notes, admin, iot, ai,
    admin_extended, meters, beeyield, bee_data, pollination, inspections, reports,
    ai_assistant, ai_admin, settings, payments, labels, streaming, bluetooth,
    requests, image_analysis, acoustic, routing, forage
)



api_router = APIRouter()

# Labels endpoint
api_router.include_router(labels.router, prefix="/labels", tags=["Labels"])

# Meters endpoint
api_router.include_router(meters.router, prefix="/meters", tags=["Meters"])

# BeeYield Dashboard (User-specific data)
api_router.include_router(beeyield.router, prefix="/beeyield", tags=["BeeYield Dashboard"])
api_router.include_router(reports.router, prefix="/beeyield/reports", tags=["BeeYield Reports"])
api_router.include_router(bluetooth.router, prefix="/beeyield/bluetooth", tags=["Bluetooth"])
api_router.include_router(requests.router, prefix="/beeyield/requests", tags=["Support Requests"])
api_router.include_router(notes.router, prefix="/beeyield/notes", tags=["Notes"])


# Precision Pollination endpoint
api_router.include_router(pollination.router, prefix="/pollination", tags=["Precision Pollination"])

# Inspections endpoint
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])

# AI Assistant endpoint (legacy)
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])

# AI Assistant v2 (comprehensive)
api_router.include_router(ai_assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(bee_data.router, prefix="/bee-data", tags=["bee-data"])

# AI Admin (sync, rebuild) — was orphaned, now mounted
api_router.include_router(ai_admin.router, prefix="/ai/admin", tags=["AI Admin"])

# Streaming Vector Search & Ingestion
api_router.include_router(streaming.router, prefix="/search", tags=["Streaming Search"])

# Analytics endpoint
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

# IoT endpoint
api_router.include_router(iot.router, prefix="/iot", tags=["IoT"])

# Core business endpoints
api_router.include_router(company.router, prefix="/company", tags=["Company"])
api_router.include_router(traceability.router, prefix="/traceability", tags=["Traceability"])
api_router.include_router(shop.router, prefix="/shop", tags=["Shop"])

# Payments (Stripe)
api_router.include_router(payments.router, prefix="/payments/stripe", tags=["Payments"])

# Services endpoints
api_router.include_router(services.router, prefix="/services", tags=["Services"])

# Content & CMS
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])

# Careers & Jobs (both paths for compatibility)
api_router.include_router(careers.router, prefix="/careers", tags=["Careers"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

# Forms & Contact
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(forms.router, prefix="/forms", tags=["Forms"])

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Settings
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])

# Image Analysis
api_router.include_router(image_analysis.router, prefix="/image", tags=["Image Analysis"])

# Acoustic Analysis (Kaggle Remote Brain)
api_router.include_router(acoustic.router, prefix="/acoustic", tags=["Acoustic Analysis"])

# Economic Routing Planner
api_router.include_router(routing.router, prefix="/routing", tags=["Routing"])

# Forage & Weather Intelligence
api_router.include_router(forage.router, prefix="/forage", tags=["Forage Analysis"])

# Notes
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Admin Extended (Activity Logs, Documents, Payments, Tracing History)
api_router.include_router(admin_extended.router, prefix="/admin", tags=["Admin Extended"])

# Stats endpoint at root level
@api_router.get("/stats/impact")
async def get_impact_stats():
    """
    Get overall impact statistics.
    Dynamics: Tries to fetch from company_stats, falls back to real-time aggregation.
    """
    from app.db.supabase_db import db_select
    
    try:
        stats = await db_select("company_stats")
        if stats:
            return {
                "total_honey_kg": next((s["stat_value"] for s in stats if s["stat_key"] == "honey_produced"), "50,000+"),
                "hive_count": next((s["stat_value"] for s in stats if s["stat_key"] == "hives_managed"), "184"),
                "beekeepers": next((s["stat_value"] for s in stats if s["stat_key"] == "beekeepers_trained"), "500+"),
                "farmers_served": next((s["stat_value"] for s in stats if s["stat_key"] == "farmers_supported"), "1,200+"),
                "acres_pollinated": next((s["stat_value"] for s in stats if s["stat_key"] == "acres_pollinated"), "5")
            }
    except Exception:
        pass
    
    # Dynamic Fallback: Calculate from real data
    try:
        harvest_data = await db_select("harvests")
        total_kg = sum(float(h.get("quantity_kg", 0)) for h in harvest_data)
        
        hive_data = await db_select("hives")
        hive_count = len(hive_data)
        
        farmer_data = await db_select("farmers")
        farmer_count = len(farmer_data)
        
        return {
            "total_honey_kg": f"{int(total_kg)}kg" if total_kg > 0 else "0kg",
            "hive_count": str(hive_count) if hive_count > 0 else "0",
            "beekeepers": str(farmer_count) if farmer_count > 0 else "0",
            "farmers_served": "0", # Placeholder for CRM linkage
            "acres_pollinated": "0"
        }
    except Exception:
        return {
            "total_honey_kg": "0kg",
            "hive_count": "0",
            "beekeepers": "0",
            "farmers_served": "0",
            "acres_pollinated": "0"
        }


@api_router.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok", "message": "BeeYield Backend is running smoothly"}


@api_router.get("/")
def api_root():
    """
    API root with available endpoints.
    """
    return {
        "message": "BeeYield API v1",
        "endpoints": {
            "company": "/api/v1/company",
            "traceability": "/api/v1/traceability",
            "shop": "/api/v1/shop",
            "services": "/api/v1/services",
            "blog": "/api/v1/blog",
            "careers": "/api/v1/careers",
            "jobs": "/api/v1/jobs",
            "contact": "/api/v1/contact",
            "contact_message": "/api/v1/contact/message",
            "newsletter": "/api/v1/contact/newsletter",
            "notes": "/api/v1/notes",
            "inspections": "/api/v1/inspections",
            "stats": "/api/v1/stats/impact"
        },
        "docs": "/docs"
    }
