from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class JobListingBase(BaseModel):
    title: str
    location: str
    type: str # Full-time, Contract
    department: Optional[str] = None
    description: str

class JobListing(JobListingBase):
    id: str
    slug: str
    is_active: bool
    posted_date: date
