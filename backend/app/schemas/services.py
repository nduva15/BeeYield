"""
Services Schemas - Pollination, Learning, ESG
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ POLLINATION SERVICES ============

class PollinationServiceBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    features: List[str] = []
    benefits: List[str] = []
    pricing_info: Optional[str] = None


class PollinationServiceCreate(PollinationServiceBase):
    display_order: int = 0


class PollinationService(PollinationServiceBase):
    id: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ CROPS POLLINATED ============

class CropBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    pollination_info: Optional[str] = None
    season: Optional[str] = None
    region: Optional[str] = None


class CropCreate(CropBase):
    display_order: int = 0


class Crop(CropBase):
    id: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ LEARNING MODULES ============

class LearningLessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 0


class LearningLesson(LearningLessonBase):
    id: str
    module_id: str
    display_order: int

    class Config:
        from_attributes = True


class LearningModuleBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: str = "beginner"
    duration_minutes: int = 0
    is_free: bool = True


class LearningModuleCreate(LearningModuleBase):
    display_order: int = 0


class LearningModule(LearningModuleBase):
    id: str
    is_active: bool
    display_order: int
    lessons: List[LearningLesson] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ============ ESG METRICS ============

class ESGMetricBase(BaseModel):
    metric_key: str
    metric_name: str
    metric_value: float
    metric_unit: Optional[str] = None
    category: str  # environmental, social, governance
    description: Optional[str] = None
    reporting_period: Optional[str] = None
    year: int


class ESGMetricCreate(ESGMetricBase):
    is_verified: bool = False


class ESGMetric(ESGMetricBase):
    id: str
    is_verified: bool
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ IMPACT STORIES ============

class ImpactStoryBase(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    impact_type: Optional[str] = None
    location: Optional[str] = None
    beneficiaries_count: int = 0


class ImpactStoryCreate(ImpactStoryBase):
    is_featured: bool = False


class ImpactStory(ImpactStoryBase):
    id: str
    is_featured: bool
    is_active: bool
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============ GLOBAL HIVE NETWORK ============

class ApiaryBase(BaseModel):
    name: str
    location_name: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hive_count: int = 0
    beekeeper_count: int = 0
    description: Optional[str] = None
    image_url: Optional[str] = None


class ApiaryCreate(ApiaryBase):
    established_date: Optional[datetime] = None


class Apiary(ApiaryBase):
    id: str
    established_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ PAGE RESPONSES ============

class PollinationSolutionsResponse(BaseModel):
    services: List[PollinationService] = []
    crops: List[Crop] = []
    stats: dict = {}


class ESGResponse(BaseModel):
    metrics: List[ESGMetric] = []
    by_category: dict = {}
    impact_stories: List[ImpactStory] = []


class GlobalHiveNetworkResponse(BaseModel):
    apiaries: List[Apiary] = []
    total_hives: int = 0
    total_beekeepers: int = 0
    countries: List[str] = []
