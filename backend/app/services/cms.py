from typing import Optional
from datetime import datetime

from app.db.supabase_db import db_select, db_insert

async def get_all_posts(category: Optional[str] = None):
    """Fetch all blog posts from Supabase"""
    filters = {"status": "published"}
    if category:
        filters["category"] = category
    
    return await db_select("blog_posts", filters=filters, order_by="published_at", ascending=False)

async def create_post(post_data: dict):
    """Create a new blog post in Supabase"""
    if 'created_at' not in post_data:
        post_data['created_at'] = datetime.now().isoformat()
    if 'updated_at' not in post_data:
        post_data['updated_at'] = datetime.now().isoformat()
        
    result = await db_insert("blog_posts", post_data)
    if result.get("success") and result.get("data"):
        return result["data"][0]
    return result
