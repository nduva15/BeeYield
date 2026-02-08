from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import numpy as np
from pathlib import Path
import traceback

def test_trace():
    db_path = str(Path(__file__).parent / "trace_db")
    print(f"Testing at: {db_path}")
    
    try:
        print("Initializing client...")
        client = QdrantClient(path=db_path)
        print(f"Client initialized: {type(client)}")
        
        print("Checking for 'search' attribute...")
        if hasattr(client, "search"):
            print("Client has 'search' attribute.")
        else:
            print("Client DOES NOT have 'search' attribute.")
            
        collection_name = "trace_col"
        
        print("Creating collection...")
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=4, distance=Distance.COSINE),
        )
        print("Collection created.")
        
        print("Upserting point...")
        client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(id=1, vector=[0.1, 0.2, 0.3, 0.4], payload={"test": "data"})
            ]
        )
        print("Point upserted.")
        
        print("Attempting search...")
        res = client.search(
            collection_name=collection_name,
            query_vector=[0.1, 0.2, 0.3, 0.4],
            limit=1
        )
        print(f"Search result: {res}")
        
    except Exception as e:
        print("\n!!! CAUGHT EXCEPTION !!!")
        traceback.print_exc()

if __name__ == "__main__":
    test_trace()
