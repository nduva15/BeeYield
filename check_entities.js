import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqdxsgnoeickomhsgeco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking entity tables...");
    const entities = ['farmers', 'orders', 'products', 'apiaries', 'hives', 'profiles', 'newsletter_subscribers', 'pollination_requests', 'contact_submissions', 'stock_movements'];
    for (const e of entities) {
        process.stdout.write(`- ${e}: `);
        const { error } = await supabase.from(e).select('id').limit(1);
        if (error) {
            console.log(`FAILED (${error.message})`);
        } else {
            console.log(`OK`);
        }
    }
}

check();
