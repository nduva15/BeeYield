import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_insert, db_update, db_select, db_delete, get_supabase_admin, get_supabase
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def seed_shop():
    print("[BeeYield] Seeding Shop Data (8 items per category, unified honey weights)...")
    
    supabase = get_supabase_admin()
    if not supabase:
        print("⚠️ Admin client not available, trying regular client...")
        supabase = get_supabase()
    
    if not supabase:
        print("❌ Supabase not connected.")
        return

    # 1. Honey Products (8 items - Professional Traceable Collection)
    honey_products = [
        {
            "name": "BeeYield Premium Acacia",
            "description": "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
            "category": "honey",
            "badge": "Bestseller",
            "rating": 4.9,
            "review_count": 245,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
            "variants": [
                {"size": "250g", "price_kes": 450, "stock_quantity": 100, "is_available": True},
                {"size": "500g", "price_kes": 800, "stock_quantity": 75, "is_available": True},
                {"size": "1kg", "price_kes": 1500, "stock_quantity": 50, "is_available": True}
            ]
        },
        {
            "name": "Wildflower Blossom Honey",
            "description": "A complex, multi-floral honey with aromatic notes from Makueni's diverse flora. Perfect for daily wellness and gourmet pairings.",
            "category": "honey",
            "badge": "Premium",
            "rating": 5.0,
            "review_count": 182,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
            "variants": [
                {"size": "250g", "price_kes": 500, "stock_quantity": 80, "is_available": True},
                {"size": "500g", "price_kes": 900, "stock_quantity": 60, "is_available": True},
                {"size": "1kg", "price_kes": 1700, "stock_quantity": 30, "is_available": True}
            ]
        },
        {
            "name": "Kibwezi Forest Honey",
            "description": "Bold, dark, and rich in minerals. This forest honey is harvested from deep within the protected Kibwezi groundwater forest.",
            "category": "honey",
            "badge": "Rare",
            "rating": 4.8,
            "review_count": 96,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
            "variants": [
                {"size": "250g", "price_kes": 600, "stock_quantity": 40, "is_available": True},
                {"size": "500g", "price_kes": 1100, "stock_quantity": 30, "is_available": True},
                {"size": "1kg", "price_kes": 2000, "stock_quantity": 20, "is_available": True}
            ]
        },
        {
            "name": "Desert Thorn Honey",
            "description": "Exquisite honey from the arid regions. Intense floral notes with a hint of spice. Highly sought after for its unique properties.",
            "category": "honey",
            "badge": "Limited Edition",
            "rating": 4.9,
            "review_count": 54,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
            "variants": [
                {"size": "250g", "price_kes": 700, "stock_quantity": 30, "is_available": True},
                {"size": "500g", "price_kes": 1350, "stock_quantity": 25, "is_available": True},
                {"size": "1kg", "price_kes": 2500, "stock_quantity": 15, "is_available": True}
            ]
        },
        {
            "name": "Raw Honeycomb Chunk",
            "description": "The purest form of honey. A generous slab of fresh honeycomb submerged in our premium liquid honey. Entirely edible and delicious.",
            "category": "honey",
            "badge": "100% Raw",
            "rating": 5.0,
            "review_count": 312,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_500g.png"],
            "variants": [
                {"size": "500g jar", "price_kes": 1600, "stock_quantity": 20, "is_available": True}
            ]
        },
        {
            "name": "Lavender Infused Honey",
            "description": "Our premium acacia honey gently infused with organic lavender blossoms. Calming, floral, and perfect for evening tea.",
            "category": "honey",
            "badge": "New Arrival",
            "rating": 4.7,
            "review_count": 42,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png"],
            "variants": [
                {"size": "250g", "price_kes": 750, "stock_quantity": 50, "is_available": True},
                {"size": "500g", "price_kes": 1400, "stock_quantity": 30, "is_available": True}
            ]
        },
        {
            "name": "Ginger & Lemon Honey",
            "description": "A powerful immune-boosting blend of raw honey, organic ginger root, and zesty lemon. Great for soothing throats and boosting energy.",
            "category": "honey",
            "badge": "Wellness",
            "rating": 4.8,
            "review_count": 128,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png"],
            "variants": [
                {"size": "250g", "price_kes": 650, "stock_quantity": 40, "is_available": True},
                {"size": "500g", "price_kes": 1200, "stock_quantity": 60, "is_available": True}
            ]
        },
        {
            "name": "Signature Reserve (Aged)",
            "description": "Our most exclusive honey, aged for 12 months to develop deep, molasses-like complexity. A true connoisseur's choice.",
            "category": "honey",
            "badge": "Gold Label",
            "rating": 5.0,
            "review_count": 15,
            "is_active": True,
            "images": ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_500g.png"],
            "variants": [
                {"size": "350g Special Bottle", "price_kes": 2500, "stock_quantity": 10, "is_available": True}
            ]
        }
    ]

    # 2. Tech / Hardware (8 items)
    tech_products = [
        {
            "name": "Solar Hive Monitor Pro",
            "description": "Unique IoT solution. Tracks weight, temperature, humidity, and acoustics using advanced solar-powered sensors.",
            "category": "hardware", "badge": "Cutting Edge", "rating": 5.0, "review_count": 24, "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [{"size": "V3.0 Unit", "price_kes": 25000, "stock_quantity": 15, "is_available": True}]
        },
        {
            "name": "Hive Temp Sensor",
            "description": "Internal temperature probe for brood nest monitoring. Helps prevent swarming and detect colony loss.",
            "category": "hardware", "badge": None, "rating": 4.6, "review_count": 15, "is_active": True,
            "images": ["/images/products/hive_temp_sensor.png"],
            "variants": [{"size": "Pack of 5", "price_kes": 4500, "stock_quantity": 50, "is_available": True}]
        },
        {
            "name": "Hive Humidity Sensor",
            "description": "Monitor in-hive humidity levels to prevent fungal diseases and ensure optimal brood rearing.",
            "category": "hardware", "badge": None, "rating": 4.7, "review_count": 12, "is_active": True,
            "images": ["/images/products/hive_humidity_sensor.png"],
            "variants": [{"size": "Pack of 5", "price_kes": 5000, "stock_quantity": 40, "is_available": True}]
        },
        {
            "name": "Acoustic Health Sensor",
            "description": "AI-powered sound analysis that detects swarming behavior and queen absence before they become visible.",
            "category": "hardware", "badge": "AI Powered", "rating": 4.9, "review_count": 8, "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [{"size": "In-Hive Unit", "price_kes": 9500, "stock_quantity": 15, "is_available": True}]
        },
        {
            "name": "Smart GPS Hive Tracker",
            "description": "Discreet anti-theft tracking for your valuable colonies. Feature geofencing and motion alerts.",
            "category": "hardware", "badge": "Security", "rating": 4.8, "review_count": 31, "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [{"size": "Hidden Unit", "price_kes": 5500, "stock_quantity": 50, "is_available": True}]
        },
        {
            "name": "Digital Brood Probe",
            "description": "Ultra-thin sensor that fits between frames to monitor the precise climate of your brood nest.",
            "category": "hardware", "badge": "Precision", "rating": 4.6, "review_count": 18, "is_active": True,
            "images": ["/images/products/hive_temp_sensor.png"],
            "variants": [{"size": "Standard", "price_kes": 4200, "stock_quantity": 40, "is_available": True}]
        },
        {
            "name": "Base Station Gateway",
            "description": "Industrial grade gateway to connect up to 500 sensors across your whole farm farm. Range up to 15km.",
            "category": "hardware", "badge": "Infrastructure", "rating": 5.0, "review_count": 8, "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [{"size": "Gateway Unit", "price_kes": 18000, "stock_quantity": 5, "is_available": True}]
        },
        {
            "name": "Precision Bluetooth Scale",
            "description": "Monitor nectar flow and honey production remotely. Capable of measuring up to 150kg.",
            "category": "hardware", "badge": "Essential", "rating": 4.9, "review_count": 45, "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [{"size": "Max 150kg", "price_kes": 14000, "stock_quantity": 20, "is_available": True}]
        }
    ]

    # 3. Merch (8 items)
    merch_products = [
        {
            "name": "BeeYield Premium Hoodie",
            "description": "Heavyweight organic cotton hoodie with embroidered BeeYield logo. Stylish and warm.",
            "category": "merch", "badge": "Premium Gear", "rating": 4.9, "review_count": 86, "is_active": True,
            "images": ["/images/products/beeyield_hoodie.png"],
            "variants": [{"size": "M/L", "price_kes": 3800, "stock_quantity": 45, "is_available": True}]
        },
        {
            "name": "BeeYield Trucker Cap",
            "description": "Classic ventilated trucker cap with embroidered logo. Perfect for sunny days.",
            "category": "merch", "badge": None, "rating": 4.5, "review_count": 42, "is_active": True,
            "images": ["/images/products/beeyield_cap.png"],
            "variants": [{"size": "Standard", "price_kes": 1200, "stock_quantity": 60, "is_available": True}]
        },
        {
            "name": "Sustainability Tote Bag",
            "description": "Eco-friendly heavy canvas tote. Features stunning botanical bee artwork.",
            "category": "merch", "badge": "Eco-Choice", "rating": 4.7, "review_count": 42, "is_active": True,
            "images": ["/images/products/beeyield_tote_bag.png"],
            "variants": [{"size": "Large", "price_kes": 1200, "stock_quantity": 100, "is_available": True}]
        },
        {
            "name": "Signature Beekeeper Tee",
            "description": "Soft, breathable 100% organic cotton. A minimalist design that makes a statement.",
            "category": "merch", "badge": None, "rating": 4.8, "review_count": 124, "is_active": True,
            "images": ["/images/products/beekeeper_tshirt.png"],
            "variants": [{"size": "S/M/L", "price_kes": 2200, "stock_quantity": 70, "is_available": True}]
        },
        {
            "name": "BeeYield Ceramic Mug",
            "description": "A high-fire ceramic mug in matte charcoal. Ergonomic design for that perfect coffee.",
            "category": "merch", "badge": "Lifestyle", "rating": 4.6, "review_count": 34, "is_active": True,
            "images": ["/images/products/beeyield_tote_bag.png"],
            "variants": [{"size": "12oz", "price_kes": 950, "stock_quantity": 60, "is_available": True}]
        },
        {
            "name": "Beekeeping Enamel Pin",
            "description": "Limited edition enamel pins featuring different bee species. Perfect for your jacket.",
            "category": "merch", "badge": "Collectible", "rating": 5.0, "review_count": 48, "is_active": True,
            "images": ["/images/products/beeyield_cap.png"],
            "variants": [{"size": "Set", "price_kes": 1500, "stock_quantity": 200, "is_available": True}]
        },
        {
            "name": "Bamboo Bee Hotel",
            "description": "Support solitary bees in your garden with this sustainably sourced bamboo bee hotel.",
            "category": "merch", "badge": "Garden", "rating": 4.8, "review_count": 29, "is_active": True,
            "images": ["/images/products/beeyield_tote_bag.png"],
            "variants": [{"size": "Standard", "price_kes": 3200, "stock_quantity": 15, "is_available": True}]
        },
        {
            "name": "Wildflower Seed Mix",
            "description": "A curated blend of 25 native wildflower species designed to provide forage for bees.",
            "category": "merch", "badge": "Impact", "rating": 4.7, "review_count": 156, "is_active": True,
            "images": ["/images/products/beeyield_tote_bag.png"],
            "variants": [{"size": "50g Pack", "price_kes": 450, "stock_quantity": 500, "is_available": True}]
        }
    ]

    # 4. Education (8 items)
    education_products = [
        {
            "name": "BEEKEEPING STARTER GUIDE",
            "description": "Comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting.",
            "category": "education", "badge": "DIGITAL", "rating": 4.9, "review_count": 215, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "PDF Download", "price_kes": 1500, "stock_quantity": 9999, "is_available": True}]
        },
        {
            "name": "PRECISION POLLINATION MANUAL",
            "description": "Advanced techniques for using data to optimize crop yields. Essential for commercial farmers.",
            "category": "education", "badge": "PROFESSIONAL", "rating": 5.0, "review_count": 48, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "Hardcover", "price_kes": 3500, "stock_quantity": 50, "is_available": True}]
        },
        {
            "name": "QUEEN REARING MASTERCLASS",
            "description": "Video course with 12 hours of expert instruction on queen breeding, grafting, and genetics.",
            "category": "education", "badge": "VIDEO COURSE", "rating": 4.8, "review_count": 87, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "Online Access", "price_kes": 5500, "stock_quantity": 9999, "is_available": True}]
        },
        {
            "name": "HONEY PROCESSING MANUAL",
            "description": "Complete guide to harvesting, extracting, bottling, and quality certification for export.",
            "category": "education", "badge": "BESTSELLER", "rating": 4.7, "review_count": 134, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "Physical", "price_kes": 2500, "stock_quantity": 100, "is_available": True}]
        },
        {
            "name": "IOT HIVE MONITORING COURSE",
            "description": "Learn to set up, calibrate, and interpret data from BeeYield sensors. Includes certification.",
            "category": "education", "badge": "TECHNICAL", "rating": 4.9, "review_count": 56, "is_active": True,
            "images": ["/images/products/solar_hive_monitor.png"],
            "variants": [{"size": "Online", "price_kes": 4000, "stock_quantity": 9999, "is_available": True}]
        },
        {
            "name": "DISEASE & PEST MANAGEMENT",
            "description": "Identify and treat common bee diseases and pests in East Africa.",
            "category": "education", "badge": "ESSENTIAL", "rating": 4.8, "review_count": 98, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "Field Guide", "price_kes": 2000, "stock_quantity": 200, "is_available": True}]
        },
        {
            "name": "BUSINESS OF BEEKEEPING",
            "description": "Transform your hobby into a profitable venture. Covers pricing and marketing.",
            "category": "education", "badge": "ENTREPRENEUR", "rating": 4.6, "review_count": 73, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "E-Book", "price_kes": 4500, "stock_quantity": 9999, "is_available": True}]
        },
        {
            "name": "COMPLETE BEEKEEPER BUNDLE",
            "description": "All educational materials in one package! Includes all guides and courses.",
            "category": "education", "badge": "BEST VALUE", "rating": 5.0, "review_count": 42, "is_active": True,
            "images": ["/images/products/beekeeping_guide.png"],
            "variants": [{"size": "Full Access", "price_kes": 15000, "stock_quantity": 9999, "is_available": True}]
        }
    ]

    all_products = honey_products + tech_products + merch_products + education_products

    success_count = 0
    error_count = 0

    print(f"📦 Processing {len(all_products)} products...")

    for p_data in all_products:
        variants = p_data.pop("variants")
        
        # Check if product exists by name
        existing_products = db_select("products", filters={"name": p_data["name"]})
        
        product_id = None
        
        if existing_products:
            # Update existing
            print(f"   🔄 Updating: {p_data['name']}...")
            product_id = existing_products[0]["id"]
            res_update = db_update("products", p_data, filters={"id": product_id})
            if not res_update.get("success"):
                print(f"   ❌ Failed Update: {res_update.get('error')}")
                error_count += 1
                continue
        else:
            # Insert new
            print(f"   ➕ Inserting: {p_data['name']}...")
            res_insert = db_insert("products", p_data)
            if res_insert.get("success") and res_insert.get("data"):
                product_id = res_insert["data"][0]["id"]
            else:
                print(f"   ❌ Failed Insert: {res_insert.get('error')}")
                error_count += 1
                continue
        
        # Handle variants
        if product_id:
             # Clear existing variants
            db_delete("product_variants", {"product_id": product_id})
            
            # Insert Variants
            for v in variants:
                v["product_id"] = product_id
                db_insert("product_variants", v)
            
            print(f"      ✅ Variants updated ({len(variants)})")
            success_count += 1
            
    print(f"\n{'='*60}")
    print(f"🎉 Seeding Complete!")
    print(f"{'='*60}")
    print(f"✅ Success: {success_count} products")
    print(f"❌ Errors: {error_count} products")
    print(f"📊 Total: {len(all_products)} products")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    seed_shop()
