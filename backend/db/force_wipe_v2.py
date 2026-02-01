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

def clear_all():
    # Tables in order of least dependencies to most
    tables = [
        "inspections",
        "tasks",
        "processing_records",
        "harvests",
        "packaged_batches",
        "honey_batches",
        "batches",
        "tracing_history",
        "activity_logs",
        "generated_documents",
        "hives",
        "apiaries",
        "farmers"
    ]
    
    print("--- Starting Force Wipe ---")
    
    # Try multiple passes to handle potential cross-references
    for pass_num in range(1, 4):
        print(f"\nPass {pass_num}:")
        for table in tables:
            try:
                # Get count before
                # res_count = supabase.table(table).select("id", count="exact").limit(1).execute()
                # count = res_count.count if res_count.count is not None else 0
                # if count == 0:
                #    continue
                
                res = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
                print(f"  ✓ {table} cleared")
            except Exception as e:
                print(f"  X {table} Error: {e}")

if __name__ == "__main__":
    clear_all()
