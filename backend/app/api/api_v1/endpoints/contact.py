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
    Fallbacks to local file if DB is unreachable.
    """
    # 0. Rate Limiting (Skip in offline mode if needed, but keeping for safety)
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip, limit_seconds=5):
            raise HTTPException(status_code=429, detail="Too many submissions. Please wait a few seconds.")
    except:
        pass # Ignore rate limit errors if request object is weird

    # 1. Prepare data
    db_data = request_in.dict(exclude_unset=True)
    
    # Fill derived fields (avoid overwriting if already provided)
    if 'first_name' in db_data and 'last_name' in db_data:
        db_data.setdefault('name', f"{request_in.first_name} {request_in.last_name}")
    
    if 'inquiry_type' in db_data and 'topic' in db_data:
        db_data.setdefault('subject', f"{request_in.inquiry_type.upper()}: {request_in.topic}")

    db_data.setdefault('status', 'new')
    
    # 2. Try Database Save
    success = False
    try:
        db_client = get_db_client()
        if db_client:
            try:
                result = db_client.table("contact_submissions").insert(db_data).execute()
                success = True
                print(f"✅ DB Save Successful: {request_in.email}")
            except Exception as e:
                # Retry without derived fields if schema mismatch
                print(f"⚠️ DB Insert Error: {e}")
                if "column" in str(e).lower() and ("name" in str(e).lower() or "subject" in str(e).lower()):
                    temp_data = db_data.copy()
                    temp_data.pop('name', None)
                    temp_data.pop('subject', None)
                    result = db_client.table("contact_submissions").insert(temp_data).execute()
                    success = True
                    print(f"✅ DB Save Successful (retry without derived) for {request_in.email}")
                else:
                    raise e
        else:
            print("⚠️ No DB Client available for contact submission.")
    except Exception as e:
        print(f"⚠️ DB Connection/Save Failed: {e}. Switching to Offline Mode.")
    
    # 3. Fallback to Local File if DB failed
    if not success:
        try:
            import json
            import os
            from datetime import datetime
            
            # Use absolute path to ensure we can write it regardless of cwd
            # contact.py is in backend/app/api/api_v1/endpoints/ -> 5 levels up to project root
            current_path = os.path.abspath(__file__)
            project_root = current_path
            for _ in range(5):
                project_root = os.path.dirname(project_root)
            
            offline_file = os.path.join(project_root, "offline_submissions.json")
            
            print(f"ℹ️ Attempting offline save to {offline_file}")
            
            entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "contact_submission",
                "data": db_data
            }
            
            # Read existing
            existing_data = []
            if os.path.exists(offline_file):
                try:
                    with open(offline_file, "r") as f:
                        file_content = f.read().strip()
                        if file_content:
                            existing_data = json.loads(file_content)
                except Exception as read_err:
                    print(f"⚠️ Could not read existing offline file: {read_err}")
            
            existing_data.append(entry)
            
            # Write back
            with open(offline_file, "w") as f:
                json.dump(existing_data, f, indent=2)
            
            print(f"✅ Saved submission to {offline_file} (Offline Mode)")
            success = True
        except Exception as file_error:
            print(f"❌ Critical Error: Failed to save to file: {file_error}")
            # Even if file saving fails, if the DB succeeded we are fine (but success is False here)
            if not success:
                raise HTTPException(status_code=500, detail=f"Submission failed during database and offline fallback. Error: {str(file_error)}")

    # 4. Attempt Notifications (wrapped in try-except)
    try:
        background_tasks.add_task(
            email.send_email,
            "info@beeyield.com",
            f"New {request_in.inquiry_type.capitalize()} Inquiry",
            f"From: {request_in.first_name} {request_in.last_name}\nEmail: {request_in.email}\nTopic: {request_in.topic}\nMessage: {request_in.message or 'No message provided'}"
        )
    except Exception as t_err:
        print(f"⚠️ Notification task failed: {t_err}")

    return {"status": "success", "message": "Inquiry submitted successfully" + (" (Offline Mode)" if not success else "")}


@router.post("/pollination", response_model=dict)
def request_pollination(
    request_in: schemas.PollinationRequestCreate, 
    background_tasks: BackgroundTasks,
    request: Request
):
    """
    Handle pollination service requests.
    Fallbacks to local file if DB unreachable.
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip, limit_seconds=5):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    except:
        pass

    db_data = request_in.dict(exclude_unset=True)
    if 'status' not in db_data:
        db_data['status'] = 'pending'
    
    success = False
    try:
        db_client = get_db_client()
        if db_client:
            result = db_client.table("pollination_requests").insert(db_data).execute()
            success = True
    except Exception as e:
        print(f"⚠️ DB Connection Failed (Pollination): {e}")

    # 3. Fallback
    if not success:
        try:
            import json, os
            from datetime import datetime
            
            app_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            offline_file = os.path.join(app_dir, "offline_submissions.json")
            
            print(f"ℹ️ Attempting offline pollination save to {offline_file}")
            
            entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "pollination_request",
                "data": db_data
            }
            
            existing_data = []
            if os.path.exists(offline_file):
                try: 
                    with open(offline_file, "r") as f: 
                        content = f.read().strip()
                        if content:
                            existing_data = json.loads(content)
                except: pass
            
            existing_data.append(entry)
            with open(offline_file, "w") as f: json.dump(existing_data, f, indent=2)
            success = True
            print(f"✅ Saved pollination request to {offline_file} (Offline Mode)")
        except Exception as e:
             print(f"❌ Critical Error in Pollination Offline Save: {e}")
             raise HTTPException(status_code=500, detail=f"Submission failed. Error: {str(e)}")

    try:
        background_tasks.add_task(
            email.send_email,
            "pollination@beeyield.com",
            "New Pollination Request",
            f"Farm: {request_in.farm_name}, Acres: {request_in.acres}, Crop: {request_in.crop_type}\nContact: {request_in.full_name} ({request_in.email})"
        )
    except:
        pass
        
    return {"status": "success", "message": "Pollination request submitted successfully" + (" (Offline Mode)" if not success else "")}

