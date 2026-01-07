"""
Contact Endpoints
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas import contact as schemas
from app.services import email
from app.db.supabase_db import db_insert

router = APIRouter()

@router.post("/submit", response_model=dict)
def submit_contact_form(request: schemas.ContactSubmissionCreate, background_tasks: BackgroundTasks):
    """
    Handle general contact forms (Grower, Beekeeper, General).
    """
    # 1. Save to Database
    db_data = request.dict()
    result = db_insert("contact_submissions", db_data)
    
    # 2. Send Notifications
    background_tasks.add_task(
        email.send_email,
        "info@beeyield.com",
        f"New Inquiry: {request.inquiry_type}",
        f"From: {request.first_name} {request.last_name}\nEmail: {request.email}\nMessage: {request.message}"
    )
    
    background_tasks.add_task(
        email.send_email,
        request.email,
        "We received your inquiry",
        f"Hi {request.first_name}, thanks for contacting BeeYield. We will get back to you shortly."
    )
    
    return {"status": "success", "message": "Inquiry submitted successfully", "db_result": result}

@router.post("/pollination", response_model=dict)
def request_pollination(request: schemas.PollinationRequestCreate, background_tasks: BackgroundTasks):
    """
    Handle pollination service requests.
    """
    # 1. Save to Database
    db_data = request.dict()
    result = db_insert("pollination_requests", db_data)
    
    # 2. Send Notifications
    background_tasks.add_task(
        email.send_email,
        "pollination@beeyield.com",
        "New Pollination Request",
        f"Farm: {request.farm_name}, Acres: {request.acres}, Crop: {request.crop_type}"
    )
    
    return {"status": "success", "message": "Pollination request submitted successfully", "db_result": result}
