import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

PUBLIC_DIR = os.path.join(os.getcwd(), "public")


print("Fetching products...")
res = supabase.table("products").select("name, images").execute()
errors = []

with open("backend/image_report.txt", "w", encoding="utf-8") as f:
    f.write("--- Verifying Product Images ---\n")
    for p in res.data:

        images = p.get('images', [])
        if not images:
            f.write(f"[WARN] {p['name']}: No images\n")
            continue
        
        img = images[0]
        if img.startswith("http"):
            f.write(f"[OK]   {p['name']}: External URL\n")
        elif img.startswith("/"):
            # Local path, key check
            # partial fix for windows paths vs url paths
            normalized_path = img.lstrip("/").replace("/", os.sep)
            local_path = os.path.join(PUBLIC_DIR, normalized_path)
            if os.path.exists(local_path):
                f.write(f"[OK]   {p['name']}: Found local file ({img})\n")
            else:
                f.write(f"[FAIL] {p['name']}: Missing local file ({local_path})\n")
                errors.append(p['name'])
        else:
            f.write(f"[WARN] {p['name']}: Invalid image format ({img})\n")

    if errors:
        f.write(f"\nFound {len(errors)} missing images!\n")
    else:
        f.write("\nAll images verified.\n")
