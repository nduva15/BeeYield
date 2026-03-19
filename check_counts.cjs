
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '.env');
const envData = fs.readFileSync(envPath, 'utf8');
const env = {};
envData.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const url = env.VITE_SUPABASE_URL || 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) { console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env'); process.exit(1); }
const supabase = createClient(url, key);

async function checkData() {
    const email = 'timothynduva349@gmail.com';
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) { console.error('Auth error:', authError); return; }
    
    const timothy = users.find(u => u.email === email);
    if (!timothy) {
        console.log('Timothy user not found!');
        return;
    }
    
    console.log('Timothy User ID:', timothy.id);
    
    const tables = ['farmers', 'apiaries', 'hives', 'harvests'];
    for (const table of tables) {
        let query = supabase.from(table).select('*', { count: 'exact', head: true });
        // Assume all these tables have user_id, or at least common for this check
        const { data, count, error } = await query.eq('user_id', timothy.id);
        
        if (error) {
            console.error(`Error checking ${table}:`, error);
        } else {
            console.log(`${table}: ${count} records`);
        }
    }
}

checkData();
