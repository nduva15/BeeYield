from qdrant_client import QdrantClient
from pathlib import Path

def inspect_client():
    db_path = str(Path(__file__).parent / "inspect_db")
    client = QdrantClient(path=db_path)
    print(f"Client type: {type(client)}")
    print(f"Client attributes: {dir(client)}")
    
    # Try to see what's inside if it's a wrapper
    if hasattr(client, "_client"):
        print(f"Internal client type: {type(client._client)}")
        print(f"Internal client attributes: {dir(client._client)}")

if __name__ == "__main__":
    inspect_client()
