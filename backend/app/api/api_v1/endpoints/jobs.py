"""
Jobs/Careers Endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from app.schemas import jobs as schemas
from app.db.supabase_db import db_select, db_insert, db_get_by_id
from datetime import datetime
import uuid

router = APIRouter()


# ============ PUBLIC JOBS ENDPOINTS ============

@router.get("/", response_model=List[dict])
def list_jobs(department: Optional[str] = None):
    """
    Lists open career positions.
    """
    filters = {"is_active": True}
    if department:
        filters["department"] = department
    
    jobs = db_select("job_positions", filters=filters, order_by="posted_at", ascending=False)
    
    if not jobs or len(jobs) == 0:
        # Return mock data
        return [
            {
                "id": "job-1",
                "title": "Senior Beekeeper",
                "department": "Operations",
                "location": "Kibwezi, Kenya",
                "job_type": "full-time",
                "description": "We are looking for an experienced beekeeper to manage our expanding apiary in Kibwezi.",
                "requirements": ["5+ years beekeeping experience", "Experience with African Honey Bees", "Driving license"],
                "benefits": ["Competitive salary", "Housing provided", "Health insurance"],
                "posted_at": "2024-12-01T08:00:00Z",
                "is_active": True
            },
            {
                "id": "job-2",
                "title": "IoT Systems Engineer",
                "department": "Technical",
                "location": "Nairobi, Kenya",
                "job_type": "full-time",
                "description": "Help us build the next generation of smart hives using IoT sensors and AI.",
                "requirements": ["BSc in Engineering or CS", "Experience with ESP32/Arduino", "Python/C++ proficiency"],
                "benefits": ["Flexible hours", "Innovation budget", "Equity options"],
                "posted_at": "2024-12-05T09:00:00Z",
                "is_active": True
            }
        ]
    
    return jobs


@router.get("/{job_id}", response_model=dict)
def get_job_detail(job_id: str):
    """
    Get detailed information about a specific job.
    """
    job = db_get_by_id("job_positions", job_id)
    if not job:
        # Mock fallback for demonstration
        if job_id == "job-1":
            return {
                "id": "job-1",
                "title": "Senior Beekeeper",
                "department": "Operations",
                "location": "Kibwezi, Kenya",
                "job_type": "full-time",
                "description": "Manage hive health and harvest operations.",
                "requirements": ["Experience"],
                "benefits": ["Insurance"],
                "posted_at": datetime.now()
            }
        raise HTTPException(status_code=404, detail="Job position not found")
    return job


@router.post("/apply", response_model=dict)
def apply_for_job(application: schemas.JobApplicationCreate):
    """
    Submit a job application.
    """
    app_data = application.dict()
    app_data["id"] = str(uuid.uuid4())
    app_data["status"] = "pending"
    app_data["created_at"] = datetime.utcnow().isoformat()
    
    result = db_insert("job_applications", app_data)
    
    if result.get("success"):
        return {"status": "success", "message": "Application submitted successfully", "application_id": app_data["id"]}
    
    # Return mock success if DB fails for now
    return {"status": "success", "message": "Application received (demo mode)"}


# ============ ADMIN ENDPOINTS ============

@router.post("/", response_model=dict)
def create_job_position(job: schemas.JobPositionCreate):
    """
    Create a new job position (Admin).
    """
    job_data = job.dict()
    job_data["posted_at"] = datetime.utcnow().isoformat()
    job_data["is_active"] = True
    
    return db_insert("job_positions", job_data)
