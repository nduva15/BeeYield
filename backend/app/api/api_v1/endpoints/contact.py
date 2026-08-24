import time
import json
import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Depends
from app.schemas import contact as schemas
from app.services import email
from app.db.supabase_db import db_insert, db_select, db_update, db_upsert
from app.core.config import settings

router = APIRouter()

# Simple in-memory rate limiter
_rate_limit_store = {}

def check_rate_limit(client_ip: str, limit_seconds: int = 60):
    now = time.time()
    if client_ip in _rate_limit_store:
        last_request = _rate_limit_store[client_ip]
        if now - last_request < limit_seconds:
            return False
    _rate_limit_store[client_ip] = now
    return True

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

async def _save_offline(submission_type: str, data: dict):
    """Consistent offline fallback for all contact forms."""
    try:
        # Resolve project root (backend folder)
        current_path = os.path.abspath(__file__)
        # endpoints -> api_v1 -> api -> app -> backend
        project_root = current_path
        for _ in range(5):
            project_root = os.path.dirname(project_root)
        
        offline_file = os.path.join(project_root, "offline_submissions.json")
        if not os.access(project_root, os.W_OK):
            import tempfile
            offline_file = os.path.join(tempfile.gettempdir(), "beeyield_offline_submissions.json")
        print(f"[INFO] Attempting offline save for {submission_type} to {offline_file}")
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": submission_type,
            "data": data
        }
        
        existing_data = []
        if os.path.exists(offline_file):
            try:
                with open(offline_file, "r") as f:
                    content = f.read().strip()
                    if content:
                        existing_data = json.loads(content)
            except Exception as e:
                print(f"[WARNING] Could not read existing offline file: {e}")
        
        # Avoid exact duplicates for newsletter
        if submission_type == "newsletter_subscription":
            if any(x.get('data', {}).get('email') == data.get('email') and x.get('type') == 'newsletter_subscription' for x in existing_data):
                print(f"[INFO] Newsletter sub already in offline file: {data.get('email')}")
                return True
 
        existing_data.append(entry)
        with open(offline_file, "w") as f:
            json.dump(existing_data, f, indent=2)
        
        print(f"[SUCCESS] Saved {submission_type} to offline file.")
        return True
    except Exception as e:
        print(f"[ERROR] Critical Error in offline save: {e}")
        return False


def _public_form_db_token(token: Optional[str] = None) -> Optional[str]:
    """Prefer the server-side service role for public forms so RLS does not block website submissions."""
    return settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY or token


