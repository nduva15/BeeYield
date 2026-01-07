"""
Services Endpoints - Pollination, Learning, ESG, Crops
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas import services as schemas
from app.db.supabase_db import db_select, db_get_by_id

router = APIRouter()


# ============ POLLINATION SOLUTIONS ============

@router.get("/pollination", response_model=List[dict])
def get_pollination_services():
    """
    Get all pollination services.
    """
    services = db_select("pollination_services", filters={"is_active": True}, order_by="display_order")
    
    if not services or len(services) == 0:
        return [
            {
                "id": "ser-1",
                "name": "In-Land Pollination",
                "slug": "in-land-pollination",
                "short_description": "Precision pollination services for large-scale farms.",
                "features": ["GPS-tracked hives", "24/7 monitoring", "Certified beekeepers"],
                "display_order": 1,
                "is_active": True
            },
            {
                "id": "ser-2",
                "name": "Precision Pollination",
                "slug": "precision-pollination",
                "short_description": "Data-driven pollination optimization using AI.",
                "features": ["AI-powered placement", "Yield analytics", "Weather integration"],
                "display_order": 2,
                "is_active": True
            }
        ]
    return services


# ============ CROPS ============

@router.get("/crops", response_model=List[dict])
def get_crops():
    """
    Get all crops pollinated by BeeYield.
    """
    crops = db_select("crops_pollinated", filters={"is_active": True}, order_by="display_order")
    
    if not crops or len(crops) == 0:
        return [
            {"id": "crop-1", "name": "Avocado", "slug": "avocado", "description": "Premium pollination for avocado orchards."},
            {"id": "crop-2", "name": "Macadamia", "slug": "macadamia", "description": "Specialized pollination for macadamia nuts."},
            {"id": "crop-3", "name": "Coffee", "slug": "coffee", "description": "Enhance coffee bean yields with bee pollination."}
        ]
    return crops


# ============ LEARNING / BEE LEARN ============

@router.get("/learning/modules", response_model=List[dict])
def get_learning_modules(category: Optional[str] = None):
    """
    Get all learning modules for Bee Learn.
    """
    filters = {"is_active": True}
    if category:
        filters["category"] = category
        
    modules = db_select("learning_modules", filters=filters, order_by="display_order")
    
    if not modules or len(modules) == 0:
        return [
            {
                "id": "mod-1",
                "title": "Introduction to Beekeeping",
                "slug": "intro-beekeeping",
                "description": "Learn the basics of beehive management.",
                "category": "Basic",
                "difficulty_level": "beginner",
                "is_free": True
            },
            {
                "id": "mod-2",
                "title": "Precision Pollination Techniques",
                "slug": "precision-techniques",
                "description": "Advanced techniques for optimizing crop yields.",
                "category": "Advanced",
                "difficulty_level": "intermediate",
                "is_free": False
            }
        ]
    return modules


# ============ ESG & IMPACT ============

@router.get("/esg/metrics", response_model=List[dict])
def get_esg_metrics():
    """
    Get ESG (Environmental, Social, Governance) metrics.
    """
    metrics = db_select("esg_metrics", order_by="metric_name")
    return metrics if metrics else []


@router.get("/impact/stories", response_model=List[dict])
def get_impact_stories():
    """
    Get impact stories.
    """
    stories = db_select("impact_stories", filters={"is_active": True}, order_by="published_at", ascending=False)
    return stories if stories else []


# ============ GLOBAL HIVE NETWORK ============

@router.get("/apiaries", response_model=List[dict])
def get_apiaries():
    """
    Get all apiary locations in the network.
    """
    apiaries = db_select("apiaries", filters={"is_active": True})
    return apiaries if apiaries else []
