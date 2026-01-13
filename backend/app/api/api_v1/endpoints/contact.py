import time
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.schemas import contact as schemas
from app.services import email
from app.db.supabase_db import db_insert, db_select

router = APIRouter()

# Simple in-memory rate limiter
# In production, use Redis or a proper library like slowapi
_rate_limit_store = {}

def check_rate_limit(client_ip: str, limit_seconds: int = 60):
    now = time.time()
    if client_ip in _rate_limit_store:
        last_request = _rate_limit_store[client_ip]
        if now - last_request < limit_seconds:
            return False
    _rate_limit_store[client_ip] = now
    return True

@router.post("/submit", response_model=dict)
def submit_contact_form(
    request_in: schemas.ContactSubmissionCreate, 
    background_tasks: BackgroundTasks,
    request: Request
):
    """
    Handle general contact forms (Grower, Beekeeper, General).
    """
    # 0. Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip, limit_seconds=10): # 10s cooldown
        raise HTTPException(status_code=429, detail="Too many submissions. Please wait a few seconds.")

    # 1. Prepare data for Database
    db_data = request_in.dict()
    
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
def request_pollination(
    request_in: schemas.PollinationRequestCreate, 
    background_tasks: BackgroundTasks,
    request: Request
):
    """
    Handle pollination service requests.
    """
    # 0. Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip, limit_seconds=15): # 15s cooldown
        raise HTTPException(status_code=429, detail="Too many submissions. Please wait.")

    # 1. Save to Database
    db_data = request_in.dict()
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

@router.post("/newsletter", response_model=dict)
def subscribe_newsletter(
    request_in: schemas.NewsletterSubscriptionCreate, 
    background_tasks: BackgroundTasks,
    request: Request
):
    """
    Handle newsletter subscriptions.
    """
    # 0. Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip + ":newsletter", limit_seconds=30): # 30s cooldown for newsletter
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    # 1. Check if already subscribed
    existing = db_select("newsletter_subscribers", filters={"email": request_in.email})
    if existing:
        return {"status": "success", "message": "Already subscribed"}

    # 2. Save to Database
    db_data = request_in.dict()
    result = db_insert("newsletter_subscribers", db_data)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"Database error: {result.get('error')}")
    
    # 3. Send Welcome Email
    background_tasks.add_task(
        email.send_email,
        request.email,
        "Welcome to the BeeYield Hive! 🐝",
        f"Hi {request.first_name or 'there'},\n\nThanks for subscribing to our newsletter! You'll now be the first to know about our latest updates, honey harvests, and pollination insights.\n\nStay buzzing,\nThe BeeYield Team"
    )
    
    return {"status": "success", "message": "Subscribed successfully"}
