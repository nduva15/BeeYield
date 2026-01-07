import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("--- Products in DB ---")
res = supabase.table("products").select("name, category").execute()
for p in res.data:
    print(f"- {p['name']} ({p['category']})")

print("\n--- Learning Modules in DB ---")
res = supabase.table("learning_modules").select("title, category").execute()
for m in res.data:
    print(f"- {m['title']} ({m['category']})")
