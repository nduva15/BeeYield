-- Create RPC function to execute dynamic SQL
-- Required for python migration scripts to work (e.g. backend/migrate_db.py)

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
