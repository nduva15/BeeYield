import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_select

print("=" * 60)
print("DATABASE SYNC CHECK")
print("=" * 60)

apiaries = db_select('apiaries')
print(f'\nTotal Apiaries: {len(apiaries)}')
print('-' * 40)

hives = db_select('hives', limit=1000)
print(f'Total Hive Rows in DB: {len(hives)}')
print('-' * 40)

# Count hives per apiary
print('\nBreakdown by Apiary:')
for a in apiaries:
    count = len([h for h in hives if h.get('apiary_id') == a['id']])
    print(f"  - {a['name']}")
    print(f"      Code: {a.get('apiary_code')}")
    print(f"      hive_count field: {a.get('hive_count')}")
    print(f"      Actual hive rows: {count}")
    print()

print("=" * 60)
