import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client creator
const createServerSupabase = () => {
    return createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.VITE_SUPABASE_ANON_KEY!
    )
}

export const getProductsFn = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            const supabase = createServerSupabase()

            // This runs on the server!
            console.log("Server Function: Fetching products from Supabase")

            const { data, error } = await supabase
                .from('products')
                .select('*, variants:product_variants(*)')

            if (error) throw error

            return (data || []).map((p: any) => ({
                ...p,
                variants: p.variants || []
            }))
        } catch (error) {
            console.error("Server Function Error fetching products:", error)
            return []
        }
    })
