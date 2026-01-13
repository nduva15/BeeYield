import { createFileRoute } from '@tanstack/react-router'
import ESG from '@/pages/ESG'

export const Route = createFileRoute('/esg')({
    component: ESG,
})
