
import fetch from 'node-fetch';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

async function globalSearchBatch() {
    const tables = [
        'batches', 'harvests', 'products', 'product_variants', 'order_items'
    ];

    console.log("Searching for 'DEMO-001' across tables...");
    for (const table of tables) {
        try {
            // Try searching in all columns? No, let's try common ones.
            const columns = ['id', 'batch_code', 'code', 'name', 'batch_id'];
            for (const col of columns) {
                const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${col}=eq.DEMO-001`, {
                    headers: {
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`
                    }
                });
                const data = await response.json();
                if (data && data.length > 0) {
                    console.log(`Found DEMO-001 in [${table}.${col}]`);
                    return;
                }
            }
        } catch (e) { }
    }
    console.log("NOT FOUND IN COMMON TABLES.");
}

globalSearchBatch();
