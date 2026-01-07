"""
BeeYield COMPLETE Database Seed Script (V4)
Synchronized with latest schema and high-quality content.
Populates ALL tables for a production-like demonstration.
"""
import os
import sys
import uuid
import random
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

# Cache for table columns to avoid repeated API calls
SCHEMA_CACHE = {}

def get_valid_columns(table_name):
    """Fetch valid column names for a table from the schema cache or API"""
    if table_name in SCHEMA_CACHE:
        return SCHEMA_CACHE[table_name]
    
    try:
        import requests
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        url = f"{SUPABASE_URL}/rest/v1/"
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            spec = response.json()
            definitions = spec.get('definitions', {})
            if table_name in definitions:
                cols = list(definitions[table_name].get('properties', {}).keys())
                SCHEMA_CACHE[table_name] = cols
                return cols
            else:
                print(f"   [DEBUG] Table {table_name} not found in schema definitions.")
        else:
            print(f"   [DEBUG] Schema fetch failed with status {response.status_code}")
    except Exception as e:
        print(f"   [DEBUG] Schema fetch exception: {e}")
    
    return None

def table_exists(table_name):
    """Check if a table exists in the schema"""
    return get_valid_columns(table_name) is not None

def filter_data(table_name, data):
    """Filter data dictionary to only include columns that exist in the database"""
    valid_cols = get_valid_columns(table_name)
    if not valid_cols:
        return data # If we can't get schema, let it fail normally or try anyway
    
    if isinstance(data, list):
        filtered = [{k: v for k, v in item.items() if k in valid_cols} for item in data]
        if filtered and len(filtered[0]) < len(data[0]):
             dropped = set(data[0].keys()) - set(filtered[0].keys())
             # print(f"   [DEBUG] Dropped columns for {table_name}: {dropped}")
        return filtered
    
    filtered = {k: v for k, v in data.items() if k in valid_cols}
    if len(filtered) < len(data):
        dropped = set(data.keys()) - set(filtered.keys())
        # print(f"   [DEBUG] Dropped columns for {table_name}: {dropped}")
    return filtered

def clear_tables():
    """Wipe existing data to avoid conflicts, in reverse order of dependencies"""
    print("--- Clearing existing data ---")
    tables = [
        "user_profiles", "learning_lessons", "learning_modules", "impact_stories", 
        "esg_metrics", "crops_pollinated", "pollination_packages", "pollination_services", 
        "faqs", "partners", "company_milestones", "company_stats", 
        "team_members", "media_items", "blog_posts", "job_applications", 
        "job_listings", "order_items", "orders", "batches", "processing_records", 
        "harvests", "hives", "apiaries", "farmers", "product_variants", "products",
        "sdgs", "esg_pillars", "esg_initiatives", "company_values"
    ]
    for table in tables:
        try:
            print(f"   - Clearing {table}...")
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception as e:
            # print(f"   ⚠️ Could not clear {table}: {e}")
            pass

