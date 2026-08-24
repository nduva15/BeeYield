import os
import sys
from pathlib import Path

# Ensure root backend directory is added to sys.path so `import app...` works universally.
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Allow FastAPI app to start without Rust core/background workers during testing.
os.environ.setdefault("BEEYIELD_TESTING", "1")
