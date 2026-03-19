
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
const supabase = createClient(url, key);

async function checkProfile() {
    const email = 'timothynduva349@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const timothy = users.find(u => u.email === email);
    if (!timothy) return;

    console.log('User ID:', timothy.id);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', timothy.id).single();
    console.log('Profile:', profile);
    
    // Also check if they are in admin_users
    const { data: admin } = await supabase.from('admin_users').select('*').eq('user_id', timothy.id);
    console.log('Admin Users Records:', admin);
}

checkProfile();
