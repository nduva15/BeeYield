import time
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.schemas import contact as schemas
from app.services import email
from app.db.supabase_db import get_supabase_admin, get_supabase, db_select

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

def get_db_client():
    """Get a working Supabase client - prefer admin, fallback to anon."""
    admin = get_supabase_admin()
    if admin:
        return admin
    # Fallback to regular client (works with RLS policies allowing public inserts)
    anon = get_supabase()
    if anon:
        return anon
    return None

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
    if not check_rate_limit(client_ip, limit_seconds=5): # Reduced to 5s cooldown
        raise HTTPException(status_code=429, detail="Too many submissions. Please wait a few seconds.")

    # 1. Prepare data for Database
    # We create a clean dict and only add fields that are in the schema
    db_data = request_in.dict(exclude_unset=True)
    
    # Optional: Fill in 'name' and 'subject' for legacy schemas
    # We add them only if they are not already there
    if 'first_name' in db_data and 'last_name' in db_data and 'name' not in db_data:
        db_data['name'] = f"{request_in.first_name} {request_in.last_name}"
    
    if 'inquiry_type' in db_data and 'topic' in db_data and 'subject' not in db_data:
        db_data['subject'] = f"{request_in.inquiry_type.upper()}: {request_in.topic}"

    if 'status' not in db_data:
        db_data['status'] = 'new'
    
    # 2. Save to Database (prefer admin, fallback to anon)
    db_client = get_db_client()
    if not db_client:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        # We try to insert. If it fails due to extra columns (name/subject), we retry without them.
        try:
            result = db_client.table("contact_submissions").insert(db_data).execute()
        except Exception as e:
            if "column" in str(e).lower() and ("name" in str(e).lower() or "subject" in str(e).lower()):
                # Retry without derived fields if they caused the error
                db_data.pop('name', None)
                db_data.pop('subject', None)
                result = db_client.table("contact_submissions").insert(db_data).execute()
            else:
                raise e
        
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
        # Return a more descriptive error for the frontend to log
        raise HTTPException(status_code=500, detail=f"Database submission failed: {str(e)}")


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
    if not check_rate_limit(client_ip, limit_seconds=5): # Reduced to 5s cooldown
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")

    # 1. Save to Database
    db_data = request_in.dict(exclude_unset=True)
    if 'status' not in db_data:
        db_data['status'] = 'pending'
    
    db_client = get_db_client()
    if not db_client:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    try:
        result = db_client.table("pollination_requests").insert(db_data).execute()
        
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
    # Reduced rate limit for newsletter to 10s
    if not check_rate_limit(client_ip + ":newsletter", limit_seconds=10): 
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again soon.")

    db_client = get_db_client()
    if not db_client:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    try:
        # 1. Check if already subscribed
        try:
            existing = db_client.table("newsletter_subscribers").select("id").eq("email", request_in.email).execute()
            if existing.data:
                return {"status": "success", "message": "Already subscribed"}
        except Exception as select_error:
            # If table doesn't exist or other error, log it but proceed to insert (it will fail there if table missing)
            print(f"Newsletter select check error: {select_error}")

        # 2. Save to Database
        db_data = request_in.dict(exclude_unset=True)
        result = db_client.table("newsletter_subscribers").insert(db_data).execute()
        
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

