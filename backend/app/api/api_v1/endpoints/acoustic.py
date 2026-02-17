"""
Acoustic Analysis Endpoints
Embedded local inference using BEE-SOUND-ANALYSIS logic.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import httpx
import logging

from app.core import security
from app.db.supabase_db import db_insert, db_select, db_update
from app.services.acoustic_analyzer import get_analyzer

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================
# SCHEMAS
# ============================================

class AcousticTrigger(BaseModel):
    hive_id: str
    audio_url: str
    model_type: Optional[str] = "embedded-v1"

class KaggleCallback(BaseModel):
    job_id: str
    status: str
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    error: Optional[str] = None

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# ============================================
# ENDPOINTS
# ============================================

@router.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_audio_direct(
    file: UploadFile = File(...),
    hive_id: Optional[str] = None,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    EMBEDDED AUDIO ANALYSIS - Runs directly in backend (Option 1 Architecture).
    Upload audio file and get instant results - no external API calls.
    
    This endpoint:
    1. Accepts uploaded audio file (.wav, .ogg, .mp3)
    2. Runs librosa feature extraction
    3. Analyzes bee colony health (Healthy, Queenless, Swarming, Stressed)
    4. Returns instant results
    """
    user_id = current_user.get("sub")
    
    # Verify hive exists if provided
    if hive_id:
        hives = await db_select("hives", filters={"id": hive_id}, token=token)
        if not hives:
            raise HTTPException(status_code=404, detail="Hive not found")
    
    try:
        # Read audio bytes
        audio_bytes = await file.read()
        logger.info(f"🎵 Received audio file: {file.filename} ({len(audio_bytes)} bytes)")
        
        # Run embedded inference
        analyzer = get_analyzer()
        result = analyzer.analyze_audio_file(audio_bytes)
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Record the analysis
        analysis_record = {
            "id": analysis_id,
            "hive_id": hive_id,
            "user_id": user_id,
            "model_type": "embedded-heuristic-v1",
            "status": "completed",
            "prediction": result['state'],
            "confidence": result['confidence'],
            "segments_analyzed": result.get('segments_analyzed', 0),
            "piping_detected": result.get('alert', False),
           "completed_at": datetime.utcnow().isoformat()
        }
        
        await db_insert("acoustic_inferences", analysis_record, token=token)
        
        # Also create acoustic reading for history
        if hive_id and result['state'] != 'Unknown':
            reading_data = {
                "hive_id": hive_id,
                "frequency_hz": result.get('details', {}).get(result['state'], {}).get('avg_confidence', 0) * 1000,
                "amplitude_db": 58.0,
                "health_index": result['confidence'],
                "tags": [result['state'], "embedded-analysis", f"segments-{result.get('segments_analyzed', 0)}"]
            }
            await db_insert("acoustic_readings", reading_data, token=token)
        
        logger.info(f"✅ Analysis complete: {result['state']} ({result['confidence']:.1%})")
        
        return {
            "analysis_id": analysis_id,
            "hive_id": hive_id,
            "verdict": result['state'],
            "confidence": result['confidence'],
            "details": result.get('details', {}),
            "alert": result.get('alert', False),
            "piping_segments": result.get('piping_segments', 0),
            "segments_analyzed": result.get('segments_analyzed', 0),
            "message": f"Colony Status: {result['state']}"
        }
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/inference/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_acoustic_inference(
    trigger: AcousticTrigger,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Trigger acoustic inference from audio URL.
    Downloads the audio and runs embedded analysis.
    """
    user_id = current_user.get("sub")
    
    # Verify hive exists and user has access
    hives = await db_select("hives", filters={"id": trigger.hive_id}, token=token)
    if not hives:
        raise HTTPException(status_code=404, detail="Hive not found")
        
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Log the trigger
    inference_record = {
        "id": job_id,
        "hive_id": trigger.hive_id,
        "user_id": user_id,
        "audio_url": trigger.audio_url,
        "model_type": trigger.model_type,
        "status": "downloading",
        "triggered_at": datetime.utcnow().isoformat()
    }
    
    await db_insert("acoustic_inferences", inference_record, token=token)
    
    try:
        # Download audio from URL
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(trigger.audio_url)
            response.raise_for_status()
            audio_bytes = response.content
        
        logger.info(f"📥 Downloaded audio: {len(audio_bytes)} bytes")
        
        # Update status
        await db_update("acoustic_inferences", {"status": "analyzing"}, {"id": job_id}, token=token)
        
        # Run embedded analysis
        analyzer = get_analyzer()
        result = analyzer.analyze_audio_file(audio_bytes)
        
        # Update with results
        await db_update("acoustic_inferences", {
            "status": "completed",
            "prediction": result['state'],
            "confidence": result['confidence'],
            "segments_analyzed": result.get('segments_analyzed', 0),
            "piping_detected": result.get('alert', False),
            "completed_at": datetime.utcnow().isoformat()
        }, {"id": job_id}, token=token)
        
        # Create acoustic reading
        reading_data = {
            "hive_id": trigger.hive_id,
            "frequency_hz": result.get('details', {}).get(result['state'], {}).get('avg_confidence', 0) * 1000,
            "amplitude_db": 58.0,
            "health_index": result['confidence'],
            "tags": [result['state'], "url-analysis", trigger.model_type]
        }
        await db_insert("acoustic_readings", reading_data, token=token)
        
        return {
            "success": True,
            "job_id": job_id,
            "status": "completed",
            "verdict": result['state'],
            "confidence": result['confidence'],
            "message": f"Analysis complete: {result['state']}"
        }
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        await db_update("acoustic_inferences", {
            "status": "failed",
            "error": str(e)
        }, {"id": job_id}, token=token)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inferences/{job_id}")
async def get_inference_status(
    job_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get the status of an acoustic inference job.
    """
    results = await db_select("acoustic_inferences", filters={"id": job_id}, token=token)
    
    if not results:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = results[0]
    return {
        "job_id": job_id,
        "status": job.get("status"),
        "prediction": job.get("prediction"),
        "confidence": job.get("confidence"),
        "segments_analyzed": job.get("segments_analyzed"),
        "piping_detected": job.get("piping_detected"),
        "error": job.get("error"),
        "triggered_at": job.get("triggered_at"),
        "completed_at": job.get("completed_at")
    }
