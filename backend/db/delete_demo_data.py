
import os
import sys
from dotenv import load_dotenv

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

load_dotenv("backend/.env")

# Fallback for keys
if not os.getenv("SUPABASE_URL"):
    os.environ["SUPABASE_URL"] = os.getenv("VITE_SUPABASE_URL", "")
if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = os.getenv("SUPABASE_KEY", "")

from app.db.supabase_db import get_supabase

def delete_demo_data():
    print("🗑️ Performing Thorough Demo Data Cleanup...")
    
    supabase = get_supabase()
    if not supabase:
        print("❌ Could not initialize Supabase client.")
        return

    # Tables to clear in reverse order of dependencies
    tables = [
        "tracing_history", "activity_logs", "generated_documents",
        "order_items", "orders", "packaged_batches", "honey_batches", "batches",
        "processing_records", "harvests", "hives", "apiaries", "farmers",
        "blockchain_records", "contact_submissions", "pollination_requests",
        "inspections", "tasks", "crops_pollinated", "pollination_packages",
        "pollination_services", "learning_lessons", "learning_modules",
        "impact_stories", "esg_metrics", "faqs", "partners", "company_milestones",
        "company_stats", "team_members", "blog_posts", "media_items",
        "job_applications", "job_listings", "product_variants", "products",
        "sdgs", "esg_pillars", "esg_initiatives", "company_values"
    ]

    for table in tables:
        try:
            # We use a filter that is guaranteed to match everything (or almost everything)
            # eq(True, True) or similar is not supported by postgrest easily.
            # Using gte on created_at is very reliable if column exists.
            print(f"  - Clearing {table}...")
            res = supabase.table(table).delete().neq("created_at", "1900-01-01").execute()
            if res.data:
                print(f"    ✅ Deleted {len(res.data)} rows.")
            else:
                print(f"    ℹ️ Table already empty.")
        except Exception as e:
            # Fallback for tables without created_at
            try:
                res = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
                print(f"    ✅ Deleted rows using ID filter.")
            except:
                print(f"    ⚠️ Could not clear {table}: {e}")

    # 2. Clear Blockchain File
    blockchain_path = os.path.join(os.path.dirname(__file__), "..", "backend", "app", "blockchain", "traceability_chain.json")
    if not os.path.exists(blockchain_path):
        # Check alternative path
        blockchain_path = os.path.join(os.path.dirname(__file__), "..", "app", "blockchain", "traceability_chain.json")

    print(f"  - Checking blockchain path: {blockchain_path}")
    if os.path.exists(blockchain_path):
        print("  - Resetting blockchain file...")
        try:
            os.remove(blockchain_path)
            print("    ✅ Blockchain file deleted.")
        except Exception as e:
            print(f"    ❌ Failed to delete blockchain file: {e}")

    print("\n✨ Database and Blockchain are now clean!")

if __name__ == "__main__":
    delete_demo_data()
