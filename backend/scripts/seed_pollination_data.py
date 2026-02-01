"""
Seed data for Precision Pollination module
Creates sample contracts, assignments, and activity logs
"""
import sys
import os
from datetime import datetime, timedelta, date
import random

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.supabase_db import db_select, db_insert, get_supabase_admin


def seed_pollination_data():
    """Seed sample pollination data"""
    # Check connection
    if not get_supabase_admin():
        print("❌ Supabase client not initialized or not connected")
        return
    
    print("🌻 Seeding Precision Pollination data...")
    
    # Get existing farmers and hives
    try:
        farmers = db_select('farmers', columns='id, name', limit=5)
        hives = db_select('hives', columns='id, hive_code', limit=50)
        
        if not farmers:
            print("⚠️  No farmers found. Please seed farmers first.")
            return
        
        if not hives:
            print("⚠️  No hives found. Please seed hives first.")
            return
        
        print(f"✅ Found {len(farmers)} farmers and {len(hives)} hives")
        
    except Exception as e:
        print(f"❌ Error fetching farmers/hives: {e}")
        return
    
    # Sample crop types and locations
    crops = [
        {"crop": "Sunflower", "location": "Kibwezi Sunflower Farm", "acres": 25, "target_fpa": 2.0},
        {"crop": "Avocado", "location": "Machakos Avocado Orchard", "acres": 15, "target_fpa": 2.5},
        {"crop": "Macadamia", "location": "Thika Macadamia Plantation", "acres": 30, "target_fpa": 3.0},
        {"crop": "Coffee", "location": "Kiambu Coffee Estate", "acres": 20, "target_fpa": 1.5},
        {"crop": "Mango", "location": "Makueni Mango Farm", "acres": 18, "target_fpa": 2.0},
        {"crop": "Watermelon", "location": "Kitui Watermelon Fields", "acres": 12, "target_fpa": 3.0},
        {"crop": "Cucumber", "location": "Kajiado Greenhouse Farm", "acres": 8, "target_fpa": 2.5},
        {"crop": "Strawberry", "location": "Limuru Strawberry Farm", "acres": 5, "target_fpa": 2.0},
    ]
    
    # Create contracts
    contracts_created = []
    today = date.today()
    
    for i, crop_data in enumerate(crops):
        farmer = random.choice(farmers)
        
        # Calculate dates
        start_date = today - timedelta(days=random.randint(0, 60))
        end_date = start_date + timedelta(days=random.randint(21, 45))
        
        # Calculate hive requirements
        hives_needed = int(crop_data["acres"] * crop_data["target_fpa"] / 8)  # Assuming 8 frames per hive
        hives_deployed = random.randint(int(hives_needed * 0.7), hives_needed)
        
        # Determine status
        if today < start_date:
            status = "pending"
        elif today > end_date:
            status = "completed"
        else:
            status = "active"
        
        # Calculate payment
        payment_per_hive = random.randint(2000, 3500)
        payment_amount = hives_needed * payment_per_hive
        
        payment_statuses = ["pending", "partial", "paid"]
        payment_status = "paid" if status == "completed" else random.choice(payment_statuses)
        
        contract_code = f"PC-{today.strftime('%Y%m%d')}-{1000 + i}"
        
        contract_data = {
            "contract_code": contract_code,
            "farmer_id": farmer["id"],
            "crop_type": crop_data["crop"],
            "farm_location": crop_data["location"],
            "farm_size_acres": crop_data["acres"],
            "contract_start_date": start_date.isoformat(),
            "contract_end_date": end_date.isoformat(),
            "hive_count_required": hives_needed,
            "hive_count_deployed": hives_deployed,
            "target_fpa": crop_data["target_fpa"],
            "actual_fpa": round((hives_deployed * 8) / crop_data["acres"], 2),
            "status": status,
            "payment_amount": payment_amount,
            "payment_status": payment_status,
            "notes": f"Pollination contract for {crop_data['crop']} cultivation"
        }
        
        try:
            result = db_insert('pollination_contracts', contract_data)
            if result.get("success") and result.get("data"):
                # Handle list response from Supabase
                data = result["data"]
                if isinstance(data, list) and len(data) > 0:
                    contract = data[0]
                    contracts_created.append(contract)
                    print(f"✅ Created contract: {contract_code} - {crop_data['crop']} ({status})")
            else:
                 print(f"❌ Failed to create contract {contract_code}: {result.get('error')}")
        except Exception as e:
            print(f"❌ Error creating contract {contract_code}: {e}")
    
    print(f"\n📋 Created {len(contracts_created)} pollination contracts")
    
    # Create hive assignments for active contracts
    assignments_created = 0
    activity_logs_created = 0
    
    for contract in contracts_created:
        if contract["status"] in ["active", "completed"]:
            # Assign hives to this contract
            num_hives_to_assign = contract["hive_count_deployed"]
            available_hives = random.sample(hives, min(num_hives_to_assign, len(hives)))
            
            for hive in available_hives:
                assignment_date = datetime.fromisoformat(contract["contract_start_date"]).date()
                removal_date = None
                
                if contract["status"] == "completed":
                    removal_date = datetime.fromisoformat(contract["contract_end_date"]).date()
                
                # Random placement coordinates near Nairobi
                placement_lat = -1.2921 + random.uniform(-0.5, 0.5)
                placement_lng = 36.8219 + random.uniform(-0.5, 0.5)
                
                assignment_data = {
                    "contract_id": contract["id"],
                    "hive_id": hive["id"],
                    "assignment_date": assignment_date.isoformat(),
                    "removal_date": removal_date.isoformat() if removal_date else None,
                    "placement_location": contract["farm_location"],
                    "placement_lat": placement_lat,
                    "placement_lng": placement_lng,
                    "notes": f"Deployed for {contract['crop_type']} pollination"
                }
                
                try:
                    result = db_insert('hive_assignments', assignment_data)
                    if result.get("success"):
                        assignments_created += 1
                        
                        # Create activity log for deployment
                        log_data = {
                            "contract_id": contract["id"],
                            "hive_id": hive["id"],
                            "activity_type": "hive_deployed",
                            "activity_description": f"Hive {hive['hive_code']} deployed to {contract['farm_location']}",
                            "severity": "success",
                            "timestamp": datetime.combine(assignment_date, datetime.min.time()).isoformat(),
                            "metadata": {
                                "hive_code": hive["hive_code"],
                                "location": contract["farm_location"],
                                "crop_type": contract["crop_type"]
                            }
                        }
                        
                        db_insert('pollination_activity_logs', log_data)
                        activity_logs_created += 1
                        
                        # If removed, create removal log
                        if removal_date:
                            removal_log_data = {
                                "contract_id": contract["id"],
                                "hive_id": hive["id"],
                                "activity_type": "hive_removed",
                                "activity_description": f"Hive {hive['hive_code']} removed from {contract['farm_location']}",
                                "severity": "info",
                                "timestamp": datetime.combine(removal_date, datetime.min.time()).isoformat(),
                                "metadata": {
                                    "hive_code": hive["hive_code"],
                                    "location": contract["farm_location"]
                                }
                            }
                            db_insert('pollination_activity_logs', removal_log_data)
                            activity_logs_created += 1
                        
                except Exception as e:
                    print(f"❌ Error creating assignment for hive {hive['hive_code']}: {e}")
    
    print(f"🐝 Created {assignments_created} hive assignments")
    print(f"📝 Created {activity_logs_created} activity logs")
    
    # Create additional activity logs for variety
    activity_types = [
        {"type": "inspection", "desc": "Routine hive inspection completed", "severity": "info"},
        {"type": "alert", "desc": "Low queen pheromone detected", "severity": "warning"},
        {"type": "alert", "desc": "Temperature anomaly detected", "severity": "warning"},
        {"type": "inspection", "desc": "Strong colony activity observed", "severity": "success"},
        {"type": "payment", "desc": "Payment received", "severity": "success"},
    ]
    
    for contract in contracts_created[:5]:  # Add logs for first 5 contracts
        for _ in range(random.randint(2, 5)):
            activity = random.choice(activity_types)
            log_time = datetime.now() - timedelta(hours=random.randint(1, 72))
            
            log_data = {
                "contract_id": contract["id"],
                "activity_type": activity["type"],
                "activity_description": activity["desc"],
                "severity": activity["severity"],
                "timestamp": log_time.isoformat()
            }
            
            try:
                db_insert('pollination_activity_logs', log_data)
                activity_logs_created += 1
            except Exception as e:
                print(f"❌ Error creating activity log: {e}")
    
    print(f"\n✅ Precision Pollination data seeding complete!")
    print(f"   - {len(contracts_created)} contracts")
    print(f"   - {assignments_created} hive assignments")
    print(f"   - {activity_logs_created} activity logs")


if __name__ == "__main__":
    seed_pollination_data()
