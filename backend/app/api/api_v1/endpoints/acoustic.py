from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Any, Optional, List
from app.db.supabase_db import db_insert, db_select, db_update
from app.core import security
from pydantic import BaseModel, Field
import time
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class AcousticInferenceResult(BaseModel):
    job_id: str
    hive_id: str
    prediction: str
    confidence: float
    model_version: str
    processing_time_ms: int
    spectrogram_url: Optional[str] = None
    metadata: Optional[dict] = {}

class AcousticTrigger(BaseModel):
    hive_id: str
    audio_url: str
    model_type: Optional[str] = "v4-28gb"

@router.post("/inference/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_acoustic_inference(
    trigger: AcousticTrigger,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Trigger a remote Kaggle inference job.
    In a real scenario, this would call the Kaggle API to start a kernel.
    For the project demo, we simulate the staging of the request.
    """
    user_id = current_user.get("sub")
    
    # Check if hive exists
    hives = await db_select("hives", filters={"id": trigger.hive_id})
    if not hives:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    # Log the trigger attempt in Supabase
    job_id = f"k-inf-{int(time.time())}"
    
    # Record the pending inference
    await db_insert("acoustic_inferences", {
        "job_id": job_id,
        "hive_id": trigger.hive_id,
        "user_id": user_id,
        "status": "triggered",
        "audio_url": trigger.audio_url,
        "model_type": trigger.model_type
    })
    
    # TODO: Call Kaggle API here
    # kaggle.api.kernel_push(...) 
    
    return {
        "success": True,
        "job_id": job_id,
        "message": "Remote Kaggle bridge initialized. Awaiting callback."
    }

@router.post("/inference/callback")
async def acoustic_inference_callback(result: AcousticInferenceResult):
    """
    Webhook endpoint for Kaggle to report results.
    """
    logger.info(f"Received inference callback for Job {result.job_id}")
    
    # 1. Update the inference record
    await db_update("acoustic_inferences", {
        "status": "completed",
        "prediction": result.prediction,
        "confidence": result.confidence,
        "processing_time": result.processing_time_ms,
        "model_version": result.model_version,
        "spectrogram_url": result.spectrogram_url,
        "completed_at": "now()"
    }, {"job_id": result.job_id})
    
    # 2. Add to acoustic_readings (Historical data)
    await db_insert("acoustic_readings", {
        "hive_id": result.hive_id,
        "frequency_hz": 440.0, # Dummy, would be extracted from metadata
        "amplitude_db": -20.0,
        "health_index": int(result.confidence * 100),
        "interpretation": result.prediction,
        "model_version": result.model_version,
        "tags": [result.prediction.split()[0]]
    })
    
    return {"status": "success", "message": "Inference results registered"}

@router.get("/inferences/{job_id}")
async def get_inference_status(job_id: str):
    """Poll for inference status"""
    results = await db_select("acoustic_inferences", filters={"job_id": job_id})
    if not results:
        raise HTTPException(status_code=404, detail="Inference job not found")
    return results[0]
