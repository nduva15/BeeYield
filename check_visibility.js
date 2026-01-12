
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, anonKey);

async function checkAll() {
    const tables = [
        "products", "product_variants", "honey_batches", "farmers",
        "orders", "profiles", "newsletter_subscribers", "contact_submissions",
        "pollination_requests", "apiaries", "hives"
    ];

    console.log("Checking table visibility for ANON key:");
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`- ${table}: FAILED (${error.code}) ${error.message}`);
        } else {
            console.log(`- ${table}: OK`);
        }
    }
}

checkAll();
