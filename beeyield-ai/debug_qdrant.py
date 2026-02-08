from qdrant_client import QdrantClient
from pathlib import Path
import os

def debug_qdrant():
    db_path = str(Path(__file__).parent / "rag" / "db")
    print(f"Connecting to local Qdrant at: {db_path}")
    
    if not os.path.exists(db_path):
        print("X DB path does not exist!")
        return

    try:
        client = QdrantClient(path=db_path)
        collections = client.get_collections()
        print(f"Collections: {collections}")
        
        for c in collections.collections:
            info = client.get_collection(c.name)
            print(f"Collection '{c.name}': {info.points_count} points, status={info.status}")
            
    except Exception as e:
        print(f"X Debug failed: {e}")

if __name__ == "__main__":
    debug_qdrant()
