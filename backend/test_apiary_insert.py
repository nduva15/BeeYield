"""Quick test for apiary insert to debug the actual error"""
import httpx
import os
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_KEY in environment")
    exit(1)

headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Test data - simulate what the frontend would send
test_apiary_code = f"APY-{str(uuid.uuid4())[:8].upper()}"
test_data = {
    "name": "Test Apiary Debug",
    "apiary_code": test_apiary_code,
    "apiary_type": "Permanent",
    "location_name": "Test Location",
    "status": "active",
    "is_active": True,
    "user_id": "00000000-0000-0000-0000-000000000000",  # Dummy UUID for testing
}

print(f"Supabase URL: {SUPABASE_URL[:30]}...")
print(f"Attempting to insert apiary with data:")
for k, v in test_data.items():
    print(f"  {k}: {v}")

try:
    with httpx.Client(base_url=f"{SUPABASE_URL}/rest/v1", headers=headers, timeout=10.0) as client:
        response = client.post("/apiaries", json=test_data)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code in [200, 201]:
            print("\n✓ SUCCESS! Apiary created.")
            # Clean up
            result = response.json()
            if result:
                apiary_id = result[0]["id"] if isinstance(result, list) else result.get("id")
                if apiary_id:
                    cleanup = client.delete(f"/apiaries?id=eq.{apiary_id}")
                    print(f"Cleanup response: {cleanup.status_code}")
        else:
            print(f"\n✗ FAILED: {response.text}")
            
except Exception as e:
    print(f"\nException: {type(e).__name__}: {e}")
