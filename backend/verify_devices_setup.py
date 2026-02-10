
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Supabase credentials missing")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Checking 'devices' table...")
    res = supabase.table('devices').select('serial_number').limit(1).execute()
    print("✅ Devices table exists.")
except Exception as e:
    print(f"❌ Devices table missing or error: {e}")

try:
    print("Checking 'support_tickets' table...")
    res = supabase.table('support_tickets').select('id').limit(1).execute()
    print("✅ Support Tickets table exists.")
except Exception as e:
    print(f"❌ Support Tickets table missing or error: {e}")
