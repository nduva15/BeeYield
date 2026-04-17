import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const realmId = url.searchParams.get('realmId')
        const state = url.searchParams.get('state') // Usually contains the user_id

        if (!code) throw new Error('No auth code provided')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Exchange code for tokens (Intuit OAuth Endpoint)
        // Production: use fetch() to 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
        console.log(`[QuickBooks] Exchanging code ${code} for RealmID ${realmId}`)

        const tokens = {
            access_token: `QB-ACC-${Math.random().toString(36).slice(2)}`,
            refresh_token: `QB-REF-${Math.random().toString(36).slice(2)}`,
            expires_in: 3600
        }

        // 2. Store in integration_settings
        // Note: In Phase 4, we assume state contains userId for the simulation
        const userId = state || 'system-user'

        const { error } = await supabaseClient
            .from('integration_settings')
            .upsert({
                user_id: userId,
                platform: 'quickbooks',
                is_active: true,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, platform' })

        if (error) throw error

        // 3. Redirect back to BeeYield App
        const redirectUrl = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/billing?tab=Integrations&connected=quickbooks`

        return new Response(null, {
            status: 302,
            headers: { ...corsHeaders, 'Location': redirectUrl }
        })

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
