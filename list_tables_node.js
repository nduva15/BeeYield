
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log("Listing tables in public schema...");
    const { data, error } = await supabase.rpc('get_tables'); // If this RPC exists
    if (error) {
        console.log("RPC get_tables failed, trying direct query if possible (rarely works via anon key)");
        // Try a common table
        const { error: e2 } = await supabase.from('products').select('*').limit(1);
        console.log("Products access:", e2 ? e2.message : "Success");

        const { error: e3 } = await supabase.from('honey_batches').select('*').limit(1);
        console.log("Honey Batches access:", e3 ? e3.message : "Success");

        const { error: e4 } = await supabase.from('farmers').select('*').limit(1);
        console.log("Farmers access:", e4 ? e4.message : "Success");
    } else {
        console.log("Tables:", data);
    }
}

listTables();
