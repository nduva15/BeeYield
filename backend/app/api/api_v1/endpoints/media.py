"""
Media Endpoints - Press, News, Videos
"""
from fastapi import APIRouter
from typing import List, Optional
from app.db.supabase_db import db_select

router = APIRouter()


@router.get("/", response_model=List[dict])
def get_media_items(media_type: Optional[str] = None):
    """
    Get all media items, optionally filtered by type.
    """
    filters = {"is_active": True}
    if media_type:
        filters["media_type"] = media_type
    
    items = db_select("media_items", filters=filters, order_by="published_date", ascending=False)
    
    if not items or len(items) == 0:
        # Return mock data
        return [
            {
                "id": "med-1",
                "title": "BeeYield Launches Blockchain Traceability in Kenya",
                "description": "A major milestone for the honey industry...",
                "media_type": "press_release",
                "source_name": "TechCrunch East Africa",
                "published_date": "2024-11-20"
            },
            {
                "id": "med-2",
                "title": "How Bees are Saving Farming",
                "description": "Featured documentary on BeeYield's impact.",
                "media_type": "video",
                "url": "https://youtube.com/watch?v=example",
                "published_date": "2024-11-15"
            }
        ]
    return items


@router.get("/featured", response_model=List[dict])
def get_featured_media():
    """
    Get featured media items.
    """
    items = db_select("media_items", filters={"is_featured": True, "is_active": True}, limit=5)
    return items if items else []
