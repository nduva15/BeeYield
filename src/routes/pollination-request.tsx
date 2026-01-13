import { createFileRoute } from '@tanstack/react-router'
import PollinationRequest from '@/pages/PollinationRequest'

export const Route = createFileRoute('/pollination-request')({
    component: PollinationRequest,
})
