import { createFileRoute } from '@tanstack/react-router'
import Receipt from '@/pages/Receipt'

export const Route = createFileRoute('/receipt/$orderId')({
    component: Receipt,
})
