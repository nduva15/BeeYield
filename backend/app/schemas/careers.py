"""
Careers / Jobs Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, list
from datetime import date


class JoblistingBase(BaseModel):
    title: str
    slug: str
    department: Optional[str] = None
    location: str
    job_type: str  # Full-time, Part-time, Contract, Internship
    description: Optional[str] = None


class JoblistingCreate(JoblistingBase):
    requirements: list[str] = []
    benefits: list[str] = []
    salary_range: Optional[str] = None
    closing_date: Optional[date] = None


class Joblisting(JoblistingBase):
    id: str
    requirements: list[str] = []
    benefits: list[str] = []
    salary_range: Optional[str] = None
    is_active: bool = True
    posted_date: date
    closing_date: Optional[date] = None

    class Config:
        from_attributes = True


class JobApplicationCreate(BaseModel):
    job_id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    experience_years: Optional[int] = None


class JobApplication(JobApplicationCreate):
    id: str
    status: str = "new"
    notes: Optional[str] = None

    class Config:
        from_attributes = True
