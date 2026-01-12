
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, anonKey);

async function check() {
    console.log("Checking honey_batches...");
    const { data: hb, error: hbe } = await supabase.from('honey_batches').select('*');
    if (hbe) console.log("honey_batches ERROR:", hbe.code, hbe.message);
    else console.log(`honey_batches OK: Found ${hb.length} rows.`);

    console.log("Checking farmers...");
    const { data: f, error: fe } = await supabase.from('farmers').select('*');
    if (fe) console.log("farmers ERROR:", fe.code, fe.message);
    else console.log(`farmers OK: Found ${f.length} rows.`);

    console.log("Checking products...");
    const { data: p, error: pe } = await supabase.from('products').select('*');
    if (pe) console.log("products ERROR:", pe.code, pe.message);
    else console.log(`products OK: Found ${p.length} rows.`);
}

check();
