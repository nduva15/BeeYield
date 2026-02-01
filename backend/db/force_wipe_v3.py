import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def clear_table(table_name):
    print(f"  Clearing {table_name}...")
    try:
        # First try the fast way
        res = supabase.table(table_name).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"    Fast delete returned: {len(res.data) if res.data else 0} records")
        
        # Then check if still has records
        check = supabase.table(table_name).select("id", count="exact").limit(1).execute()
        count = check.count if check.count is not None else 0
        if count > 0:
            print(f"    ! Still has {count} records. Fetching IDs for manual delete...")
            all_records = supabase.table(table_name).select("id").limit(1000).execute()
            ids = [r['id'] for r in all_records.data]
            for record_id in ids:
                try:
                    supabase.table(table_name).delete().eq("id", record_id).execute()
                except Exception as e:
                    pass
            print(f"    Done with ID-based delete attempt for {len(ids)} records")
        else:
            print(f"    Table {table_name} is empty")
            
    except Exception as e:
        print(f"    X Error clearing {table_name}: {e}")

def main():
    # Order matters: children tables first, then parent tables
    tables = [
        "blockchain_records",
        "processing_records",
        "tracing_history",
        "activity_logs",
        "generated_documents",
        "packaged_batches",
        "honey_batches",
        "batches",
        "harvests",
        "inspections",
        "tasks",
        "hive_assignments",
        "pollination_activity_logs",
        "pollination_contracts",
        "sensor_readings",
        "iot_devices",
        "colonies",
        "flower_sources",
        "hives",
        "apiaries",
        "farmers"
    ]
    
    print("--- Starting Full Force Wipe V4 ---")
    # Multiple passes for safety
    for i in range(2):
        print(f"\nPass {i+1}:")
        for table in tables:
            clear_table(table)

if __name__ == "__main__":
    main()
