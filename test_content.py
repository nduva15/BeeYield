import asyncio
import os
from dotenv import load_dotenv

# Load env from backend folder
load_dotenv("backend/.env")

from backend.app.services.content_service import ContentService
from backend.app.db.supabase_db import get_supabase

async def test_content_service():
    print("Testing Supabase connection...")
    client = get_supabase()
    if not client:
        print("FAILED: Supabase client not initialized")
        return

    print("\nFetching latest blogs...")
    blogs = await ContentService.get_latest_blogs()
    print(f"Blogs found: {len(blogs)}")
    for b in blogs:
        print(f" - {b['title']}")

    print("\nFetching latest products...")
    products = await ContentService.get_featured_products()
    print(f"Products found: {len(products)}")
    for p in products:
        print(f" - {p['name']}")

    print("\nKnowledge Summary:")
    summary = await ContentService.get_website_knowledge_summary()
    print(summary)

if __name__ == "__main__":
    asyncio.run(test_content_service())
