
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def get_columns(table_name):
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
            table = definitions.get(table_name, {})
            properties = table.get('properties', {})
            cols = list(properties.keys())
            print(f"COLUMNS_START:{table_name}")
            for col in cols:
                print(f"COL:{col}")
            print(f"COLUMNS_END")
        else:
            print(f"ERROR_STATUS:{response.status_code}")
    except Exception as e:
        print(f"ERROR_EXCEPTION:{e}")

if __name__ == "__main__":
    get_columns("products")
    get_columns("product_variants")
