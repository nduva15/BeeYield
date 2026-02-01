import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def verify_data():
    print("--- Verifying Data ---")
    
    # Farmers
    farmers = supabase.table("farmers").select("id, name").execute()
    print(f"Farmers ({len(farmers.data)}): {[f['name'] for f in farmers.data]}")
    
    # Apiaries
    apiaries = supabase.table("apiaries").select("id, name, hive_count, size_acres").execute()
    print(f"Apiaries ({len(apiaries.data)}): {[a['name'] for a in apiaries.data]}")
    for a in apiaries.data:
        print(f"  - {a['name']}: {a['hive_count']} hives, {a['size_acres']} acres")
    
    # Hives
    hives_count = supabase.table("hives").select("id", count="exact").execute()
    print(f"Total Hives: {hives_count.count}")

if __name__ == "__main__":
    verify_data()
