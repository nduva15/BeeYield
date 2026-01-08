"""
Blog/CMS Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas import blog as schemas
from app.db.supabase_db import db_select, db_insert, db_update, db_get_by_id
from datetime import datetime

router = APIRouter()


# ============ PUBLIC BLOG ENDPOINTS ============

@router.get("/posts", response_model=List[dict])
def get_blog_posts(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = Query(10, le=50),
    offset: int = 0
):
    """
    Get all published blog posts with optional filtering.
    """
    filters = {"status": "published"}
    if category:
        filters["category"] = category
    
    posts = db_select(
        "blog_posts", 
        filters=filters, 
        order_by="published_at", 
        ascending=False,
        limit=limit
    )
    
    if not posts or len(posts) == 0:
        # Return mock data
        return [
            {
                "id": "post-1",
                "slug": "importance-of-bees",
                "title": "The Importance of Bees in Our Ecosystem",
                "excerpt": "Discover why bees are crucial pollinators and what we can do to protect them.",
                "featured_image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
                "category": "Conservation",
                "tags": ["bees", "environment", "pollination"],
                "author_name": "Timothy Nduva",
                "read_time_minutes": 5,
                "published_at": "2024-12-15T10:00:00Z",
                "views_count": 1234
            },
            {
                "id": "post-2",
                "slug": "blockchain-honey-traceability",
                "title": "How Blockchain is Revolutionizing Honey Traceability",
                "excerpt": "Learn how we use blockchain technology to ensure your honey is 100% authentic.",
                "featured_image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
                "category": "Technology",
                "tags": ["blockchain", "traceability", "honey"],
                "author_name": "Agatha Nduva",
                "read_time_minutes": 7,
                "published_at": "2024-12-10T10:00:00Z",
                "views_count": 856
            },
            {
                "id": "post-3",
                "slug": "sustainable-beekeeping-practices",
                "title": "Sustainable Beekeeping: Our Approach at BeeYield",
                "excerpt": "How we balance honey production with bee welfare and environmental protection.",
                "featured_image": "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800",
                "category": "Sustainability",
                "tags": ["sustainability", "beekeeping", "practices"],
                "author_name": "Carole Nduva",
                "read_time_minutes": 6,
                "published_at": "2024-12-05T10:00:00Z",
                "views_count": 678
            }
        ]
    
    return posts


@router.get("/posts/{slug}", response_model=dict)
def get_blog_post(slug: str):
    """
    Get a single blog post by slug.
    """
    posts = db_select("blog_posts", filters={"slug": slug, "status": "published"}, limit=1)
    
    if posts and len(posts) > 0:
        post = posts[0]
        # Increment view count
        db_update("blog_posts", {"views_count": post.get("views_count", 0) + 1}, {"id": post["id"]})
        return post
    
    # Return mock data
    if slug == "importance-of-bees":
        return {
            "id": "post-1",
            "slug": "importance-of-bees",
            "title": "The Importance of Bees in Our Ecosystem",
            "excerpt": "Discover why bees are crucial pollinators and what we can do to protect them.",
            "content": "# The Importance of Bees in Our Ecosystem\n\nBees are among the most important pollinators...",
            "featured_image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
            "category": "Conservation",
            "tags": ["bees", "environment", "pollination"],
            "author_name": "Timothy Nduva",
            "read_time_minutes": 5,
            "published_at": "2024-12-15T10:00:00Z",
            "views_count": 1235
        }
    
    raise HTTPException(status_code=404, detail="Blog post not found")


@router.get("/categories", response_model=List[dict])
def get_blog_categories():
    """
    Get all blog categories.
    """
    return [
        {"name": "Conservation", "slug": "conservation"},
        {"name": "Technology", "slug": "technology"},
        {"name": "Sustainability", "slug": "sustainability"},
        {"name": "Pollination", "slug": "pollination"}
    ]


# ============ ADMIN ENDPOINTS (Protected) ============

@router.post("/posts", response_model=dict)
def create_blog_post(post: schemas.BlogPostCreate):
    """
    Create a new blog post.
    """
    post_data = post.dict()
    if not post_data.get("slug"):
        post_data["slug"] = post_data["title"].lower().replace(" ", "-")
    
    post_data["created_at"] = datetime.utcnow().isoformat()
    result = db_insert("blog_posts", post_data)
    return result


@router.put("/posts/{post_id}", response_model=dict)
def update_blog_post(post_id: str, post: schemas.BlogPostCreate):
    """
    Update an existing blog post.
    """
    return db_update("blog_posts", post.dict(), {"id": post_id})
