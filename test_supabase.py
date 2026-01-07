import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
print(f"Key set: {bool(key)}")

try:
    supabase = create_client(url, key)
    print("✅ Successfully created client")
    res = supabase.table("products").select("*").limit(1).execute()
    print("✅ Successfully executed query")
    print(res.data)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
