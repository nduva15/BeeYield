"""
Jobs/Careers Schemas
"""
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, list
from datetime import date, datetime


# ============ JOB POSITIONS ============

class JobPositionBase(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    job_type: str = "full-time"  # full-time, part-time, contract, internship
    experience_level: Optional[str] = None
    description: Optional[str] = None
    requirements: list[str] = []
    benefits: list[str] = []
    salary_range: Optional[str] = None
    is_remote: bool = False


class JobPositionCreate(JobPositionBase):
    closes_at: Optional[datetime] = None


class JobPosition(JobPositionBase):
    id: str
    is_active: bool
    applications_count: int = 0
    posted_date: date
    closing_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============ JOB APPLICATIONS ============

class JobApplicationBase(BaseModel):
    job_id: str
    job_title: Optional[str] = None
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    resume_url: str
    cover_letter_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    years_experience: int = 0
    availability_date: Optional[date] = None
    notes: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplication(JobApplicationBase):
    id: str
    status: str = "pending"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ CAREERS PAGE RESPONSE ============

class CareersPageResponse(BaseModel):
    open_positions: list[JobPosition] = []
    total_positions: int = 0
    benefits_offered: list[str] = [
        "Competitive salary",
        "Health insurance",
        "Remote work options",
        "Professional development",
        "Equity participation"
    ]
    culture_highlights: list[str] = [
        "Mission-driven team",
        "Work-life balance",
        "Innovative environment",
        "Diverse & inclusive"
    ]
