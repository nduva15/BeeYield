import urllib.request
import json
import time

BASE_URL = "http://localhost:8000/api/v1"
ANALYTICS_URL = f"{BASE_URL}/analytics"

def get_json(url):
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                return json.loads(response.read().decode())
            return None
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
        return None

def test_analytics_endpoints():
    print("🚀 Starting Analytics Verification (urllib)...")

    # 1. Test Summary Endpoint
    print("\n📊 Testing Summary Endpoint...")
    data = get_json(f"{ANALYTICS_URL}/summary?days=30")
    if data:
        print("✅ Summary Endpoint OK")
        print(f"   - Page Views: {data.get('page_views')}")
        print(f"   - Unique Sessions: {data.get('unique_sessions')}")
        print(f"   - Traceability Scans: {data.get('traceability_scans')}")

    # 2. Test Page Views Chart
    print("\n📈 Testing Page Views Chart Endpoint...")
    data = get_json(f"{ANALYTICS_URL}/page-views?days=7")
    if data is not None:
        print("✅ Page Views Chart Endpoint OK")
        print(f"   - Data points returned: {len(data)}")
        if len(data) > 0:
            print(f"   - Sample: {data[0]}")

    # 3. Test Top Pages
    print("\n🏆 Testing Top Pages Endpoint...")
    data = get_json(f"{ANALYTICS_URL}/top-pages?limit=5")
    if data is not None:
        print("✅ Top Pages Endpoint OK")
        print(f"   - Pages returned: {len(data)}")
        for page in data:
            print(f"   - {page['page_path']}: {page['views']} views")

    # 4. Test Scans Chart
    print("\n📱 Testing Scans Chart Endpoint...")
    data = get_json(f"{ANALYTICS_URL}/scans?days=30")
    if data is not None:
        print("✅ Scans Chart Endpoint OK")
        print(f"   - Data points returned: {len(data)}")

    # 5. Test Sales Analytics
    print("\n💰 Testing Sales Analytics Endpoint...")
    data = get_json(f"{ANALYTICS_URL}/sales?days=30")
    if data is not None:
        print("✅ Sales Analytics Endpoint OK")
        print(f"   - Data points returned: {len(data)}")

if __name__ == "__main__":
    test_analytics_endpoints()