@router.post("/submit", response_model=dict)
async def submit_contact_form(
    request_in: schemas.ContactSubmissionCreate, 
    background_tasks: BackgroundTasks,
    request: Request,
    token: Optional[str] = Depends(get_token)
):
    """
    Handle general contact forms (Grower, Beekeeper, General).
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip, limit_seconds=5):
            raise HTTPException(status_code=429, detail="Too many submissions. Please wait a few seconds.")
    except HTTPException:
        raise
    except Exception:
        pass

    db_data = request_in.dict(exclude_unset=True)
    if 'first_name' in db_data and 'last_name' in db_data:
        db_data.setdefault('name', f"{request_in.first_name} {request_in.last_name}")
    if 'inquiry_type' in db_data and 'topic' in db_data:
        db_data.setdefault('subject', f"{request_in.inquiry_type.upper()}: {request_in.topic}")
    db_data.setdefault('status', 'new')
    
    success = False
    try:
        result = await db_insert("contact_submissions", db_data, token=_public_form_db_token(token))
        if result.get("success"):
            success = True
            print(f"[SUCCESS] DB Save Successful: {request_in.email}")
        else:
            print(f"[WARNING] DB Insert Error: {result.get('error')}")
    except Exception as e:
        print(f"[WARNING] DB Connection Failed: {e}")
    
    if not success:
        success = await _save_offline("contact_submission", db_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save submission.")

    try:
        background_tasks.add_task(
            email.send_email,
            "info@beeyield.com",
            f"New {request_in.inquiry_type.capitalize()} Inquiry",
            f"From: {request_in.first_name} {request_in.last_name}\nEmail: {request_in.email}\nTopic: {request_in.topic}\nMessage: {request_in.message or 'No message provided'}"
        )
    except Exception:
        pass

    return {"status": "success", "message": "Thank you for contacting us! We've received your inquiry and will get back to you shortly."}


@router.post("/pollination", response_model=dict)
async def request_pollination(
    request_in: schemas.PollinationRequestCreate, 
    background_tasks: BackgroundTasks,
    request: Request,
    token: Optional[str] = Depends(get_token)
):
    """
    Handle pollination service requests.
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip, limit_seconds=5):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except HTTPException:
        raise
    except Exception:
        pass

    db_data = request_in.dict(exclude_unset=True)
    db_data.setdefault('status', 'pending')
    
    success = False
    try:
        result = await db_insert("pollination_requests", db_data, token=_public_form_db_token(token))
        if result.get("success"):
            success = True
            print(f"[SUCCESS] Pollination request saved: {request_in.email}")
    except Exception as e:
        print(f"[WARNING] DB Connection Failed (Pollination): {e}")

    if not success:
        success = await _save_offline("pollination_request", db_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save pollination request.")

    try:
        background_tasks.add_task(
            email.send_email,
            "pollination@beeyield.com",
            "New Pollination Request",
            f"Farm: {request_in.farm_name}, Acres: {request_in.acres}, Crop: {request_in.crop_type}\nContact: {request_in.full_name} ({request_in.email})"
        )
    except Exception:
        pass
        
    return {"status": "success", "message": "Thank you for your interest in our pollination services! We've received your request and will contact you shortly to discuss your needs."}

@router.post("/message", response_model=dict)
async def submit_contact_message(
    request_in: schemas.ContactMessageCreate,
    request: Request,
    token: Optional[str] = Depends(get_token)
):
    """
    Public endpoint: submit a message to the contact_messages inbox.
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip + ":contact_msg", limit_seconds=10):
            raise HTTPException(status_code=429, detail="Too many messages. Please wait before sending another.")
    except HTTPException:
        raise
    except Exception:
        pass

    payload = {
        "full_name": request_in.full_name,
        "email": request_in.email,
        "subject": request_in.subject,
        "message": request_in.message,
        "status": "new"
    }

    success = False
    try:
        result = await db_insert("contact_messages", payload, token=_public_form_db_token(token))
        if result.get("success"):
            success = True
            print(f"[SUCCESS] Contact message saved: {request_in.email}")
        else:
            print(f"[WARNING] Contact message insert error: {result.get('error')}")
    except Exception as e:
        print(f"[WARNING] Contact message DB error: {e}")

    if not success:
        success = await _save_offline("contact_message", payload)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send message.")

    return {"status": "success", "message": "Message sent! We will get back to you shortly."}


@router.get("/messages", response_model=list)
async def get_contact_messages(
    status: str = None,
    limit: int = 50,
    token: Optional[str] = Depends(get_token)
):
    """
    Admin endpoint: retrieve contact messages.
    """
    filters = {}
    if status:
        filters["status"] = status

    try:
        messages = await db_select(
            "contact_messages",
            filters=filters if filters else None,
            limit=limit,
            order_by="created_at",
            ascending=False,
            token=token
        )
        return messages
    except Exception as e:
        print(f"[WARNING] Error fetching contact messages: {e}")
        return [] # Return empty list on failure instead of 500


@router.patch("/messages/{message_id}/status", response_model=dict)
async def update_message_status(
    message_id: str,
    request_in: schemas.ContactMessageUpdate,
    token: Optional[str] = Depends(get_token)
):
    """
    Admin endpoint: update a contact message's status.
    """
    try:
        result = await db_update(
            "contact_messages",
            {"status": request_in.status},
            {"id": message_id},
            token=token
        )
        if result.get("success"):
            return {"status": "success", "message": f"Message marked as '{request_in.status}'."}
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Update failed"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/newsletter", response_model=dict)
async def subscribe_newsletter(
    request_in: schemas.NewsletterSubscriptionCreate, 
    background_tasks: BackgroundTasks,
    request: Request,
    token: Optional[str] = Depends(get_token)
):
    """
    Handle newsletter subscriptions.
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip + ":newsletter", limit_seconds=10): 
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again soon.")
    except HTTPException:
        raise
    except Exception:
        pass

    db_data = request_in.dict(exclude_unset=True)

    try:
        result = await db_upsert(
            "newsletter_subscribers",
            db_data,
            on_conflict="email",
            merge_duplicates=False,
            token=_public_form_db_token(token),
        )
        if not result.get("success"):
            print(f"[WARNING] Newsletter DB Upsert failed: {result.get('error')}")
            raise RuntimeError(result.get("error", "newsletter upsert failed"))
        if not result.get("data"):
            return {"status": "success", "message": "You're already subscribed! Check your inbox for our latest updates."}
        print(f"[SUCCESS] Newsletter Sub DB Successful: {request_in.email}")
    except Exception as e:
        print(f"[WARNING] DB Connection Failed (Newsletter): {e}")
        success = await _save_offline("newsletter_subscription", db_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to subscribe.")

    # Notifications
    try:
        subject = "Welcome to the BeeYield Hive! 🐝"
        body = f"Hi {request_in.first_name or 'there'},\n\nThanks for subscribing to our newsletter! You'll now be the first to know about our latest updates, honey harvests, and pollination insights.\n\nStay buzzing,\nThe BeeYield Team"
        
        if request_in.source == 'starter_guide_download':
            subject = "Your Free Beekeeping Starter Guide 🐝"
            body = f"Hi {request_in.first_name or 'there'},\n\nThank you for requesting our Beekeeping Starter Guide! Attached (simulated) is your comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting.\n\nDownload Link: https://assets.beeyield.com/guides/beekeeping-starter-guide.pdf\n\nStay buzzing,\nThe BeeYield Team"

        background_tasks.add_task(
            email.send_email,
            request_in.email,
            subject,
            body
        )
    except Exception as email_err:
        print(f"[WARNING] Newsletter Email Notification failed: {email_err}")

    if request_in.source == 'starter_guide_download':
        return {"status": "success", "message": "Success! Check your email for the Beekeeping Starter Guide."}
    else:
        return {"status": "success", "message": "Welcome to BeeYield! You're now subscribed to our newsletter."}


