import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/pages/AdminDashboard'
import AuthGuard from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/admin/')({
    component: () => (
        <AuthGuard requireAdmin>
            <AdminDashboard />
        </AuthGuard>
    ),
})
