
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRealTables() {
    console.log("Querying information_schema.tables...");
    const { data, error } = await supabase.rpc('get_tables'); // I'll try this first

    if (error) {
        console.log("RPC failed. Trying direct query of information_schema.columns (often visible)...");
        const { data: cols, error: e2 } = await supabase
            .from('information_schema.columns' as any)
            .select('table_name, column_name')
            .eq('table_schema', 'public');

        if (e2) {
            console.log("Direct query failed:", e2.message);
        } else {
            const tableNames = [...new Set(cols.map((c: any) => c.table_name))];
            console.log("Tables found in information_schema:", tableNames);
        }
    } else {
        console.log("Tables from RPC:", data);
    }
}

checkRealTables();
