import requests
import json

def test_trace(code):
    url = f"http://localhost:8000/api/v1/traceability/code/{code}"
    print(f"Testing URL: {url}")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        if response.status_code == 200:
            try:
                data = response.json()
                print("Response is valid JSON")
            except Exception as e:
                print(f"Response is NOT valid JSON: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_trace("DEMO-001")
    test_trace("INVALID_CODE")
