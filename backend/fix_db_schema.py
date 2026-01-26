
import os
import sys
import psycopg2
from urllib.parse import urlparse

# Add parent directory to path to allow imports if needed, though we try to work standalone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Load .env explicitly
load_dotenv()

POSTGRES_URL = os.getenv("POSTGRES_URL")

if not POSTGRES_URL:
    # Try to construct it from SUPABASE_URL if possible, but we need the password which might be in DB_PASSWORD or similar
    # Check if we have SUPABASE_DB_PASSWORD
    db_pass = os.getenv("SUPABASE_DB_PASSWORD") or os.getenv("DB_PASSWORD")
    db_host = os.getenv("SUPABASE_DB_HOST") 
    
    if not db_pass:
        print("❌ Error: POSTGRES_URL not found in .env and no DB_PASSWORD found to construct it.")
        print("Please add POSTGRES_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres")
        sys.exit(1)

    # If we have password, we can guess the host from supabase url maybe?
    # Usually supabase url is https://[ref].supabase.co
    supabase_url = os.getenv("SUPABASE_URL")
    if supabase_url and "supabase.co" in supabase_url:
        project_ref = supabase_url.split("://")[1].split(".")[0]
        POSTGRES_URL = f"postgresql://postgres:{db_pass}@db.{project_ref}.supabase.co:5432/postgres"
    else:
        print("❌ Error: Could not determine Postgres connection string.")
        sys.exit(1)

print(f"Connecting to database with inferred/found URL...")

try:
    conn = psycopg2.connect(POSTGRES_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("✅ Connected to Postgres.")

    # 1. Fix newsletter_subscribers
    print("\nChecking 'newsletter_subscribers' table...")
    # Add columns if not exist
    columns_to_add = {
        "source": "TEXT DEFAULT 'website'",
        "first_name": "TEXT"
    }
    
    for col, dtype in columns_to_add.items():
        try:
            cur.execute(f"ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS {col} {dtype};")
            print(f"  - Ensured column '{col}' exists.")
        except Exception as e:
            print(f"  - Error adding '{col}': {e}")
            
    # 2. Fix contact_submissions
    print("\nChecking 'contact_submissions' table...")
    contact_columns = {
        "name": "TEXT",
        "subject": "TEXT",
        "company": "TEXT",
        "farm_name": "TEXT",
        "crop_type": "TEXT",
        "acres": "TEXT", # Could be int but TEXT is safer for dirty data
        "apiary_name": "TEXT",
        "hive_count": "INTEGER",
        "experience_years": "TEXT",
        "status": "TEXT DEFAULT 'new'"
    }
    
    for col, dtype in contact_columns.items():
        try:
            cur.execute(f"ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS {col} {dtype};")
            print(f"  - Ensured column '{col}' exists.")
        except Exception as e:
            print(f"  - Error adding '{col}': {e}")

    # 3. Fix pollination_requests
    print("\nChecking 'pollination_requests' table...")
    pollination_columns = {
        "status": "TEXT DEFAULT 'pending'",
        "additional_info": "TEXT"
    }
    
    for col, dtype in pollination_columns.items():
        try:
            cur.execute(f"ALTER TABLE pollination_requests ADD COLUMN IF NOT EXISTS {col} {dtype};")
            print(f"  - Ensured column '{col}' exists.")
        except Exception as e:
            print(f"  - Error adding '{col}': {e}")

    print("\n✅ Schema migration completed.")
    conn.close()

except Exception as e:
    print(f"\n❌ Database Connection/Migration Failed: {e}")
    sys.exit(1)
