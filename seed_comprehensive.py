import os
import sys
import uuid
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import db_insert, get_supabase

def seed_comprehensive():
    print("🐝 BeeYield Comprehensive Seeder Started...")
    
    supabase = get_supabase()
    if not supabase:
        print("❌ Supabase connection failed!")
        return

    # 1. Seed Products
    print("🛍️ Seeding Products...")
    products = [
        {
            "name": "Amber Infusion VII",
            "description": "Premium acacia honey with a hint of wild lavender. Harvested at peak bloom.",
            "category": "honey",
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"]
        },
        {
            "name": "Desert Gold Sensors",
            "description": "IoT-enabled hive monitoring system for moisture and temperature tracking.",
            "category": "sensors",
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=800"]
        }
    ]
    for p in products:
        res = db_insert("products", p)
        if res.get("success") and res.get("data"):
            p_id = res["data"][0]["id"]
            # Seed variant
            db_insert("product_variants", {
                "product_id": p_id,
                "size": "500g",
                "price_kes": 1200,
                "stock_quantity": 50,
                "is_available": True
            })
    print(" ✅ Products & Variants Seeded.")

    # 2. Seed Honey Batches
    print("🏗️ Seeding Honey Batches...")
    batches = [
        {
            "batch_code": "KIB-ACA-001",
            "honey_type": "Acacia Noir",
            "harvest_date": "2024-01-10",
            "quantity_kg": 250,
            "processing_method": "Raw Filtered",
            "farmer_name": "Samuel Kipchumba",
            "farmer_phone": "+254712345678",
            "location_county": "Kibwezi",
            "location_region": "Makueni",
            "quality_grade": "A",
            "moisture_content": 17.5,
            "color_grade": "Light Amber",
            "block_hash": "0x" + uuid.uuid4().hex + uuid.uuid4().hex
        }
    ]
    for b in batches:
        db_insert("honey_batches", b)
    print(" ✅ Batches Seeded.")

    # 3. Seed Pollination
    print("🐝 Seeding Pollination Requests...")
    reqs = [
        {
            "name": "Jane Muthoni",
            "email": "jane@example.com",
            "phone": "+254789456123",
            "crop_type": "Avocado",
            "farm_size": 25,
            "location": "Murang'a",
            "status": "pending"
        }
    ]
    for r in reqs:
        db_insert("pollination_requests", r)
    print(" ✅ Pollination Seeded.")

    # 4. Seed Newsletter
    print("📧 Seeding Newsletter...")
    subs = [
        {"email": "grower@farms.com", "first_name": "Farmer John", "is_active": True}
    ]
    for s in subs:
        db_insert("newsletter_subscribers", s)
    print(" ✅ Newsletter Seeded.")

    # 5. Seed Contact
    print("💬 Seeding Contact Submissions...")
    contacts = [
        {
            "name": "Investor Alpha",
            "email": "invest@alpha.com",
            "subject": "Expansion Query",
            "message": "We are interested in your scalability plans for 2026.",
            "status": "new"
        }
    ]
    for c in contacts:
        db_insert("contact_submissions", c)
    print(" ✅ Contacts Seeded.")

    # 6. Seed Orders
    print("📦 Seeding Orders...")
    orders = [
        {
            "order_number": "BY-ORD-2024-001",
            "customer_email": "customer@gmail.com",
            "total_amount": 3500,
            "status": "pending",
            "items": [
                {"product_name": "Amber Infusion VII", "quantity": 2, "price_at_purchase": 1200}
            ],
            "shipping_address": {
                "first_name": "Alice",
                "last_name": "Doe",
                "address": "123 Hive Way",
                "city": "Nairobi",
                "phone": "+254700000000"
            }
        }
    ]
    for o in orders:
        db_insert("orders", o)
    print(" ✅ Orders Seeded.")

    print("\n🌟 Database successfully populated with sample data!")

if __name__ == "__main__":
    seed_comprehensive()
