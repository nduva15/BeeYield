import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnvValue(keyName, defaultValue = '') {
  if (process.env[keyName]) return process.env[keyName];
  let dir = __dirname;
  while (dir) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      try {
        const envData = fs.readFileSync(envPath, 'utf8');
        for (const line of envData.split('\n')) {
          const parts = line.split('=');
          if (parts.length >= 2 && parts[0].trim() === keyName) {
            let val = parts.slice(1).join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            return val;
          }
        }
      } catch (e) {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return defaultValue;
}

const projectRef = getEnvValue('SUPABASE_PROJECT_REF') || 'ezfccfypwmuvbpujkqrg';
const token = getEnvValue('SUPABASE_MANAGEMENT_TOKEN') || 'sb_secret_MZerTs797AxSfPwb0K68HA_5FYSQW3F';

async function executeSql() {
    console.log("Executing SQL using Management API...");
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
BEGIN;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public._sync_auth_user_profile(NEW);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user triggered exception: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
COMMIT;
`
        })
    });
    
    if (!res.ok) {
        console.error("Failed:", await res.text());
    } else {
        console.log("Success:", await res.json());
    }
}

executeSql();
