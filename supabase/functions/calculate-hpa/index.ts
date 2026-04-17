import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { acreage, crop_type, location_geojson } = await req.json()

        // 1. Foraging Optimization Math (Simplified Industry Standards)
        // Blueberries: 3 hives/acre | Almonds: 2 hives/acre | Cherries: 1.5 hives/acre
        const cropStandards: Record<string, number> = {
            'Blueberries': 3.0,
            'Almonds': 2.0,
            'Cherries': 1.5,
            'Apples': 1.0,
            'Clover': 0.5
        }

        const hpa = cropStandards[crop_type] || 2.0
        const total_hives_recommended = Math.ceil(acreage * hpa)

        // 2. Spatial Drop Generation (Mocking optimized cluster points)
        // In a real scenario, this would use a geometric packing algorithm
        const drop_coordinates = []
        const num_drops = Math.ceil(total_hives_recommended / 12) // average 12 hives per drop point

        for (let i = 0; i < num_drops; i++) {
            drop_coordinates.push({
                id: `drop_${i}`,
                lat: 0.0, // Placeholder for geometric offset logic
                lng: 0.0,
                hives: 12
            })
        }

        const output = {
            total_hives_recommended,
            hives_per_acre: hpa,
            drop_coordinates,
            calculated_at: new Date().toISOString()
        }

        // 3. Audit Logging (PRD compliance)
        const { error: logError } = await supabaseClient
            .from('calculator_logs')
            .insert({
                module_type: 'HpaOptimizer',
                input_json: { acreage, crop_type },
                output_json: output,
                user_id: (await supabaseClient.auth.getUser()).data.user?.id
            })

        if (logError) console.error('Audit log failed:', logError)

        return new Response(
            JSON.stringify(output),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
