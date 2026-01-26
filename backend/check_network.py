import requests
import socket
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")

print("--- Network Diagnostic ---")

# 1. Test DNS Resolution
print("\n1. Testing DNS Resolution for google.com...")
try:
    ip = socket.gethostbyname("google.com")
    print(f"✅ Google IP: {ip}")
except Exception as e:
    print(f"❌ Google DNS Failed: {e}")

print(f"\n2. Testing DNS Resolution for Supabase ({SUPABASE_URL})...")
try:
    if SUPABASE_URL:
        domain = SUPABASE_URL.replace("https://", "").replace("http://", "").split("/")[0]
        print(f"   Domain: {domain}")
        ip = socket.gethostbyname(domain)
        print(f"✅ Supabase IP: {ip}")
    else:
        print("❌ SUPABASE_URL not found in env")
except Exception as e:
    print(f"❌ Supabase DNS Failed: {e}")

# 2. Test HTTP Connectivity
print("\n3. Testing HTTP to Google...")
try:
    r = requests.get("https://google.com", timeout=5)
    print(f"✅ Google HTTP: {r.status_code}")
except Exception as e:
    print(f"❌ Google HTTP Failed: {e}")

print("\n4. Testing HTTP to Supabase Health/Root...")
try:
    if SUPABASE_URL:
        r = requests.get(SUPABASE_URL, timeout=5)
        print(f"✅ Supabase HTTP: {r.status_code}")
    else:
        print("skipped")
except Exception as e:
    print(f"❌ Supabase HTTP Failed: {e}")