@router.post("/newsletter", response_model=dict)
def subscribe_newsletter(
    request_in: schemas.NewsletterSubscriptionCreate, 
    background_tasks: BackgroundTasks,
    request: Request
):
    """
    Handle newsletter subscriptions.
    Fallbacks to local file if DB unreachable.
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit(client_ip + ":newsletter", limit_seconds=10): 
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again soon.")
    except:
        pass

    success = False
    db_data = request_in.dict(exclude_unset=True)

    try:
        db_client = get_db_client()
        if db_client:
            # Check exist
            try:
                existing = db_client.table("newsletter_subscribers").select("id").eq("email", request_in.email).execute()
                if existing.data:
                    return {"status": "success", "message": "Already subscribed"}
            except Exception as check_err: 
                print(f"⚠️ Newsletter dupe check failed: {check_err}")

            result = db_client.table("newsletter_subscribers").insert(db_data).execute()
            success = True
            print(f"✅ Newsletter Sub DB Successful: {request_in.email}")
    except Exception as e:
        print(f"⚠️ DB Connection Failed (Newsletter): {e}")

    # Fallback
    if not success:
        try:
            import json, os
            from datetime import datetime
            
            app_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            offline_file = os.path.join(app_dir, "offline_submissions.json")
            
            print(f"ℹ️ Attempting offline newsletter save to {offline_file}")
            
            entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "newsletter_subscription",
                "data": db_data
            }
            
            existing_data = []
            if os.path.exists(offline_file):
                try: 
                    with open(offline_file, "r") as f: 
                        content = f.read().strip()
                        if content:
                            existing_data = json.loads(content)
                except: pass
            
            # Check for dupes in offline file to avoid spamming file
            is_dupe = any(x.get('data', {}).get('email') == request_in.email and x.get('type') == 'newsletter_subscription' for x in existing_data)
            
            if not is_dupe:
                existing_data.append(entry)
                with open(offline_file, "w") as f: json.dump(existing_data, f, indent=2)
                print(f"✅ Saved newsletter sub to {offline_file} (Offline Mode)")
            else:
                print(f"ℹ️ Newsletter sub already in offline file: {request_in.email}")
            
            success = True
        except Exception as e:
             print(f"❌ Critical Error in Newsletter Offline Save: {e}")
             raise HTTPException(status_code=500, detail=f"Submission failed. Error: {str(e)}")
    
    try:
        # Wrap email in a try-except to ensure we return success if DB/Offline worked
        try:
            subject = "Welcome to the BeeYield Hive! 🐝"
            body = f"Hi {request_in.first_name or 'there'},\n\nThanks for subscribing to our newsletter! You'll now be the first to know about our latest updates, honey harvests, and pollination insights.\n\nStay buzzing,\nThe BeeYield Team"
            
            # Special content for starter guide download
            if request_in.source == 'starter_guide_download':
                subject = "Your Free Beekeeping Starter Guide 🐝"
                body = f"Hi {request_in.first_name or 'there'},\n\nThank you for requesting our Beekeeping Starter Guide! Attached (simulated) is your comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting.\n\nDownload Link: https://assets.beeyield.com/guides/beekeeping-starter-guide.pdf\n\nWe hope this helps you start your journey into sustainable beekeeping!\n\nStay buzzing,\nThe BeeYield Team"

            background_tasks.add_task(
                email.send_email,
                request_in.email,
                subject,
                body
            )
        except Exception as email_err:
            print(f"⚠️ Newsletter Email Notification failed (Non-critical): {email_err}")

        return {"status": "success", "message": "Subscribed successfully" + (" (Offline Mode)" if not success else "")}
    except Exception as e:
        print(f"❌ Critical error in newsletter subscription completion: {e}")
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")

