import sys
import os
import requests
import json

# Add current directory to path to allow importing app modules
sys.path.append(os.getcwd())

try:
    from app.services.shop_service import MOCK_PRODUCTS
except ImportError:
    # Fallback if import fails (e.g. strict environment), define a simplified version or try to read file
    print("Could not import MOCK_PRODUCTS directly, defining manually based on known data...")
    # I will paste the mock products here to be safe and avoid import issues manually
    MOCK_PRODUCTS = [
    {
        "id": "honey-1",
        "name": "Highland Blossom Honey",
        "description": "Rare, multi-floral honey harvested from the pristine Aberdare highlands. Delicate floral notes with a smooth, lingering finish.",
        "category": "honey",
        "badge": "Bestseller",
        "images": ["/images/products/highland_blossom_honey.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v1", "size": "250g", "price_kes": 850, "stock_quantity": 100 },
            { "id": "v2", "size": "500g", "price_kes": 1500, "stock_quantity": 75 },
            { "id": "v3", "size": "1kg", "price_kes": 2800, "stock_quantity": 50 }
        ]
    },
    {
        "id": "honey-2",
        "name": "Savannah Gold Honey",
        "description": "Rich, amber honey with distinctive citrus and acacia undertones from the Kibwezi savannah. Bold and energizing.",
        "category": "honey",
        "badge": "Premium",
        "images": ["/images/products/savannah_blossom_honey.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "id": "v4", "size": "250g", "price_kes": 950, "stock_quantity": 80 },
            { "id": "v5", "size": "500g", "price_kes": 1700, "stock_quantity": 60 },
            { "id": "v6", "size": "1kg", "price_kes": 3200, "stock_quantity": 40 }
        ]
    },
    {
        "id": "honey-3",
        "name": "Mara Wildflower Honey",
        "description": "Exquisite wildflower honey from the Maasai Mara region. Complex, aromatic profile with hints of wild herbs and grassland blooms.",
        "category": "honey",
        "badge": "Limited Edition",
        "images": ["/images/products/wildflower_honey.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v-h3-1", "size": "250g", "price_kes": 1100, "stock_quantity": 40 },
            { "id": "v-h3-2", "size": "500g", "price_kes": 2000, "stock_quantity": 30 },
            { "id": "v-h3-3", "size": "1kg", "price_kes": 3800, "stock_quantity": 20 }
        ]
    },
    {
        "id": "honey-4",
        "name": "Pure Acacia Honey",
        "description": "Light, mild honey with a subtle sweetness. Perfect for tea, baking, and those who prefer delicate flavors.",
        "category": "honey",
        "badge": "Organic",
        "images": ["/images/products/acacia_honey.png"],
        "rating": 4.7,
        "is_active": True,
        "variants": [
            { "id": "v-h4-1", "size": "250g", "price_kes": 800, "stock_quantity": 120 },
            { "id": "v-h4-2", "size": "500g", "price_kes": 1400, "stock_quantity": 90 },
            { "id": "v-h4-3", "size": "1kg", "price_kes": 2600, "stock_quantity": 60 }
        ]
    },
    {
        "id": "honey-5",
        "name": "Desert Bloom Honey",
        "description": "Unique honey from desert-adapted flora in Northern Kenya. Crystallizes naturally with a creamy texture.",
        "category": "honey",
        "badge": "Rare",
        "images": ["/images/products/desert_bloom_honey.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "id": "v-h5-1", "size": "250g", "price_kes": 1200, "stock_quantity": 25 },
            { "id": "v-h5-2", "size": "500g", "price_kes": 2200, "stock_quantity": 15 }
        ]
    },
    {
        "id": "honey-6",
        "name": "Eucalyptus Reserve Honey",
        "description": "Bold, medicinal honey harvested from eucalyptus forests. Known for its immune-boosting properties.",
        "category": "honey",
        "badge": "Therapeutic",
        "images": ["/images/products/eucalyptus_honey.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v-h6-1", "size": "250g", "price_kes": 900, "stock_quantity": 70 },
            { "id": "v-h6-2", "size": "500g", "price_kes": 1600, "stock_quantity": 50 },
            { "id": "v-h6-3", "size": "1kg", "price_kes": 3000, "stock_quantity": 35 }
        ]
    },
    {
        "id": "honey-7",
        "name": "Raw Honeycomb Chunk",
        "description": "Pure, unprocessed honeycomb straight from the hive. Experience honey in its most natural form.",
        "category": "honey",
        "badge": "Artisan",
        "images": ["/images/products/honey_comb_chunk.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "id": "v-h7-1", "size": "200g", "price_kes": 1500, "stock_quantity": 40 },
            { "id": "v-h7-2", "size": "400g", "price_kes": 2800, "stock_quantity": 25 }
        ]
    },
    {
        "id": "honey-8",
        "name": "Coastal Mangrove Honey",
        "description": "Exotic honey from the mangrove forests of the Kenyan coast. Unique minerality with caramel undertones.",
        "category": "honey",
        "badge": "New",
        "images": ["/images/products/savannah_blossom_honey.png"],
        "rating": 4.6,
        "is_active": True,
        "variants": [
            { "id": "v-h8-1", "size": "250g", "price_kes": 1050, "stock_quantity": 35 },
            { "id": "v-h8-2", "size": "500g", "price_kes": 1900, "stock_quantity": 20 }
        ]
    },
    # ========== HARDWARE/SENSORS PRODUCTS ==========
    {
        "id": "hw-1",
        "name": "ApiSense Sentinel Node",
        "description": "Advanced IoT hive monitor with acoustic disease detection, temperature, and humidity sensors. Real-time alerts via cellular network.",
        "category": "hardware",
        "badge": "New Technology",
        "images": ["/images/products/solar_hive_monitor.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "id": "v-hw-1", "size": "Standard Unit", "price_kes": 15000, "stock_quantity": 50 }
        ]
    },
    {
        "id": "hw-2",
        "name": "Intelligent Hive Scale",
        "description": "Precision weight monitoring with 4G connectivity. Track honey flow and colony growth in real-time from your dashboard.",
        "category": "hardware",
        "badge": "Best Value",
        "images": ["/images/products/hive_temp_sensor.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "id": "v-hw-2", "size": "Standard Unit", "price_kes": 12500, "stock_quantity": 50 }
        ]
    },
    {
        "id": "hw-3",
        "name": "BeeSense Humidity Monitor",
        "description": "Compact IoT humidity sensor with digital display. Track optimal hive conditions for healthy bee colonies.",
        "category": "hardware",
        "badge": "Essential",
        "images": ["/images/products/hive_humidity_sensor.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v-hw-3", "size": "Standard Unit", "price_kes": 8500, "stock_quantity": 75 }
        ]
    },
    {
        "id": "hw-4",
        "name": "Solar Power Kit",
        "description": "Complete solar panel kit for off-grid hive monitoring. Powers all BeeYield sensors for 24/7 operation.",
        "category": "hardware",
        "badge": "Eco-Friendly",
        "images": ["/images/products/solar_hive_monitor.png"],
        "rating": 4.7,
        "is_active": True,
        "variants": [
            { "id": "v-hw-4-1", "size": "5W Panel", "price_kes": 4500, "stock_quantity": 60 },
            { "id": "v-hw-4-2", "size": "10W Panel", "price_kes": 7500, "stock_quantity": 40 }
        ]
    },
    {
        "id": "hw-5",
        "name": "Hive Gateway Hub",
        "description": "Central hub connecting up to 20 hive sensors. Aggregates data and provides mesh networking for remote apiaries.",
        "category": "hardware",
        "badge": "Professional",
        "images": ["/images/products/hive_temp_sensor.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v-hw-5", "size": "Standard Unit", "price_kes": 22000, "stock_quantity": 25 }
        ]
    },
    {
        "id": "hw-6",
        "name": "Acoustic Swarm Detector",
        "description": "AI-powered sound analysis module that predicts swarming events 48 hours in advance. Protect your colonies.",
        "category": "hardware",
        "badge": "AI Powered",
        "images": ["/images/products/hive_humidity_sensor.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "id": "v-hw-6", "size": "Standard Unit", "price_kes": 18500, "stock_quantity": 30 }
        ]
    },
    {
        "id": "hw-7",
        "name": "Weather Station Pro",
        "description": "Agricultural weather station with wind, rain, UV, and barometric sensors. Integrates with your hive dashboard.",
        "category": "hardware",
        "badge": "Premium",
        "images": ["/images/products/solar_hive_monitor.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "id": "v-hw-7", "size": "Complete Kit", "price_kes": 28000, "stock_quantity": 15 }
        ]
    },
    {
        "id": "hw-8",
        "name": "Starter Sensor Bundle",
        "description": "Perfect for beginners! Includes temperature, humidity, and weight sensors for monitoring 3 hives.",
        "category": "hardware",
        "badge": "Best for Beginners",
        "images": ["/images/products/hive_temp_sensor.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v-hw-8", "size": "3-Hive Bundle", "price_kes": 35000, "stock_quantity": 20 }
        ]
    },
    # ========== MERCH ==========
    {
        "id": "merch-1",
        "name": "BeeYield Classic Tee",
        "description": "100% organic cotton with embroidered BeeYield logo. Durable, breathable, and supports sustainable pollination.",
        "category": "merch",
        "badge": "Eco-Friendly",
        "images": ["/images/products/beekeeper_tshirt.png"],
        "rating": 4.7,
        "is_active": True,
        "variants": [
            { "id": "v13", "size": "S", "price_kes": 2500, "stock_quantity": 30 },
            { "id": "v14", "size": "M", "price_kes": 2500, "stock_quantity": 50 },
            { "id": "v15", "size": "L", "price_kes": 2500, "stock_quantity": 50 },
            { "id": "v16", "size": "XL", "price_kes": 2500, "stock_quantity": 30 }
        ]
    },
    {
        "id": "merch-2",
        "name": "Pollinator Hoodie",
        "description": "Premium heavyweight organic cotton hoodie. Perfect for early morning hive inspections.",
        "category": "merch",
        "badge": "Seasonal",
        "images": ["/images/products/beeyield_hoodie.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v17", "size": "M", "price_kes": 4500, "stock_quantity": 20 },
            { "id": "v18", "size": "L", "price_kes": 4500, "stock_quantity": 25 },
            { "id": "v18-xl", "size": "XL", "price_kes": 4500, "stock_quantity": 15 }
        ]
    },
    # ========== EDUCATION ==========
    {
        "id": "edu-1",
        "name": "Beekeeping Starter Guide",
        "description": "Comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting for beginners in East Africa.",
        "category": "education",
        "badge": "Digital",
        "images": ["/images/products/beekeeping_guide.png"],
        "rating": 4.9,
        "is_active": True,
        "variants": [
            { "id": "v22", "size": "PDF Download", "price_kes": 1500, "stock_quantity": 9999 }
        ]
    },
    {
        "id": "edu-2",
        "name": "Precision Pollination Handbook",
        "description": "Advanced techniques for using data to optimize crop yields. Essential for commercial farmers and professional beekeepers.",
        "category": "education",
        "badge": "Professional",
        "images": ["/images/products/beekeeping_guide.png"],
        "rating": 5.0,
        "is_active": True,
        "variants": [
            { "id": "v23", "size": "PDF Download", "price_kes": 3500, "stock_quantity": 9999 }
        ]
    },
    {
        "id": "edu-6",
        "name": "Disease & Pest Management",
        "description": "Identify and treat common bee diseases and pests in East Africa. Includes natural and chemical treatment options.",
        "category": "education",
        "badge": "Essential",
        "images": ["/images/products/beekeeping_guide.png"],
        "rating": 4.8,
        "is_active": True,
        "variants": [
            { "id": "v-e6", "size": "PDF Download", "price_kes": 2000, "stock_quantity": 9999 }
        ]
    }
]

API_URL = "http://localhost:8000/api/v1/admin/products"

def seed():
    print(f"Seeding {len(MOCK_PRODUCTS)} products to {API_URL}...")
    success_count = 0
    for p in MOCK_PRODUCTS:
        # Transform MOCK_PRODUCT to ProductCreate schema
        variants = []
        for v in p.get("variants", []):
            variants.append({
                "size": v.get("size"),
                "price_kes": v.get("price_kes"),
                "stock_quantity": v.get("stock_quantity"),
                "is_available": True
            })
            
        payload = {
            "name": p["name"],
            "description": p.get("description"),
            "category": p["category"],
            "images": p.get("images", []),
            "is_active": p.get("is_active", True),
            "variants": variants
        }
        
        try:
            res = requests.post(API_URL, json=payload)
            if res.status_code == 200 or res.status_code == 201:
                print(f"Created {p['name']}")
                success_count += 1
            else:
                print(f"Failed {p['name']}: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"Error {p['name']}: {e}")
            
    print(f"Seeding complete. {success_count}/{len(MOCK_PRODUCTS)} created.")

if __name__ == "__main__":
    seed()
