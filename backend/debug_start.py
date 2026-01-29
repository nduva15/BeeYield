import traceback
import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

try:
    print("Attempting to import main...")
    import main
    print("Main imported successfully")
except Exception:
    traceback.print_exc()
