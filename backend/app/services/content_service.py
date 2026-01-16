from typing import List, Dict, Any
from app.db.supabase_db import db_select

class ContentService:
    # Fallback data in case DB is unavailable
    FALLBACK_BLOGS = [
        {"title": "Sustainable Beekeeping in Kenya", "slug": "sustainable-beekeeping"},
        {"title": "The Role of Smart Hives in Modern Pollination", "slug": "smart-hives-tech"},
        {"title": "Ensuring Purity with HoneyChain Blockchain", "slug": "honeychain-traceability"}
    ]
    
    FALLBACK_PRODUCTS = [
        {"name": "Acacia Honey", "category": "honey", "description": "Pure, light, and sweet Acacia honey from Kibwezi."},
        {"name": "Solar Hive Monitor", "category": "technology", "description": "IoT sensor for real-time hive health tracking."},
        {"name": "Highland Blossom Honey", "category": "honey", "description": "Rich multi-floral honey from Mount Kenya regions."},
        {"name": "BeeYield Drone", "category": "technology", "description": "Precision pollination scouting drone."},
        {"name": "Organic Honeycomb", "category": "honey", "description": "Raw honeycomb directly from our smart hives."}
    ]

    @staticmethod
    async def get_latest_blogs(limit: int = 3) -> List[Dict[str, Any]]:
        """Fetch latest published blog posts from Supabase."""
        blogs = db_select(
            table="blog_posts",
            columns="title, slug, excerpt",
            filters={"status": "published"},
            limit=limit,
            order_by="published_at",
            ascending=False
        )
        return blogs if blogs else ContentService.FALLBACK_BLOGS[:limit]

    @staticmethod
    async def get_featured_products(limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch active products from Supabase."""
        products = db_select(
            table="products",
            columns="name, category, description",
            filters={"is_active": True},
            limit=limit,
            order_by="created_at",
            ascending=False
        )
        return products if products else ContentService.FALLBACK_PRODUCTS[:limit]

    @staticmethod
    async def get_website_knowledge_summary() -> str:
        """Get a text summary of website content for AI context."""
        try:
            blogs = await ContentService.get_latest_blogs()
            products = await ContentService.get_featured_products()
            
            summary = "WEBSITE CONTENT KNOWLEDGE:\n"
            
            if blogs:
                summary += "Recent Blog Posts Available:\n"
                for b in blogs:
                    summary += f"- {b['title']} (Link: beeyield.com/blog/{b.get('slug', '')})\n"
            
            if products:
                summary += "\nAvailable Shop Products:\n"
                for p in products:
                    summary += f"- {p['name']} ({p['category']}): {p.get('description', '')[:80]}...\n"
                    
            return summary
        except Exception:
            return "WEBSITE CONTENT: Focus on professional pollination, smart hives, and traceable honey."
