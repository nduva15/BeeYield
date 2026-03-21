const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const P_ACACIA_ID = "e8a9f7d2-4b2a-4a2a-8b2a-4a2a4a2a4a2a";
const P_PREMIUM_ID = "f1b1a1a1-1b1b-1b1b-1b1b-1b1b1b1b1b1b";

async function main() {
    console.log('Seeding Comprehensive Traceability Data...');

    // 1. Farmer
    const farmerId = uuidv4();
    const { data: farmer, error: fError } = await supabase.from('farmers').upsert({
        id: farmerId,
        name: "Timothy Nduva",
        phone: "0742004187",
        experience_years: 15,
        story: "Timothy Nduva is a master beekeeper in Kibwezi, Makueni. He specializes in organic Acacia honey production and sustainable beekeeping practices.",
        location_name: "Kibwezi Sanctuary",
        county: "Makueni",
        region: "Eastern",
        latitude: -2.41,
        longitude: 37.97,
        status: "active"
    }).select().single();
    if (fError) { console.error('Farmer Error:', fError); return; }
    console.log('Farmer seeded:', farmer.name);

    // 2. Apiary
    const apiaryId = uuidv4();
    const { data: apiary, error: aError } = await supabase.from('apiaries').upsert({
        id: apiaryId,
        name: "Kibwezi Savanna Apiary",
        location_name: "Kibwezi West",
        county: "Makueni",
        region: "Eastern",
        latitude: -2.412,
        longitude: 37.975,
        farmer_id: farmerId,
        status: "active",
        flora_types: ["Acacia Tortilis", "Desert Date", "Wildflowers"]
    }).select().single();
    if (aError) { console.error('Apiary Error:', aError); return; }
    console.log('Apiary seeded:', apiary.name);

    // 3. Hives
    const hive1Id = uuidv4();
    const hive2Id = uuidv4();
    const { error: hError } = await supabase.from('hives').upsert([
        { id: hive1Id, hive_code: "KIB-H-001", apiary_id: apiaryId, type: "Langstroth", installation_date: "2020-06-01", status: "active" },
        { id: hive2Id, hive_code: "KIB-H-002", apiary_id: apiaryId, type: "Langstroth", installation_date: "2020-07-15", status: "active" }
    ]);
    if (hError) console.error('Hives Error:', hError);
    console.log('Hives seeded.');

    // 4. Harvests & Batches
    const types = ["BeeYield Acacia", "BeeYield Premium Acacia"];
    const batchCodes = ["BY-AC-24-001", "BY-AC-24-002", "BY-PR-24-001", "BY-PR-24-002"];
    
    for (let i = 0; i < batchCodes.length; i++) {
        const type = i < 2 ? types[0] : types[1];
        const batchCode = batchCodes[i];
        const harvestDate = i % 2 === 0 ? "2024-01-15" : "2024-02-10";
        
        // Record Harvest
        const harvestId = uuidv4();
        const { error: hvError } = await supabase.from('harvests').upsert({
            id: harvestId,
            hive_id: i % 2 === 0 ? hive1Id : hive2Id,
            farmer_id: farmerId,
            harvest_date: harvestDate,
            quantity_kg: 25.5,
            quality_score: 95 + i,
            notes: `Excellent ${type} harvest with high clarity.`,
            honey_type: type,
            batch_code: batchCode
        });
        if (hvError) console.error(`Harvest Error (${batchCode}):`, hvError);

        // Create Honey Batch
        const { error: bError } = await supabase.from('honey_batches').upsert({
            batch_code: batchCode,
            honey_type: type,
            harvest_date: harvestDate,
            quantity_kg: 25.5,
            processing_method: "Raw Cold Extraction",
            farmer_name: farmer.name,
            apiary_name: apiary.name,
            location_county: apiary.county,
            quality_grade: "A",
            status: "verified"
        });
        if (bError) console.error(`Batch Error (${batchCode}):`, bError);
        
        console.log(`Seeded Batch: ${batchCode} (${type})`);
    }

    // 5. Update Product Variants to link to these batches
    // Acacia variants
    await supabase.from('product_variants').update({ batch_code: "BY-AC-24-001" }).eq('product_id', P_ACACIA_ID);
    // Premium variants
    await supabase.from('product_variants').update({ batch_code: "BY-PR-24-001" }).eq('product_id', P_PREMIUM_ID);

    console.log('All traceability data seeded and linked to shop products.');
}

main().catch(console.error);
