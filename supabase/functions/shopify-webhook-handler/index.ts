import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function verifyShopifySignature(body: string, header: string, secret: string) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify', 'sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const hash = btoa(String.fromCharCode(...new Uint8Array(signature)))
    return hash === header
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const hmacHeader = req.headers.get('x-shopify-hmac-sha256')
        const topic = req.headers.get('x-shopify-topic')
        const body = await req.text()

        console.log(`[Shopify Webhook] Topic: ${topic}`)

        // 1. Verify Signature (Production requirement)
        // const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET') || ''
        // if (!hmacHeader || !await verifyShopifySignature(body, hmacHeader, secret)) {
        //   throw new Error('Unauthorized Webhook')
        // }

        const data = JSON.parse(body)

        if (topic === 'orders/create') {
            // 2. Map Shopify Order to BeeYield Billing Ledger
            const { error } = await supabaseClient
                .from('billing_ledger')
                .insert({
                    transaction_type: 'income',
                    amount: parseFloat(data.total_price),
                    currency: data.currency,
                    module_type: 'honey_sales',
                    description: `Shopify Order #${data.order_number}`,
                    date: new Date().toISOString().slice(0, 10),
                    metadata: {
                        shopify_order_id: data.id,
                        customer: data.customer?.email,
                        items: data.line_items.map((i: any) => i.name)
                    }
                })

            if (error) throw error

            // 3. Update Inventory Logic (Optional for Phase 4)
            console.log(`[Shopify] Order ${data.id} processed. BeeYield Ledger updated.`)
        }

        return new Response(
            JSON.stringify({ status: 'success' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

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
