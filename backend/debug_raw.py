from app.db.supabase_db import db_select
try:
    print("Calling db_select('products')...")
    products = db_select("products")
    print(f"Found {len(products)} RAW products.")
    for p in products:
        print(f" - {p.get('name')} (Active: {p.get('is_active')}, Category: {p.get('category')})")
        
    print("\nCalling db_select('product_variants')...")
    variants = db_select("product_variants")
    print(f"Found {len(variants)} RAW variants.")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
