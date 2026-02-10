import os, sys
sys.path.append(os.getcwd())
from app.db.supabase_db import get_client, get_admin_headers

def check_columns(table):
    client = get_client()
    headers = get_admin_headers()
    # PostgREST allows getting schema via OpenAPI or by querying a non-existent column to see the error,
    # or better, just select * with limit 0 and check keys if it returns something.
    # But if it's empty, we won't see keys.
    # We can use the 'Prefer: headcount=exact' and select * limit 0, but that doesn't give columns.
    # Let's try to get the OpenAPI spec for the table.
    try:
        response = client.get(f"/", headers=headers)
        if response.status_code == 200:
            spec = response.json()
            definitions = spec.get('definitions', {})
            table_def = definitions.get(table, {})
            properties = table_def.get('properties', {})
            print(f"Columns for {table}:")
            for col, details in properties.items():
                print(f"  - {col}: {details.get('format', details.get('type'))}")
        else:
            print(f"Error fetching schema: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

check_columns('harvests')
