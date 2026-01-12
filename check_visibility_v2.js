
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, anonKey);

async function check() {
    console.log("Checking honey_batches (ANON)...");
    const { data, error } = await supabase.from('honey_batches').select('*');
    if (error) console.log("honey_batches:", error.code, error.message);
    else console.log("honey_batches: OK, count =", data.length);

    console.log("Checking batches (ANON)...");
    const { data: d2, error: e2 } = await supabase.from('batches').select('*');
    if (e2) console.log("batches:", e2.code, e2.message);
    else console.log("batches: OK, count =", d2.length);
}

check();
