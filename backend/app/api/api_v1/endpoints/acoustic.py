"""
Acoustic Analysis Endpoints
Embedded local inference using BEE-SOUND-ANALYSIS logic.
"""
from datetime import datetime
from typing import Optional
import logging
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from app.core import security
from app.db.supabase_db import db_insert, db_select, db_update
from app.services.acoustic_analyzer import get_analyzer

logger = logging.getLogger(__name__)
router = APIRouter()


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


def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


@router.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_audio_direct(
    file: UploadFile = File(...),
    hive_id: Optional[str] = None,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Run embedded audio analysis directly in the backend.
    """
    user_id = current_user.get("sub")

    if hive_id:
        hives = await db_select("hives", filters={"id": hive_id}, token=token)
        if not hives:
            raise HTTPException(status_code=404, detail="Hive not found")

    try:
        audio_bytes = await file.read()
        logger.info("Received acoustic file %s (%s bytes)", file.filename, len(audio_bytes))

        analyzer = get_analyzer()
        result = await run_in_threadpool(
            analyzer.analyze_audio_file,
            audio_bytes,
            file.filename,
            file.content_type,
        )

        analysis_id = str(uuid.uuid4())
        persistence_warning = None

        analysis_record = {
            "id": analysis_id,
            "hive_id": hive_id,
            "user_id": user_id,
            "model_type": "beesound-repo-v2",
            "status": "completed",
            "prediction": result["state"],
            "confidence": result["confidence"],
            "segments_analyzed": result.get("segments_analyzed", 0),
            "piping_detected": result.get("alert", False),
            "completed_at": datetime.utcnow().isoformat(),
        }

        try:
            await db_insert("acoustic_inferences", analysis_record, token=token)

            if hive_id and result["state"] != "Unknown":
                signal_metrics = result.get("signal_metrics", {})
                reading_data = {
                    "hive_id": hive_id,
                    "frequency_hz": signal_metrics.get("dominant_frequency_hz")
                    or result.get("details", {}).get(result["state"], {}).get("avg_confidence", 0) * 1000,
                    "amplitude_db": signal_metrics.get("rms_db", 58.0),
                    "health_index": result["confidence"],
                    "tags": [
                        result["state"],
                        "embedded-analysis",
                        f"segments-{result.get('segments_analyzed', 0)}",
                    ],
                }
                await db_insert("acoustic_readings", reading_data, token=token)
        except Exception as persistence_error:
            persistence_warning = "Analysis finished, but history persistence failed."
            logger.warning("Acoustic analysis persistence failed: %s", persistence_error)

        logger.info("Analysis complete: %s (%.1f%%)", result["state"], result["confidence"] * 100)

        return {
            "analysis_id": analysis_id,
            "hive_id": hive_id,
            "verdict": result["state"],
            "confidence": result["confidence"],
            "details": result.get("details", {}),
            "alert": result.get("alert", False),
            "alert_level": result.get("alert_level", "NORMAL"),
            "piping_segments": result.get("piping_segments", 0),
            "segments_analyzed": result.get("segments_analyzed", 0),
            "classification_breakdown": result.get("classification_breakdown", {}),
            "signal_metrics": result.get("signal_metrics", {}),
            "recommended_actions": result.get("recommended_actions", []),
            "hissing_detected": result.get("hissing_detected", False),
            "primary_species": result.get("primary_species"),
            "species_summary": result.get("species_summary", {}),
            "bee_coverage": result.get("bee_coverage"),
            "osbh_summary": result.get("osbh_summary", {}),
            "segment_timeline": result.get("segment_timeline", []),
            "model_inventory": result.get("model_inventory", {}),
            "persistence_warning": persistence_warning,
            "message": f"Colony Status: {result['state']}",
        }
    except Exception as e:
        logger.error("Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/inference/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_acoustic_inference(
    trigger: AcousticTrigger,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """
    Trigger acoustic inference from a downloadable audio URL.
    """
    user_id = current_user.get("sub")

    hives = await db_select("hives", filters={"id": trigger.hive_id}, token=token)
    if not hives:
        raise HTTPException(status_code=404, detail="Hive not found")

    job_id = str(uuid.uuid4())
    inference_record = {
        "id": job_id,
        "hive_id": trigger.hive_id,
        "user_id": user_id,
        "audio_url": trigger.audio_url,
        "model_type": trigger.model_type,
        "status": "downloading",
        "triggered_at": datetime.utcnow().isoformat(),
    }

    await db_insert("acoustic_inferences", inference_record, token=token)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(trigger.audio_url)
            response.raise_for_status()
            audio_bytes = response.content

        logger.info("Downloaded remote acoustic payload (%s bytes)", len(audio_bytes))
        await db_update("acoustic_inferences", {"status": "analyzing"}, {"id": job_id}, token=token)

        analyzer = get_analyzer()
        result = await run_in_threadpool(
            analyzer.analyze_audio_file,
            audio_bytes,
            trigger.audio_url,
            None,
        )

        await db_update(
            "acoustic_inferences",
            {
                "status": "completed",
                "prediction": result["state"],
                "confidence": result["confidence"],
                "segments_analyzed": result.get("segments_analyzed", 0),
                "piping_detected": result.get("alert", False),
                "completed_at": datetime.utcnow().isoformat(),
            },
            {"id": job_id},
            token=token,
        )

        signal_metrics = result.get("signal_metrics", {})
        reading_data = {
            "hive_id": trigger.hive_id,
            "frequency_hz": signal_metrics.get("dominant_frequency_hz")
            or result.get("details", {}).get(result["state"], {}).get("avg_confidence", 0) * 1000,
            "amplitude_db": signal_metrics.get("rms_db", 58.0),
            "health_index": result["confidence"],
            "tags": [result["state"], "url-analysis", trigger.model_type],
        }
        await db_insert("acoustic_readings", reading_data, token=token)

        return {
            "success": True,
            "job_id": job_id,
            "status": "completed",
            "verdict": result["state"],
            "confidence": result["confidence"],
            "alert_level": result.get("alert_level", "NORMAL"),
            "segments_analyzed": result.get("segments_analyzed", 0),
            "signal_metrics": result.get("signal_metrics", {}),
            "recommended_actions": result.get("recommended_actions", []),
            "primary_species": result.get("primary_species"),
            "bee_coverage": result.get("bee_coverage"),
            "osbh_summary": result.get("osbh_summary", {}),
            "model_inventory": result.get("model_inventory", {}),
            "message": f"Analysis complete: {result['state']}",
        }
    except Exception as e:
        logger.error("Analysis failed: %s", e)
        await db_update(
            "acoustic_inferences",
            {"status": "failed", "error": str(e)},
            {"id": job_id},
            token=token,
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inferences/{job_id}")
async def get_inference_status(
    job_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
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
        "completed_at": job.get("completed_at"),
    }
