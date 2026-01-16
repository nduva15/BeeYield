from typing import List, Dict, Any
from app.db.supabase_db import db_select

class ContentService:
    @staticmethod
    async def get_latest_blogs(limit: int = 3) -> List[Dict[str, Any]]:
        """Fetch latest published blog posts from Supabase."""
        return db_select(
            table="blog_posts",
            columns="title, slug, excerpt",
            filters={"status": "published"},
            limit=limit,
            order_by="published_at",
            ascending=False
        )

    @staticmethod
    async def get_featured_products(limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch active products from Supabase."""
        return db_select(
            table="products",
            columns="name, category, description",
            filters={"is_active": True},
            limit=limit,
            order_by="created_at",
            ascending=False
        )

    @staticmethod
    async def get_website_knowledge_summary() -> str:
        """Get a text summary of website content for AI context."""
        blogs = await ContentService.get_latest_blogs()
        products = await ContentService.get_featured_products()
        
        summary = "WEBSITE DATA:\n"
        
        if blogs:
            summary += "Latest Blog Posts:\n"
            for b in blogs:
                summary += f"- {b['title']} (Slug: {b['slug']})\n"
        
        if products:
            summary += "\nFeatured Products:\n"
            for p in products:
                summary += f"- {p['name']} ({p['category']}): {p['description'][:100]}...\n"
                
        return summary
