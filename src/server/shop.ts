import { createServerFn } from '@tanstack/react-start'

// DB Gateway URL from environment — no hardcoded URLs
const getGatewayUrl = () => {
    return process.env.DB_GATEWAY_URL || process.env.VITE_DB_GATEWAY_URL || 'http://127.0.0.1:9090'
}

export const getProductsFn = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            const gatewayUrl = getGatewayUrl()

            // Use the Rust/Go gateway instead of direct Supabase SDK
            const response = await fetch(`${gatewayUrl}/db/select`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: 'products',
                    columns: '*',
                    limit: 100,
                    filters: { is_active: 'eq.true' }
                })
            })

            if (!response.ok) {
                console.error("Gateway error:", await response.text())
                return []
            }

            const products = await response.json()

            // Fetch variants for each product
            const productIds = products.map((p: any) => p.id)
            let variants: any[] = []
            if (productIds.length > 0) {
                const varResponse = await fetch(`${gatewayUrl}/db/select`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'product_variants',
                        columns: '*',
                        limit: 1000
                    })
                })
                if (varResponse.ok) {
                    variants = await varResponse.json()
                }
            }

            // Attach variants to products
            return (products || []).map((p: any) => ({
                ...p,
                variants: variants.filter((v: any) => v.product_id === p.id)
            }))
        } catch (error) {
            console.error("Server Function Error fetching products:", error)
            return []
        }
    })
