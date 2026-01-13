
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Simple env parser
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] ? match[2].trim() : '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[match[1]] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkAndSeed() {
    const tables = ['farmers', 'apiaries', 'hives', 'honey_batches'];
    console.log('--- Checking Tables ---');

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`❌ Table '${table}' check failed: ${error.message} (${error.code})`);
            if (error.code === 'PGRST116' || error.message.includes('not found')) {
                console.log(`   Suggestion: Table '${table}' might be missing.`);
            }
        } else {
            console.log(`✅ Table '${table}' exists.`);
        }
    }

    console.log('\n--- Attempting to Seed Timothy Nduva ---');
    const farmerData = {
        farmer_id: "F-MAT-001",
        name: "Timothy Nduva",
        email: "timothy@beeyield.com",
        phone: "+254712345678",
        region: "Eastern",
        county: "Makueni",
        location_name: "Kibwezi HQ",
        latitude: -2.41,
        longitude: 37.97,
        experience_years: 15,
        story: "Timothy Nduva is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production.",
        certification_status: "CERTIFIED",
        registration_date: "2020-05-15"
    };

    const { data: existingFarmer, error: fetchError } = await supabase.from('farmers').select('id').eq('farmer_id', 'F-MAT-001').maybeSingle();

    if (fetchError) {
        console.error("Error checking for existing farmer:", fetchError.message);
    } else if (!existingFarmer) {
        console.log("Farmer not found, inserting...");
        const { error: insertError } = await supabase.from('farmers').insert([farmerData]);
        if (insertError) {
            console.error("Failed to insert farmer:", insertError.message);
        } else {
            console.log("✅ Farmer Timothy Nduva seeded successfully.");
        }
    } else {
        console.log("✅ Farmer Timothy Nduva already exists.");
    }

    console.log('\n--- Attempting to Seed Batches ---');
    const batches = [
        {
            batch_code: "DEMO-001",
            honey_type: "Kibwezi Wildflower Honey",
            harvest_date: "2024-01-20",
            quantity_kg: 15,
            processing_method: "Raw Filtered",
            farmer_name: "Timothy Nduva",
            location_county: "Makueni",
            quality_grade: "A",
            block_hash: "0x0dab75f233d2ac30ca09f41148ac2e5b9069a65314db4981b8d8d65862644ea"
        }
    ];

    for (const b of batches) {
        const { data: existingHB, error: checkError } = await supabase.from('honey_batches').select('id').eq('batch_code', b.batch_code).maybeSingle();
        if (checkError) {
            console.warn(`Error checking honey_batches: ${checkError.message}`);
        } else if (!existingHB) {
            const { error: hbError } = await supabase.from('honey_batches').insert([b]);
            if (hbError) {
                console.error(`Failed to seed batch ${b.batch_code}: ${hbError.message}`);
            } else {
                console.log(`✅ Batch ${b.batch_code} seeded successfully.`);
            }
        } else {
            console.log(`✅ Batch ${b.batch_code} already exists.`);
        }
    }
}

checkAndSeed().catch(console.error);
