
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function finalSeeding() {
    console.log("--- STARTING DETERMINISTIC SEEDING ---");

    // 1. Check if honey_batches is visible to Service Role
    console.log("Checking honey_batches table...");
    const { data: batches, error: fetchError } = await supabase.from('honey_batches').select('*');

    if (fetchError) {
        console.error("FATAL: Could not access honey_batches table even with Service Role.");
        console.error("Error Detail:", fetchError.message, "Code:", fetchError.code);
        return;
    }

    console.log(`Current honey_batches count: ${batches.length}`);

    // 2. Data to seed
    const demoBatches = [
        {
            batch_code: "DEMO-001",
            honey_type: "Acacia Gold",
            harvest_date: "2024-01-15",
            packaged_date: "2024-01-20",
            quantity_kg: 120.5,
            processing_method: "Cold Pressed",
            quality_grade: "A+",
            farmer_name: "Timothy Nduva",
            location_region: "Kibwezi",
            location_county: "Makueni",
            status: "verified",
            block_hash: "0x7ae568e3f4b4e5d8a9b2c1d0e9f8a7b6c5d4e3f2"
        },
        {
            batch_code: "KIB-ACACIA-24",
            honey_type: "Pure Acacia",
            harvest_date: "2024-03-10",
            packaged_date: "2024-03-15",
            quantity_kg: 250.0,
            processing_method: "Centrifuged",
            quality_grade: "A",
            farmer_name: "Timothy Nduva",
            location_region: "Kibwezi",
            location_county: "Makueni",
            status: "verified",
            block_hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
        },
        {
            batch_code: "KIB-GOLD-24",
            honey_type: "High Grade Gold",
            harvest_date: "2024-05-22",
            packaged_date: "2024-05-27",
            quantity_kg: 85.0,
            processing_method: "Raw Unfiltered",
            quality_grade: "Premium",
            farmer_name: "Timothy Nduva",
            location_region: "Kibwezi",
            location_county: "Makueni",
            status: "verified",
            block_hash: "0xabcdef1234567890abcdef1234567890abcdef12"
        }
    ];

    console.log("Upserting batches...");
    const { error: upsertError } = await supabase.from('honey_batches').upsert(demoBatches, { onConflict: 'batch_code' });

    if (upsertError) {
        console.error("UPSERT FAILED:", upsertError.message);
    } else {
        console.log("SUCCESS! Demo batches are now in 'honey_batches' table.");
    }

    // 3. Ensure Farmers table has Timothy
    const { data: farmers, error: fError } = await supabase.from('farmers').select('*').eq('name', 'Timothy Nduva');
    if (!fError && farmers.length === 0) {
        console.log("Timothy Nduva missing from 'farmers' table. Adding...");
        await supabase.from('farmers').insert({
            name: "Timothy Nduva",
            phone: "+254712345678",
            email: "timothy@beeyield.com",
            experience_years: 15,
            region: "Kibwezi",
            county: "Makueni",
            certification_status: "CERTIFIED",
            farmer_id: "BY-F-001"
        });
    } else {
        console.log("Timothy Nduva already exists in 'farmers' table.");
    }

    console.log("--- SEEDING COMPLETE ---");
}

finalSeeding();
