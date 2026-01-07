"""
Company Endpoints - About, Story, Team, Stats
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas import company as schemas
from app.db.supabase_db import db_select, db_insert, db_get_by_id

router = APIRouter()


# ============ COMPANY INFO ============

@router.get("/info", response_model=dict)
def company_info():
    """
    Returns general company info, values, and stats for the About Us page.
    """
    return {
        "name": "BeeYield",
        "tagline": "From Hive to Table, Traced with Trust",
        "mission": "To secure the future of food by reversing the pollination crisis through precision pollination and ecosystem restoration.",
        "vision": "To create a world where every drop of honey tells a story of ethical sourcing and environmental stewardship.",
        "description": "Born from a family's shared vision in rural Kenya, we're on a mission to solve the global pollination crisis.",
        "location": "Kibwezi, Makueni County, Kenya",
        "founded_year": 2020,
        "origin_story": [
            "In 2020, in the midst of the global pandemic, BeeYield was born on a humble half-acre plot with just 4 hives in Kibwezi, a rural town in Makueni, Kenya. Timothy, then a Strathmore University student, saw an opportunity where others saw crisis.",
            "But where would three beekeepers meet? At the family table. Timothy's sisters, Agatha and Carole, brought their own Strathmore expertise to shape BeeYield's direction: web development, product design, and IoT research.",
            "From those 4 hives, BeeYield has grown to 184 hives across a 5-acre fenced apiary. We've planted over 2,500+ trees to restore the ecosystem."
        ],
        "values": [
            {"title": "Family-Powered", "description": "Three siblings, one vision. Combining Strathmore studies to build a precision pollination company.", "icon": "heart"},
            {"title": "Sustainability", "description": "Protecting bees and improving yields from hive to harvest.", "icon": "leaf"},
            {"title": "Traceability", "description": "Ensuring authenticity and quality through blockchain technology.", "icon": "shield"},
            {"title": "Innovation", "description": "Using IoT and AI to optimize bee management and pollination.", "icon": "zap"}
        ],
        "stats": [
            {"label": "Hives Today", "value": "184", "icon": "hexagon"},
            {"label": "Acre Apiary", "value": "5", "icon": "map"},
            {"label": "Trees Planted", "value": "2,500+", "icon": "tree-pine"},
            {"label": "Acres Pollinated", "value": "25", "icon": "flower"}
        ],
        "social_links": {
            "twitter": "https://twitter.com/beeyield",
            "linkedin": "https://linkedin.com/company/beeyield",
            "instagram": "https://instagram.com/beeyield",
            "facebook": "https://facebook.com/beeyield"
        },
        "contact_email": "hello@beeyield.com",
        "contact_phone": "+254 700 000 000"
    }


# ============ TEAM ============

@router.get("/team", response_model=dict)
def team_members():
    """
    Returns grouped team members: Founders, Board, and Technical Team.
    """
    # Try to get from database first
    db_members = db_select("team_members", filters={"is_active": True}, order_by="display_order")
    
    if db_members and len(db_members) > 0:
        # Organize by department
        founders = [m for m in db_members if m.get("is_leadership") and "founder" in m.get("role", "").lower()]
        board = [m for m in db_members if "board" in m.get("role", "").lower()]
        technical = [m for m in db_members if m.get("department") == "Technical"]
        operations = [m for m in db_members if m.get("department") == "Operations"]
        
        return {
            "founders": founders,
            "board": board,
            "technical": technical,
            "operations": operations
        }
    
    # Return default team data
    return {
        "founders": [
            { 
                "id": "team-1",
                "name": "Timothy Mathuva", 
                "role": "CEO & Founder", 
                "description": "Visionary leader driving BeeYield's mission to revolutionize pollination through technology.",
                "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
                "linkedin": "https://www.linkedin.com/in/timothymathuva/"
            },
            { 
                "id": "team-2",
                "name": "Carole Mathuva", 
                "role": "Chief Growth Officer & Co-founder", 
                "description": "Business Development lead, shaping partnerships and driving company growth.",
                "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
                "linkedin": "#"
            },
            { 
                "id": "team-3",
                "name": "Agatha Mathuva", 
                "role": "Chief IT Head & Co-founder", 
                "description": "Leading technology infrastructure and digital innovation at BeeYield.",
                "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
                "linkedin": "#"
            }
        ],
        "board": [
            { 
                "id": "team-4",
                "name": "Nicholas Nduva", 
                "role": "Board Member",
                "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
                "linkedin": "#"
            },
            { 
                "id": "team-5",
                "name": "Redemepta Mathuva", 
                "role": "Board Member",
                "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400",
                "linkedin": "#"
            }
        ],
        "technical": [
            { 
                "id": "team-6",
                "name": "Rose Ndinda", 
                "role": "Technical Team Member",
                "description": "Contributing to BeeYield's technical innovation and development.",
                "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
                "linkedin": "#"
            }
        ]
    }


@router.get("/team/{member_id}", response_model=dict)
def get_team_member(member_id: str):
    """
    Get a specific team member by ID.
    """
    member = db_get_by_id("team_members", member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member


# ============ STORY / MILESTONES ============

@router.get("/story", response_model=dict)
def get_company_story():
    """
    Get company story with milestones/timeline.
    """
    milestones = db_select("company_milestones", filters={"is_active": True}, order_by="year")
    
    if not milestones or len(milestones) == 0:
        milestones = [
            {"id": "ms-1", "year": 2020, "title": "BeeYield Founded", "description": "Started with 4 hives in Kibwezi during the pandemic.", "type": "founding"},
            {"id": "ms-2", "year": 2021, "title": "First 50 Hives", "description": "Expanded to 50 hives and began serving local farmers.", "type": "growth"},
            {"id": "ms-3", "year": 2022, "title": "Blockchain Traceability", "description": "Launched blockchain-based honey traceability system.", "type": "technology"},
            {"id": "ms-4", "year": 2023, "title": "Pollination Services", "description": "Started precision pollination services for commercial farms.", "type": "expansion"},
            {"id": "ms-5", "year": 2024, "title": "184 Hives & Growing", "description": "Reached 184 hives and 5-acre fenced apiary.", "type": "milestone"}
        ]
    
    return {
        "title": "Our Story",
        "subtitle": "From 4 Hives to a Pollination Revolution",
        "intro": "BeeYield was born from a family's shared vision in rural Kenya. What started as a pandemic-era project with just 4 hives has grown into a movement transforming how the world thinks about honey and beekeeping.",
        "founders_message": "We started BeeYield because we saw the potential to create real change - for bees, for beekeepers, and for consumers who care about where their food comes from. Our blockchain traceability isn't just technology; it's our promise of transparency and trust.",
        "milestones": milestones
    }


@router.get("/milestones", response_model=List[dict])
def get_milestones():
    """
    Get all company milestones.
    """
    milestones = db_select("company_milestones", filters={"is_active": True}, order_by="year")
    return milestones if milestones else []


# ============ STATS ============

@router.get("/stats", response_model=List[dict])
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
            {"id": "stat-1", "key": "farmers_supported", "value": "500+", "label": "Farmers Supported", "icon": "users", "category": "impact"},
            {"id": "stat-2", "key": "hives_managed", "value": "184", "label": "Hives Managed", "icon": "hexagon", "category": "impact"},
            {"id": "stat-3", "key": "trees_planted", "value": "2,500+", "label": "Trees Planted", "icon": "tree-pine", "category": "environment"},
            {"id": "stat-4", "key": "acres_pollinated", "value": "25", "label": "Acres Pollinated", "icon": "flower", "category": "impact"},
            {"id": "stat-5", "key": "beekeepers", "value": "50+", "label": "Partner Beekeepers", "icon": "users", "category": "community"}
        ]
    
    return stats


# ============ ABOUT PAGE (Combined) ============

@router.get("/about", response_model=dict)
def get_about_page():
    """
    Get complete about page data including company info, story, stats, and leadership.
    """
    return {
        "info": company_info(),
        "story": get_company_story(),
        "stats": get_company_stats(),
        "team": team_members()
    }
