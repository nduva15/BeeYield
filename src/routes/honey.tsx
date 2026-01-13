import { createFileRoute } from '@tanstack/react-router'
import HoneyLanding from '@/pages/HoneyLanding'

export const Route = createFileRoute('/honey')({
    component: HoneyLanding,
})
