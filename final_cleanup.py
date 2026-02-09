"""
FINAL CLEANUP SCRIPT
- Deletes all apiaries except "Kibwezi Main Apiary"
- Deletes all orphaned hives
- Ensures only Timothy's data remains
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('backend/.env')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get Timothy's user ID
users_resp = supabase.auth.admin.list_users()
timothy_id = None
for user in users_resp:
    if hasattr(user, 'email') and user.email == 'timothynduva349@gmail.com':
        timothy_id = user.id
        break

print(f"Timothy's User ID: {timothy_id}")

# Step 1: Get all apiaries
print("\n=== CURRENT APIARIES ===")
apiaries = supabase.table('apiaries').select('*').execute()
for apiary in apiaries.data:
    print(f"  - {apiary['name']} (ID: {apiary['id']}, user_id: {apiary.get('user_id', 'N/A')})")

# Step 2: Find Kibwezi Main Apiary
kibwezi_apiary = None
other_apiaries = []
for apiary in apiaries.data:
    if 'kibwezi' in apiary['name'].lower() and 'main' in apiary['name'].lower():
        kibwezi_apiary = apiary
    else:
        other_apiaries.append(apiary)

if kibwezi_apiary:
    print(f"\n✓ Found Kibwezi Main Apiary: {kibwezi_apiary['id']}")
else:
    print("\n✗ Kibwezi Main Apiary NOT FOUND!")
    exit(1)

print(f"\nApiaries to DELETE: {len(other_apiaries)}")
for a in other_apiaries:
    print(f"  - {a['name']} (ID: {a['id']})")

# Step 3: Delete harvests, notes, tasks, inspections for non-Kibwezi apiaries
for apiary in other_apiaries:
    apiary_id = apiary['id']
    
    # Get hives for this apiary
    hives = supabase.table('hives').select('id').eq('apiary_id', apiary_id).execute()
    hive_ids = [h['id'] for h in hives.data]
    
    if hive_ids:
        print(f"\n  Deleting data for {len(hive_ids)} hives in {apiary['name']}...")
        
        # Delete harvests
        for hive_id in hive_ids:
            supabase.table('harvests').delete().eq('hive_id', hive_id).execute()
        
        # Delete hive notes
        for hive_id in hive_ids:
            supabase.table('hive_notes').delete().eq('hive_id', hive_id).execute()
        
        # Delete hive tasks
        for hive_id in hive_ids:
            supabase.table('hive_tasks').delete().eq('hive_id', hive_id).execute()
        
        # Delete inspections
        for hive_id in hive_ids:
            supabase.table('inspections').delete().eq('hive_id', hive_id).execute()
        
        # Delete hives
        supabase.table('hives').delete().eq('apiary_id', apiary_id).execute()
        print(f"    ✓ Deleted {len(hive_ids)} hives")
    
    # Delete the apiary
    supabase.table('apiaries').delete().eq('id', apiary_id).execute()
    print(f"  ✓ Deleted apiary: {apiary['name']}")

# Step 4: Verify remaining data
print("\n=== VERIFICATION ===")
remaining_apiaries = supabase.table('apiaries').select('*').execute()
print(f"Remaining apiaries: {len(remaining_apiaries.data)}")
for a in remaining_apiaries.data:
    print(f"  - {a['name']}")

remaining_hives = supabase.table('hives').select('id').execute()
print(f"Total hives: {len(remaining_hives.data)}")

# Step 5: Ensure Kibwezi Main Apiary is linked to Timothy
if timothy_id and kibwezi_apiary:
    supabase.table('apiaries').update({'user_id': timothy_id}).eq('id', kibwezi_apiary['id']).execute()
    print(f"\n✓ Kibwezi Main Apiary linked to Timothy ({timothy_id})")

# Step 6: Ensure all hives in Kibwezi are linked to Timothy
supabase.table('hives').update({'user_id': timothy_id}).eq('apiary_id', kibwezi_apiary['id']).execute()
print(f"✓ All hives in Kibwezi Main Apiary linked to Timothy")

print("\n=== CLEANUP COMPLETE ===")
