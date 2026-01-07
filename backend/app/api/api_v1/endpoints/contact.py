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
    # 1. Prepare data for Database
    db_data = request.dict()
    
    # Store form-specific fields in form_specific_data JSON field 
    # since they don't have their own columns in the table
    form_data = {}
    specific_fields = ['farm_name', 'crop_type', 'acres', 'apiary_name', 'hive_count', 'experience_years']
    
    for field in specific_fields:
        if db_data.get(field) is not None:
            form_data[field] = db_data.pop(field)
    
    if form_data:
        if db_data.get('form_specific_data'):
            db_data['form_specific_data'].update(form_data)
        else:
            db_data['form_specific_data'] = form_data

    # 2. Save to Database
    result = db_insert("contact_submissions", db_data)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"Database error: {result.get('error')}")
    
    # 3. Send Notifications
    background_tasks.add_task(
        email.send_email,
        "info@beeyield.com",
        f"New {request.inquiry_type.capitalize()} Inquiry",
        f"From: {request.first_name} {request.last_name}\nEmail: {request.email}\nTopic: {request.topic}\nMessage: {request.message}"
    )
    
    background_tasks.add_task(
        email.send_email,
        request.email,
        "Inquiry Received - BeeYield",
        f"Hi {request.first_name}, thanks for contacting BeeYield. We will get back to you shortly regarding your {request.inquiry_type} inquiry."
    )
    
    return {"status": "success", "message": "Inquiry submitted successfully"}


@router.post("/pollination", response_model=dict)
def request_pollination(request: schemas.PollinationRequestCreate, background_tasks: BackgroundTasks):
    """
    Handle pollination service requests.
    """
    # 1. Save to Database
    db_data = request.dict()
    result = db_insert("pollination_requests", db_data)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"Database error: {result.get('error')}")
    
    # 2. Send Notifications
    background_tasks.add_task(
        email.send_email,
        "pollination@beeyield.com",
        "New Pollination Request",
        f"Farm: {request.farm_name}, Acres: {request.acres}, Crop: {request.crop_type}\nContact: {request.full_name} ({request.email})"
    )
    
    background_tasks.add_task(
        email.send_email,
        request.email,
        "Pollination Request Received - BeeYield",
        f"Dear {request.full_name},\n\nWe have received your pollination request for {request.farm_name}. Our team will review the details and contact you shortly."
    )
    
    return {"status": "success", "message": "Pollination request submitted successfully"}
