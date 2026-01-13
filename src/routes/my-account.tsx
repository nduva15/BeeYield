import { createFileRoute } from '@tanstack/react-router'
import BuyerDashboard from '@/pages/BuyerDashboard'

export const Route = createFileRoute('/my-account')({
    component: BuyerDashboard,
})