def seed_products():
    print("\n--- Seeding Products ---")
    products = [
        {
            "name": "Organic Acacia Honey", 
            "description": "Our signature light and floral honey, crystal clear for your morning tea.", 
            "category": "honey", 
            "badge": "Bestseller", 
            "images": ["/images/products/acacia_honey_jar.png"], 
            "rating": 4.9, 
            "review_count": 128
        },
        {
            "name": "Wild Forest Multi-floral", 
            "description": "Dark, complex honey harvested from the indigenous forests of Mt. Kenya.", 
            "category": "honey", 
            "badge": "Award Winning", 
            "images": ["/images/products/wild_forest_honey.png"], 
            "rating": 4.8, 
            "review_count": 94
        },
        {
            "name": "Royal Reserve Manuka-Style",
            "description": "Ultra-premium, high-activity honey with verified medicinal properties.",
            "category": "honey",
            "badge": "Premium",
            "images": ["/images/products/royal_reserve_honey.png"], 
            "rating": 5.0,
            "review_count": 42
        },
        {
            "name": "BeeYield Tech Tee", 
            "description": "Breathable, eco-friendly cotton t-shirt for the modern beekeeper.", 
            "category": "merch", 
            "badge": "Staff Pick", 
            "images": ["/images/products/beeyield_tshirt.png"], 
            "rating": 4.7, 
            "review_count": 32
        },
        {
            "name": "Save the Bees Hoodie",
            "description": "Premium heavyweight hoodie with our conservation message. Warm, stylish, and sustainable.",
            "category": "merch",
            "badge": "Limited Edition",
            "images": ["/images/products/beeyield_tshirt.png"],
            "rating": 4.9,
            "review_count": 45
        },
        {
            "name": "Stainless Steel Smoker",
            "description": "Professional-grade smoker with heat shield and leather bellows. Essential for every beekeeper.",
            "category": "merch",
            "badge": "Essential",
            "images": ["/images/products/smoker_tool.png"],
            "rating": 4.8,
            "review_count": 92
        },
        {
            "name": "Pro-Grip Hive Tool",
            "description": "Heavy-duty J-hook hive tool made from hardened spring steel. Perfect for prying frames.",
            "category": "merch",
            "badge": "Top Rated",
            "images": ["/images/products/smoker_tool.png"],
            "rating": 4.9,
            "review_count": 115
        },
        {
            "name": "BeeYield Branded Cap",
            "description": "Adjustable, breathable cotton cap with embroidered BeeYield logo.",
            "category": "merch",
            "badge": "New Arrival",
            "images": ["/images/products/beeyield_tshirt.png"],
            "rating": 4.6,
            "review_count": 28
        },
        {
            "name": "Beekeeping for Beginners", 
            "description": "A comprehensive digital course covering everything from first hive to first harvest.", 
            "category": "education", 
            "badge": "Best Seller", 
            "images": ["/images/products/beekeeping_book_guide.png"], 
            "rating": 4.9, 
            "review_count": 215
        },
        {
            "name": "Intermediate Hive Management",
            "description": "Advanced course on splits, pest management, and maximizing honey production.",
            "category": "education",
            "badge": "Advanced",
            "images": ["/images/products/advanced_beekeeping.png"], 
            "rating": 4.8, 
            "review_count": 64
        },
        {
            "name": "Pollination Economics Masterclass",
            "description": "Learn how to monetize your pollination services and calculate ROI for commercial fruit growers.",
            "category": "education",
            "badge": "Enterprise",
            "images": ["/images/products/pollination_economics.png"], 
            "rating": 5.0, 
            "review_count": 31
        },
        {
            "name": "Queen Rearing & Breeding",
            "description": "A deep dive into the specialized art of raising high-quality African honeybee queens.",
            "category": "education",
            "badge": "Expert Level",
            "images": ["/images/products/queen_rearing_course.png"], 
            "rating": 4.9, 
            "review_count": 18
        },
        {
            "name": "Bee Health & Disease Management",
            "description": "Identify, treat, and prevent common honeybee diseases and pests in tropical climates.",
            "category": "education",
            "badge": "Technical",
            "images": ["/images/products/beekeeping_book_guide.png"], 
            "rating": 4.7, 
            "review_count": 42
        },
        {
            "name": "ApiSense Sentinel Node",
            "description": "IoT hive monitor with acoustic disease detection and gas sensing (VOCs/CO2).",
            "category": "hardware",
            "badge": "New Technology",
            "images": ["/images/products/apisense_node.png"], 
            "rating": 5.0, 
            "review_count": 12
        },
        {
            "name": "Intelligent Hive Scale",
            "description": "Precision weight, temperature, and humidity monitoring with 4G connectivity.",
            "category": "hardware",
            "badge": "Best Value",
            "images": ["/images/products/hive_scale.png"], 
            "rating": 4.8, 
            "review_count": 24
        }
    ]
    
    for p_data in products:
        # Filter data to match actual schema
        cleaned_p_data = filter_data("products", p_data)
        
        # Check if 'images' was dropped
        if "images" in p_data and "images" not in cleaned_p_data:
            print(f"   Warning: 'images' column missing in DB, skipping for {p_data['name']}.")

        res = supabase.table("products").insert(cleaned_p_data).execute()
        if res.data:
            p_id = res.data[0]["id"]
            if p_data["category"] == "honey":
                v_data = [
                    {"product_id": p_id, "size": "250g", "price_kes": 450, "stock_quantity": 100},
                    {"product_id": p_id, "size": "500g", "price_kes": 850, "stock_quantity": 75},
                    {"product_id": p_id, "size": "1kg", "price_kes": 1500, "stock_quantity": 40}
                ]
            elif p_data["category"] == "merch":
                v_data = [{"product_id": p_id, "size": s, "price_kes": 2200, "stock_quantity": 20} for s in ["S", "M", "L", "XL"]]
            elif p_data["category"] == "education":
                v_data = [{"product_id": p_id, "size": "Digital Course", "price_kes": 3500, "stock_quantity": 9999}]
            else: # hardware
                v_data = [{"product_id": p_id, "size": "Unit", "price_kes": 15000, "stock_quantity": 50}]
            
            # Filter variant data
            cleaned_v_data = filter_data("product_variants", v_data)
            supabase.table("product_variants").insert(cleaned_v_data).execute()
            print(f"   [OK] {p_data['name']}")

