
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, anonKey);

async function checkBatchesTable() {
    console.log("Checking contents of 'batches' table...");
    const { data, error } = await supabase.from('batches').select('*');
    if (error) {
        console.error("Error fetching 'batches':", error.code, error.message);
    } else {
        console.log(`Found ${data.length} rows in 'batches'.`);
        data.forEach(r => console.log(`- Batch: ${r.batch_code || r.id}, Type: ${r.honey_type || r.type}`));
    }
}

checkBatchesTable();
