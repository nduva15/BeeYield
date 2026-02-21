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

        const { hive_id, start_date, end_date } = await req.json()

        // 1. Aggregate Sensor Data
        const { data: readings, error: readingsError } = await supabaseClient
            .from('sensor_readings')
            .select('weight_kg, recorded_at')
            .eq('hive_id', hive_id)
            .gte('recorded_at', start_date)
            .lte('recorded_at', end_date)

        if (readingsError) throw readingsError

        // 2. Aggregate Inspections
        const { data: inspections, error: inspError } = await supabaseClient
            .from('inspections')
            .select('*')
            .eq('hive_id', hive_id)
            .gte('created_at', start_date)

        if (inspError) throw inspError

        // 3. Analytics Logic
        const avgWeight = readings.length > 0
            ? readings.reduce((acc, r) => acc + (r.weight_kg || 0), 0) / readings.length
            : 0

        const weightGain = readings.length > 1
            ? (readings[readings.length - 1].weight_kg || 0) - (readings[0].weight_kg || 0)
            : 0

        const reportContent = {
            hive_id,
            period: `${start_date} to ${end_date}`,
            total_readings: readings.length,
            total_inspections: inspections.length,
            average_weight_kg: avgWeight.toFixed(2),
            net_weight_gain_kg: weightGain.toFixed(2),
            generated_at: new Date().toISOString(),
            download_url: `/storage/v1/object/public/reports/season_${hive_id}_${Date.now()}.pdf`
        }

        // 4. Save to Generated Reports (PRD requirement)
        const { error: saveError } = await supabaseClient
            .from('generated_reports')
            .insert({
                user_id: (await supabaseClient.auth.getUser()).data.user?.id,
                hive_id,
                report_type: 'Seasonal Performance',
                data: reportContent
            })

        if (saveError) console.error('Report save failed:', saveError)

        return new Response(
            JSON.stringify(reportContent),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
