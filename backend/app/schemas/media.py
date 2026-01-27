"""
Media Schemas - Press, News, Videos
"""
from pydantic import BaseModel
from typing import Optional, list
from datetime import date, datetime


# ============ MEDIA ITEMS ============

class MediaItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    media_type: str  # press_release, news, video, image, document
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    published_date: Optional[date] = None


class MediaItemCreate(MediaItemBase):
    is_featured: bool = False


class MediaItem(MediaItemBase):
    id: str
    is_featured: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ MEDIA PAGE RESPONSE ============

class MediaPageResponse(BaseModel):
    press_releases: list[MediaItem] = []
    news_coverage: list[MediaItem] = []
    videos: list[MediaItem] = []
    featured: list[MediaItem] = []
    total_items: int = 0
