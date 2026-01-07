from pydantic import BaseModel, EmailStr
from typing import Optional, Dict

class ContactSubmissionCreate(BaseModel):
    inquiry_type: str # grower, beekeeper, general
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str
    state: str
    country: str
    
    # Optional fields depending on type
    company: Optional[str] = None
    topic: str
    message: Optional[str] = None
    
    # Catch-all for form-specific data
    form_specific_data: Optional[Dict] = None

class PollinationRequestCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    farm_name: str
    farm_location: str
    crop_type: str
    acres: int
    preferred_start_date: str # Date string
    additional_info: Optional[str] = None
