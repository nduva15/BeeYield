"""
VERIFY CURRENT STATE
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('backend/.env')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

print("=== CURRENT DATABASE STATE ===\n")

# Apiaries
apiaries = supabase.table('apiaries').select('*').execute()
print(f"APIARIES ({len(apiaries.data)}):")
for a in apiaries.data:
    print(f"  - {a['name']} (ID: {a['id'][:8]}..., user_id: {a.get('user_id', 'N/A')[:8] if a.get('user_id') else 'N/A'}...)")

# Hives
hives = supabase.table('hives').select('id, hive_code, apiary_id, user_id').execute()
print(f"\nHIVES ({len(hives.data)}):")
if len(hives.data) > 5:
    print(f"  First 5:")
    for h in hives.data[:5]:
        print(f"    - {h['hive_code']} (apiary: {h['apiary_id'][:8]}...)")
    print(f"  ... and {len(hives.data) - 5} more")
else:
    for h in hives.data:
        print(f"  - {h['hive_code']}")

# Harvests
harvests = supabase.table('harvests').select('id').execute()
print(f"\nHARVESTS: {len(harvests.data)}")

# Notes
notes = supabase.table('hive_notes').select('id').execute()
print(f"NOTES: {len(notes.data)}")

# Tasks
tasks = supabase.table('hive_tasks').select('id').execute()
print(f"TASKS: {len(tasks.data)}")

print("\n=== CHECK COMPLETE ===")
