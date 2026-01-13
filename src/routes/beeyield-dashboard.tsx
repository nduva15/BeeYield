import { createFileRoute } from '@tanstack/react-router'
import BeeYieldDashboard from '@/pages/BeeYieldDashboard'

export const Route = createFileRoute('/beeyield-dashboard' as any)({
    component: BeeYieldDashboard,
})
