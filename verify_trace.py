
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.blockchain.honey_chain import honey_blockchain
from app.services import traceability_service

def verify():
    print("--- Verifying Traceability Logic ---")
    
    # Ensure bootstrap data is loaded
    if honey_blockchain.chain_length <= 1:
        print("Bootstrapping demo data...")
        honey_blockchain._bootstrap_demo_data()
    
    print(f"Chain length: {honey_blockchain.chain_length}")
    
    # Test 1: Search by various IDs
    print("\n[Test 1] Searching by entity IDs...")
    
    farmer_id = "F-JOHN-KAMAU"
    farmer_block = honey_blockchain.search_by_record_id(farmer_id)
    if farmer_block:
        print(f"PASS: Found farmer block by ID {farmer_id}")
    else:
        print(f"FAIL: Could not find farmer block by ID {farmer_id}")
        
    harvest_id = "HARV-2024-001"
    harvest_block = honey_blockchain.search_by_record_id(harvest_id)
    if harvest_block:
        print(f"PASS: Found harvest block by ID {harvest_id}")
    else:
        print(f"FAIL: Could not find harvest block by ID {harvest_id}")

    # Test 2: Trace Batch
    print("\n[Test 2] Tracing Batch DEMO-001...")
    trace = honey_blockchain.trace_batch("DEMO-001")
    
    if not trace['found']:
        print("FAIL: Batch DEMO-001 not found")
        return
        
    details = trace['batch_details']
    print(f"Batch Found: {details.get('batch_code')}")
    
    # Check if we have linked IDs
    print(f"Linked Harvest ID: {details.get('harvest_id')}")
    print(f"Linked Hive ID: {details.get('hive_id')}")
    print(f"Linked Apiary ID: {details.get('apiary_id')}")
    print(f"Linked Farmer ID: {details.get('farmer_id')}")
    
    if details.get('harvest_id') and details.get('farmer_id'):
        print("PASS: Linked IDs successfully retrieved in trace")
    else:
        print("FAIL: Linked IDs missing in trace")

    # Test 3: Service Layer
    print("\n[Test 3] Service Layer full journey...")
    journey = traceability_service.get_trace_journey("DEMO-001")
    
    if journey:
        print("PASS: Service returned journey object")
        print(f"Timeline steps: {len(journey.timeline)}")
        for step in journey.timeline:
            print(f"  - {step.title} ({step.date})")
            
        if journey.farmer:
             print(f"PASS: Farmer populated: {journey.farmer.name}")
        else:
             print("FAIL: Farmer data missing in response")
             
        if journey.apiary:
             print(f"PASS: Apiary populated: {journey.apiary.name}")
        else:
             print("FAIL: Apiary data missing in response")
    else:
        print("FAIL: Service returned None")

if __name__ == "__main__":
    verify()
