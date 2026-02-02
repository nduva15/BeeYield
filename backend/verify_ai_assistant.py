
import asyncio
import sys
import os
from pprint import pprint

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

# Mock settings to avoid dependency issues during simple verification
os.environ["GOOGLE_API_KEY"] = "mock_key_for_verification"
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"

try:
    from app.services.ai_assistant import BeeYieldAI, AIQuery, AIContext, IntentDetector
    print("✅ SUCCESS: Successfully imported BeeYieldAI and related classes.")
except ImportError as e:
    print(f"❌ ERROR: Failed to import AI modules. {e}")
    sys.exit(1)

async def verify_ai_logic():
    print("\n--- Verifying AI Logic ---")
    
    # Test Intent Detection
    test_messages = [
        ("Trace batch KIB-ACACIAL-26", "trace_honey"),
        ("I need to buy some honey", "product_search"),
        ("What is the temperature in hive H-01?", "iot_data"),
        ("Hello BeeYield", "greeting")
    ]
    
    print("\n1. Testing Intent Detection:")
    for msg, expected in test_messages:
        intents = IntentDetector.detect(msg)
        if expected in intents:
            print(f"  ✅ '{msg}' -> Detected: {intents} (Matched '{expected}')")
        else:
            print(f"  ❌ '{msg}' -> Detected: {intents} (Expected '{expected}')")

    # Test Suggestions
    print("\n2. Testing Role-Based Suggestions:")
    roles = ["guest", "farmer", "admin"]
    for role in roles:
        suggs = await BeeYieldAI.get_quick_suggestions(role)
        print(f"  Role '{role}': {len(suggs)} suggestions generated.")
        if len(suggs) > 3:
             print(f"  ✅ Role '{role}' specific suggestions found.")

    # Test Health Check
    print("\n3. Testing System Health Check:")
    health = await BeeYieldAI.health_check()
    print(f"  Health Status: {health['status']}")
    pprint(health['checks'])
    
    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(verify_ai_logic())
