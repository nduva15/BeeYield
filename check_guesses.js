
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lqdxsgnoeickomhsgeco.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTIwMDEsImV4cCI6MjA4MzQyODAwMX0.UtOsTUJS2Z8uqi7pzDqn8eZdv9T5CvZRVGDsOrC_gms";

const supabase = createClient(supabaseUrl, anonKey);

async function checkGuesses() {
    const guesses = ["farmer", "honey_batch", "batch", "batches"];
    console.log("Checking Singular/Alternative names:");
    for (const table of guesses) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`- ${table}: FAILED (${error.code})`);
        } else {
            console.log(`- ${table}: OK`);
        }
    }
}

checkGuesses();
