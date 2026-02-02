import os
import sys
import uuid
from datetime import datetime

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_insert, db_select, db_delete

def seed_products():
    print("Seeding products and variants...")
    
    # Clear existing products to avoid duplicates during development
    # (Optional: only if you want a clean start)
    # products = db_select("products")
    # for p in products:
    #     db_delete("product_variants", {"product_id": p["id"]})
    #     db_delete("products", {"id": p["id"]})

    static_products = [
        {
            "id": str(uuid.uuid4()),
            "static_id": "h1",
            "name": "BeeYield Premium Acacia",
            "description": "Pure, light, and delicate Acacia honey harvested from the pristine northern plains.",
            "category": "honey",
            "badge": "Bestseller",
            "images": ["/images/products/beeyield_honey_500g.png"],
            "rating": 4.9,
            "review_count": 245,
            "variants": [
                {"size": "250g", "price_kes": 250, "stock_quantity": 100},
                {"size": "500g", "price_kes": 500, "stock_quantity": 75},
                {"size": "1kg", "price_kes": 1000, "stock_quantity": 50}
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "static_id": "h2",
            "name": "Wildflower Blossom Honey",
            "description": "A complex, multi-floral honey with aromatic notes from Makueni's diverse flora.",
            "category": "honey",
            "badge": "Premium",
            "images": ["/images/products/beeyield_honey_500g.png"],
            "rating": 5.0,
            "review_count": 182,
            "variants": [
                {"size": "250g", "price_kes": 250, "stock_quantity": 80},
                {"size": "500g", "price_kes": 500, "stock_quantity": 60},
                {"size": "1kg", "price_kes": 1000, "stock_quantity": 30}
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "static_id": "hw1",
            "name": "Solar Hive Monitor Pro",
            "description": "The ultimate IoT solution for beekeepers. Tracks weight, temperature, humidity, and acoustics.",
            "category": "hardware",
            "badge": "Cutting Edge",
            "images": ["/images/products/solar_hive_monitor.png"],
            "rating": 5.0,
            "review_count": 24,
            "variants": [
                {"size": "V3.0 Unit", "price_kes": 25000, "stock_quantity": 15}
            ]
        }
    ]

    for p in static_products:
        variants = p.pop("variants")
        # Remove static_id if it's not in the schema (it's not)
        p.pop("static_id", None)
        
        # Check if exists by name
        exists = db_select("products", filters={"name": p["name"]})
        if exists:
            product_id = exists[0]["id"]
            print(f"Product {p['name']} already exists.")
        else:
            p_data = {**p}
            res = db_insert("products", p_data)
            if res.get("success"):
                product_id = p["id"]
                print(f"Inserted product: {p['name']}")
            else:
                print(f"Failed to insert product {p['name']}: {res.get('error')}")
                continue
        
        # Insert variants
        for v in variants:
            v_exists = db_select("product_variants", filters={"product_id": product_id, "size": v["size"]})
            if not v_exists:
                v_data = {
                    "id": str(uuid.uuid4()),
                    "product_id": product_id,
                    "size": v["size"],
                    "price_kes": v["price_kes"],
                    "stock_quantity": v["stock_quantity"],
                    "is_available": True,
                    "created_at": datetime.utcnow().isoformat()
                }
                db_insert("product_variants", v_data)
                print(f"  Inserted variant: {v['size']}")

if __name__ == "__main__":
    seed_products()
