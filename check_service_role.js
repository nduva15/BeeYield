
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWithServiceRole() {
    console.log("Checking tables with Service Role Key...");

    // Check farmers
    const { data: farmers, error: fError } = await supabase.from('farmers').select('*').limit(1);
    if (fError) console.log("Farmers table access error:", fError.message);
    else console.log("Farmers table exists (or at least accessible)");

    // Check honey_batches
    const { data: batches, error: bError } = await supabase.from('honey_batches').select('*').limit(1);
    if (bError) console.log("Honey Batches table access error:", bError.message);
    else console.log("Honey Batches table exists (or at least accessible)");
}

checkWithServiceRole();
