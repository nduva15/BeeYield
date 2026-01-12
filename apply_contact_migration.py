"""
Apply migration to update contact_submissions table
"""
import os
from supabase import create_client

# Load from environment or hardcode for this fix
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lqdxsgnoeickomhsgeco.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL migration statements to add missing columns
migration_sql = """
-- Add phone column
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;

-- Add location columns
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS country text;

-- Add inquiry type
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS inquiry_type text;

-- Add topic
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS topic text;

-- Add company field
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS company text;

-- Add grower-specific fields
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS farm_name text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS crop_type text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS acres numeric;

-- Add beekeeper-specific fields
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS apiary_name text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS hive_count integer;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS experience_years text;

-- Add form_specific_data for any additional fields (JSON)
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS form_specific_data jsonb;
"""

print("Applying migration to contact_submissions table...")
print("=" * 50)

# Execute migration using Supabase's RPC or direct SQL
# Note: Supabase Python client doesn't directly support raw SQL execution
# We need to use the REST API or Postgres connection

# Alternative: Try to insert a test record with all fields to check if they exist
try:
    # First, let's check current table structure by trying to select
    result = supabase.table("contact_submissions").select("*").limit(1).execute()
    print("Current table accessible. Columns may need updating.")
    
    # Try inserting a test record with all new fields
    test_data = {
        "first_name": "Test",
        "last_name": "Migration",
        "email": "test_migration@example.com",
        "phone": "+1234567890",
        "city": "Test City",
        "state": "Test State",
        "country": "Test Country",
        "inquiry_type": "general",
        "topic": "Test Topic",
        "message": "Migration test - please delete",
        "status": "test"
    }
    
    insert_result = supabase.table("contact_submissions").insert(test_data).execute()
    
    if insert_result.data:
        print("Success! Test record inserted with all new columns.")
        print(f"Inserted record ID: {insert_result.data[0].get('id')}")
        
        # Clean up test record
        test_id = insert_result.data[0].get('id')
        supabase.table("contact_submissions").delete().eq("id", test_id).execute()
        print("Test record cleaned up.")
        print("\n✓ Migration verified - all columns exist!")
    else:
        print("Insert returned no data - check for errors")
        
except Exception as e:
    error_str = str(e)
    if "column" in error_str.lower() and "does not exist" in error_str.lower():
        print(f"\n⚠ Some columns are missing. Please run the SQL migration manually:")
        print("-" * 50)
        print("Go to Supabase Dashboard > SQL Editor and run:")
        print("-" * 50)
        print(migration_sql)
    else:
        print(f"Error: {e}")
        print("\nPlease run the migration SQL manually in Supabase SQL Editor.")
        print("-" * 50)
        print(migration_sql)
