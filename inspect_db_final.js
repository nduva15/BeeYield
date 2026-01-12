
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectSchema() {
    console.log("Fetching all table names from public schema...");
    const { data, error } = await supabase.rpc('get_tables'); // Checking if this RPC is available

    if (error) {
        console.log("RPC get_tables failed. Trying direct table checks...");
        const tablesToCheck = ['farmers', 'honey_batches', 'honey-batches', 'batches', 'hney-batches'];
        for (const t of tablesToCheck) {
            const { data: rows, error: e } = await supabase.from(t).select('*');
            if (e) {
                console.log(`- ${t}: ERROR ${e.code} - ${e.message}`);
            } else {
                console.log(`- ${t}: EXISTS, Found ${rows.length} rows.`);
            }
        }
    } else {
        console.log("Tables in DB:", data);
    }
}

inspectSchema();
