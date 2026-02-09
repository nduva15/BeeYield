import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to ensure we can import if needed, though mostly using installed packages
sys.path.append(os.getcwd())

# Load env variables from .env
load_dotenv()

from google import genai

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY not found in environment variables.")
    # Try reading directly from file if dotenv fails for some reason
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("GOOGLE_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
                    print("Found key via direct file read.")
                    break
    except Exception as e:
        print(f"Could not read .env file: {e}")

if not api_key:
    print("FAILED: No API Key found.")
    exit(1)

print(f"Using API Key: {api_key[:8]}...{api_key[-5:]}")

try:
    print("Initializing GenAI Client...")
    client = genai.Client(api_key=api_key)
    
    print("Sending request to gemini-3-flash-preview...")
    response = client.models.generate_content(
        model="gemini-3-flash-preview", 
        contents="Explain to a bee farmer why bees are important, in one sentence."
    )
    
    print("\n--- GEMINI RESPONSE ---")
    print(response.text)
    print("-----------------------")
    print("SUCCESS: Google GenAI SDK integration verified.")

except Exception as e:
    print(f"\nERROR: Verification failed.")
    print(str(e))
