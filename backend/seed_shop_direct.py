import os
from supabase import create_client

# Hardcoded keys from .env to ensure we use the SERVICE ROLE key
SUPABASE_URL = "https://lqdxsgnoeickomhsgeco.supabase.co"
# The service role key from .env
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc"

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("Connected to Supabase with Service Role Key")
except Exception as e:
    print(f"Failed to connect: {e}")
    exit(1)

MOCK_PRODUCTS = [
    {
        "name": "Highland Blossom Honey",
        "description": "Rare, multi-floral honey harvested from the pristine Aberdare highlands. Delicate floral notes with a smooth, lingering finish.",
        "category": "honey",
        "badge": "Bestseller",
        "images": ["/images/products/highland_blossom_honey.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 850, "stock_quantity": 100 },
            { "size": "500g", "price_kes": 1500, "stock_quantity": 75 },
            { "size": "1kg", "price_kes": 2800, "stock_quantity": 50 }
        ]
    },
    {
        "name": "Savannah Gold Honey",
        "description": "Rich, amber honey with distinctive citrus and acacia undertones from the Kibwezi savannah. Bold and energizing.",
        "category": "honey",
        "badge": "Premium",
        "images": ["/images/products/savannah_blossom_honey.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 950, "stock_quantity": 80 },
            { "size": "500g", "price_kes": 1700, "stock_quantity": 60 },
            { "size": "1kg", "price_kes": 3200, "stock_quantity": 40 }
        ]
    },
    {
        "name": "Mara Wildflower Honey",
        "description": "Exquisite wildflower honey from the Maasai Mara region. Complex, aromatic profile with hints of wild herbs and grassland blooms.",
        "category": "honey",
        "badge": "Limited Edition",
        "images": ["/images/products/wildflower_honey.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 1100, "stock_quantity": 40 },
            { "size": "500g", "price_kes": 2000, "stock_quantity": 30 },
            { "size": "1kg", "price_kes": 3800, "stock_quantity": 20 }
        ]
    },
    {
        "name": "Pure Acacia Honey",
        "description": "Light, mild honey with a subtle sweetness. Perfect for tea, baking, and those who prefer delicate flavors.",
        "category": "honey",
        "badge": "Organic",
        "images": ["/images/products/acacia_honey.png"],
        "rating": 4.7,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 800, "stock_quantity": 120 },
            { "size": "500g", "price_kes": 1400, "stock_quantity": 90 },
            { "size": "1kg", "price_kes": 2600, "stock_quantity": 60 }
        ]
    },
    {
        "name": "Desert Bloom Honey",
        "description": "Unique honey from desert-adapted flora in Northern Kenya. Crystallizes naturally with a creamy texture.",
        "category": "honey",
        "badge": "Rare",
        "images": ["/images/products/desert_bloom_honey.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 1200, "stock_quantity": 25 },
            { "size": "500g", "price_kes": 2200, "stock_quantity": 15 }
        ]
    },
    {
        "name": "Eucalyptus Reserve Honey",
        "description": "Bold, medicinal honey harvested from eucalyptus forests. Known for its immune-boosting properties.",
        "category": "honey",
        "badge": "Therapeutic",
        "images": ["/images/products/eucalyptus_honey.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 900, "stock_quantity": 70 },
            { "size": "500g", "price_kes": 1600, "stock_quantity": 50 },
            { "size": "1kg", "price_kes": 3000, "stock_quantity": 35 }
        ]
    },
    {
        "name": "Raw Honeycomb Chunk",
        "description": "Pure, unprocessed honeycomb straight from the hive. Experience honey in its most natural form.",
        "category": "honey",
        "badge": "Artisan",
        "images": ["/images/products/honey_comb_chunk.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "size": "200g", "price_kes": 1500, "stock_quantity": 40 },
            { "size": "400g", "price_kes": 2800, "stock_quantity": 25 }
        ]
    },
    {
        "name": "Coastal Mangrove Honey",
        "description": "Exotic honey from the mangrove forests of the Kenyan coast. Unique minerality with caramel undertones.",
        "category": "honey",
        "badge": "New",
        "images": ["/images/products/savannah_blossom_honey.png"],
        "rating": 4.6,
        "is_active": True,
        "variants": [
            { "size": "250g", "price_kes": 1050, "stock_quantity": 35 },
            { "size": "500g", "price_kes": 1900, "stock_quantity": 20 }
        ]
    },
    # ========== HARDWARE/SENSORS PRODUCTS ==========
    {
        "name": "ApiSense Sentinel Node",
        "description": "Advanced IoT hive monitor with acoustic disease detection, temperature, and humidity sensors. Real-time alerts via cellular network.",
        "category": "hardware",
        "badge": "New Technology",
        "images": ["/images/products/solar_hive_monitor.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "size": "Standard Unit", "price_kes": 15000, "stock_quantity": 50 }
        ]
    },
    {
        "name": "Intelligent Hive Scale",
        "description": "Precision weight monitoring with 4G connectivity. Track honey flow and colony growth in real-time from your dashboard.",
        "category": "hardware",
        "badge": "Best Value",
        "images": ["/images/products/hive_temp_sensor.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "size": "Standard Unit", "price_kes": 12500, "stock_quantity": 50 }
        ]
    },
    {
        "name": "BeeSense Humidity Monitor",
        "description": "Compact IoT humidity sensor with digital display. Track optimal hive conditions for healthy bee colonies.",
        "category": "hardware",
        "badge": "Essential",
        "images": ["/images/products/hive_humidity_sensor.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "Standard Unit", "price_kes": 8500, "stock_quantity": 75 }
        ]
    },
    {
        "name": "Solar Power Kit",
        "description": "Complete solar panel kit for off-grid hive monitoring. Powers all BeeYield sensors for 24/7 operation.",
        "category": "hardware",
        "badge": "Eco-Friendly",
        "images": ["/images/products/solar_hive_monitor.png"],
        "rating": 4.7,
        "is_active": True,
        "variants": [
            { "size": "5W Panel", "price_kes": 4500, "stock_quantity": 60 },
            { "size": "10W Panel", "price_kes": 7500, "stock_quantity": 40 }
        ]
    },
    {
        "name": "Hive Gateway Hub",
        "description": "Central hub connecting up to 20 hive sensors. Aggregates data and provides mesh networking for remote apiaries.",
        "category": "hardware",
        "badge": "Professional",
        "images": ["/images/products/hive_temp_sensor.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "Standard Unit", "price_kes": 22000, "stock_quantity": 25 }
        ]
    },
    {
        "name": "Acoustic Swarm Detector",
        "description": "AI-powered sound analysis module that predicts swarming events 48 hours in advance. Protect your colonies.",
        "category": "hardware",
        "badge": "AI Powered",
        "images": ["/images/products/hive_humidity_sensor.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "size": "Standard Unit", "price_kes": 18500, "stock_quantity": 30 }
        ]
    },
    {
        "name": "Weather Station Pro",
        "description": "Agricultural weather station with wind, rain, UV, and barometric sensors. Integrates with your hive dashboard.",
        "category": "hardware",
        "badge": "Premium",
        "images": ["/images/products/solar_hive_monitor.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "size": "Complete Kit", "price_kes": 28000, "stock_quantity": 15 }
        ]
    },
    {
        "name": "Starter Sensor Bundle",
        "description": "Perfect for beginners! Includes temperature, humidity, and weight sensors for monitoring 3 hives.",
        "category": "hardware",
        "badge": "Best for Beginners",
        "images": ["/images/products/hive_temp_sensor.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "3-Hive Bundle", "price_kes": 35000, "stock_quantity": 20 }
        ]
    },
    # ========== MERCH ==========
    {
        "name": "BeeYield Classic Tee",
        "description": "100% organic cotton with embroidered BeeYield logo. Durable, breathable, and supports sustainable pollination.",
        "category": "merch",
        "badge": "Eco-Friendly",
        "images": ["/images/products/beekeeper_tshirt.png"],
        "rating": 4.7,
        "is_active": True,
        "variants": [
            { "size": "S", "price_kes": 2500, "stock_quantity": 30 },
            { "size": "M", "price_kes": 2500, "stock_quantity": 50 },
            { "size": "L", "price_kes": 2500, "stock_quantity": 50 },
            { "size": "XL", "price_kes": 2500, "stock_quantity": 30 }
        ]
    },
    {
        "name": "Pollinator Hoodie",
        "description": "Premium heavyweight organic cotton hoodie. Perfect for early morning hive inspections.",
        "category": "merch",
        "badge": "Seasonal",
        "images": ["/images/products/beeyield_hoodie.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "M", "price_kes": 4500, "stock_quantity": 20 },
            { "size": "L", "price_kes": 4500, "stock_quantity": 25 },
            { "size": "XL", "price_kes": 4500, "stock_quantity": 15 }
        ]
    },
    # ========== EDUCATION ==========
    {
        "name": "Beekeeping Starter Guide",
        "description": "Comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting for beginners in East Africa.",
        "category": "education",
        "badge": "Digital",
        "images": ["/images/products/beekeeping_guide.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "size": "PDF Download", "price_kes": 1500, "stock_quantity": 9999 }
        ]
    },
    {
        "name": "Precision Pollination Handbook",
        "description": "Advanced techniques for using data to optimize crop yields. Essential for commercial farmers and professional beekeepers.",
        "category": "education",
        "badge": "Professional",
        "images": ["/images/products/beekeeping_guide.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "size": "PDF Download", "price_kes": 3500, "stock_quantity": 9999 }
        ]
    },
    {
        "name": "Disease & Pest Management",
        "description": "Identify and treat common bee diseases and pests in East Africa. Includes natural and chemical treatment options.",
        "category": "education",
        "badge": "Essential",
        "images": ["/images/products/beekeeping_guide.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "size": "PDF Download", "price_kes": 2000, "stock_quantity": 9999 }
        ]
    }
]

