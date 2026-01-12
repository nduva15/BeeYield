
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspect() {
    const tables = ['farmers', 'honey_batches', 'honey-batches', 'hney-batches', 'batches'];
    console.log("--- DB INSPECTION START ---");
    for (const t of tables) {
        try {
            const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' });
            if (error) {
                console.log(`[${t}] Error: ${error.code} - ${error.message}`);
            } else {
                console.log(`[${t}] OK: ${data.length} rows found.`);
            }
        } catch (err) {
            console.log(`[${t}] Crash: ${err.message}`);
        }
    }
    console.log("--- DB INSPECTION END ---");
}

inspect();
