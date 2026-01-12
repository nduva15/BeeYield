import base64
import json

# Original corrupted key
s_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc"
parts = s_key.split('.')

def decode(data):
    rem = len(data) % 4
    if rem > 0: data += '=' * (4 - rem)
    return base64.urlsafe_b64decode(data).decode('utf-8')

payload = json.loads(decode(parts[1]))
print("Original Payload:", payload)

# Fix "rose" to "role"
if "rose" in payload:
    payload["role"] = payload.pop("rose")

print("Corrected Payload:", payload)

# Re-encode payload
new_payload = base64.urlsafe_b64encode(json.dumps(payload, separators=(',', ':')).encode('utf-8')).decode('utf-8').rstrip('=')

# Reconstruct key with original signature
new_key = parts[0] + "." + new_payload + "." + parts[2]
print("New Key:", new_key)

# Test the new key
import requests
url = "https://lqdxsgnoeickomhsgeco.supabase.co/rest/v1/products?select=*"
headers = {
    "apikey": new_key,
    "Authorization": "Bearer " + new_key
}

try:
    res = requests.get(url, headers=headers)
    print("Response Code:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", e)
