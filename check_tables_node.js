
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
    "products", "product_variants", "honey_batches", "orders", "newsletter_subscribers",
    "contact_submissions", "pollination_requests", "farmers", "stock_movements", "profiles"
];

async function checkTables() {
    console.log("Checking tables...");
    for (const table of tablesToCheck) {
        // Try to select 1 row. If table doesn't exist, it should throw error or return error
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`❌ Table '${table}': Access Failed - ${error.message} (Code: ${error.code})`);
        } else {
            console.log(`✅ Table '${table}': EXISTS`);
        }
    }
}

checkTables();
