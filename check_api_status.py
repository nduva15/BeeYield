
import requests

def check_status():
    r = requests.get("http://localhost:8000/")
    print(r.json())

if __name__ == "__main__":
    check_status()
