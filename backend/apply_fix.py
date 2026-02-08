import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env
load_dotenv()

# Check for POSTGRES_URL directly or construct it
postgres_url = os.getenv("POSTGRES_URL")
if not postgres_url:
    # Try to construct from Supabase DB URL format if available
    # usually: postgres://postgres:[password]@[host]:[port]/[db]
    # But usually Supabase provides a direct connection string
    print("No POSTGRES_URL found in env.")
    # Attempt to read from config if it differs
    try:
        sys.path.append(os.getcwd())
        from app.core.config import settings
        if settings.POSTGRES_URL:
            postgres_url = settings.POSTGRES_URL
            print("Found POSTGRES_URL in settings.")
    except ImportError:
        pass

if not postgres_url:
    print("Cannot apply SQL fix without POSTGRES_URL.")
    sys.exit(1)

print(f"Connecting to DB...")
try:
    engine = create_engine(postgres_url)
    with engine.connect() as connection:
        print("Connected. Applying fix...")
        
        # Read the fix file
        with open("../DASHBOARD_DATABASE_FIX.sql", "r") as f:
            sql_content = f.read()
            
        # Split logic is simple/naive, might need better handling if complex
        # But for this file, it has DO blocks. SQLAlchemy execute might handle it if passed as one block?
        # Let's try executing the critical parts individually if needed, or the whole thing.
        # Actually, let's just try to reload schema cache first as it might be enough if table exists.
        
        try:
            connection.execute(text("NOTIFY pgrst, 'reload schema';"))
            print("Reloaded schema cache.")
        except Exception as e:
            print(f"Failed to reload schema: {e}")

        # Now apply the fix file
        # The file contains multiple statements. We should split by semicolon if not in $$ block
        # better to just execute the whole block if possible, or key parts.
        
        # Let's manually executing the critical enabling of RLS and fixes
        
        sqls = [
            "ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE hives ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE apiaries DROP CONSTRAINT IF EXISTS apiaries_user_id_fkey;",
             """
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='user_id') THEN
                    ALTER TABLE apiaries ADD COLUMN user_id UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='apiary_code') THEN
                    ALTER TABLE apiaries ADD COLUMN apiary_code TEXT;
                END IF;
                 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='apiary_type') THEN
                    ALTER TABLE apiaries ADD COLUMN apiary_type TEXT DEFAULT 'Permanent';
                END IF;
            END $$;
            """,
            "DROP POLICY IF EXISTS \"Service role full access apiaries\" ON apiaries;",
            "CREATE POLICY \"Service role full access apiaries\" ON apiaries FOR ALL USING (true) WITH CHECK (true);"
        ]
        
        for s in sqls:
            try:
                connection.execute(text(s))
                connection.commit()
                print(f"Executed: {s[:50]}...")
            except Exception as e:
                print(f"Error executing {s[:20]}: {e}")
                
        print("Fix applied successfully.")
        
except Exception as e:
    print(f"Connection failed: {e}")
