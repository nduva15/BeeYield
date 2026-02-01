"""
Quick verification script for BeeYield Harvests Data Model
Tests that all new columns exist and contain data
"""
from app.db.supabase_db import db_select

print("=" * 60)
print("BEEYIELD HARVESTS DATA MODEL VERIFICATION")
print("=" * 60)

# Test 1: Fetch harvests
print("\n[TEST 1] Fetching harvests from database...")
harvests = db_select("harvests", limit=5)
print(f"✅ Found {len(harvests)} harvest records")

if harvests:
    print("\n[TEST 2] Checking first harvest record...")
    h = harvests[0]
    
    # Check required fields
    fields_to_check = [
        'id', 'harvest_date', 'quantity_kg', 
        'honey_type', 'color_grade', 'is_verified', 'batch_code'
    ]
    
    print("\nField Status:")
    for field in fields_to_check:
        value = h.get(field)
        status = "✅" if value is not None else "❌"
        print(f"  {status} {field}: {value}")
    
    print("\n[TEST 3] Full harvest record:")
    print("-" * 60)
    for key, value in h.items():
        print(f"  {key}: {value}")
    
    print("\n[TEST 4] Checking all harvests for new fields...")
    stats = {
        'total': len(harvests),
        'with_honey_type': sum(1 for h in harvests if h.get('honey_type')),
        'with_color_grade': sum(1 for h in harvests if h.get('color_grade')),
        'verified': sum(1 for h in harvests if h.get('is_verified')),
        'with_batch_code': sum(1 for h in harvests if h.get('batch_code'))
    }
    
    print("\nStatistics:")
    print(f"  Total harvests: {stats['total']}")
    print(f"  With honey_type: {stats['with_honey_type']} ({stats['with_honey_type']/stats['total']*100:.0f}%)")
    print(f"  With color_grade: {stats['with_color_grade']} ({stats['with_color_grade']/stats['total']*100:.0f}%)")
    print(f"  Verified: {stats['verified']} ({stats['verified']/stats['total']*100:.0f}%)")
    print(f"  With batch_code: {stats['with_batch_code']} ({stats['with_batch_code']/stats['total']*100:.0f}%)")

else:
    print("❌ No harvest records found!")
    print("\nTo seed data, run:")
    print("  1. Open Supabase SQL Editor")
    print("  2. Execute: backend/db/seed_harvests.sql")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
