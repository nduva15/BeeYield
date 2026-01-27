"""
Careers Endpoints - Connected to Supabase
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import list, Optional
from datetime import date
from app.schemas import careers as schemas
from app.db.supabase_db import db_select, db_insert, get_supabase
from app.services import email

router = APIRouter()


@router.get("/", response_model=list[schemas.Joblisting])
def get_job_listings():
    """
    Get all active job listings from database.
    """
    jobs = db_select("job_listings", filters={"is_active": True}, order_by="posted_date", ascending=False)
    
    # If no jobs in DB, return fallback mock data
    if not jobs:
        return [
            {
                "id": "job-1",
                "title": "Senior Agronomist",
                "slug": "senior-agronomist",
                "department": "Agriculture",
                "location": "Nairobi, Kenya",
                "job_type": "Full-time",
                "description": "Lead our agricultural research and pollination optimization programs.",
                "requirements": ["MSc in Agronomy", "5+ years experience"],
                "benefits": ["Health insurance", "Performance bonus"],
                "salary_range": "KES 150,000 - 250,000/month",
                "is_active": True,
                "posted_date": date.today()
            },
            {
                "id": "job-2",
                "title": "Field Operations Manager",
                "slug": "field-operations-manager",
                "department": "Operations",
                "location": "Rift Valley, Kenya",
                "job_type": "Full-time",
                "description": "Manage hive deployment and pollination services.",
                "requirements": ["Bachelor's degree", "3+ years in operations"],
                "benefits": ["Health insurance", "Company vehicle"],
                "salary_range": "KES 100,000 - 150,000/month",
                "is_active": True,
                "posted_date": date.today()
            },
            {
                "id": "job-3",
                "title": "Data Scientist",
                "slug": "data-scientist",
                "department": "Technology",
                "location": "Remote (Kenya)",
                "job_type": "Full-time",
                "description": "Build ML models for pollination optimization.",
                "requirements": ["MSc in Data Science", "Python experience"],
                "benefits": ["Remote work", "Stock options"],
                "salary_range": "KES 200,000 - 350,000/month",
                "is_active": True,
                "posted_date": date.today()
            },
            {
                "id": "job-4",
                "title": "Beekeeping Specialist",
                "slug": "beekeeping-specialist",
                "department": "Operations",
                "location": "Mount Kenya Region",
                "job_type": "Contract",
                "description": "Expert guidance on hive management.",
                "requirements": ["5+ years experience", "Training certification"],
                "benefits": ["Competitive daily rate", "Equipment provided"],
                "salary_range": "KES 2,500 - 4,000/day",
                "is_active": True,
                "posted_date": date.today()
            },
            {
                "id": "job-5",
                "title": "Customer Success Manager",
                "slug": "customer-success-manager",
                "department": "Sales",
                "location": "Nairobi, Kenya",
                "job_type": "Full-time",
                "description": "Build lasting relationships with grower clients.",
                "requirements": ["Bachelor's degree", "3+ years in customer success"],
                "benefits": ["Health insurance", "Performance commission"],
                "salary_range": "KES 80,000 - 120,000/month",
                "is_active": True,
                "posted_date": date.today()
            }
        ]
    
    return jobs


@router.get("/{slug}", response_model=schemas.Joblisting)
def get_job_by_slug(slug: str):
    """
    Get a single job listing by slug.
    """
    jobs = db_select("job_listings", filters={"slug": slug, "is_active": True}, limit=1)
    
    if not jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[0]


@router.post("/apply", response_model=dict)
async def apply_for_job(
    background_tasks: BackgroundTasks,
    job_id: str = Form(...),
    full_name: str = Form(...),
    email_address: str = Form(...),
    phone: str = Form(None),
    cover_letter: str = Form(None),
    linkedin_url: str = Form(None),
    portfolio_url: str = Form(None),
    experience_years: int = Form(None),
    resume: UploadFile = File(None)
):
    """
    Submit a job application with optional resume upload.
    """
    resume_url = None
    
    # Upload resume to Supabase Storage if provided
    if resume:
        try:
            supabase = get_supabase()
            if supabase:
                file_ext = resume.filename.split(".")[-1] if resume.filename else "pdf"
                file_name = f"{job_id}_{full_name.replace(' ', '_')}_{date.today().isoformat()}.{file_ext}"
                
                contents = await resume.read()
                result = supabase.storage.from_("resumes").upload(file_name, contents)
                
                # Get public URL
                resume_url = supabase.storage.from_("resumes").get_public_url(file_name)
        except Exception as e:
            print(f"Resume upload error: {e}")
    
    # Save application to database
    application_data = {
        "job_id": job_id,
        "full_name": full_name,
        "email": email_address,
        "phone": phone,
        "resume_url": resume_url,
        "cover_letter": cover_letter,
        "linkedin_url": linkedin_url,
        "portfolio_url": portfolio_url,
        "experience_years": experience_years,
        "status": "new"
    }
    
    result = db_insert("job_applications", application_data)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"Database error: {result.get('error')}")
    
    # Send notification emails
    background_tasks.add_task(
        email.send_email,
        "careers@beeyield.com",
        f"New Job Application: {full_name}",
        f"New application received for job ID: {job_id}\n\nApplicant: {full_name}\nEmail: {email_address}\nPhone: {phone}"
    )
    
    # Send confirmation to applicant
    background_tasks.add_task(
        email.send_email,
        email_address,
        "Application Received - BeeYield Careers",
        f"Dear {full_name},\n\nThank you for applying to BeeYield! We have received your application and will review it shortly.\n\nBest regards,\nBeeYield Talent Team"
    )
    
    return {
        "status": "success",
        "message": "Application submitted successfully",
        "application_id": result.get("data", [{}])[0].get("id") if result.get("data") else None
    }

