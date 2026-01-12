
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deepInspect() {
    const tables = ['honey_batches', 'honey-batches', 'batches', 'hney-batches', 'farmers', 'team_members'];
    console.log("--- DEEP INSPECTION ---");
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*');
        if (error) {
            console.log(`[${t}] ERROR: ${error.code} - ${error.message}`);
        } else {
            console.log(`[${t}] SUCCESS: ${data.length} rows.`);
            if (data.length > 0) {
                console.log(`  Sample ID: ${data[0].id || data[0].batch_code || 'N/A'}`);
            }
        }
    }
}

deepInspect();
