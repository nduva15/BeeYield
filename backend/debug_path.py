import sys
import os
# Add current directory to path to mimic uvicorn
sys.path.append(os.getcwd())

try:
    from app.services import traceability_service
    print(f"FILE: {traceability_service.__file__}")
except ImportError as e:
    print(f"ImportError: {e}")
    print(f"CWD: {os.getcwd()}")
    print(f"Sys Path: {sys.path}")
