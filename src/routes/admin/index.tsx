import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/pages/AdminDashboard'

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard,
})