def seed_traceability():
    print("\n--- Seeding Traceability (Farmer -> Apiary -> Hive -> Harvest) ---")
    farmers = [
        {
            "farmer_id": "F-MAT-001", "name": "Timothy Mathuva", "registration_date": datetime.now().isoformat(),
            "region": "Kibwezi", "county": "Makueni", "experience_years": 4, 
            "story": "Timothy founded BeeYield on his family farm to combine his passion for tech.",
            "latitude": -2.41, "longitude": 37.97, "location_name": "Kibwezi HQ", "certification_status": "CERTIFIED"
        }
    ]
    f_recs = supabase.table("farmers").insert(farmers).execute().data
    
    apiaries = [
        {
            "apiary_id": str(uuid.uuid4()), "apiary_code": "KIB-01", "name": "Main Apiary - Savannah",
            "farmer_id": f_recs[0]["id"], "environment_type": "Savannah Wooded", 
            "flora_types": ["Acacia", "Citrus", "Wildflowers"], "location_name": "Kibwezi",
            "latitude": -2.40, "longitude": 37.96, "region": "Eastern", "county": "Makueni",
            "hive_count": 184, "established_date": "2020-05-15", "is_active": True
        }
    ]
    a_recs = supabase.table("apiaries").insert(apiaries).execute().data

    hives = [
        {
            "hive_id": str(uuid.uuid4()), "hive_code": "KIB-01-H01", 
            "apiary_id": a_recs[0]["id"], "farmer_id": f_recs[0]["id"],
            "hive_type": "Langstroth", "bee_type": "African Honey Bee", 
            "frame_count": 10, "has_sensors": True, "installation_date": "2020-05-20"
        }
    ]
    h_recs = supabase.table("hives").insert(hives).execute().data

    harvests = [
        {
            "harvest_id": str(uuid.uuid4()), "harvest_code": "HRV-24-KIB-01", 
            "hive_id": h_recs[0]["id"], "farmer_id": f_recs[0]["id"],
            "harvest_date": "2024-01-15", "quantity_kg": 15.5, "quantity_left_for_bees_kg": 12.0,
            "extraction_method": "Centrifuge", "nectar_source": "Acacia Tortilis",
            "weather_conditions": "Sunny, 32°C", "moisture_content_percent": 17.2, "quality_score": 98
        }
    ]
    harv_recs = supabase.table("harvests").insert(harvests).execute().data
    
    batches = [
        {
            "batch_code": "DEMO-KIB-24", "packaging_date": "2024-01-20", 
            "expiry_date": "2026-01-20", "quantity_jars": 30, "jar_size_grams": 500
        }
    ]
    supabase.table("batches").insert(batches).execute()
    print("   ✓ Journey data established")

