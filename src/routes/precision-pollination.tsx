import { createFileRoute } from '@tanstack/react-router'
import PrecisionPollination from '@/pages/PrecisionPollination'

export const Route = createFileRoute('/precision-pollination')({
    component: PrecisionPollination,
})
