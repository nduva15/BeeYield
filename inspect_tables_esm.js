
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env 
const env = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectAndFix() {
    const tables = ['farmers', 'apiaries', 'hives', 'honey_batches', 'products', 'pollination_requests', 'contact_submissions', 'newsletter_subscribers'];

    console.log('--- Inspecting Tables ---');
    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
                    console.log(`❌ Table '${table}' DOES NOT EXIST.`);
                } else {
                    console.log(`⚠️ Table '${table}' access error: ${error.message} (${error.code})`);
                }
            } else {
                console.log(`✅ Table '${table}' exists.`);
            }
        } catch (e) {
            console.log(`❌ Table '${table}' check failed: ${e.message}`);
        }
    }
}

inspectAndFix();
