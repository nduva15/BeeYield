
import os
from supabase import create_client

url = "https://lqdxsgnoeickomhsgeco.supabase.co"
# Trying both Keys to see which one works
anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms"
service = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc"

print("--- TESTING ANON ---")
try:
    s_anon = create_client(url, anon)
    res = s_anon.table("honey_batches").select("*").limit(1).execute()
    print(f"ANON SUCCESS: found {len(res.data)} rows")
except Exception as e:
    print(f"ANON FAIL: {e}")

print("\n--- TESTING SERVICE ---")
try:
    s_serv = create_client(url, service)
    res = s_serv.table("honey_batches").select("*").limit(1).execute()
    print(f"SERVICE SUCCESS: found {len(res.data)} rows")
except Exception as e:
    print(f"SERVICE FAIL: {e}")
