import { createFileRoute } from '@tanstack/react-router'
import Traceability from '@/pages/Traceability'

export const Route = createFileRoute('/traceability')({
    component: Traceability,
})
