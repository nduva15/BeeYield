import { createFileRoute } from '@tanstack/react-router'
import CommitmentPage from '@/pages/Commitment'

export const Route = createFileRoute('/commitment' as any)({
    component: CommitmentPage,
})
