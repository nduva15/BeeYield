
import os
from supabase import create_client

url = "https://lqdxsgnoeickomhsgeco.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc"

try:
    supabase = create_client(url, key)
    res = supabase.table("batches").select("*").limit(1).execute()
    print(f"Success! Found {len(res.data)} rows in 'batches'.")
except Exception as e:
    print(f"Error: {e}")
