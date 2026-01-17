import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqdxsgnoeickomhsgeco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const table = 'batches';
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Table info for 'batches':");
        console.log(JSON.stringify(data?.[0], null, 2));
    }
}

check();
