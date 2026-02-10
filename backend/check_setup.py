
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
try:
    from app.db.supabase_db import get_client, get_admin_headers
except ImportError:
    # Fallback if running from root
    sys.path.insert(0, os.path.join(os.getcwd()))
    from backend.app.db.supabase_db import get_client, get_admin_headers

load_dotenv()

def check():
    try:
        client = get_client()
        headers = get_admin_headers()
        print("Checking alert_thresholds table...")
        # We use a simple select to check if table exists
        resp = client.table("alert_thresholds").select("id").limit(1).execute()
        print("✅ Table 'alert_thresholds' EXISTS")
    except Exception as e:
        print(f"❌ Table 'alert_thresholds' ERROR: {e}")
        # If accessing via REST fails with 404, the python client usually raises an error
        # "relation ... does not exist" comes as a PostgrestError

if __name__ == "__main__":
    check()
