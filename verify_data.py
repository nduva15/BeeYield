
import httpx
import json

def verify_data():
    api_url = "http://localhost:8000/api/v1"
    user_id = "10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6"
    
    print(f"--- Verifying Data for Timothy (user_id: {user_id}) ---")
    
    # 1. Fetch Apiaries
    try:
        r = httpx.get(f"{api_url}/beeyield/apiaries?user_id={user_id}")
        print(f"Status Code: {r.status_code}")
        if r.status_code != 200:
            print(f"Error Response: {r.text}")
            
        response_data = r.json()
        apiaries = response_data.get('data', []) if isinstance(response_data, dict) else response_data
        print(f"Found {len(apiaries)} apiaries.")
        
        kibwezi = next((a for a in apiaries if "Kibwezi" in a.get('name', '')), None)
        if kibwezi:
            print(f"Found '{kibwezi['name']}' with ID: {kibwezi['id']}")
            
            # 2. Fetch Hives for this apiary
            r = httpx.get(f"{api_url}/beeyield/hives?apiary_id={kibwezi['id']}")
            hives_data = r.json()
            hives = hives_data.get('data', []) if isinstance(hives_data, dict) else hives_data
            print(f"Found {len(hives)} hives in this apiary.")
            
            # 3. Fetch latest telemetry
            r = httpx.get(f"{api_url}/beeyield/telemetry/latest?user_id={user_id}")
            telemetry_data = r.json()
            telemetry = telemetry_data.get('data', []) if isinstance(telemetry_data, dict) else telemetry_data
            print(f"Found latest telemetry for {len(telemetry)} hives.")
            
            # Sample telemetry check
            if len(telemetry) > 0:
                print(f"Sample telemetry for hive {telemetry[0].get('hive_code', 'N/A')}: {json.dumps(telemetry[0], indent=2)}")
        else:
            print("Kibwezi Main Apiary not found.")
            
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    verify_data()
