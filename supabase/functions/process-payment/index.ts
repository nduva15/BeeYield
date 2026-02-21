import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { amount, currency, payment_method, subscription_tier } = await req.json()

        // 1. Simulate Stripe/M-Pesa processing
        // In production, you would use 'stripe-node' or similar here
        const transaction_id = `txn_${Math.random().toString(36).slice(2, 11)}`

        // 2. Update Profile Subscription Tier (PRD compliance)
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ subscription_tier: subscription_tier || 'Pro' })
            .eq('id', user.id)

        if (updateError) throw updateError

        // 3. Log harvest (Income) as a proxy for transaction log for now
        await supabaseClient.from('calculator_logs').insert({
            user_id: user.id,
            module_type: 'Billing',
            input_json: { amount, currency, payment_method },
            output_json: { status: 'success', transaction_id }
        })

        return new Response(
            JSON.stringify({ success: true, transaction_id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
