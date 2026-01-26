
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load .env
load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    sys.exit(1)

print(f"Connecting to: {SUPABASE_URL}")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

tables = ["contact_submissions", "pollination_requests", "newsletter_subscribers"]

for table in tables:
    print(f"\nChecking table: {table}")
    try:
        # Try a simple select to see if table exists
        result = supabase.table(table).select("*").limit(1).execute()
        print(f"✅ Table '{table}' exists and is accessible.")
        print(f"   Data found: {len(result.data)} rows")
    except Exception as e:
        print(f"❌ Error checking table '{table}': {e}")
        if "relation" in str(e).lower() and "does not exist" in str(e).lower():
            print(f"   💡 Table '{table}' DOES NOT EXIST in the database.")
        elif "401" in str(e) or "unauthorized" in str(e).lower():
            print(f"   💡 Authentication failed. Check your SERVICE_ROLE_KEY.")
        else:
            print(f"   💡 Unknown error type.")

