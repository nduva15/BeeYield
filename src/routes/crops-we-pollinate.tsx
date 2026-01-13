import { createFileRoute } from '@tanstack/react-router'
import CropsWePollinate from '@/pages/CropsWePollinate'

export const Route = createFileRoute('/crops-we-pollinate')({
    component: CropsWePollinate,
})
