
import fetch from 'node-fetch';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

async function globalSearch() {
    const tables = [
        'team_members', 'profiles', 'batches', 'harvests', 'apiaries',
        'pollination_requests', 'contact_submissions', 'newsletter_subscribers'
    ];

    console.log("Searching for 'Timothy' across tables...");
    for (const table of tables) {
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&name=ilike.*Timothy*`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`
                }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                console.log(`Found Timothy in [${table}]:`, data.length, "rows.");
                data.forEach(r => console.log(`- ${r.name || r.email || r.id}`));
            }
        } catch (e) { }
    }
}

globalSearch();
