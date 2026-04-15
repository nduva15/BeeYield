"""
Company Endpoints - Story, Team, Stats
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional
from app.schemas import company as schemas
from app.db.supabase_db import db_select, db_get_by_id

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# ============ COMPANY INFO ============

@router.get("/info", response_model=schemas.CompanyInfo)
async def company_info(token: Optional[str] = Depends(get_token)):
    """
    Returns general company info, values, and stats for the company story pages.
    """
    # Fetch values from DB
    db_values = await db_select("company_values", filters={"is_active": True}, order_by="display_order", token=token)
    values = [{"title": v["title"], "description": v["description"], "icon": v.get("icon", "Heart")} for v in db_values]
    
    if not values:
        values = [
            {"title": "Family-Powered", "description": "Founded by three siblings with a shared mission.", "icon": "Heart"},
            {"title": "Tech-Driven", "description": "Blockchain and IoT at the heart of our operations.", "icon": "Zap"},
            {"title": "Eco-Positive", "description": "We don't just harvest; we restore.", "icon": "Leaf"}
        ]

    return schemas.CompanyInfo(
        name="BeeYield",
        tagline="Your Partner in pollination",
        vision="BeeYield aims to be an ecosystem guardian, creating sustainable solutions that empower farmers and preserve global biodiversity.",
        founded_year=2020,
        headquarters="Kibwezi, Makueni, Kenya",
        contact_email="info@beeyield.com",
        contact_phone="+254 742004187",
        values=values,
        social_links={
            "twitter": "https://twitter.com/beeyield",
            "linkedin": "https://linkedin.com/company/beeyield",
            "instagram": "https://instagram.com/beeyield",
            "facebook": "https://facebook.com/beeyield"
        }
    )


# ============ TEAM ============

@router.get("/team", response_model=list[schemas.TeamMember])
async def team_members(token: Optional[str] = Depends(get_token)):
    """
    Returns all active team members.
    """
    # Try to get from database first
    db_members = await db_select("team_members", filters={"is_active": True}, order_by="display_order", token=token)
    
    if db_members and len(db_members) > 0:
        return db_members
    
    # Return default team data if DB empty
    return [
        { 
            "id": "team-1",
            "name": "Timothy Nduva", 
            "role": "CEO & Founder", 
            "bio": "Visionary leader driving BeeYield's mission to revolutionize pollination through technology.",
            "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
            "linkedin_url": "https://www.linkedin.com/in/timothynduva/",
            "is_leadership": True,
            "display_order": 1,
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z"
        },
        { 
            "id": "team-2",
            "name": "Carole Nduva", 
            "role": "Chief Growth Officer & Co-founder", 
            "bio": "Business Development lead, shaping partnerships and driving company growth.",
            "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            "linkedin_url": "#",
            "is_leadership": True,
            "display_order": 2,
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z"
        },
        { 
            "id": "team-3",
            "name": "Agatha Nduva", 
            "role": "Chief IT Head & Co-founder", 
            "bio": "Leading technology infrastructure and digital innovation at BeeYield.",
            "image_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
            "linkedin_url": "#",
            "is_leadership": True,
            "display_order": 3,
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]


@router.get("/team/{member_id}", response_model=schemas.TeamMember)
async def get_team_member(member_id: str, token: Optional[str] = Depends(get_token)):
    """
    Get a specific team member by ID.
    """
    member = await db_get_by_id("team_members", member_id, token=token)
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member


# ============ STORY / MILESTONES ============

@router.get("/story", response_model=schemas.CompanyStory)
async def get_company_story(token: Optional[str] = Depends(get_token)):
    """
    Get company story with milestones/timeline.
    """
    milestones = await db_select("company_milestones", filters={"is_active": True}, order_by="year", token=token)
    
    if not milestones or len(milestones) == 0:
        milestones = [
            {"id": "ms-1", "year": 2020, "title": "BeeYield Founded", "description": "Started with 4 hives in Kibwezi during the pandemic.", "milestone_type": "founding", "display_order": 1, "is_active": True, "created_at": "2024-01-01T00:00:00Z"},
            {"id": "ms-2", "year": 2021, "title": "First 50 Hives", "description": "Expanded to 50 hives and began serving local farmers.", "milestone_type": "growth", "display_order": 2, "is_active": True, "created_at": "2024-01-01T00:00:00Z"},
            {"id": "ms-3", "year": 2022, "title": "Blockchain Traceability", "description": "Launched blockchain-based honey traceability system.", "milestone_type": "technology", "display_order": 3, "is_active": True, "created_at": "2024-01-01T00:00:00Z"},
            {"id": "ms-4", "year": 2023, "title": "Pollination Services", "description": "Started precision pollination services for commercial farms.", "milestone_type": "expansion", "display_order": 4, "is_active": True, "created_at": "2024-01-01T00:00:00Z"},
            {"id": "ms-5", "year": 2024, "title": "184 Hives & Growing", "description": "Reached 184 hives and 5-acre fenced apiary.", "milestone_type": "milestone", "display_order": 5, "is_active": True, "created_at": "2024-01-01T00:00:00Z"}
        ]
    
    return schemas.CompanyStory(
        title="Our Story",
        intro="BeeYield was born from a family's shared vision in rural Kenya. What started as a pandemic-era project with just 4 hives has grown into a movement transforming how the world thinks about honey and beekeeping.",
        founders_message="We started BeeYield because we saw the potential to create real change - for bees, for beekeepers, and for consumers who care about where their food comes from.",
        milestones=milestones
    )


# ============ STATS ============

@router.get("/stats", response_model=list[schemas.CompanyStat])
async def get_company_stats(category: Optional[str] = None, token: Optional[str] = Depends(get_token)):
    """
    Get company statistics/impact numbers.
    """
    filters = {}
    if category:
        filters["category"] = category
    
    stats = await db_select("company_stats", filters=filters, order_by="display_order", token=token)
    
    if not stats or len(stats) == 0:
        return []
    
    return stats


# ============ COMPANY STORY PAGE (Combined) ============

@router.get("/ourstory", response_model=schemas.AboutPageResponse)
async def get_our_story_page(token: Optional[str] = Depends(get_token)):
    """
    Get complete company story page data including company info, story, stats, and leadership.
    """
    info = await company_info(token=token)
    story = await get_company_story(token=token)
    stats = await get_company_stats(token=token)
    team = await team_members(token=token)
    
    return schemas.AboutPageResponse(
        company_info=info,
        story=story,
        stats=stats,
        leadership_team=team
    )


# ============ PARTNERS ============

@router.get("/partners", response_model=list[schemas.Partner])
async def get_partners(token: Optional[str] = Depends(get_token)):
    """
    Get all active partners, certifications, and investors.
    """
    partners = await db_select("partners", filters={"is_active": True}, order_by="display_order", token=token)
    
    if not partners or len(partners) == 0:
        return [
            {
                "id": "partner-1", "name": "EcoCert", "type": "certification",
                "logo_url": "https://images.unsplash.com/photo-1563906267088-b029e7101114?w=200",
                "website_url": "#", "description": "Certified Organic",
                "display_order": 1, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "partner-2", "name": "Kenya Beekeepers Assoc", "type": "partner",
                "logo_url": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
                "website_url": "#", "description": "Strategic Partner",
                "display_order": 2, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    return partners


# ============ FAQs ============

@router.get("/faqs", response_model=list[schemas.FAQ])
async def get_faqs(category: Optional[str] = None, token: Optional[str] = Depends(get_token)):
    """
    Get Frequently Asked Questions.
    """
    filters = {"is_active": True}
    if category:
        filters["category"] = category
        
    faqs = await db_select("faqs", filters=filters, order_by="display_order", token=token)
    
    if not faqs or len(faqs) == 0:
        return [
            {
                "id": "faq-1", "question": "Is all honey organic?",
                "answer": "Yes, all our honey is sourced from certified organic apiaries.",
                "category": "Products", "display_order": 1, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "faq-2", "question": "How do I trace my honey?",
                "answer": "Scan the QR code on the jar or enter the batch code on our Traceability page.",
                "category": "Services", "display_order": 2, "is_active": True, "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    return faqs
