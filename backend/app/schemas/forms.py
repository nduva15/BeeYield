from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from datetime import date

class JobApplicationCreate(BaseModel):
    job_position: str
    full_name: str
    email: EmailStr
    phone: str
    resume_url: HttpUrl
    cover_letter_url: Optional[HttpUrl] = None
    linkedin_profile: Optional[HttpUrl] = None
    years_experience: int
    availability_date: date
    notes: Optional[str] = None

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    source: str = "website_footer" 

class DonationCreate(BaseModel):
    donor_name: str
    donor_email: EmailStr
    amount_usd: float
    donation_type: str # onetime, monthly
    tier: str # basic, patron
    payment_method: str # stripe, mpesa
    subscribe_to_updates: bool = True
