import { createFileRoute } from '@tanstack/react-router'
import Shop from '@/pages/Shop'
import { getProductsFn } from '@/server/shop'

export const Route = createFileRoute('/shop')({
    component: ShopComponent,
    loader: async () => await getProductsFn(),
})

function ShopComponent() {
    const products = Route.useLoaderData()
    return <Shop initialProducts={products} />
}
