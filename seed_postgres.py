import os
import psycopg2
from dotenv import load_dotenv

def seed_postgres():
    print("🚀 Seeding BeeYield Postgres Tables Directly...")
    
    load_dotenv()
    db_url = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("POSTGRES_URL")
    
    if not db_url:
        print("❌ Error: No Postgres URL found.")
        return

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected to Postgres.")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # 1. Team Members
    print("👥 Seeding Team Members...")
    team = [
        ('Samuel Maina', 'CEO & Co-Founder', 'Leadership', 'Passionate about sustainable beekeeping and empowering African beekeepers.', True, 1),
        ('Grace Wanjiku', 'COO', 'Leadership', 'Operations expert with 15 years in agricultural supply chains.', True, 2),
        ('Timothy Nduva', 'Head of Beekeeping', 'Operations', 'Third-generation beekeeper from Kibwezi.', True, 3)
    ]
    for member in team:
        cursor.execute(
            "INSERT INTO team_members (name, role, department, bio, is_leadership, display_order) VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
            member
        )

    # 2. Company Stats
    print("📊 Seeding Company Stats...")
    stats = [
        ('farmers_supported', '500+', 'Farmers Supported', 1),
        ('hives_managed', '10,000+', 'Hives Managed', 2),
        ('honey_produced', '50,000', 'Liters of Honey', 3),
        ('countries', '3', 'Countries Active', 4)
    ]
    for stat in stats:
        cursor.execute(
            "INSERT INTO company_stats (stat_key, stat_value, stat_label, display_order) VALUES (%s, %s, %s, %s) ON CONFLICT (stat_key) DO NOTHING",
            stat
        )

    # 3. Products & Variants
    print("🍯 Seeding Shop Data...")
    products = [
        ("Acacia Honey", "acacia-honey", "Pure light Acacia honey.", "honey", "Bestseller", 4.9, 128),
        ("Highland Blossom", "highland-blossom", "Rich dark multi-floral honey.", "honey", "Premium", 5.0, 85)
    ]
    
    for p in products:
        cursor.execute(
            "INSERT INTO products (name, slug, description, category, badge, rating, review_count) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (slug) DO NOTHING RETURNING id",
            p
        )
        res = cursor.fetchone()
        if res:
            product_id = res[0]
            # Simple variants
            cursor.execute(
                "INSERT INTO product_variants (product_id, size, price_kes, stock_quantity) VALUES (%s, %s, %s, %s)",
                (product_id, "500g", 850, 50)
            )

    print("\n🌟 Seeding completed successfully!")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    seed_postgres()
