import os
import sys
import uuid
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

f_uuid = str(uuid.uuid4())
farmer_data = {
    "id": f_uuid,
    "farmer_id": "F-TEST-001",
    "name": "Test Farmer",
    "registration_date": "2020-01-15T00:10:00+00:00"
}

try:
    res = supabase.table("farmers").insert(farmer_data).execute()
    print(f"Success: {res.data}")
except Exception as e:
    print(f"Error: {e}")
