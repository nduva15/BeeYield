from app.db.supabase_db import db_select

def debug_ownership():
    print("=== FARMERS ===")
    farmers = db_select("farmers")
    for f in farmers:
        print(f"Farmer: {f.get('name')}, ID: {f.get('id')}, UserID: {f.get('user_id')}")

    print("\n=== APIARIES ===")
    apiaries = db_select("apiaries")
    for a in apiaries:
        print(f"Apiary: {a.get('name')}, ID: {a.get('id')}, FarmerID: {a.get('farmer_id')}, UserID: {a.get('user_id')}")

    print("\n=== HIVES ===")
    hives = db_select("hives", limit=10)
    for h in hives:
        print(f"Hive: {h.get('hive_code')}, ID: {h.get('id')}, ApiaryID: {h.get('apiary_id')}, UserID: {h.get('user_id')}")

if __name__ == "__main__":
    debug_ownership()
