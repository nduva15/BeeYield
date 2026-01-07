"""
API Router - Registers all API endpoints
"""
from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    company, auth, traceability, contact, 
    forms, shop, blog, careers, media, 
    services, jobs, analytics
)

api_router = APIRouter()

# Analytics endpoint
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

# Core business endpoints
api_router.include_router(company.router, prefix="/company", tags=["Company"])
api_router.include_router(traceability.router, prefix="/traceability", tags=["Traceability"])
api_router.include_router(shop.router, prefix="/shop", tags=["Shop"])

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
            "total_honey_kg": next((s["metric_value"] for s in stats if s["metric_name"] == "honey_produced_kg"), "50,000+"),
            "hive_count": next((s["metric_value"] for s in stats if s["metric_name"] == "hives_deployed"), "2,500+"),
            "beekeepers": next((s["metric_value"] for s in stats if s["metric_name"] == "beekeepers_trained"), "500+"),
            "farmers_served": next((s["metric_value"] for s in stats if s["metric_name"] == "farmers_served"), "1,200+"),
            "acres_pollinated": next((s["metric_value"] for s in stats if s["metric_name"] == "acres_pollinated"), "25,000+")
        }
    
    return {
        "total_honey_kg": "50,000+",
        "hive_count": "2,500+",
        "beekeepers": "500+",
        "farmers_served": "1,200+",
        "acres_pollinated": "25,000+"
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
            "stats": "/api/v1/stats/impact"
        },
        "docs": "/docs"
    }
