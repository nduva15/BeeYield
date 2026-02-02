from app.services.shop_service import get_products
try:
    print("Calling get_products()...")
    products = get_products()
    print(f"Success. Found {len(products)} products.")
    for p in products:
        print(f" - {p['name']} ({len(p.get('variants', []))} variants)")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
