import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
s=create_client(os.getenv('VITE_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print("--- Content of tasks table ---")
res = s.table('tasks').select('*').execute()
print(f"Count: {len(res.data)}")
for r in res.data:
    print(r)

print("\n--- Content of hives table ---")
res = s.table('hives').select('id, hive_code').limit(10).execute()
res_total = s.table('hives').select('id', count='exact').limit(1).execute()
print(f"Total Count: {res_total.count}")
for r in res.data:
    print(r)

print("\n--- Content of harvests table ---")
res = s.table('harvests').select('id, harvest_code').execute()
print(f"Count: {len(res.data)}")
for r in res.data:
    print(r)
