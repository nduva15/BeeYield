from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Request, Depends
from typing import Optional
from app.db.supabase_db import get_supabase, db_insert
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.post("/apply")
async def apply_for_job(
    job_id: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    resume: UploadFile = File(...),
    token: Optional[str] = Depends(get_token)
):
    """
    Handle job application submission: 
    1. Upload resume to Supabase Storage ('resumes' bucket)
    2. Create record in 'job_applications' table
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Database connection unavailable"
        )
    
    try:
        # 1. Read file content
        file_content = await resume.read()
        
        # 2. Construct file path
        # Logic: {job_id}/{email}_{filename}
        # Sanitize email slightly to avoid weird chars in path if needed, but path usually allows most.
        file_path = f"{job_id}/{email}_{resume.filename}"
        
        # 3. Upload to Supabase Storage
        # Note: 'resumes' bucket must exist and be set to Private.
        # The clean path logic requested: JUST the structure inside the bucket.
        try:
            supabase.storage.from_("resumes").upload(
                path=file_path, 
                file=file_content,
                file_options={"content-type": resume.content_type}
            )
        except Exception as e:
            # Check if error is "The resource already exists" or similar if trying to re-upload
            logger.error(f"Storage upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload resume: {str(e)}")

        # 4. Insert Application Record
        application_data = {
            "job_id": job_id,
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "linkedin_url": linkedin_url,
            "resume_url": file_path, # Store the internal path
            "status": "applied"
        }
        
        # Using db_insert helper or raw client? db_insert uses REST API.
        # Let's use the supabase client directly for consistency with storage if available,
        # but db_insert is imported from supabase_db. Let's use db_insert for the DB part.
        
        insert_res = await db_insert("job_applications", application_data, token=token)
        
        if not insert_res.get("success"):
            # If DB insert fails, we might want to clean up the file? 
            # For now, just error out.
            logger.error(f"DB insert failed: {insert_res.get('error')}")
            raise HTTPException(status_code=500, detail=f"Failed to save application: {insert_res.get('error')}")
            
        return {"message": "Application sent successfully!", "data": insert_res.get("data")}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
