"""
Forms Endpoints - Careers, Newsletter, Donations
"""
from fastapi import APIRouter, BackgroundTasks, Request, Depends
from typing import Optional
from app.schemas import forms as schemas
from app.services import email
from app.db.supabase_db import db_insert, db_upsert

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.post("/careers/apply", response_model=dict)
async def apply_for_job(application: schemas.JobApplicationCreate, background_tasks: BackgroundTasks, token: Optional[str] = Depends(get_token)):
    """
    Submit a job application.
    """
    # 1. Save to Database
    result = await db_insert("job_applications", application.dict(), token=token)
    
    # 2. Email Notification to HR
    background_tasks.add_task(
        email.send_email,
        "careers@beeyield.com",
        f"New Job Application: {application.job_position}",
        f"Applicant: {application.full_name}\nExperience: {application.years_experience} years"
    )
    
    return {"status": "success", "message": "Application received successfully", "db_result": result}

@router.post("/newsletter/subscribe", response_model=dict)
async def subscribe_newsletter(sub: schemas.NewsletterSubscribe, token: Optional[str] = Depends(get_token)):
    """
    Subscribe to the newsletter.
    """
    # 1. Save to Database
    result = await db_upsert("newsletter_subscribers", sub.dict(), on_conflict='email', token=token)
    
    return {"status": "success", "message": "Subscribed successfully", "db_result": result}

@router.post("/donate", response_model=dict)
async def process_donation(donation: schemas.DonationCreate, background_tasks: BackgroundTasks, token: Optional[str] = Depends(get_token)):
    """
    Process a donation pledge.
    """
    # 1. Save to Database
    result = await db_insert("donations", donation.dict(), token=token)
    
    # 2. Thank you email
    background_tasks.add_task(
        email.send_email,
        donation.donor_email,
        "Thank you for your support!",
        f"Hi {donation.donor_name}, thank you for your generous donation of ${donation.amount_usd}."
    )
    
    return {"status": "success", "message": "Donation recorded successfully", "db_result": result}
