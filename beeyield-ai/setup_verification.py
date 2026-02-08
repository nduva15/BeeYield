import sys
import os

print("--- BeeYield AI Environment Verification ---")

# Check RAG dependencies
print("\n[RAG] Checking dependencies...")
try:
    import fastapi
    print("   ✓ fastapi installed")
except ImportError:
    print("   ✗ fastapi NOT installed")

try:
    import uvicorn
    print("   ✓ uvicorn installed")
except ImportError:
    print("   ✗ uvicorn NOT installed")
    
try:
    import chromadb
    print("   ✓ chromadb installed")
except ImportError:
    print("   ✗ chromadb NOT installed (Might be optional/lazy loaded)")

try:
    import sentence_transformers
    print("   ✓ sentence_transformers installed")
except ImportError:
    print("   ✗ sentence_transformers NOT installed")

# Check Model dependencies
print("\n[Model] Checking dependencies...")
try:
    import torch
    print(f"   ✓ torch installed (version: {torch.__version__})")
except ImportError:
    print("   ✗ torch NOT installed")

try:
    import transformers
    print("   ✓ transformers installed")
except ImportError:
    print("   ✗ transformers NOT installed")

# Check local imports
print("\n[Project] Checking local modules...")
try:
    sys.path.append(os.path.join(os.path.dirname(__file__), 'model'))
    from beeformer import Beeformer
    print("   ✓ beeyield-ai.model.beeformer imported successfully")
except Exception as e:
    print(f"   ✗ Error importing beeformer: {e}")

try:
    sys.path.append(os.path.join(os.path.dirname(__file__), 'rag'))
    import api
    print("   ✓ beeyield-ai.rag.api imported successfully")
except Exception as e:
    print(f"   ✗ Error importing rag.api: {e}")

print("\n--- Verification Complete ---")
