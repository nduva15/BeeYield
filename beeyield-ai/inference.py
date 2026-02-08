"""
BeeYield AI Enterprise Inference
=================================
Full RAG + LLM inference pipeline.
"""

import os
from typing import Optional, List, Dict, Any
from pathlib import Path
from datetime import datetime

# RAG imports
from rag.retriever import get_retriever, RetrievalResult
from rag.prompts import get_system_prompt, build_full_prompt, CompanyContext

# Model imports (optional - works without trained model)
try:
    from model import BeeFormerConfig, BeeFormerLMHead
    import torch
    MODEL_AVAILABLE = True
except ImportError:
    MODEL_AVAILABLE = False


class BeeYieldAIEnterprise:
    """
    Enterprise-grade BeeYield AI with RAG.
    
    3-Tier Memory Architecture:
    1. Static Memory: Pre-trained BeeFormer LLM
    2. Dynamic Memory: Qdrant Vector DB (company + research)
    3. Real-time Memory: Scheduled scraped content
    """
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        company: Optional[CompanyContext] = None,
    ):
        self.retriever = get_retriever()
        self.company = company or CompanyContext()
        self.model = None
        self.tokenizer = None
        self.device = None
        
        if MODEL_AVAILABLE and model_path:
            self._load_model(model_path)
    
    def _load_model(self, model_path: str) -> bool:
        """Load the trained BeeFormer model."""
        try:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            checkpoint = torch.load(model_path, map_location=self.device)
            
            config = BeeFormerConfig.from_dict(checkpoint["config"])
            self.model = BeeFormerLMHead(config)
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model.to(self.device)
            self.model.eval()
            
            # Load tokenizer
            tokenizer_path = Path(model_path).parent / "tokenizer.json"
            if tokenizer_path.exists():
                from tokenizers import Tokenizer
                self.tokenizer = Tokenizer.from_file(str(tokenizer_path))
            
            print(f"Loaded BeeFormer model from {model_path}")
            return True
        except Exception as e:
            print(f"Failed to load model: {e}")
            return False
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        force_type: Optional[str] = None,
    ) -> RetrievalResult:
        """Retrieve relevant context for a query."""
        return self.retriever.retrieve(query, top_k, force_type)
    
    def generate(
        self,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """Generate response using the BeeFormer model."""
        if not MODEL_AVAILABLE or self.model is None:
            return self._fallback_generate(prompt)
        
        if self.tokenizer is None:
            return self._fallback_generate(prompt)
        
        # Tokenize
        input_ids = self.tokenizer.encode(prompt).ids
        input_tensor = torch.tensor([input_ids], device=self.device)
        
        # Generate
        with torch.no_grad():
            output_ids = self.model.generate(
                input_tensor,
                max_new_tokens=max_tokens,
                temperature=temperature,
            )
        
        # Decode
        response = self.tokenizer.decode(output_ids[0].tolist())
        return response[len(prompt):].strip()
    
    def _fallback_generate(self, prompt: str) -> str:
        """Fallback when model not available - use context only."""
        # Extract context from prompt
        if "## Retrieved Knowledge" in prompt:
            start = prompt.find("## Retrieved Knowledge") + len("## Retrieved Knowledge")
            end = prompt.find("## User Question")
            if end > start:
                context = prompt[start:end].strip()
                
                return f"""# ⚠️ Model Status: Offline (RAG Mode Only)

I am currently running in **Retrieval-Augmented Generation (RAG) Mode** because the core BeeFormer model is not loaded. Below is the raw knowledge retrieved from my database relevant to your query.

## 📂 Retrieved Context
{context[:1500]}...

## 🔍 Analysis Note
This information is directly from my vector database. For a comprehensive, synthesized answer, please ensure the BeeFormer model (`best_model.pt`) is available in the `model/checkpoints` directory.
"""
        
        return (
            "# System Notification\n\n"
            "BeeYield AI model is not yet trained or loaded. "
            "Please train the model first using `python train_model.py`, "
            "or ensure the checkpoint exists."
        )
    
    def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        mode: str = "default",
        language: str = "EN",
    ) -> Dict[str, Any]:
        """
        Full RAG + LLM chat interface.
        
        This is the main entry point for the enterprise AI.
        """
        start_time = datetime.now()
        
        # Step 1: Retrieve relevant context
        retrieval = self.retrieve(message)
        
        # Step 2: Build prompt with context
        full_prompt = build_full_prompt(
            user_query=message,
            retrieved_context=retrieval.context,
            mode=mode,
            company=self.company,
        )
        
        # Step 3: Generate response
        response = self.generate(full_prompt)
        
        # Calculate latency
        latency_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        return {
            "response": response,
            "sources": retrieval.sources,
            "company_sources": retrieval.company_sources,
            "research_sources": retrieval.research_sources,
            "query_type": self.retriever.classify_query(message),
            "confidence": 0.85 if self.model else 0.6,
            "language": language,
            "model": "BeeYield-AI-Enterprise" if self.model else "RAG-Only",
            "latency_ms": latency_ms,
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get system status."""
        from rag.vector_store import get_vector_store
        store = get_vector_store()
        stats = store.get_stats()
        
        return {
            "status": "operational",
            "model_loaded": self.model is not None,
            "vector_store": stats,
            "company": self.company.company_name,
            "timestamp": datetime.now().isoformat(),
        }


# Singleton instance
_enterprise: Optional[BeeYieldAIEnterprise] = None


def get_enterprise_ai() -> BeeYieldAIEnterprise:
    """Get or create the enterprise AI instance."""
    global _enterprise
    if _enterprise is None:
        # Try to find model
        model_path = Path(__file__).parent / "model" / "checkpoints" / "best_model.pt"
        _enterprise = BeeYieldAIEnterprise(
            model_path=str(model_path) if model_path.exists() else None
        )
    return _enterprise


if __name__ == "__main__":
    # Test enterprise AI
    ai = get_enterprise_ai()
    
    print("BeeYield AI Enterprise Status:")
    print(ai.get_status())
    print()
    
    # Test query
    response = ai.chat("What is American Foulbrood and how do we treat it?")
    print("Response:", response["response"][:500])
    print("Sources:", response["sources"])
    print("Latency:", response["latency_ms"], "ms")
