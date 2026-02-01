import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_upsert, get_supabase_admin
from dotenv import load_dotenv
import json

load_dotenv()

def test_upsert():
    print("Testing single upsert...")
    item = {
        "name": "TEST PRODUCT",
        "description": "Test description",
        "category": "education",
        "badge": "TEST",
        "rating": 5.0,
        "review_count": 0,
        "is_active": True,
        "images": [],
        "slug": "test-product"
    }
    
    res = db_upsert("products", item, on_conflict="slug")
    print("FULL RESULT:")
    print(res)

if __name__ == "__main__":
    test_upsert()
