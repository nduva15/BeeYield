from app.db.supabase_db import db_select

print("="*60)
print("DEBUGGING HARVEST VISIBILITY")
print("="*60)

# 1. Check Farmers
print("\n[1] Checking Farmers named 'Timothy Nduva'...")
farmers = db_select("farmers", filters={"name": "Timothy Nduva"})
for f in farmers:
    print(f"  - ID: {f.get('id')}, Name: {f.get('name')}, UserID: {f.get('user_id', 'N/A')}")

if not farmers:
    print("  No farmer found with name 'Timothy Nduva'")

# 2. Check Harvests
print("\n[2] Checking All Harvests...")
harvests = db_select("harvests")
total_kg = 0
for h in harvests:
    print(f"  - Harvest: {h.get('quantity_kg')}kg on {h.get('harvest_date')} (FarmerID: {h.get('farmer_id')})")
    total_kg += h.get('quantity_kg', 0)

print(f"\nTotal Harvest Weight in DB: {total_kg}kg")

# 3. Check ownership linkage
print("\n[3] Analysis")
if len(farmers) > 1:
    print("  [WARNING] Multiple 'Timothy Nduva' records found! Data might be split.")
    
    # Check which farmer has the harvests
    for f in farmers:
        f_harvests = [h for h in harvests if h.get('farmer_id') == f.get('id')]
        print(f"  - Farmer {f.get('id')[:8]}... owns {len(f_harvests)} harvests totaling {sum(h['quantity_kg'] for h in f_harvests)}kg")

print("="*60)
