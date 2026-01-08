import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
# Try anon key first for connectivity
key = os.getenv("VITE_SUPABASE_ANON_KEY")

print(f"URL: {url}")
print(f"Key set: {bool(key)}")

try:
    supabase = create_client(url, key)
    print("✅ Successfully created client")
    # Try to select from a potentially public table
    res = supabase.table("team_members").select("*").limit(1).execute()
    print("✅ Successfully executed query")
    print(res.data)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

