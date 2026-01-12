
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedMissing() {
    console.log("Seeding Timothy Nduva...");
    const { data: fData, error: fError } = await supabase.from('farmers').upsert({
        name: 'Timothy Nduva',
        phone: '+254712345678',
        email: 'timothy@beeyield.com',
        experience_years: 15,
        story: 'Third-generation beekeeper from Kibwezi. Timothy manages our HoneyChain network and hive health, ensuring the highest standards of purity.',
        region: 'Kibwezi',
        county: 'Makueni',
        location_name: 'Kibwezi East',
        certification_status: 'CERTIFIED',
        farmer_id: 'BY-F-001'
    }, { onConflict: 'name' });

    if (fError) console.error("Error seeding farmer:", fError);
    else console.log("Farmer seeded successfully.");

    console.log("Seeding 3 Batches...");
    const batches = [
        {
            batch_code: 'DEMO-001',
            honey_type: 'Acacia Gold',
            harvest_date: '2024-01-15',
            quantity_kg: 120.5,
            farmer_name: 'Timothy Nduva',
            location_region: 'Kibwezi',
            location_county: 'Makueni',
            quality_grade: 'A+',
            moisture_content: 17.2,
            color_grade: 'Golden',
            processing_method: 'Cold Pressed',
            block_hash: '0x7ae568e3f4b4e5d8a9b2c1d0e9f8a7b6c5d4e3f2'
        },
        {
            batch_code: 'KIB-ACACIA-24',
            honey_type: 'Pure Acacia',
            harvest_date: '2024-03-10',
            quantity_kg: 250.0,
            farmer_name: 'Timothy Nduva',
            location_region: 'Kibwezi',
            location_county: 'Makueni',
            quality_grade: 'A',
            moisture_content: 18.1,
            color_grade: 'Light Amber',
            processing_method: 'Centrifuged',
            block_hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t'
        },
        {
            batch_code: 'KIB-GOLD-24',
            honey_type: 'High Grade Gold',
            harvest_date: '2024-05-22',
            quantity_kg: 85.0,
            farmer_name: 'Timothy Nduva',
            location_region: 'Kibwezi',
            location_county: 'Makueni',
            quality_grade: 'Premium',
            moisture_content: 16.5,
            color_grade: 'Dark Golden',
            processing_method: 'Raw Unfiltered',
            block_hash: '0xabcdef1234567890abcdef1234567890abcdef12'
        }
    ];

    const { data: bData, error: bError } = await supabase.from('honey_batches').upsert(batches, { onConflict: 'batch_code' });

    if (bError) console.error("Error seeding batches:", bError);
    else console.log("Batches seeded successfully.");
}

seedMissing();
