import os
import time
from app.db.supabase_db import db_insert, get_supabase
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def seed_shop():
    print("🐝 Seeding BeeYield Shop Data...")
    
    supabase = get_supabase()
    if not supabase:
        print("❌ Supabase not connected. Please check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
        return

    # 1. Honey Products
    honey_products = [
        {
            "name": "Acacia Honey",
            "description": "Pure, light, and sweet Acacia honey collected from the vast plains of Kenya. Perfect for tea and pancakes.",
            "category": "honey",
            "badge": "Bestseller",
            "rating": 4.9,
            "review_count": 128,
            "is_active": True,
            "variants": [
                {"size": "500g", "price_kes": 800, "stock_quantity": 50},
                {"size": "1kg", "price_kes": 1500, "stock_quantity": 30}
            ]
        },
        {
            "name": "Highland Blossom Honey",
            "description": "Rich, dark, and multi-floral honey from the Mount Kenya region. Contains high antioxidants.",
            "category": "honey",
            "badge": "Premium",
            "rating": 5.0,
            "review_count": 85,
            "is_active": True,
            "variants": [
                {"size": "500g", "price_kes": 950, "stock_quantity": 40},
                {"size": "1kg", "price_kes": 1800, "stock_quantity": 20}
            ]
        },
         {
            "name": "Eucalyptus Honey",
            "description": "Distinctive herbal flavor with verified medicinal properties. Great for cold relief.",
            "category": "honey",
            "badge": "New",
            "rating": 4.7,
            "review_count": 42,
            "is_active": True,
            "variants": [
                {"size": "500g", "price_kes": 850, "stock_quantity": 60}
            ]
        }
    ]

    # 2. Merch
    merch_products = [
        {
            "name": "BeeYield Hoodie",
            "description": "Eco-friendly cotton blend hoodie with our signature bee logo. Keep warm while saving bees.",
            "category": "merch",
            "badge": "Limited",
            "rating": 4.8,
            "review_count": 56,
            "is_active": True,
            "variants": [
                {"size": "S", "price_kes": 3500, "stock_quantity": 10},
                {"size": "M", "price_kes": 3500, "stock_quantity": 15},
                {"size": "L", "price_kes": 3500, "stock_quantity": 12},
                {"size": "XL", "price_kes": 3500, "stock_quantity": 8}
            ]
        },
        {
            "name": "Beekeeper T-Shirt",
            "description": "100% organic cotton t-shirt. Breathable and durable.",
            "category": "merch",
            "badge": None,
            "rating": 4.6,
            "review_count": 34,
            "is_active": True,
            "variants": [
                {"size": "M", "price_kes": 1500, "stock_quantity": 20},
                {"size": "L", "price_kes": 1500, "stock_quantity": 25}
            ]
        }
    ]

    # 3. Education
    education_products = [
        {
            "name": "Beekeeping 101 Guide",
            "description": "Comprehensive PDF guide for beginners. Learn how to start your own apiary.",
            "category": "education",
            "badge": "Best Value",
            "rating": 4.9,
            "review_count": 210,
            "is_active": True,
            "variants": [
                {"size": "PDF", "price_kes": 500, "stock_quantity": 9999}
            ]
        },
         {
            "name": "Advanced Pollination Techniques",
            "description": "Video course and manual for maximizing crop yields through strategic hive placement.",
            "category": "education",
            "badge": "Professional",
            "rating": 5.0,
            "review_count": 45,
            "is_active": True,
            "variants": [
                {"size": "Course", "price_kes": 2500, "stock_quantity": 9999}
            ]
        }
    ]

    all_products = honey_products + merch_products + education_products

    for p_data in all_products:
        variants = p_data.pop("variants")
        
        # Insert Product
        print(f"Adding product: {p_data['name']}...")
        res_prod = db_insert("products", p_data)
        
        if res_prod.get("success"):
            product_id = res_prod["data"][0]["id"]
            
            # Insert Variants
            for v in variants:
                v["product_id"] = product_id
                db_insert("product_variants", v)
            print(f" ✅ Added {p_data['name']} with {len(variants)} variants.")
        else:
            print(f" ❌ Failed to add {p_data['name']}: {res_prod.get('error')}")
            
    print("\n🎉 Seeding complete!")

if __name__ == "__main__":
    # Ensure sys path can find 'app'
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    seed_shop()
