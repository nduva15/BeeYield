import os
import datetime
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

def seed_measurements():
    # 1. Get user_id from apiaries/hives if possible
    info = supabase.table("hives").select("user_id, id, apiary_id").limit(1).execute().data
    if not info:
        print("No hives found. Please run hive sync first.")
        return
    
    user_id = info[0]["user_id"]
    hive_id = info[0]["id"]
    apiary_id = info[0]["apiary_id"]

    print(f"Seeding data for User: {user_id}, Hive: {hive_id}, Apiary: {apiary_id}")

    # 3. Generate sensor readings (last 7 days)
    readings = []
    now = datetime.datetime.now(datetime.timezone.utc)
    base_weight = 42.0
    base_temp = 34.5

    for h in range(7 * 24):
        time = now - datetime.timedelta(hours=h)
        readings.append({
            "hive_id": hive_id,
            "user_id": user_id,
            "recorded_at": time.isoformat(),
            "weight_kg": round(base_weight + random.uniform(-0.5, 3.0) + (h % 24) * 0.05, 2),
            "temp_internal": round(base_temp + random.uniform(-0.5, 0.5), 1),
            "humidity_internal": random.randint(60, 70),
            "acoustic_freq": random.randint(180, 220)
        })

    print(f"Inserting {len(readings)} sensor readings...")
    # Batch insert in chunks of 50
    for i in range(0, len(readings), 50):
        supabase.table("sensor_readings").insert(readings[i:i+50]).execute()

    # 4. Generate land readings
    land_readings = []
    for d in range(7):
        time = now - datetime.timedelta(days=d)
        land_readings.append({
            "apiary_id": apiary_id,
            "user_id": user_id,
            "recorded_at": time.isoformat(),
            "soil_moisture": round(random.uniform(20, 40), 1),
            "rainfall_mm": round(random.uniform(0, 15), 2),
            "ambient_temp": round(random.uniform(20, 32), 1),
            "wind_speed_kmh": round(random.uniform(5, 20), 1)
        })
    
    print(f"Inserting {len(land_readings)} land readings...")
    supabase.table("land_readings").insert(land_readings).execute()

    # 5. Generate disease detections
    diseases = [
        {"type": "varroa", "severity": "medium", "conf": 0.85},
        {"type": "afb_spores", "severity": "critical", "conf": 0.92},
        {"type": "wasp", "severity": "low", "conf": 0.78}
    ]
    
    detections = []
    for d in diseases:
        detections.append({
            "hive_id": hive_id,
            "user_id": user_id,
            "threat_type": d["type"],
            "severity": d["severity"],
            "confidence": d["conf"],
            "status": "unresolved",
            "detected_at": (now - datetime.timedelta(days=random.randint(1, 5))).isoformat()
        })
    
    print(f"Inserting {len(detections)} disease detections...")
    supabase.table("disease_detections").insert(detections).execute()

    print("Seeding complete!")

if __name__ == "__main__":
    seed_measurements()
