from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

class ContactSubmissionCreate(BaseModel):
    inquiry_type: str # grower, beekeeper, general
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str
    state: str
    country: str
    topic: Optional[str] = None
    message: Optional[str] = None
    
    # Optional fields depending on type
    company: Optional[str] = None
    farm_name: Optional[str] = None
    crop_type: Optional[str] = None
    acres: Optional[float] = None
    apiary_name: Optional[str] = None
    hive_count: Optional[int] = None
    experience_years: Optional[str] = None
    
    # Catch-all for form-specific data
    form_specific_data: Optional[dict] = None


class PollinationRequestCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    farm_name: str
    farm_location: str
    crop_type: str
    acres: float
    preferred_start_date: str # Date string
    additional_info: Optional[str] = None

class NewsletterSubscriptionCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    source: Optional[str] = "footer"


class ContactMessageCreate(BaseModel):
    """Schema for the dedicated contact_messages inbox (PRD Engagement Module)."""
    full_name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str


class ContactMessageUpdate(BaseModel):
    """Admin-only: update the status of a contact message."""
    status: Literal["new", "read", "replied", "archived"]
