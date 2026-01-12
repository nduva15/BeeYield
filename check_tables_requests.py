
import os
import requests
import json

def load_env():
    env = {}
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v
    return env

env = load_env()
url = env.get('VITE_SUPABASE_URL')
key = env.get('SUPABASE_SERVICE_ROLE_KEY')

tables = ['farmers', 'apiaries', 'hives', 'honey_batches', 'products', 'pollination_requests', 'contact_submissions', 'newsletter_subscribers']

print(f"Checking tables at {url}...")

for table in tables:
    resp = requests.get(
        f"{url}/rest/v1/{table}?select=id&limit=1",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}"
        }
    )
    if resp.status_code == 200:
        print(f"✅ {table}: Exists")
    elif resp.status_code == 404:
        print(f"❌ {table}: NOT FOUND")
    else:
        print(f"⚠️ {table}: {resp.status_code} - {resp.text}")
