import requests
import json
import sys

# Force encoding to utf-8 for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')

url = "http://localhost:8000/api/v1/contact/newsletter"
payload = {
    "email": "test_script_file@example.com",
    "source": "debug_script"
}
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    with open("newsletter_test_output.txt", "w", encoding="utf-8") as f:
        f.write(f"Status Code: {response.status_code}\n")
        f.write(f"Response: {response.text}\n")
        
except Exception as e:
    print(f"Error: {e}")
    with open("newsletter_test_output.txt", "w", encoding="utf-8") as f:
        f.write(f"Error: {e}\n")
