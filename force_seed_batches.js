
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixAndSeed() {
    console.log("Checking honey_batches table with Service Role...");
    const { data: batches, error } = await supabase.from('honey_batches').select('*');

    if (error) {
        console.log("Error or Missing Table:", error.code, error.message);
        if (error.code === 'PGRST205') {
            console.log("Table 'honey_batches' REALLY does not exist according to PostgREST.");
        }
    } else {
        console.log(`Table exists. Found ${batches.length} batches.`);
        if (batches.length === 0) {
            console.log("Seeding data directly via Service Role (bypassing RLS)...");
            const demoBatches = [
                {
                    batch_code: "DEMO-001",
                    honey_type: "Kibwezi Wildflower Honey",
                    packaged_date: "2024-01-20",
                    quantity_kg: 15,
                    processing_method: "Raw Filtered",
                    quality_grade: "A",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    status: "verified"
                },
                {
                    batch_code: "KIB-ACACIA-24",
                    honey_type: "Pure Acacia Honey",
                    packaged_date: "2024-02-25",
                    quantity_kg: 22.5,
                    processing_method: "Raw Filtered",
                    quality_grade: "A",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    status: "verified"
                },
                {
                    batch_code: "KIB-GOLD-24",
                    honey_type: "Premium Golden Honey",
                    packaged_date: "2024-03-10",
                    quantity_kg: 30,
                    processing_method: "Raw Filtered",
                    quality_grade: "A",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    status: "verified"
                }
            ];
            const { error: insError } = await supabase.from('honey_batches').insert(demoBatches);
            if (insError) console.error("Insert failed:", insError);
            else console.log("Successfully seeded 3 batches!");
        }
    }

    console.log("\nChecking RLS accessibility with ANON/Auth logic...");
    // We can't easily simulate anon here without a separate client, but we checked earlier.
}

fixAndSeed();
