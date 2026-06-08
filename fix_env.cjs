const fs = require('fs');
const envPath = '.env';

if (!fs.existsSync(envPath)) {
    console.error('.env file does not exist. Copying from .env.example...');
    fs.copyFileSync('.env.example', '.env');
}

let content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
const envVars = {};

lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

let modified = false;

// Fix missing VITE_ prefix
if (envVars['SUPABASE_URL'] && !envVars['VITE_SUPABASE_URL']) {
    content += `\nVITE_SUPABASE_URL=${envVars['SUPABASE_URL']}`;
    envVars['VITE_SUPABASE_URL'] = envVars['SUPABASE_URL'];
    modified = true;
}
if (envVars['SUPABASE_ANON_KEY'] && !envVars['VITE_SUPABASE_ANON_KEY']) {
    content += `\nVITE_SUPABASE_ANON_KEY=${envVars['SUPABASE_ANON_KEY']}`;
    envVars['VITE_SUPABASE_ANON_KEY'] = envVars['SUPABASE_ANON_KEY'];
    modified = true;
}

// Map base to specific if missing
['SHOP', 'BEEYIELD', 'CEBA'].forEach(backend => {
    const urlKey = `VITE_SUPABASE_URL_${backend}`;
    const keyKey = `VITE_SUPABASE_ANON_KEY_${backend}`;
    
    if (envVars['VITE_SUPABASE_URL'] && !envVars[urlKey]) {
        content += `\n${urlKey}=${envVars['VITE_SUPABASE_URL']}`;
        modified = true;
    }
    if (envVars['VITE_SUPABASE_ANON_KEY'] && !envVars[keyKey]) {
        content += `\n${keyKey}=${envVars['VITE_SUPABASE_ANON_KEY']}`;
        modified = true;
    }
});

if (modified) {
    fs.writeFileSync(envPath, content);
    console.log('Successfully fixed .env file! Missing variables were added.');
} else {
    console.log('No automatic fixes applied to .env. Current VITE variables found:');
    console.log(Object.keys(envVars).filter(k => k.startsWith('VITE_')).join(', '));
    if (!envVars['VITE_SUPABASE_URL']) {
        console.log('ERROR: VITE_SUPABASE_URL is completely missing from your .env file!');
    }
}
