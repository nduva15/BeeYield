import os
import time
from app.db.supabase_db import db_insert, get_supabase, db_upsert, db_delete
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
            "images": ["/images/products/savannah_blossom_honey.png"],
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
            "images": ["/images/products/highland_blossom_honey.png"],
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
            "images": ["/images/products/eucalyptus_honey.png"],
            "variants": [
                {"size": "500g", "price_kes": 850, "stock_quantity": 60}
            ]
        },
        {
            "name": "Desert Bloom Honey",
            "description": "Golden, crystallized honey from the arid regions. Intense floral notes from acacia and cactus flowers.",
            "category": "honey",
            "badge": "Rare",
            "rating": 4.8,
            "review_count": 29,
            "is_active": True,
            "images": ["/images/products/desert_bloom_honey.png"],
            "variants": [
                {"size": "500g", "price_kes": 1000, "stock_quantity": 25}
            ]
        },
        {
            "name": "Forest Dark Honey",
            "description": "Intense, molasses-like flavor from the deep forests. High mineral content.",
            "category": "honey",
            "badge": "Organic",
            "rating": 4.6,
            "review_count": 55,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "500g", "price_kes": 900, "stock_quantity": 45}
            ]
        },
        {
            "name": "Comb Chunk Honey",
            "description": "Raw liquid honey with a generous chunk of edible honeycomb. The ultimate natural treat.",
            "category": "honey",
            "badge": "Raw",
            "rating": 5.0,
            "review_count": 150,
            "is_active": True,
            "images": ["/images/products/honey_comb_chunk.png"],
            "variants": [
                {"size": "500g", "price_kes": 1200, "stock_quantity": 15}
            ]
        }
    ]

    # 2. Merch
    merch_products = [
        {
            "name": "BeeYield Tote Bag",
            "description": "Durable, eco-friendly tote bag perfect for your grocery runs or carrying bee equipment.",
            "category": "merch",
            "badge": "Eco-Friendly",
            "rating": 4.9,
            "review_count": 12,
            "is_active": True,
            "images": ["/images/products/beeyield_tote_bag.png"],
            "variants": [
                {"size": "One Size", "price_kes": 800, "stock_quantity": 100}
            ]
        },
        {
            "name": "BeeYield Hoodie",
            "description": "Eco-friendly cotton blend hoodie with our signature bee logo. Keep warm while saving bees.",
            "category": "merch",
            "badge": "Limited",
            "rating": 4.8,
            "review_count": 56,
            "is_active": True,
            "images": ["/images/products/beeyield_hoodie.png"],
            "variants": [
                {"size": "S", "price_kes": 3500, "stock_quantity": 10},
                {"size": "M", "price_kes": 3500, "stock_quantity": 15},
                {"size": "L", "price_kes": 3500, "stock_quantity": 12},
                {"size": "XL", "price_kes": 3500, "stock_quantity": 8}
            ]
        },
        {
            "name": "Beekeeper T-Shirt",
            "description": "100% organic cotton t-shirt. Breathable and durable, featuring a minimalist bee design.",
            "category": "merch",
            "badge": None,
            "rating": 4.6,
            "review_count": 34,
            "is_active": True,
            "images": ["/images/products/beekeeper_tshirt.png"],
            "variants": [
                {"size": "M", "price_kes": 1500, "stock_quantity": 20},
                {"size": "L", "price_kes": 1500, "stock_quantity": 25}
            ]
        },
        {
            "name": "Beekeeper Hat",
            "description": "Wide-brimmed hat with protective veil. Essential for inspecting hives safely.",
            "category": "merch",
            "badge": "Essential",
            "rating": 4.7,
            "review_count": 88,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1599351431093-f4c2ebf9273c?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Adjustable", "price_kes": 1200, "stock_quantity": 50}
            ]
        },
        {
            "name": "BeeYield Mug",
            "description": "Ceramic mug for your morning coffee or tea. Microwave and dishwasher safe.",
            "category": "merch",
            "badge": None,
            "rating": 4.5,
            "review_count": 22,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Standard", "price_kes": 600, "stock_quantity": 60}
            ]
        },
        {
            "name": "Sticker Pack",
            "description": "High-quality vinyl stickers featuring bees, flowers, and hive designs.",
            "category": "merch",
            "badge": "Fun",
            "rating": 4.9,
            "review_count": 67,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1572375992503-4db091c53e02?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Pack of 5", "price_kes": 300, "stock_quantity": 200}
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
            "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop"],
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
            "images": ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Course", "price_kes": 2500, "stock_quantity": 9999}
            ]
        },
        {
            "name": "Queen Rearing Masterclass",
            "description": "A deep dive into the art of raising quality queen bees. Suitable for intermediate beekeepers.",
            "category": "education",
            "badge": "Expert",
            "rating": 4.9,
            "review_count": 30,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Video Series", "price_kes": 3500, "stock_quantity": 9999}
            ]
        },
        {
            "name": "Hive Health Management",
            "description": "Learn to identify and treat common bee diseases like Varroa and AFB.",
            "category": "education",
            "badge": "Crucial",
            "rating": 4.8,
            "review_count": 92,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1576086213369-97a306d3d146?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Digital Book", "price_kes": 800, "stock_quantity": 9999}
            ]
        },
        {
            "name": "Urban Beekeeping Guide",
            "description": "How to keep bees on rooftops and balconies safely and legally.",
            "category": "education",
            "badge": "Trending",
            "rating": 4.7,
            "review_count": 105,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1520880351543-854737d94943?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "PDF", "price_kes": 600, "stock_quantity": 9999}
            ]
        },
        {
            "name": "Honey Processing Workshop",
            "description": "Recording of our live workshop on harvesting, filtering, and bottling honey.",
            "category": "education",
            "badge": None,
            "rating": 4.6,
            "review_count": 18,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1558583055-d7ac00b1adca?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Access Pass", "price_kes": 1500, "stock_quantity": 9999}
            ]
        }
    ]
    
    # 4. Tech / Hardware
    tech_products = [
        {
            "name": "Solar Hive Monitor",
            "description": "Real-time hive monitoring powered by solar energy. Track temperature, humidity, and acoustics.",
            "category": "technology",
            "badge": "Smart",
            "rating": 5.0,
            "review_count": 5,
            "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [
                {"size": "Standard", "price_kes": 15000, "stock_quantity": 10}
            ]
        },
        {
            "name": "Smart Hive Scale",
            "description": "Monitor nectar flow remotely by tracking hive weight changes day and night.",
            "category": "technology",
            "badge": "Essential",
            "rating": 4.8,
            "review_count": 8,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1585834893700-111531e05030?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Standard", "price_kes": 12000, "stock_quantity": 15}
            ]
        },
        {
            "name": "Acoustic Hive Detector",
            "description": "AI-powered sensor that listens for swarming behavior and distress signals.",
            "category": "technology",
            "badge": "AI Powered",
            "rating": 4.7,
            "review_count": 10,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Unit", "price_kes": 8500, "stock_quantity": 20}
            ]
        },
        {
            "name": "Apiary Weather Station",
            "description": "Micro-climate tracking for your apiary. Measures rain, wind, and UV.",
            "category": "technology",
            "badge": "Pro",
            "rating": 4.6,
            "review_count": 14,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1590552553952-78a05c3b44c6?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Station", "price_kes": 9500, "stock_quantity": 12}
            ]
        },
        {
            "name": "GPS Hive Tracker",
            "description": "Anti-theft GPS tracker designed to be hidden within the hive structure.",
            "category": "technology",
            "badge": "Security",
            "rating": 4.9,
            "review_count": 33,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1563228399-5407dc7c6e61?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Tracker", "price_kes": 4500, "stock_quantity": 50}
            ]
        },
        {
            "name": "Digital Frame Counter",
            "description": "Handheld device for quickly scanning and counting brood coverage on frames.",
            "category": "technology",
            "badge": "New",
            "rating": 4.5,
            "review_count": 6,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"],
            "variants": [
                {"size": "Device", "price_kes": 3000, "stock_quantity": 40}
            ]
        }
    ]

    all_products = honey_products + merch_products + education_products + tech_products

    for p_data in all_products:
        variants = p_data.pop("variants")
        
        # Generate slug
        if "slug" not in p_data:
            p_data["slug"] = p_data["name"].lower().replace(" ", "-")

        # Upsert Product (update if exists by slug)
        print(f"Upserting product: {p_data['name']} (slug: {p_data['slug']})...")
        res_prod = db_upsert("products", p_data, on_conflict="slug")
        
        if res_prod.get("success"):
            # Result data is a list of rows, get the first one
            product_data = res_prod["data"][0]
            product_id = product_data["id"]
            
            # Clear existing variants to avoid duplicates/orphans
            print(f" clearing old variants for {p_data['name']}...")
            db_delete("product_variants", {"product_id": product_id})
            
            # Insert Variants
            for v in variants:
                v["product_id"] = product_id
                # Generate a simple SKU if needed or let DB handle it (if logic existed)
                # Here we just insert.
                db_insert("product_variants", v)
            print(f" ✅ Updated {p_data['name']} with {len(variants)} variants.")
        else:
            print(f" ❌ Failed to add/update {p_data['name']}: {res_prod.get('error')}")
            
    print("\n🎉 Seeding complete!")

if __name__ == "__main__":
    # Ensure sys path can find 'app'
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    seed_shop()
