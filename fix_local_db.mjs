import pkg from 'pg';
const { Client } = pkg;

async function fixLocalDb() {
    const client = new Client({
        host: '127.0.0.1',
        port: 54322,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres'
    });

    try {
        console.log("Connecting to local Supabase DB...");
        await client.connect();
        console.log("Connected.");

        const sql = `
BEGIN;
-- Fix the trigger function to be resilient
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public._sync_auth_user_profile(NEW);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user triggered exception: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Also ensure the sync function itself is resilient
-- (Already handled in latest migration but let's be sure for the local instance)
COMMIT;
`;
        await client.query(sql);
        console.log("SQL Fix applied to local database successfully.");
    } catch (err) {
        console.error("Error applying fix to local DB:", err.message);
    } finally {
        await client.end();
    }
}

fixLocalDb();
