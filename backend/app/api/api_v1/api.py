"""
API Router - Registers all API endpoints
"""
from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    company, auth, traceability, contact, 
    forms, shop, blog, careers, media, 
    services, jobs, analytics, notes, admin, iot, ai,
    admin_extended, meters, beeyield, pollination, inspections, reports,
    ai_assistant, settings, payments
)


api_router = APIRouter()

# Meters endpoint
api_router.include_router(meters.router, prefix="/meters", tags=["Meters"])

# BeeYield Dashboard (User-specific data)
api_router.include_router(beeyield.router, prefix="/beeyield", tags=["BeeYield Dashboard"])
api_router.include_router(reports.router, prefix="/beeyield/reports", tags=["BeeYield Reports"])

# Precision Pollination endpoint
api_router.include_router(pollination.router, prefix="/pollination", tags=["Precision Pollination"])

# Inspections endpoint
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])

# AI Assistant endpoint (legacy)
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])

# AI Assistant v2 (comprehensive)
api_router.include_router(ai_assistant.router, prefix="/assistant", tags=["AI Assistant"])

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

# Notes
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Admin Extended (Activity Logs, Documents, Payments, Tracing History)
api_router.include_router(admin_extended.router, prefix="/admin", tags=["Admin Extended"])

# Stats endpoint at root level
@api_router.get("/stats/impact")
def get_impact_stats():
    """
    Get overall impact statistics.
    """
    from app.db.supabase_db import db_select
    
    stats = db_select("company_stats")
    
    if stats:
        return {
            "total_honey_kg": next((s["stat_value"] for s in stats if s["stat_key"] == "honey_produced"), "50,000+"),
            "hive_count": next((s["stat_value"] for s in stats if s["stat_key"] == "hives_managed"), "184"),
            "beekeepers": next((s["stat_value"] for s in stats if s["stat_key"] == "beekeepers_trained"), "500+"),
            "farmers_served": next((s["stat_value"] for s in stats if s["stat_key"] == "farmers_supported"), "1,200+"),
            "acres_pollinated": next((s["stat_value"] for s in stats if s["stat_key"] == "acres_pollinated"), "5")
        }
    
    return {
        "total_honey_kg": "50,000+",
        "hive_count": "184",
        "beekeepers": "500+",
        "farmers_served": "1,200+",
        "acres_pollinated": "5"
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
            "notes": "/api/v1/notes",
            "inspections": "/api/v1/inspections",
            "stats": "/api/v1/stats/impact"
        },
        "docs": "/docs"
    }
