import asyncio
import os
import sys

# Ensure backend folder is in path
sys.path.append(os.getcwd())

from app.services.content_service import ContentService
from app.db.supabase_db import get_supabase

async def test_content_service():
    print("Testing Supabase connection...")
    client = get_supabase()
    if not client:
        print("FAILED: Supabase client not initialized")
        return

    print("\nFetching latest blogs...")
    try:
        blogs = await ContentService.get_latest_blogs()
        print(f"Blogs found: {len(blogs)}")
        for b in blogs:
            print(f" - {b['title']}")
    except Exception as e:
        print(f"Error fetching blogs: {e}")

    print("\nFetching latest products...")
    try:
        products = await ContentService.get_featured_products()
        print(f"Products found: {len(products)}")
        for p in products:
            print(f" - {p['name']}")
    except Exception as e:
        print(f"Error fetching products: {e}")

    print("\nKnowledge Summary:")
    summary = await ContentService.get_website_knowledge_summary()
    print(summary)

if __name__ == "__main__":
    asyncio.run(test_content_service())
