const fs = require('fs');

const url = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI';

let current = '';
if (fs.existsSync('.env')) {
    current = fs.readFileSync('.env', 'utf8');
}

const linesToAppend = [
    `VITE_SUPABASE_URL=${url}`,
    `VITE_SUPABASE_ANON_KEY=${key}`,
    `VITE_SUPABASE_URL_SHOP=${url}`,
    `VITE_SUPABASE_ANON_KEY_SHOP=${key}`,
    `VITE_SUPABASE_URL_BEEYIELD=${url}`,
    `VITE_SUPABASE_ANON_KEY_BEEYIELD=${key}`,
    `VITE_SUPABASE_URL_CEBA=${url}`,
    `VITE_SUPABASE_ANON_KEY_CEBA=${key}`,
    `VITE_API_URL=${url}`
];

// Append only what is completely missing (basic check)
let appended = false;
for (const line of linesToAppend) {
    const varName = line.split('=')[0];
    if (!current.includes(varName)) {
        current += `\n${line}`;
        appended = true;
    }
}

if (appended || current.trim() === '') {
    fs.writeFileSync('.env', current.trim() + '\n');
    console.log('✅ Found your project keys and successfully injected them into .env!');
} else {
    console.log('✅ Variables were already present. Check if they are correct in .env');
}
