import { createFileRoute } from '@tanstack/react-router'
import BeeYieldDashboard from '@/pages/BeeYieldDashboard'
import AuthGuard from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/beeyield-dashboard' as any)({
    component: () => (
        <AuthGuard>
            <BeeYieldDashboard />
        </AuthGuard>
    ),
})
