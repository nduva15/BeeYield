import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"

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
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { invoice_id, kra_pin } = await req.json()

        // 1. Fetch invoice data from BeeYield DB
        const { data: invoice, error: invoiceError } = await supabaseClient
            .from('billing_ledger')
            .select('*, profiles:user_id(full_name)')
            .eq('id', invoice_id)
            .single()

        if (invoiceError || !invoice) {
            throw new Error(`Transaction ${invoice_id} not found in billing_ledger`)
        }

        // 2. Perform Handshake with eTIMS (Simulation for Phase 4)
        // In production, this would use fetch() to the KRA eTIMS VSDC API
        console.log(`[eTIMS] Processing invoice ${invoice_id} for PIN ${kra_pin}`)

        const etimsResponse = {
            receiptNumber: `ETIMS-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
            controlCode: `VSDC-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            qrUrl: `https://etims.kra.go.ke/verify?id=${invoice_id}&t=${Date.now()}`,
            status: 'synced'
        }

        // 3. Update BeeYield DB with compliance records
        const { error: updateError } = await supabaseClient
            .from('billing_ledger')
            .update({
                etims_receipt_number: etimsResponse.receiptNumber,
                etims_control_code: etimsResponse.controlCode,
                etims_qr_url: etimsResponse.qrUrl,
                etims_status: 'synced',
                invoice_status: 'issued',
                updated_at: new Date().toISOString()
            })
            .eq('id', invoice_id)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify(etimsResponse),
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
