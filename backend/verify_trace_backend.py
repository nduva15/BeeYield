import os
import sys
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services import traceability_service

codes = ["KIB-KIB-H001-0126", "KIB-KIB-H005-0126", "KIB-KIB-H015-0126"]

for code in codes:
    print(f"\n--- Tracing Code: {code} ---")
    try:
        res = traceability_service.get_trace_journey(code)
        if res:
            print(f"SUCCESS: Found journey for {code}")
            # print(json.dumps(res.dict(), indent=2, default=str)) # Too long
            print(f"Farmer: {res.farmer.name if res.farmer else 'N/A'}")
            print(f"Apiary: {res.apiary.name if res.apiary else 'N/A'}")
            print(f"Flora: {res.apiary.flora_types if res.apiary else 'N/A'}")
            print(f"Hive: {res.hive.hive_code if res.hive else 'N/A'}")
            print(f"Timeline Steps: {len(res.timeline)}")
            for step in res.timeline:
                print(f"  - {step.title}: {step.description}")
        else:
            print(f"FAILED: Journey not found for {code}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
