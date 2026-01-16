import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqdxsgnoeickomhsgeco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log("Fetching first row from 'batches'...");
    const { data, error } = await supabase.from('batches').select('*').limit(1);
    if (error) {
        console.error(error.message);
    } else {
        console.log("Columns in 'batches':", Object.keys(data[0] || {}));
        console.log("Sample row:", data[0]);
    }
}

checkColumns();