def seed_cms():
    print("\n--- Seeding CMS (Stats, Milestones, Team, Blog) ---")
    stats = [
        {"stat_key": "hives", "stat_label": "Hives Managed", "stat_value": "184", "icon": "Hexagon", "category": "impact", "display_order": 1},
        {"stat_key": "farmers", "stat_label": "Farmers Impacted", "stat_value": "50+", "icon": "Users", "category": "social", "display_order": 2},
        {"stat_key": "trees", "stat_label": "Trees Planted", "stat_value": "2,500+", "icon": "TreePine", "category": "environment", "display_order": 3}
    ]
    supabase.table("company_stats").insert(stats).execute()

    milestones = [
        {"year": 2020, "title": "The Founding", "description": "Started with 4 hives on a family plot in Kibwezi.", "milestone_type": "founding", "display_order": 1},
        {"year": 2022, "title": "Blockchain Protocol", "description": "BeeYield Blockchain V1 goes live.", "milestone_type": "technology", "display_order": 2}
    ]
    supabase.table("company_milestones").insert(milestones).execute()

    team = [
        {"name": "Timothy Mathuva", "role": "CEO & Founder", "is_leadership": True, "department": "Leadership", "display_order": 1, "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400", "bio": "Leading the pollination revolution."}
    ]
    supabase.table("team_members").insert(team).execute()

    blog = [
        {"title": "The Future of Smart Beekeeping", "slug": "future-smart-beekeeping", "excerpt": "How IoT is saving the African honey bee.", "content": "<p>Content...</p>", "category": "Technology", "status": "published", "author_name": "Agatha Mathuva", "published_at": datetime.now().isoformat()}
    ]
    supabase.table("blog_posts").insert(blog).execute()
    
    jobs = [
        {"title": "Software Engineer", "slug": "software-engineer", "department": "Technical", "location": "Nairobi / Remote", "job_type": "Full-time", "description": "Build the platform.", "is_active": True, "posted_date": str(date.today()), "closing_date": str(date.today() + timedelta(days=30))}
    ]
    supabase.table("job_listings").insert(filter_data("job_listings", jobs)).execute()
    print("   ✓ CMS content seeded")

def seed_services():
    print("\n--- Seeding Services & Impact ---")
    services = [
        {"name": "Precision Pollination", "slug": "precision-pollination", "short_description": "Data-driven optimization.", "display_order": 1, "features": ["IoT Sensors", "Yield Prediction"]}
    ]
    supabase.table("pollination_services").insert(services).execute()

    crops = [
        {"name": "Avocados", "slug": "avocados", "description": "30% yield increase.", "display_order": 1}
    ]
    supabase.table("crops_pollinated").insert(crops).execute()

    esg = [
        {"metric_key": "CO2", "metric_name": "CO2 Sequestered", "metric_value": 45.2, "metric_unit": "tons", "category": "environmental", "year": 2024}
    ]
    supabase.table("esg_metrics").insert(esg).execute()

    impact = [{"title": "Scaling Sustainability", "slug": "sustainability-impact", "summary": "Impact story.", "is_featured": True, "is_active": True}]
    supabase.table("impact_stories").insert(impact).execute()

    modules = [
        {"title": "Beekeeping Essentials", "slug": "beekeeping-essentials", "description": "Foundation course for aspiring beekeepers.", "category": "Basic", "duration_minutes": 60, "difficulty_level": "beginner"},
        {"title": "Pollinator Landscapes", "slug": "pollinator-landscapes", "description": "Learn to create habitats that support local biodiversity.", "category": "Environment", "duration_minutes": 45, "difficulty_level": "beginner"},
        {"title": "Introduction to Hive Health", "slug": "hive-health-intro", "description": "Identifying and managing common honeybee pests and diseases.", "category": "Technical", "duration_minutes": 90, "difficulty_level": "intermediate"},
        {"title": "The Honey Cycle", "slug": "honey-cycle", "description": "A deep dive into how bees make honey and the extraction process.", "category": "Basic", "duration_minutes": 30, "difficulty_level": "beginner"},
        {"title": "Urban Beekeeping", "slug": "urban-beekeeping", "description": "Master the unique challenges of keeping bees in city environments.", "category": "Specialized", "duration_minutes": 75, "difficulty_level": "intermediate"},
        {"title": "Sustainable Harvesting", "slug": "sustainable-harvesting", "description": "Ethical methods for harvesting honey while ensuring colony survival.", "category": "Ethics", "duration_minutes": 50, "difficulty_level": "beginner"}
    ]
    
    for mod in modules:
        res = supabase.table("learning_modules").insert(mod).execute()
        if res.data:
            m_id = res.data[0]["id"]
            if mod["slug"] == "beekeeping-essentials":
                lessons = [
                    {"module_id": m_id, "title": "Safety & Gear", "display_order": 1},
                    {"module_id": m_id, "title": "Hive Components", "display_order": 2}
                ]
            else:
                lessons = [{"module_id": m_id, "title": "Getting Started", "display_order": 1}]
            supabase.table("learning_lessons").insert(lessons).execute()
    
    print("   ✓ Services & learning seeded")

