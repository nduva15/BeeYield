import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add backend to path to import settings
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.core.config import settings

def apply_migrations():
    print("🚀 Starting BeeYield Postgres Migration...")
    
    # Load environment variables
    load_dotenv()
    
    # Prioritize non-pooling URL for migrations
    db_url = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("POSTGRES_URL") or settings.POSTGRES_URL
    
    if not db_url:
        print("❌ Error: No Postgres URL found in environment or settings.")
        return


    print(f"🔗 Connecting to database...")
    try:
        # SQLAlchemy requires 'postgresql://' instead of 'postgres://'
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
            
        import psycopg2
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        print("✅ Connected to Postgres.")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return


    # List of migration files to run (skipping ClickHouse)
    migrations = [
        "backend/migrations/001_create_tables.sql",
        "backend/migrations/003_auth_trigger.sql",
        "backend/migrations/004_create_notes_table.sql"
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
