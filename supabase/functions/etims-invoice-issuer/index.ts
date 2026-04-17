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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { invoice_id, kra_pin } = await req.json()

        if (!invoice_id) {
            throw new Error("Invoice ID is required")
        }

        // 1. Fetch invoice data from BeeYield DB
        const { data: invoice, error: invoiceError } = await supabaseClient
            .from('billing_ledger')
            .select('*, profiles:user_id(full_name, company_name)')
            .eq('id', invoice_id)
            .single()

        if (invoiceError || !invoice) {
            throw new Error(`Transaction ${invoice_id} not found in billing_ledger`)
        }

        // 2. Perform Handshake with eTIMS (Simulation for Phase 4)
        // In production, this would use fetch() to the KRA eTIMS VSDC API with proper certificates
        console.log(`[eTIMS] Processing invoice ${invoice_id} for PIN ${kra_pin || 'P000000000Z'}`)

        const timestamp = new Date().toISOString()
        const checksum = crypto.subtle.digest("SHA-256", new TextEncoder().encode(invoice_id + timestamp))
        const checksumHex = Array.from(new Uint8Array(await checksum))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        const etimsResponse = {
            receiptNumber: `ETIMS-${invoice_id.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            controlCode: checksumHex.slice(0, 16).toUpperCase(),
            qrUrl: `https://etims.kra.go.ke/verify?id=${invoice_id}&ts=${Date.now()}&v=2`,
            signature: checksumHex,
            status: 'synced',
            syncedAt: timestamp
        }

        // 3. Update BeeYield DB with compliance records
        const { error: updateError } = await supabaseClient
            .from('billing_ledger')
            .update({
                etims_receipt_number: etimsResponse.receiptNumber,
                etims_signature: etimsResponse.signature,
                etims_qr_url: etimsResponse.qrUrl,
                etims_status: 'synced',
                invoice_status: 'issued',
                is_etims_synced: true,
                metadata: {
                    ...(invoice.metadata || {}),
                    etims_control_code: etimsResponse.controlCode,
                    etims_sync_timestamp: etimsResponse.syncedAt,
                    vscu_serial: "BY-VSCU-2026-X"
                },
                updated_at: timestamp
            })
            .eq('id', invoice_id)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({
                success: true,
                ...etimsResponse
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error(`[eTIMS Error] ${error.message}`)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                details: "Ensure the transaction exists and your KRA configuration is valid."
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
