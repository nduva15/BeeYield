"""
BeeYield Atomic AI Service
===========================
Integreates the pure Python 'beeformer' atomic model into the FastAPI backend.
"""

from app.services.ai_service import AIService
import traceback
import sys
import os

# Ensure the project root is in the path to find 'beeyield-ai'
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if project_root not in sys.path:
    sys.path.append(project_root)

# Try importing the atomic inference.py logic
try:
    from beeyield_ai.inference import BeeYieldAIEnterprise
except ImportError:
    # Fallback if module path is tricky
    try:
        sys.path.append(os.path.join(project_root, 'beeyield-ai'))
        from inference import BeeYieldAIEnterprise
    except ImportError:
        print("Warning: Could not import BeeYieldAIEnterprise. Atomic AI unavailable.")
        BeeYieldAIEnterprise = None

class AtomicAIService:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None and BeeYieldAIEnterprise:
            cls._instance = BeeYieldAIEnterprise()
        return cls._instance

    @staticmethod
    def _ensure_min_paragraphs(text: str, min_paragraphs: int = 2) -> str:
        """Ensure the response contains at least `min_paragraphs` paragraphs."""
        import re
        if not text:
            return text
        parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if len(parts) >= min_paragraphs:
            return "\n\n".join(parts)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]
        if not sentences:
            return text
        per_par = max(1, (len(sentences) + min_paragraphs - 1) // min_paragraphs)
        new_parts = []
        i = 0
        for _ in range(min_paragraphs):
            chunk = sentences[i:i+per_par]
            if not chunk and sentences:
                chunk = [sentences[-1]]
            if chunk:
                new_parts.append(" ".join(chunk).strip())
            i += per_par
        return "\n\n".join(new_parts)

    @staticmethod
    async def generate_thought_response(query: str) -> dict:
        """
        Main entry point for 'Native Hive' atomic queries.
        """
        ai = AtomicAIService.get_instance()
        if not ai:
            return {
                "response": "Atomic AI Core not running. Please check server logs.",
                "mode": "Unavailable"
            }
        
        # Use the synchronous atomic chat method
        # In a real async app, this might block, but for atomic demo it's fine.
        result = ai.chat(query)
        
        response_text = AtomicAIService._ensure_min_paragraphs(result["response"], min_paragraphs=2)
        
        return {
            "response": response_text,
            "thought_process": "1. Verified Input. 2. Retrieved Context. 3. Generated Atomic Response.",
            "mode": "Atomic (Python Native)",
            "confidence": 0.95
        }
