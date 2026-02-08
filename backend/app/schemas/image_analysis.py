"""
BeeYield Image Analysis Schemas
===============================
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime


class BoundingBox(BaseModel):
    """Bounding box coordinates for a detection."""
    x: int = Field(..., description="X coordinate (top-left)")
    y: int = Field(..., description="Y coordinate (top-left)")
    width: int = Field(..., description="Box width in pixels")
    height: int = Field(..., description="Box height in pixels")


class BeeDetection(BaseModel):
    """Individual bee detection result."""
    id: int = Field(..., description="Detection ID")
    label: str = Field(default="Bee", description="Detection label")
    confidence: float = Field(..., ge=0, le=1, description="Detection confidence")
    health: Optional[str] = Field(None, description="Health classification")
    health_confidence: Optional[float] = Field(None, ge=0, le=1, description="Health classification confidence")
    bbox: BoundingBox = Field(..., description="Bounding box coordinates")


class DiseaseIndicator(BaseModel):
    """Aggregated disease indicator."""
    disease: str = Field(..., description="Disease name")
    probability: float = Field(..., ge=0, le=1, description="Probability of disease in colony")
    affected_bees: List[int] = Field(default_factory=list, description="IDs of affected bees")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")


class AnalysisResults(BaseModel):
    """Complete analysis results."""
    bee_count: int = Field(..., ge=0, description="Total bees detected")
    health_status: str = Field(..., description="Overall health status: Healthy, Warning, Critical, Unknown")
    health_score: int = Field(..., ge=0, le=100, description="Health score 0-100")
    confidence: float = Field(..., ge=0, le=1, description="Average detection confidence")
    detections: List[BeeDetection] = Field(default_factory=list, description="Individual detections")
    disease_indicators: List[DiseaseIndicator] = Field(default_factory=list, description="Disease indicators")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations")


class ImageAnalysisResponse(BaseModel):
    """Response model for image analysis endpoint."""
    success: bool = Field(..., description="Whether analysis completed successfully")
    analysis_id: str = Field(..., description="Unique analysis ID")
    status: str = Field(..., description="Analysis status: processing, completed, failed")
    results: AnalysisResults = Field(..., description="Analysis results")
    image_url: Optional[str] = Field(None, description="URL to original image")
    annotated_image_url: Optional[str] = Field(None, description="URL to annotated image")
    created_at: str = Field(..., description="ISO timestamp of analysis")
    processing_time_ms: int = Field(..., ge=0, description="Processing time in milliseconds")


class AnalysisHistoryItem(BaseModel):
    """Summary item for analysis history list."""
    id: str = Field(..., description="Analysis ID")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail image URL")
    bee_count: int = Field(..., ge=0, description="Bees detected")
    health_score: int = Field(..., ge=0, le=100, description="Health score")
    health_status: str = Field(..., description="Health status")
    created_at: Optional[str] = Field(None, description="ISO timestamp")
    hive_id: Optional[str] = Field(None, description="Associated hive ID")
    apiary_id: Optional[str] = Field(None, description="Associated apiary ID")


class AnalysisHistoryResponse(BaseModel):
    """Response model for analysis history list."""
    total: int = Field(..., ge=0, description="Total number of analyses")
    items: List[AnalysisHistoryItem] = Field(default_factory=list, description="Analysis items")


class HealthTrendPoint(BaseModel):
    """Single data point in health trend."""
    date: Optional[str] = Field(None, description="ISO timestamp")
    health_score: int = Field(..., ge=0, le=100, description="Health score")
    bee_count: int = Field(..., ge=0, description="Bees detected")
    health_status: Optional[str] = Field(None, description="Health status")


class HealthTrendsResponse(BaseModel):
    """Response model for health trends endpoint."""
    hive_id: str = Field(..., description="Hive ID")
    trends: List[HealthTrendPoint] = Field(default_factory=list, description="Trend data points")
    average_score: Optional[float] = Field(None, description="Average health score")
    total_analyses: int = Field(..., ge=0, description="Total analyses for this hive")
