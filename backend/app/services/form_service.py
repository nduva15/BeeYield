from typing import Dict, Any, Optional
from app.db.supabase_db import db_insert
from app.services.email import send_email

async def submit_contact_form(data: Dict[str, Any]):
    """Save contact submission and send notification"""
    # 1. Save to DB
    result = db_insert("contact_submissions", data)
    
    # 2. Send email notification (async)
    # await send_email(
    #     to_email="hello@beeyield.com",
    #     subject=f"New Inquiry: {data.get('topic', 'General')}",
    #     template="contact_notification",
    #     context=data
    # )
    
    return result

async def submit_pollination_request(data: Dict[str, Any]):
    """Save pollination request"""
    return db_insert("pollination_requests", data)

async def submit_job_application(data: Dict[str, Any]):
    """Save job application"""
    return db_insert("job_applications", data)

async def subscribe_newsletter(email: str):
    """Add email to newsletter list"""
    return db_insert("newsletter_subscribers", {"email": email})
