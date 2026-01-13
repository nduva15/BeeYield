import { createFileRoute } from '@tanstack/react-router'
import BeeLearn from '@/pages/BeeLearn'

export const Route = createFileRoute('/learn')({
    component: BeeLearn,
})
