import os
import sys
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

tables = [
    "farmers", "apiaries", "hives", "harvests", 
    "processing_records", "batches", "honey_batches"
]

for table in tables:
    try:
        # Get one row and check its keys/values
        res = supabase.table(table).select("*").limit(1).execute()
        if res.data:
            print(f"\n--- Table: {table} (Row Sample) ---")
            print(json.dumps(res.data[0], indent=2, default=str))
        else:
            print(f"\n--- Table: {table} (Empty) ---")
    except Exception as e:
        print(f"\n--- Table: {table} (Error) ---")
        print(e)
