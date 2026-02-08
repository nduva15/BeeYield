import httpx
import json

# Dummy token (backend in DEBUG mode accepts unsigned tokens or I can just mock the structure)
# security.py uses jwt.get_unverified_claims(token) in DEBUG mode.
# So I just need a valid JWT structure: header.payload.signature
# Payload needs "sub" (user_id)

user_id = "00000000-0000-0000-0000-000000000000"
# Minimal base64 parts
header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" # {"alg":"HS256","typ":"JWT"}
payload = "eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJleHAiOjE5OTk5OTk5OTl9" # {"sub":"...","exp":...}
sig = "signature"
token = f"{header}.{payload}.{sig}"

headers = {"Authorization": f"Bearer {token}"}

# API Endpoint
url = "http://localhost:8000/api/v1/beeyield/apiaries"

# Payload
data = {
    "name": "Debug Apiary via Script",
    "type": "Permanent",
    "location_name": "Test Loc",
    "expected_hives": 10
}

print(f"Sending request to {url}...")
try:
    r = httpx.post(url, json=data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
except Exception as e:
    print(f"Request failed: {e}")
