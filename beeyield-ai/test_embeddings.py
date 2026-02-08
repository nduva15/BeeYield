from rag.embeddings import EmbeddingModel
import numpy as np

def test_embeddings():
    print("Initializing EmbeddingModel...")
    model = EmbeddingModel()
    
    texts = ["BeeYield is a company.", "Bees produce honey.", "Hives are essential."]
    print(f"Embedding {len(texts)} texts...")
    
    try:
        embeddings = model.embed(texts)
        print(f"Success! Shape: {embeddings.shape}")
        
        query = "What is BeeYield?"
        vec = model.embed_query(query)
        print(f"Query embedding success! Dim: {len(vec)}")
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_embeddings()
