import { createFileRoute } from '@tanstack/react-router'
import Diseases from '@/pages/Diseases'

export const Route = createFileRoute('/diseases' as any)({
    component: Diseases,
})
