
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listAllTables() {
    console.log("Listing all tables in 'public' schema...");
    const { data: tables, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');

    if (error) {
        console.error("Error querying information_schema:", error);
        // Try Postgres RPC if available
        const { data: tables2, error: e2 } = await supabase.rpc('get_table_names');
        if (e2) console.error("RPC failed too:", e2);
        else console.log("Tables (via RPC):", tables2);
    } else {
        console.log("Tables Found:");
        tables.forEach(t => console.log(`- ${t.table_name}`));
    }
}

listAllTables();
