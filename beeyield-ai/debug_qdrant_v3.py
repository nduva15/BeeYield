from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import traceback
from pathlib import Path

def test_internal():
    db_path = str(Path(__file__).parent / "internal_db")
    client = QdrantClient(path=db_path)
    
    collection_name = "test_col"
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=4, distance=Distance.COSINE),
    )
    
    client.upsert(
        collection_name=collection_name,
        points=[PointStruct(id=1, vector=[0.1, 0.2, 0.3, 0.4], payload={"test": "data"})]
    )
    
    print(f"Client type: {type(client)}")
    print(f"Internal client type: {type(client._client)}")
    
    try:
        print("Calling client.search()...")
        res = client.search(
            collection_name=collection_name,
            query_vector=[0.1, 0.2, 0.3, 0.4],
            limit=1
        )
        print("SUCCESS")
    except AttributeError:
        print("Caught AttributeError on client.search()")
        try:
            print("Calling client._client.search() directly...")
            res = client._client.search(
                collection_name=collection_name,
                query_vector=[0.1, 0.2, 0.3, 0.4],
                limit=1,
                # Note: QdrantLocal.search might have different signature!
            )
            print("SUCCESS on internal client")
        except Exception as e:
            print(f"FAILED on internal client: {type(e).__name__}: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    test_internal()
