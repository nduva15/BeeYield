
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

def check_schema():
    if not SUPABASE_URL:
        print("VITE_SUPABASE_URL not found")
        return

    # Postgrest OpenAPI spec is at the root
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            spec = response.json()
            definitions = spec.get('definitions', {})
            print("--- Existing Tables in Supabase ---")
            for table in definitions.keys():
                print(f"- {table}")
                # Print columns
                properties = definitions[table].get('properties', {})
                cols = ", ".join(properties.keys())
                print(f"  Cols: {cols}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Failed to fetch schema: {e}")

if __name__ == "__main__":
    check_schema()
