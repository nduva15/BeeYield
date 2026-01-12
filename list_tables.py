import os
import requests
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("VITE_SUPABASE_URL")
KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}"
}

response = requests.get(f"{URL}/rest/v1/", headers=headers)
if response.status_code == 200:
    spec = response.json()
    tables = spec.get('definitions', {}).keys()
    print("Tables found in database:")
    for t in sorted(tables):
        print(f" - {t}")
else:
    print(f"Error fetching schema: {response.status_code}")
    print(response.text)
