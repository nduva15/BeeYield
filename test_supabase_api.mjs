const projectRef = 'ezfccfypwmuvbpujkqrg';
const token = 'sb_secret_MZerTs797AxSfPwb0K68HA_5FYSQW3F';

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
