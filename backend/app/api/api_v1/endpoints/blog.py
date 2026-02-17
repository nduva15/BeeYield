"""
Blog/CMS Endpoints with AI Content Engine Integration
"""
from fastapi import APIRouter, HTTPException, Query, Body, Depends, Request
from typing import Optional, List, Dict, Any
from app.schemas import blog as schemas
from app.db.supabase_db import db_select, db_insert, db_update, db_get_by_id, db_delete
from app.services.blog_ai_service import BlogAiService
from datetime import datetime

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# ============ PUBLIC BLOG ENDPOINTS ============

@router.get("/posts", response_model=list[dict])
async def get_blog_posts(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = Query(10, le=100),
    offset: int = 0,
    status: str = "published",
    token: Optional[str] = Depends(get_token)
):
    """
    Get blog posts with optional filtering.
    """
    filters = {"status": status}
    if category:
        filters["category"] = category
    
    posts = await db_select(
        "blog_posts", 
        filters=filters, 
        order_by="published_at" if status == "published" else "created_at", 
        ascending=False,
        limit=limit,
        token=token
    )
    return posts

@router.get("/posts/{slug_or_id}", response_model=dict)
async def get_blog_post(slug_or_id: str, token: Optional[str] = Depends(get_token)):
    """
    Get a single blog post by slug or ID.
    """
    # Try by ID first
    post = await db_get_by_id("blog_posts", slug_or_id, token=token)
    
    # Try by slug if not found or if ID look-alike is actually a slug
    if not post:
        posts = await db_select("blog_posts", filters={"slug": slug_or_id}, limit=1, token=token)
        if posts:
            post = posts[0]
            
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    # Increment view count
    await db_update("blog_posts", {"views_count": post.get("views_count", 0) + 1}, {"id": post["id"]}, token=token)
    return post

@router.get("/posts/{post_id}/chapters", response_model=list[dict])
async def get_blog_chapters(post_id: str, token: Optional[str] = Depends(get_token)):
    """
    Get all chapters for a specific post.
    """
    chapters = await db_select("blog_chapters", filters={"post_id": post_id}, order_by="chapter_order", ascending=True, token=token)
    return chapters

@router.get("/categories", response_model=list[dict])
def get_blog_categories():
    """
    Get blog categories.
    """
    return [
        {"name": "Bees & Biology", "slug": "bees"},
        {"name": "Conservation", "slug": "conservation"},
        {"name": "Technology", "slug": "technology"},
        {"name": "Sustainability", "slug": "sustainability"},
        {"name": "Pollination", "slug": "pollination"},
        {"name": "Business", "slug": "business"},
        {"name": "Education", "slug": "education"},
        {"name": "Lifestyle", "slug": "lifestyle"},
        {"name": "Impact", "slug": "impact"}
    ]

# ============ AI CONTENT ENGINE ENDPOINTS ============

@router.post("/generate-outline")
async def generate_blog_outline(request: schemas.OutlineGenerationRequest):
    """
    AI-assisted generation of a multi-chapter outline.
    """
    result = await BlogAiService.generate_outline(request.post_id)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate outline"))
    return result

@router.post("/generate-chapter")
async def generate_blog_chapter(request: schemas.ChapterGenerationRequest):
    """
    AI-assisted generation of content for a specific chapter.
    """
    result = await BlogAiService.generate_chapter_content(request.post_id, request.chapter_id)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate chapter content"))
    return result

@router.post("/analyze-seo/{post_id}")
async def analyze_blog_seo(post_id: str):
    """
    Analyze post for SEO/AEO/GEO scores.
    """
    result = await BlogAiService.analyze_and_optimize(post_id)
    return result

# ============ ADMIN CRUD ENDPOINTS ============

@router.post("/posts", response_model=dict)
async def create_blog_post(post: schemas.BlogPostCreate, token: Optional[str] = Depends(get_token)):
    """
    Create a new blog post.
    """
    post_data = post.dict()
    if not post_data.get("slug"):
        post_data["slug"] = post_data["title"].lower().strip().replace(" ", "-")
        # Ensure slug is actually slug-friendly
        post_data["slug"] = "".join([c if c.isalnum() or c == "-" else "" for c in post_data["slug"]])
        
    post_data["created_at"] = datetime.utcnow().isoformat()
    result = await db_insert("blog_posts", post_data, token=token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]

@router.put("/posts/{post_id}", response_model=dict)
async def update_blog_post(post_id: str, post: dict = Body(...), token: Optional[str] = Depends(get_token)):
    """
    Update an existing blog post.
    """
    result = await db_update("blog_posts", post, {"id": post_id}, token=token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]

@router.delete("/posts/{post_id}")
async def delete_blog_post(post_id: str, token: Optional[str] = Depends(get_token)):
    """
    Delete a blog post.
    """
    result = await db_delete("blog_posts", {"id": post_id}, token=token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Delete failed"))
    return {"status": "success"}

@router.get("/stats", response_model=dict)
async def get_blog_stats(token: Optional[str] = Depends(get_token)):
    """
    Get high-level blog stats for dashboard.
    """
    posts = await db_select("blog_posts", columns="id, status, target_word_count, views_count", token=token)
    
    total_posts = len(posts)
    published = len([p for p in posts if p["status"] == "published"])
    drafts = len([p for p in posts if p["status"] == "draft" or p["status"] == "writing"])
    ideas = len([p for p in posts if p["status"] == "idea"])
    total_views = sum([p.get("views_count", 0) for p in posts])
    
    return {
        "total_posts": total_posts,
        "published_count": published,
        "draft_count": drafts,
        "idea_count": ideas,
        "total_views": total_views,
        "word_count_milestone": 125000, # Example placeholder
        "posts_needed": 45 - total_posts
    }
