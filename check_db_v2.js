import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqdxsgnoeickomhsgeco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const table = 'batches';
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Table info for 'batches':");
        console.log(JSON.stringify(data[0], null, 2));
    }
}

check();
