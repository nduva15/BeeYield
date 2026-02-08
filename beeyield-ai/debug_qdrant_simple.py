from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import numpy as np
from pathlib import Path

def test_minimal():
    db_path = str(Path(__file__).parent / "test_db")
    print(f"Testing local Qdrant at: {db_path}")
    
    client = QdrantClient(path=db_path)
    collection_name = "test_col"
    
    # Clean up
    try:
        client.delete_collection(collection_name)
    except:
        pass
        
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=4, distance=Distance.COSINE),
    )
    
    print("Collection created.")
    
    # Add a point
    client.upsert(
        collection_name=collection_name,
        points=[
            PointStruct(id=1, vector=[0.1, 0.2, 0.3, 0.4], payload={"test": "data"})
        ]
    )
    
    print("Point upserted.")
    
    # Search
    res = client.search(
        collection_name=collection_name,
        query_vector=[0.1, 0.2, 0.3, 0.4],
        limit=1
    )
    
    print(f"Search result: {res}")
    
    if len(res) > 0 and res[0].id == 1:
        print("SUCCESS: Minimal Qdrant works!")
    else:
        print("FAILURE: Minimal Qdrant failed!")

if __name__ == "__main__":
    test_minimal()
