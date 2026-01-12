import os
import sys
from dotenv import load_dotenv
import psycopg2

def apply_migrations():
    print("🚀 Starting Farmer Table Migration...")
    
    load_dotenv()
    
    # Prioritize non-pooling URL for migrations
    db_url = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")
    
    if not db_url:
        print("❌ Error: No Postgres URL found in environment.")
        return

    print(f"🔗 Connecting to database...")
    try:
        # SQLAlchemy requires 'postgresql://' instead of 'postgres://' - psycopg2 is fine with postgres:// usually but let's be safe
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
            
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        print("✅ Connected to Postgres.")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    migrations = [
        "supabase_update_farmers.sql"
    ]

    for mig_file in migrations:
        print(f"📜 Applying {mig_file}...")
        try:
            if not os.path.exists(mig_file):
                print(f" ⚠️ File not found: {mig_file}")
                continue
                
            with open(mig_file, 'r', encoding='utf-8') as f:
                sql = f.read()
                
            cursor = conn.cursor()
            cursor.execute(sql)
            print(f" ✅ Success: {mig_file}")
            cursor.close()
        except Exception as e:
            print(f" ❌ Error applying {mig_file}: {e}")

    conn.close()
    print("\n🌟 Migration process completed!")

if __name__ == "__main__":
    apply_migrations()
