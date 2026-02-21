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
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const payload = await req.json()
        console.log('Webhook Received:', payload)

        // 1. Identify Provider (Stripe vs M-Pesa)
        const source = payload.type ? 'Stripe' : (payload.Body ? 'M-Pesa' : 'Unknown')

        let userId, amount, status, transactionId

        if (source === 'Stripe') {
            // In production, verify Stripe signature here
            userId = payload.data.object.metadata.user_id
            amount = payload.data.object.amount / 100
            status = payload.data.object.status
            transactionId = payload.data.object.id
        } else if (source === 'M-Pesa') {
            // Safaricom C2B/B2C Webhook handling
            userId = payload.Body.stkCallback.CheckoutRequestID // Simplified
            status = payload.Body.stkCallback.ResultCode === 0 ? 'succeeded' : 'failed'
            transactionId = payload.Body.stkCallback.MerchantRequestID
        }

        if (status === 'succeeded' && userId) {
            // 2. Update Profile or Contract Status
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ last_payment_status: 'succeeded', last_payment_date: new Date().toISOString() })
                .eq('id', userId)

            if (updateError) throw updateError

            // 3. Log the successful transaction
            await supabaseAdmin.from('calculator_logs').insert({
                user_id: userId,
                module_type: 'Webhook_Billing',
                input_json: { source, transactionId },
                output_json: { status: 'processed' }
            })
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
