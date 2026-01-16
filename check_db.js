import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqdxsgnoeickomhsgeco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log("Checking tables in public schema...");

    const tables = ['honey_batches', 'batches', 'hney-batches', 'harvests'];

    for (const table of tables) {
        process.stdout.write(`Checking '${table}'... `);
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`FAILED (${error.message})`);
        } else {
            console.log(`EXISTS!`);
        }
    }
}

checkTable();
