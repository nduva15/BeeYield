
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing env vars")
    exit(1)

supabase: Client = create_client(url, key)

print("Fetching honey_batches...")
try:
    response = supabase.table("honey_batches").select("*").execute()
    batches = response.data
    print(f"Found {len(batches)} batches.")
    for b in batches:
        print("---")
        print(f"ID: {b.get('id')}")
        print(f"Farmer: {b.get('farmer_name')}")
        print(f"Beekeeper: {b.get('beekeeper_name')}") # Check if this column exists
        print(f"Region: {b.get('location_region')}") # Check if this column exists
        print(f"Keys: {b.keys()}")
except Exception as e:
    print(f"Error: {e}")
