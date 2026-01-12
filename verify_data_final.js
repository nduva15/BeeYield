
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
// Using the service role key from the root .env
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
    console.log("Checking Farmers...");
    const { data: farmers, error: fErr } = await supabase.from('farmers').select('*');
    if (fErr) console.error("Farmers Error:", fErr);
    else console.log(`Farmers Found: ${farmers.length}`);

    console.log("Checking Honey Batches...");
    const { data: batches, error: bErr } = await supabase.from('honey_batches').select('*');
    if (bErr) console.error("Batches Error:", bErr);
    else console.log(`Batches Found: ${batches.length}`);
}

verify();
