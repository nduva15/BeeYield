
"""
Company Endpoints - About, Story, Team, Stats
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas import company as schemas
from app.db.supabase_db import db_select, db_insert, db_get_by_id

router = APIRouter()


# ============ COMPANY INFO ============

@router.get("/info", response_model=schemas.CompanyInfo)
def company_info():
    """
    Returns general company info, values, and stats for the About Us page.
    """
    # Fetch values from DB
    db_values = db_select("company_values", filters={"is_active": True}, order_by="display_order")
    values = [{"title": v["title"], "description": v["description"], "icon": v.get("icon", "Heart")} for v in db_values]
    
    if not values:
        values = [
            {"title": "Family-Powered", "description": "Founded by three siblings with a shared mission.", "icon": "Heart"},
            {"title": "Tech-Driven", "description": "Blockchain and IoT at the heart of our operations.", "icon": "Zap"},
            {"title": "Eco-Positive", "description": "We don't just harvest; we restore.", "icon": "Leaf"}
        ]

    return schemas.CompanyInfo(
        name="BeeYield",
        tagline="From Hive to Table, Traced with Trust",
        mission="Revolutionizing beekeeping through blockchain traceability and sustainable practices.",
        vision="To create a world where every drop of honey tells a story of ethical sourcing and environmental stewardship.",
        founded_year=2020,
        headquarters="Kibwezi, Makueni, Kenya",
        contact_email="hello@beeyield.com",
        contact_phone="+254 700 000 000",
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
def team_members():
    """
    Returns all active team members.
    """
    # Try to get from database first
    db_members = db_select("team_members", filters={"is_active": True}, order_by="display_order")
    
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
def get_team_member(member_id: str):
    """
    Get a specific team member by ID.
    """
    member = db_get_by_id("team_members", member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member


# ============ STORY / MILESTONES ============

@router.get("/story", response_model=schemas.CompanyStory)
def get_company_story():
    """
    Get company story with milestones/timeline.
    """
    milestones = db_select("company_milestones", filters={"is_active": True}, order_by="year")
    
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
def get_company_stats(category: Optional[str] = None):
    """
    Get company statistics/impact numbers.
    """
    filters = {}
    if category:
        filters["category"] = category
    
    stats = db_select("company_stats", filters=filters, order_by="display_order")
    
    if not stats or len(stats) == 0:
        return [
            {"id": "stat-1", "stat_key": "farmers_supported", "stat_value": "500+", "stat_label": "Farmers Supported", "icon": "users", "category": "impact", "display_order": 1, "updated_at": "2024-01-01T00:00:00Z"},
            {"id": "stat-2", "stat_key": "hives_managed", "stat_value": "184", "stat_label": "Hives Managed", "icon": "hexagon", "category": "impact", "display_order": 2, "updated_at": "2024-01-01T00:00:00Z"},
            {"id": "stat-3", "stat_key": "trees_planted", "stat_value": "2,500+", "stat_label": "Trees Planted", "icon": "tree-pine", "category": "environment", "display_order": 3, "updated_at": "2024-01-01T00:00:00Z"},
            {"id": "stat-4", "stat_key": "acres_pollinated", "stat_value": "25+", "stat_label": "Acres Pollinated", "icon": "flower", "category": "impact", "display_order": 4, "updated_at": "2024-01-01T00:00:00Z"},
            {"id": "stat-5", "stat_key": "beekeepers", "stat_value": "50+", "stat_label": "Partner Beekeepers", "icon": "users", "category": "community", "display_order": 5, "updated_at": "2024-01-01T00:00:00Z"}
        ]
    
    return stats


# ============ ABOUT PAGE (Combined) ============

@router.get("/about", response_model=schemas.AboutPageResponse)
def get_about_page():
    """
    Get complete about page data including company info, story, stats, and leadership.
    """
    info = company_info()
    story = get_company_story()
    stats = get_company_stats()
    team = team_members()
    
    return schemas.AboutPageResponse(
        company_info=info,
        story=story,
        stats=stats,
        leadership_team=team
    )


# ============ PARTNERS ============

@router.get("/partners", response_model=list[schemas.Partner])
def get_partners():
    """
    Get all active partners, certifications, and investors.
    """
    partners = db_select("partners", filters={"is_active": True}, order_by="display_order")
    
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
def get_faqs(category: Optional[str] = None):
    """
    Get Frequently Asked Questions.
    """
    filters = {"is_active": True}
    if category:
        filters["category"] = category
        
    faqs = db_select("faqs", filters=filters, order_by="display_order")
    
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
