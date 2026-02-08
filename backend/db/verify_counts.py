import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

tables = ["apiaries", "hives", "farmers", "crop_pollination_requirements", "iot_devices", "sensor_readings"]
for table in tables:
    try:
        res = supabase.table(table).select("id", count="exact").execute()
        print(f"{table}: {res.count}")
    except Exception as e:
        print(f"{table}: Table might not exist ({e})")
