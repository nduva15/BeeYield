import httpx
from app.core.security import create_access_token
from app.core.config import settings
import uuid

# Generate a fake user ID and token
user_id = str(uuid.uuid4())
token = create_access_token(subject=user_id)
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
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Request failed: {e}")
