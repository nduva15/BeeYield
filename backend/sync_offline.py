
import os
import json
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load .env
load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Use SUPABASE_KEY (which we updated to the new ANON_KEY)
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

offline_file = "backend/offline_submissions.json"

if not os.path.exists(offline_file):
    print(f"ℹ️ No offline submissions found at {offline_file}")
    sys.exit(0)

try:
    with open(offline_file, "r") as f:
        submissions = json.load(f)
except Exception as e:
    print(f"❌ Error reading offline file: {e}")
    sys.exit(1)

print(f"Found {len(submissions)} offline submissions. Attempting sync...")

success_count = 0
fail_count = 0

for entry in submissions:
    sub_type = entry.get("type")
    data = entry.get("data")
    timestamp = entry.get("timestamp")
    
    table_map = {
        "contact_submission": "contact_submissions",
        "pollination_request": "pollination_requests",
        "newsletter_subscription": "newsletter_subscribers"
    }
    
    table = table_map.get(sub_type)
    if not table:
        print(f"  - Skipping unknown type: {sub_type}")
        continue
        
    print(f"  - Syncing {sub_type} from {timestamp}...")
    try:
        # Check for newsletter dupe
        if sub_type == "newsletter_subscription":
            email = data.get("email")
            existing = supabase.table(table).select("id").eq("email", email).execute()
            if existing.data:
                print(f"    - Already exists: {email}")
                success_count += 1
                continue
        
        result = supabase.table(table).insert(data).execute()
        print(f"    ✅ Success")
        success_count += 1
    except Exception as e:
        print(f"    ❌ Failed: {e}")
        fail_count += 1

print(f"\nSync complete: {success_count} succeeded, {fail_count} failed.")

if success_count > 0 and fail_count == 0:
    # Rename file instead of deleting to be safe
    os.rename(offline_file, offline_file + ".synced")
    print(f"Renamed {offline_file} to .synced")
