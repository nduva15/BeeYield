"""
Services Endpoints - Pollination, Learning, ESG, Crops
"""
from fastapi import APIRouter, HTTPException, Request, Depends, status
from typing import Optional
from app.schemas import services as schemas
from app.db.supabase_db import db_select, db_get_by_id
from app.core import security

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# ============ POLLINATION SOLUTIONS ============

@router.get("/pollination", response_model=list[schemas.PollinationService])
async def get_pollination_services(token: Optional[str] = Depends(get_token)):
    """
    Get all pollination services.
    """
    services = await db_select("pollination_services", filters={"is_active": True}, order_by="display_order", token=token)
    
    if not services or len(services) == 0:
        return [
            {
                "id": "ser-1",
                "name": "In-Land Pollination",
                "slug": "in-land-pollination",
                "description": "Comprehensive pollination tracking for field crops.",
                "short_description": "Precision pollination services for large-scale farms.",
                "features": ["GPS-tracked hives", "24/7 monitoring", "Certified beekeepers"],
                "benefits": ["Increased yield", "Data-driven decisions"],
                "display_order": 1,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "ser-2",
                "name": "Precision Pollination",
                "slug": "precision-pollination",
                "description": "Advanced AI-driven pollination planning.",
                "short_description": "Data-driven pollination optimization using AI.",
                "features": ["AI-powered placement", "Yield analytics", "Weather integration"],
                "benefits": ["Optimized bee density", "Cost reduction"],
                "display_order": 2,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    return services


# ============ CROPS ============

@router.get("/crops", response_model=list[schemas.Crop])
async def get_crops(token: Optional[str] = Depends(get_token)):
    """
    Get all crops pollinated by BeeYield.
    """
    crops = await db_select("crops_pollinated", filters={"is_active": True}, order_by="display_order", token=token)
    
    if not crops or len(crops) == 0:
        return [
            {
                "id": "crop-1", "name": "Avocado", "slug": "avocado", 
                "description": "Premium pollination for avocado orchards.",
                "display_order": 1, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "crop-2", "name": "Macadamia", "slug": "macadamia", 
                "description": "Specialized pollination for macadamia nuts.",
                "display_order": 2, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "crop-3", "name": "Coffee", "slug": "coffee", 
                "description": "Enhance coffee bean yields with bee pollination.",
                "display_order": 3, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    return crops


# ============ LEARNING / BEE LEARN ============

@router.get("/learning/modules", response_model=list[schemas.LearningModule])
async def get_learning_modules(category: Optional[str] = None, token: Optional[str] = Depends(get_token)):
    """
    Get all learning modules for Bee Learn.
    """
    filters = {"is_active": True}
    if category:
        filters["category"] = category
        
    modules = await db_select("learning_modules", filters=filters, order_by="display_order", token=token)
    
    if not modules or len(modules) == 0:
        return [
            {
                "id": "mod-1",
                "title": "Beekeeping Essentials",
                "slug": "beekeeping-essentials",
                "description": "Foundation course for aspiring beekeepers to start their journey.",
                "category": "Basic",
                "difficulty_level": "beginner",
                "is_free": True,
                "display_order": 1,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "lessons": [{"id": "l-1", "title": "Safety & Gear", "display_order": 1}]
            },
            {
                "id": "mod-2",
                "title": "Pollinator Landscapes",
                "slug": "pollinator-landscapes",
                "description": "Learn to create habitats that support local biodiversity.",
                "category": "Environment",
                "duration_minutes": 45,
                "difficulty_level": "beginner",
                "is_free": True,
                "display_order": 2,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "lessons": []
            },
            {
                "id": "mod-3",
                "title": "Introduction to Hive Health",
                "slug": "hive-health-intro",
                "description": "Identifying and managing common honeybee pests and diseases.",
                "category": "Technical",
                "duration_minutes": 90,
                "difficulty_level": "intermediate",
                "is_free": True,
                "display_order": 3,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "lessons": []
            },
            {
                "id": "mod-4",
                "title": "The Honey Cycle",
                "slug": "honey-cycle",
                "description": "A deep dive into how bees make honey and the extraction process.",
                "category": "Basic",
                "duration_minutes": 30,
                "difficulty_level": "beginner",
                "is_free": True,
                "display_order": 4,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "lessons": []
            }
        ]
    
    # For each module, fetch its lessons
    for module in modules:
        lessons = await db_select("learning_lessons", filters={"module_id": module["id"]}, order_by="display_order", token=token)
        module["lessons"] = lessons if lessons else []
        
    return modules


# ============ ESG & IMPACT ============

@router.get("/esg/metrics", response_model=list[schemas.ESGMetric])
async def get_esg_metrics(token: Optional[str] = Depends(get_token)):
    """
    Get ESG (Environmental, Social, Governance) metrics.
    """
    metrics = await db_select("esg_metrics", order_by="metric_name", token=token)
    
    if not metrics or len(metrics) == 0:
        return [
            {
                "id": "esg-1", "metric_key": "carbon_offset", "metric_name": "Carbon Offset",
                "metric_value": 125.5, "metric_unit": "tons", "category": "environmental",
                "year": 2023, "is_verified": True, "updated_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "esg-2", "metric_key": "farmers_trained", "metric_name": "Farmers Trained",
                "metric_value": 500.0, "metric_unit": "farmers", "category": "social",
                "year": 2023, "is_verified": True, "updated_at": "2024-01-01T00:00:00Z"
            }
        ]
    return metrics


@router.get("/impact/stories", response_model=list[dict])
async def get_impact_stories(token: Optional[str] = Depends(get_token)):
    """
    Get impact stories.
    """
    stories = await db_select("impact_stories", filters={"is_active": True}, order_by="published_at", ascending=False, token=token)
    
    if not stories or len(stories) == 0:
        return [
            {
                "id": "story-1", "title": "Empowering Women Beekeepers", "slug": "empowering-women",
                "summary": "How BeeYield is creating opportunities for women in rural Kenya.",
                "content": "Full story here...", "impact_type": "Social", "location": "Kibwezi",
                "is_featured": True, "is_active": True, "published_at": "2024-03-01T00:00:00Z",
                "created_at": "2024-03-01T00:00:00Z"
            }
        ]
    return stories


@router.get("/impact/sdgs", response_model=list[dict])
async def get_sdgs(token: Optional[str] = Depends(get_token)):
    """
    Get UN Sustainable Development Goals commitment.
    """
    sdgs = await db_select("sdgs", filters={"is_active": True}, order_by="display_order", token=token)
    return sdgs if sdgs else []


@router.get("/esg/pillars", response_model=list[dict])
async def get_esg_pillars(token: Optional[str] = Depends(get_token)):
    """
    Get ESG pillars and their initiatives.
    """
    pillars = await db_select("esg_pillars", filters={"is_active": True}, order_by="display_order", token=token)
    
    # Enrich with initiatives
    result = []
    for pillar in pillars:
        try:
            initiatives = await db_select("esg_initiatives", filters={"pillar_id": pillar["id"]}, order_by="display_order", token=token)
            pillar["initiatives"] = [i["description"] for i in initiatives]
        except Exception:
            pillar["initiatives"] = []
        result.append(pillar)
        
    return result if result else []


# ============ GLOBAL HIVE NETWORK ============

@router.get("/apiaries", response_model=list[dict])
async def get_apiaries(token: Optional[str] = Depends(get_token)):
    """
    Get all apiary locations in the network.
    """
    apiaries = await db_select("apiaries", filters={"is_active": True}, token=token)
    
    if not apiaries or len(apiaries) == 0:
        return [
            {
                "id": "apiary-1", "apiary_id": "api-1", "apiary_code": "KIB-001", "name": "Main Apiary Kibwezi",
                "location_name": "Kibwezi", "region": "Makueni", "county": "Makueni", 
                "latitude": -2.4, "longitude": 37.9, "hive_count": 184,
                "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    return apiaries

