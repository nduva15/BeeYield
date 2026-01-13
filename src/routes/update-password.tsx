import { createFileRoute } from '@tanstack/react-router'
import UpdatePassword from '@/pages/UpdatePassword'

export const Route = createFileRoute('/update-password')({
    component: UpdatePassword,
})
