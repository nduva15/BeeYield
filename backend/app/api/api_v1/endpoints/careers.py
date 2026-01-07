from fastapi import APIRouter
from typing import List
from app.schemas import careers as schemas
from datetime import date

router = APIRouter()

@router.get("/", response_model=List[schemas.JobListing])
def get_job_listings():
    """
    Get all open job listings.
    """
    # Mock data based on frontend content
    return [
        {
            "id": "job-1",
            "title": "Senior Agronomist",
            "slug": "senior-agronomist",
            "location": "Nairobi, Kenya",
            "type": "Full-time",
            "description": "...",
            "is_active": True,
            "posted_date": date.today()
        },
        {
            "id": "job-2",
            "title": "Field Operations Manager",
            "slug": "field-operations-manager",
            "location": "Rift Valley, Kenya",
            "type": "Full-time",
            "description": "...",
            "is_active": True,
            "posted_date": date.today()
        },
        {
            "id": "job-3",
            "title": "Data Scientist (Remote)",
            "slug": "data-scientist",
            "location": "Kenya (Remote)",
            "type": "Full-time",
            "description": "...",
            "is_active": True,
            "posted_date": date.today()
        },
        {
            "id": "job-4",
            "title": "Beekeeping Specialist",
            "slug": "beekeeping-specialist",
            "location": "Mount Kenya Region",
            "type": "Contract",
            "description": "...",
            "is_active": True,
            "posted_date": date.today()
        },
        {
            "id": "job-5",
            "title": "Customer Success Manager",
            "slug": "customer-success-manager",
            "location": "Nairobi, Kenya",
            "type": "Full-time",
            "description": "...",
            "is_active": True,
            "posted_date": date.today()
        }
    ]
