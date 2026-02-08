import { createFileRoute } from '@tanstack/react-router'
import BuyerDashboard from '@/pages/BuyerDashboard'
import AuthGuard from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/my-account')({
    component: () => (
        <AuthGuard>
            <BuyerDashboard />
        </AuthGuard>
    ),
})
