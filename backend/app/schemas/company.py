"""
Company Schemas - About, Story, Team, Stats, Partners, FAQs
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ TEAM MEMBERS ============

class TeamMemberBase(BaseModel):
    name: str
    role: str
    department: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: Optional[str] = None
    is_leadership: bool = False


class TeamMemberCreate(TeamMemberBase):
    display_order: int = 0


class TeamMember(TeamMemberBase):
    id: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ COMPANY MILESTONES (Story) ============

class MilestoneBase(BaseModel):
    year: int
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    milestone_type: str = "general"


class MilestoneCreate(MilestoneBase):
    display_order: int = 0


class Milestone(MilestoneBase):
    id: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ COMPANY STATS ============

class CompanyStatBase(BaseModel):
    stat_key: str
    stat_value: str
    stat_label: str
    stat_description: Optional[str] = None
    icon: Optional[str] = None
    category: str = "impact"


class CompanyStatCreate(CompanyStatBase):
    display_order: int = 0


class CompanyStat(CompanyStatBase):
    id: str
    display_order: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ PARTNERS ============

class PartnerBase(BaseModel):
    name: str
    type: Optional[str] = "partner"
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None


class PartnerCreate(PartnerBase):
    display_order: int = 0
    is_active: bool = True


class Partner(PartnerBase):
    id: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ FAQs ============

class FAQBase(BaseModel):
    question: str
    answer: str
    category: Optional[str] = "General"


class FAQCreate(FAQBase):
    display_order: int = 0
    is_active: bool = True


class FAQ(FAQBase):
    id: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ COMPANY INFO ============

class CompanyInfo(BaseModel):
    name: str = "BeeYield"
    tagline: str = "From Hive to Table, Traced with Trust"
    mission: str = "Revolutionizing beekeeping through blockchain traceability and sustainable practices."
    vision: str = "To create a world where every drop of honey tells a story of ethical sourcing and environmental stewardship."
    founded_year: int = 2020
    headquarters: str = "Nairobi, Kenya"
    contact_email: str = "hello@beeyield.com"
    contact_phone: str = "+254 700 000 000"
    values: List[dict] = []
    social_links: dict = {
        "twitter": "https://twitter.com/beeyield",
        "linkedin": "https://linkedin.com/company/beeyield",
        "instagram": "https://instagram.com/beeyield",
        "facebook": "https://facebook.com/beeyield"
    }


# ============ STORY RESPONSE ============

class CompanyStory(BaseModel):
    title: str = "Our Story"
    intro: str
    milestones: List[Milestone] = []
    founders_message: Optional[str] = None


# ============ ABOUT PAGE RESPONSE ============

class AboutPageResponse(BaseModel):
    company_info: CompanyInfo
    story: CompanyStory
    stats: List[CompanyStat] = []
    leadership_team: List[TeamMember] = []
