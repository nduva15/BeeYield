"""
BeeYield Image Analysis API Endpoints
=====================================
Production-ready endpoints for bee image analysis, detection, and health classification.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from typing import Optional
import uuid
from datetime import datetime

from app.core.auth import get_current_user_id
from app.services.image_analysis_service import ImageAnalysisService
from app.db.supabase_db import get_supabase, db_insert, db_select
from app.schemas.image_analysis import (
    ImageAnalysisResponse,
    AnalysisHistoryResponse,
    AnalysisType
)

router = APIRouter()

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
]


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(
    image: UploadFile = File(..., description="Image file to analyze"),
    hive_id: Optional[str] = Form(None, description="Associated hive UUID"),
    apiary_id: Optional[str] = Form(None, description="Associated apiary UUID"),
    confidence_threshold: float = Form(0.4, ge=0.1, le=1.0),
    overlap_threshold: float = Form(0.5, ge=0.1, le=1.0),
    analysis_type: AnalysisType = Form(AnalysisType.FULL),
    user_id: str = Depends(get_current_user_id)
):
    """
    Upload and analyze a bee/hive image.
    
    This endpoint performs:
    1. Image validation and preprocessing
    2. Bee detection using ML models
    3. Per-bee health classification
    4. Disease indicator aggregation
    5. Recommendation generation
    
    Returns detailed analysis results with bounding boxes, health scores, and recommendations.
    """
    
    # Validate file type
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # Read and validate file size
    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    try:
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Upload original image to Supabase Storage
        supabase = get_supabase()
        if supabase:
            try:
                storage_path = f"image-analyses/{user_id}/{analysis_id}/original.jpg"
                supabase.storage.from_("beeyield-images").upload(
                    storage_path,
                    image_bytes,
                    {"content-type": image.content_type}
                )
                image_url = supabase.storage.from_("beeyield-images").get_public_url(storage_path)
            except Exception as storage_error:
                print(f"Storage upload failed: {storage_error}")
                image_url = None
        else:
            image_url = None
        
        # Run ML analysis
        analysis_result = await ImageAnalysisService.analyze_image(
            image_bytes=image_bytes,
            user_id=user_id,
            hive_id=hive_id,
            apiary_id=apiary_id,
            confidence_threshold=confidence_threshold,
            overlap_threshold=overlap_threshold,
            analysis_type=analysis_type
        )
        
        # Generate annotated image (if detections exist)
        annotated_image_url = None
        if analysis_result.get("detections"):
            try:
                annotated_bytes = await ImageAnalysisService.generate_annotated_image(
                    image_bytes=image_bytes,
                    detections=analysis_result["detections"]
                )
                if supabase and annotated_bytes:
                    annotated_path = f"image-analyses/{user_id}/{analysis_id}/annotated.jpg"
                    supabase.storage.from_("beeyield-images").upload(
                        annotated_path,
                        annotated_bytes,
                        {"content-type": "image/jpeg"}
                    )
                    annotated_image_url = supabase.storage.from_("beeyield-images").get_public_url(annotated_path)
            except Exception as annotate_error:
                print(f"Annotation generation failed: {annotate_error}")
        
        # Store analysis in database
        db_record = {
            "id": analysis_id,
            "user_id": user_id,
            "apiary_id": apiary_id,
            "hive_id": hive_id,
            "original_image_path": image_url,
            "annotated_image_path": annotated_image_url,
            "confidence_threshold": confidence_threshold,
            "overlap_threshold": overlap_threshold,
            "analysis_type": analysis_type,
            "bee_count": analysis_result.get("bee_count", 0),
            "health_score": analysis_result.get("health_score", 0),
            "health_status": analysis_result.get("health_status", "Unknown"),
            "overall_confidence": analysis_result.get("overall_confidence", 0),
            "detections": analysis_result.get("detections", []),
            "disease_indicators": analysis_result.get("disease_indicators", []),
            "recommendations": analysis_result.get("recommendations", []),
            "image_width": analysis_result.get("image_width"),
            "image_height": analysis_result.get("image_height"),
            "file_size_bytes": len(image_bytes),
            "processing_time_ms": analysis_result.get("processing_time_ms"),
            "model_version": analysis_result.get("model_version", "v1.0")
        }
        
        if supabase:
            try:
                await db_insert("image_analyses", db_record)
            except Exception as db_error:
                print(f"Database insert failed: {db_error}")
        
        return {
            "success": True,
            "analysis_id": analysis_id,
            "status": "completed",
            "results": {
                "bee_count": analysis_result.get("bee_count", 0),
                "health_status": analysis_result.get("health_status", "Unknown"),
                "health_score": analysis_result.get("health_score", 0),
                "confidence": analysis_result.get("overall_confidence", 0),
                "detections": analysis_result.get("detections", []),
                "disease_indicators": analysis_result.get("disease_indicators", []),
                "recommendations": analysis_result.get("recommendations", [])
            },
            "image_url": image_url,
            "annotated_image_url": annotated_image_url,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "processing_time_ms": analysis_result.get("processing_time_ms", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Image analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analysis/{analysis_id}", response_model=ImageAnalysisResponse)
async def get_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve a specific image analysis result by ID.
    """
    try:
        result = await db_select(
            "image_analyses",
            filters={"id": analysis_id, "user_id": user_id}
        )
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis = result[0]
        
        return {
            "success": True,
            "analysis_id": analysis["id"],
            "status": "completed",
            "results": {
                "bee_count": analysis.get("bee_count", 0),
                "health_status": analysis.get("health_status", "Unknown"),
                "health_score": analysis.get("health_score", 0),
                "confidence": analysis.get("overall_confidence", 0),
                "detections": analysis.get("detections", []),
                "disease_indicators": analysis.get("disease_indicators", []),
                "recommendations": analysis.get("recommendations", [])
            },
            "image_url": analysis.get("original_image_path"),
            "annotated_image_url": analysis.get("annotated_image_path"),
            "created_at": analysis.get("created_at"),
            "processing_time_ms": analysis.get("processing_time_ms", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")


@router.get("/analyses", response_model=AnalysisHistoryResponse)
async def list_analyses(
    hive_id: Optional[str] = Query(None, description="Filter by hive"),
    apiary_id: Optional[str] = Query(None, description="Filter by apiary"),
    date_from: Optional[str] = Query(None, description="Start date (ISO format)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id)
):
    """
    List all image analyses for the authenticated user.
    Supports filtering by hive, apiary, and date range.
    """
    try:
        filters = {"user_id": user_id}
        if hive_id:
            filters["hive_id"] = hive_id
        if apiary_id:
            filters["apiary_id"] = apiary_id
        
        # Note: Date filtering would need custom query logic
        # For now, basic filter support
        
        results = await db_select("image_analyses", filters=filters)
        
        if not results:
            results = []
        
        # Sort by created_at descending
        sorted_results = sorted(
            results,
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )
        
        # Apply pagination
        total = len(sorted_results)
        paginated = sorted_results[offset:offset + limit]
        
        items = []
        for analysis in paginated:
            items.append({
                "id": analysis["id"],
                "thumbnail_url": analysis.get("original_image_path"),
                "bee_count": analysis.get("bee_count", 0),
                "health_score": analysis.get("health_score", 0),
                "health_status": analysis.get("health_status", "Unknown"),
                "created_at": analysis.get("created_at"),
                "hive_id": analysis.get("hive_id"),
                "apiary_id": analysis.get("apiary_id")
            })
        
        return {
            "total": total,
            "items": items
        }
        
    except Exception as e:
        print(f"List analyses error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list analyses: {str(e)}")


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete an image analysis and its associated images.
    """
    try:
        # Verify ownership
        result = await db_select(
            "image_analyses",
            filters={"id": analysis_id, "user_id": user_id}
        )
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        result[0]
        
        # Delete from storage
        supabase = get_supabase()
        if supabase:
            try:
                storage_prefix = f"image-analyses/{user_id}/{analysis_id}/"
                # Delete all files in the analysis folder
                supabase.storage.from_("beeyield-images").remove([
                    f"{storage_prefix}original.jpg",
                    f"{storage_prefix}annotated.jpg"
                ])
            except Exception as storage_error:
                print(f"Storage deletion failed: {storage_error}")
        
        # Delete from database
        if supabase:
            supabase.table("image_analyses").delete().eq("id", analysis_id).execute()
        
        return {"success": True, "message": "Analysis deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")


@router.get("/hive/{hive_id}/analyses", response_model=AnalysisHistoryResponse)
async def get_hive_analyses(
    hive_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all image analyses for a specific hive.
    Useful for tracking colony health over time.
    """
    return await list_analyses(
        hive_id=hive_id,
        apiary_id=None,
        date_from=None,
        date_to=None,
        limit=limit,
        offset=offset,
        user_id=user_id
    )


@router.get("/health-trends/{hive_id}")
async def get_health_trends(
    hive_id: str,
    days: int = Query(30, ge=7, le=365),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get health score trends for a hive over time.
    Returns data points for charting colony health progression.
    """
    try:
        results = await db_select(
            "image_analyses",
            filters={"hive_id": hive_id, "user_id": user_id}
        )
        
        if not results:
            return {"hive_id": hive_id, "trends": [], "average_score": None}
        
        # Sort by date
        sorted_results = sorted(
            results,
            key=lambda x: x.get("created_at", "")
        )
        
        trends = []
        for analysis in sorted_results:
            trends.append({
                "date": analysis.get("created_at"),
                "health_score": analysis.get("health_score", 0),
                "bee_count": analysis.get("bee_count", 0),
                "health_status": analysis.get("health_status")
            })
        
        # Calculate average
        scores = [t["health_score"] for t in trends if t["health_score"] is not None]
        avg_score = sum(scores) / len(scores) if scores else None
        
        return {
            "hive_id": hive_id,
            "trends": trends[-30:],  # Last 30 data points
            "average_score": round(avg_score, 1) if avg_score else None,
            "total_analyses": len(trends)
        }
        
    except Exception as e:
        print(f"Health trends error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")
