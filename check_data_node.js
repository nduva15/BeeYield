
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("--- Checking Farmers ---");
    const { data: farmers, error: fError } = await supabase.from('farmers').select('*');
    if (fError) console.error("Error fetching farmers:", fError);
    else {
        console.log(`Found ${farmers.length} farmers:`);
        farmers.forEach(f => console.log(`- ${f.name} (ID: ${f.id})`));
    }

    console.log("\n--- Checking Honey Batches ---");
    const { data: batches, error: bError } = await supabase.from('honey_batches').select('*');
    if (bError) console.error("Error fetching batches:", bError);
    else {
        console.log(`Found ${batches.length} batches:`);
        batches.forEach(b => console.log(`- ${b.batch_code}: ${b.honey_type} (${b.farmer_name || b.beekeeper_name})`));
    }
}

checkData();
