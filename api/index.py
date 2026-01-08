import sys
import os

# Add the backend directory to the path so that 'app' can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

# This is the entry point for Vercel
