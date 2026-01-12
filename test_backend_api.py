
import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")

# Try to query the backend directly
url = "http://localhost:8000/api/v1/admin/batches"
print(f"Querying backend: {url}")
try:
    r = requests.get(url)
    print(f"STATUS: {r.status_code}")
    print(f"RESPONSE: {r.text[:200]}")
except Exception as e:
    print(f"BACKEND ERROR: {e}")

# Try to query farmers
url2 = "http://localhost:8000/api/v1/admin/farmers"
print(f"\nQuerying backend: {url2}")
try:
    r = requests.get(url2)
    print(f"STATUS: {r.status_code}")
    print(f"RESPONSE: {r.text[:200]}")
except Exception as e:
    print(f"BACKEND ERROR: {e}")