def seed_sdgs():
    print("\n--- Seeding SDGs ---")
    sdgs = [
        {"number": 1, "title": "No Poverty", "description": "Training programs for smallholder farmers.", "impact": "50+ farmers trained", "color": "bg-red-500", "icon": "Users", "display_order": 1},
        {"number": 2, "title": "Zero Hunger", "description": "Boosting agricultural yields.", "impact": "25 acres pollinated", "color": "bg-amber-500", "icon": "Wheat", "display_order": 2},
        {"number": 6, "title": "Clean Water", "description": "Ecosystem restoration.", "impact": "2,500+ trees", "color": "bg-cyan-500", "icon": "Droplets", "display_order": 3}
    ]
    supabase.table("sdgs").insert(sdgs).execute()

def seed_esg_content():
    print("\n--- Seeding ESG Content ---")
    pillars = [
        {"title": "Environmental", "icon": "Sprout", "color_gradient": "from-emerald-500 to-green-600", "summary_impact": "3,000+ tons CO2 avoided", "display_order": 1},
        {"title": "Social", "icon": "Users", "color_gradient": "from-amber-500 to-orange-600", "summary_impact": "KES 2.4M+ in income", "display_order": 2}
    ]
    for p in pillars:
        res = supabase.table("esg_pillars").insert(p).execute()
        if res.data:
            p_id = res.data[0]["id"]
            init = [{"pillar_id": p_id, "description": f"Key {p['title']} initiative."}]
            supabase.table("esg_initiatives").insert(init).execute()

def seed_company_values():
    print("\n--- Seeding Company Values ---")
    values = [
        {"title": "Family-Powered", "description": "Three siblings, one vision.", "icon": "Heart", "display_order": 1},
        {"title": "Sustainability", "description": "Protecting bees and yields.", "icon": "Leaf", "display_order": 2}
    ]
    supabase.table("company_values").insert(values).execute()

def main():
    print("=" * 60)
    print("BeeYield Database Seeding Engine V4")
    print("=" * 60)
    try:
        clear_tables()
        
        # Step-by-step seeding with checks
        seed_products()
        
        if table_exists("farmers"):
            seed_traceability()
        else:
            print("\n[SKIP] Traceability (Table 'farmers' not found)")
            
        if table_exists("company_stats"):
            seed_cms()
        else:
            print("\n[SKIP] CMS (Table 'company_stats' not found)")
            
        if table_exists("pollination_services"):
            seed_services()
        else:
            print("\n[SKIP] Services (Table 'pollination_services' not found)")
            
        if table_exists("sdgs"):
            seed_sdgs()
        else:
            print("\n[SKIP] SDGs (Table 'sdgs' not found)")
            
        if table_exists("esg_pillars"):
            seed_esg_content()
        else:
            print("\n[SKIP] ESG Content (Table 'esg_pillars' not found)")
            
        if table_exists("company_values"):
            seed_company_values()
        else:
            print("\n[SKIP] Company Values (Table 'company_values' not found)")

        print("\n" + "=" * 60)
        print("SUCCESS: Database seeding process finished!")
        
        # Final Warning if tables were missing
        existing_tables = list(SCHEMA_CACHE.keys())
        if len(existing_tables) < 10:
             print("\n!!! WARNING: Only " + str(len(existing_tables)) + " tables were found.")
             print("!!! Please run 'backend/db/complete_schema.sql' in your Supabase SQL Editor")
             print("!!! to enable all features (Traceability, CMS, ESG, etc.)")
        
        print("=" * 60)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\nERROR: {e}")
        print("\nHINT: This error often occurs when the Supabase schema is out of date.")
        print("FIX: Run the SQL in 'backend/db/complete_schema.sql' in your Supabase SQL Editor.")

if __name__ == "__main__":
    main()
