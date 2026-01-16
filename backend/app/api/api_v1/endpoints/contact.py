import time
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.schemas import contact as schemas
from app.services import email
from app.db.supabase_db import get_supabase_admin, db_select

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
    Uses Service Role to write to Database (Secure Gate).
    """
    # 0. Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip, limit_seconds=10): # 10s cooldown
        raise HTTPException(status_code=429, detail="Too many submissions. Please wait a few seconds.")

    # 1. Prepare data for Database
    db_data = request_in.dict()
    
    # Construct derived fields (replicating frontend logic)
    db_data['name'] = f"{request_in.first_name} {request_in.last_name}"
    db_data['subject'] = f"{request_in.inquiry_type.upper()}: {request_in.topic}"
    # Use specific message or summary if empty (though logic suggests just using what's passed)
    if not db_data.get('message'):
        db_data['message'] = f"Type: {request_in.inquiry_type.upper()}\nTopic: {request_in.topic}"

    db_data['status'] = 'new'
    
    # Store form-specific fields in form_specific_data JSON field 
    # since they don't have their own columns in the table (if schema dictates)
    # BUT existing frontend code inserted them directly into columns like 'farm_name', 'crop_type'.
    # We will assume the columns exist based on frontend code.
    # The dictionary already contains them.
    
    # Clean up fields that might not be in DB columns if schema is strict
    # (FastAPI Pydantic dict includes all fields, if DB has extra columns fine, if missing columns error)
    # We'll trust the Pydantic model matches or DB tolerates extra inputs (ignoring them requires setting)
    # For now, we pass `db_data` which matches what frontend was sending mostly.

    # 2. Save to Database using Service Role
    supabase_admin = get_supabase_admin()
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Backend configuration error: Service Role missing")
        
    try:
        result = supabase_admin.table("contact_submissions").insert(db_data).execute()
        
        # 3. Send Notifications
        background_tasks.add_task(
            email.send_email,
            "info@beeyield.com",
            f"New {request_in.inquiry_type.capitalize()} Inquiry",
            f"From: {request_in.first_name} {request_in.last_name}\nEmail: {request_in.email}\nTopic: {request_in.topic}\nMessage: {request_in.message}"
        )
        
        background_tasks.add_task(
            email.send_email,
            request_in.email,
            "Inquiry Received - BeeYield",
            f"Hi {request_in.first_name}, thanks for contacting BeeYield. We will get back to you shortly regarding your {request_in.inquiry_type} inquiry."
        )
        
        return {"status": "success", "message": "Inquiry submitted successfully"}
        
    except Exception as e:
        print(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
    db_data['status'] = 'pending'
    
    supabase_admin = get_supabase_admin()
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Backend configuration error: Service Role missing")

    try:
        result = supabase_admin.table("pollination_requests").insert(db_data).execute()
        
        # 2. Send Notifications
        background_tasks.add_task(
            email.send_email,
            "pollination@beeyield.com",
            "New Pollination Request",
            f"Farm: {request_in.farm_name}, Acres: {request_in.acres}, Crop: {request_in.crop_type}\nContact: {request_in.full_name} ({request_in.email})"
        )
        
        background_tasks.add_task(
            email.send_email,
            request_in.email,
            "Pollination Request Received - BeeYield",
            f"Dear {request_in.full_name},\n\nWe have received your pollination request for {request_in.farm_name}. Our team will review the details and contact you shortly."
        )
        
        return {"status": "success", "message": "Pollination request submitted successfully"}
    except Exception as e:
        print(f"Error submitting pollination request: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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

    supabase_admin = get_supabase_admin()
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Backend configuration error: Service Role missing")

    try:
        # 1. Check if already subscribed
        # We use admin here too to ensure we can see it even if RLS blocks read
        existing = supabase_admin.table("newsletter_subscribers").select("id").eq("email", request_in.email).execute()
        if existing.data:
            return {"status": "success", "message": "Already subscribed"}

        # 2. Save to Database
        db_data = request_in.dict()
        result = supabase_admin.table("newsletter_subscribers").insert(db_data).execute()
        
        # 3. Send Welcome Email
        background_tasks.add_task(
            email.send_email,
            request_in.email,
            "Welcome to the BeeYield Hive! 🐝",
            f"Hi {request_in.first_name or 'there'},\n\nThanks for subscribing to our newsletter! You'll now be the first to know about our latest updates, honey harvests, and pollination insights.\n\nStay buzzing,\nThe BeeYield Team"
        )
        
        return {"status": "success", "message": "Subscribed successfully"}
    except Exception as e:
        print(f"Error subscribing to newsletter: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
