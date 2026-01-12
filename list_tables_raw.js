
import fetch from 'node-fetch';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

async function listTables() {
    console.log("Listing all tables visible to PostgREST...");
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            }
        });
        const data = await response.json();
        if (data.definitions) {
            console.log("Table definitions found:");
            Object.keys(data.definitions).forEach(table => console.log(`- ${table}`));
        } else {
            console.log("No definitions found. Full response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

listTables();