def seed_direct():
    print(f"Seeding {len(MOCK_PRODUCTS)} products directly to Supabase...")
    success_count = 0
    
    for p in MOCK_PRODUCTS:
        # Prepare product data for DB
        product_data = {
            "name": p["name"],
            "description": p.get("description"),
            "category": p["category"],
            "images": p.get("images", []),
            "is_active": p.get("is_active", True),
            # "badge": p.get("badge") # Check if table has badge column. If not, omit.
            # Assuming table MIGHT NOT have badge, let's omit to be safe unless we confirmed.
            # But let's try to include it, if it fails, maybe that's why?
            # Safe bet: omit badge if unsure. But user wants "available items", badge is visual.
        }
        
        # Try to insert product
        try:
            # We don't include 'variants' in product insert.
            res = supabase.table("products").insert(product_data).execute()
            
            if res.data and len(res.data) > 0:
                product_id = res.data[0]['id']
                print(f"Created Product: {p['name']} ({product_id})")
                
                # Insert variants
                variants = p.get("variants", [])
                if variants:
                    variants_data = []
                    for v in variants:
                        variants_data.append({
                            "product_id": product_id,
                            "size": v["size"],
                            "price_kes": v["price_kes"],
                            "stock_quantity": v["stock_quantity"],
                            "is_available": True
                        })
                    
                    try:
                        v_res = supabase.table("product_variants").insert(variants_data).execute()
                        print(f"  -> Added {len(v_res.data)} variants")
                        success_count += 1
                    except Exception as ve:
                        print(f"  -> Failed to add variants: {ve}")
            else:
                print(f"Failed to create product {p['name']}, no data returned.")
                
        except Exception as e:
            print(f"Error creating {p['name']}: {e}")

    print("Done.")

if __name__ == "__main__":
    seed_direct()
