
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

tables_to_check = [
    "contact_submissions",
    "pollination_requests",
    "newsletter_subscribers",
    "job_applications",
    "donations"
]

def check_tables():
    print("Checking for form-related tables...")
    for table in tables_to_check:
        try:
            # Try to select 0 records, just to see if table exists
            response = supabase.table(table).select("count", count="exact").limit(0).execute()
            print(f"✅ Table '{table}' exists.")
        except Exception as e:
            if "does not exist" in str(e).lower() or "404" in str(e) or "not found" in str(e).lower():
                print(f"❌ Table '{table}' DOES NOT exist.")
            else:
                print(f"⚠️ Error checking table '{table}': {e}")

if __name__ == "__main__":
    check_tables()
