import uuid
from app.db.supabase_db import db_insert, db_select

def seed_products():
    print("🌱 Seeding products...")
    
    # Check if products already exist
    existing = db_select("products", limit=1)
    if existing:
        print("ℹ️ Products already exist, skipping seed.")
        return

    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Kibwezi Wildflower Honey",
            "slug": "kibwezi-wildflower",
            "description": "Pure honey from the diverse wildflower meadows of Makueni. Rich in antioxidants and unique floral notes.",
            "category": "honey",
            "badge": "Bestseller",
            "rating": 4.9,
            "review_count": 127,
            "images": ["/img/honey_wildflower.jpg"],
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Acacia Gold Honey",
            "slug": "acacia-gold",
            "description": "Light, crystalline honey with a delicate sweet flavor. Perfect for tea and baking.",
            "category": "honey",
            "badge": "Premium",
            "rating": 4.8,
            "review_count": 89,
            "images": ["/img/honey_acacia.jpg"],
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "BeeYield Classic Tee",
            "slug": "beeyield-tee",
            "description": "100% organic cotton with embroidered logo.",
            "category": "merch",
            "badge": "Bestseller",
            "rating": 4.8,
            "review_count": 56,
            "images": ["/img/merch_tee.jpg"],
            "is_active": True
        }
    ]
    
    for p in products:
        db_insert("products", p)
        
        # Add variants
        if p["category"] == "honey":
            variants = [
                {"id": str(uuid.uuid4()), "product_id": p["id"], "size": "250g", "price_kes": 850, "stock_quantity": 100},
                {"id": str(uuid.uuid4()), "product_id": p["id"], "size": "500g", "price_kes": 1500, "stock_quantity": 50},
                {"id": str(uuid.uuid4()), "product_id": p["id"], "size": "1kg", "price_kes": 2800, "stock_quantity": 20}
            ]
        else:
            variants = [
                {"id": str(uuid.uuid4()), "product_id": p["id"], "size": "M", "price_kes": 1800, "stock_quantity": 20},
                {"id": str(uuid.uuid4()), "product_id": p["id"], "size": "L", "price_kes": 1800, "stock_quantity": 20}
            ]
            
        for v in variants:
            db_insert("product_variants", v)
            
    print("✅ Seeding completed!")

if __name__ == "__main__":
    seed_products()
