import os
import sys
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import db_insert, get_supabase

load_dotenv()

def seed_all():
    print("🐝 BeeYield Global Seeder Started...")
    
    supabase = get_supabase()
    if not supabase:
        print("❌ Supabase connection failed!")
        return

    # 1. Seed Team Members
    print("👥 Seeding Team Members...")
    team = [
        {
            "name": "Samuel Maina",
            "role": "CEO & Co-Founder",
            "department": "Leadership",
            "bio": "Passionate about sustainable beekeeping and empowering African beekeepers through technology.",
            "is_leadership": True,
            "display_order": 1
        },
        {
            "name": "Grace Wanjiku",
            "role": "COO",
            "department": "Leadership",
            "bio": "Operations expert with 15 years in agricultural supply chains. Making sure every drop reaches you pure.",
            "is_leadership": True,
            "display_order": 2
        },
        {
            "name": "Timothy Nduva",
            "role": "Head of Beekeeping",
            "department": "Operations",
            "bio": "Third-generation beekeeper from Kibwezi. Timothy manages our HoneyChain network and hive health.",
            "is_leadership": True,
            "display_order": 3
        }
    ]
    for member in team:
        db_insert("team_members", member)
    print(" ✅ Team Seeded.")

    # 2. Seed Company Stats
    print("📊 Seeding Company Stats...")
    stats = [
        {"stat_key": "farmers_supported", "stat_value": "500+", "stat_label": "Farmers Supported", "display_order": 1},
        {"stat_key": "hives_managed", "stat_value": "10,000+", "stat_label": "Hives Managed", "display_order": 2},
        {"stat_key": "honey_produced", "stat_value": "50,000", "stat_label": "Liters of Honey", "display_order": 3},
        {"stat_key": "countries", "stat_value": "3", "stat_label": "Countries Active", "display_order": 4}
    ]
    for stat in stats:
        db_insert("company_stats", stat)
    print(" ✅ Stats Seeded.")

    # 3. Seed Blog Posts
    print("📝 Seeding Blog Posts...")
    blogs = [
        {
            "title": "The Future of Traceability: How Blockchain Protects Bees",
            "slug": "blockchain-protects-bees",
            "excerpt": "Discover how our HoneyChain™ technology ensures every jar is authentic and ethically sourced.",
            "content": "Full content about blockchain and bee protection...",
            "category": "Technology",
            "status": "published",
            "published_at": datetime.utcnow().isoformat()
        },
        {
            "title": "Kibwezi Harvest 2024: A Record Year for Acacia",
            "slug": "kibwezi-harvest-2024",
            "excerpt": "Our latest harvest from the Makueni region has yielded some of the purest honey in years.",
            "content": "Full content about the harvest...",
            "category": "Harvest",
            "status": "published",
            "published_at": datetime.utcnow().isoformat()
        }
    ]
    for post in blogs:
        db_insert("blog_posts", post)
    print(" ✅ Blogs Seeded.")

    print("\n🌟 All connections should now show data on beeyield.com!")

if __name__ == "__main__":
    seed_all()
