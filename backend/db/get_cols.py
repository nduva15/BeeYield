
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def get_columns():
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        spec = response.json()
        definitions = spec.get('definitions', {})
        products = definitions.get('products', {})
        properties = products.get('properties', {})
        print(f"Products columns: {list(properties.keys())}")
    else:
        print(f"Error: {response.status_code}")

if __name__ == "__main__":
    get_columns()
