
import fetch from 'node-fetch';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

async function inspectBatches() {
    console.log("Inspecting 'batches' table columns...");
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/batches?limit=1`, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Prefer': 'count=exact'
            }
        });
        const data = await response.json();
        console.log("Sample row (to see columns):", data[0] ? Object.keys(data[0]) : "Empty Table");

        console.log("Checking for ANY rows in 'batches'...");
        const countRes = await fetch(`${supabaseUrl}/rest/v1/batches?select=count`, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            }
        });
        const countData = await countRes.json();
        console.log("Count Data:", countData);
    } catch (err) {
        console.error("Failed:", err);
    }
}

inspectBatches();
