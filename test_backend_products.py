
import requests

def test_products():
    r = requests.get("http://localhost:8000/api/v1/admin/products")
    if r.status_code == 200:
        data = r.json()
        print(f"Success! Found {len(data)} products.")
        if data:
            print(f"First product: {data[0]['name']}")
    else:
        print(f"Failed: {r.status_code}")

if __name__ == "__main__":
    test_products()
