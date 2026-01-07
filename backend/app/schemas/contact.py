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
    topic: Optional[str] = None
    message: Optional[str] = None
    
    # Optional fields depending on type
    company: Optional[str] = None
    farm_name: Optional[str] = None
    crop_type: Optional[str] = None
    acres: Optional[int] = None
    apiary_name: Optional[str] = None
    hive_count: Optional[int] = None
    experience_years: Optional[str] = None
    
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
