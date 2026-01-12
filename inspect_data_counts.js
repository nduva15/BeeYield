
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

// Load env from .env or .env.local
const env = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const tables = ['farmers', 'apiaries', 'hives', 'honey_batches', 'products', 'pollination_requests', 'contact_submissions', 'newsletter_subscribers'];

    console.log('--- Table Row Counts ---');
    for (const table of tables) {
        try {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`${table}: Error - ${error.message} (Code: ${error.code})`);
            } else {
                console.log(`${table}: ${count} rows`);
            }
        } catch (e) {
            console.log(`${table}: Failed to query - ${e.message}`);
        }
    }
}

checkData();
