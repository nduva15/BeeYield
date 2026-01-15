import { createServerFn } from '@tanstack/start'
import { createClient } from '@supabase/supabase-js'
import { Product } from '@/services/shopService'

// Server-side Supabase client creator
const createServerSupabase = () => {
    return createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.VITE_SUPABASE_ANON_KEY!
    )
}

export const getProductsFn = createServerFn({ method: "GET" })
    .handler(async (): Promise<Product[]> => {
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
