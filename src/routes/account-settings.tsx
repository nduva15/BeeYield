import { createFileRoute } from '@tanstack/react-router'
import AccountSettings from '@/pages/AccountSettings'
import AuthGuard from '@/components/auth/AuthGuard'

export const Route = createFileRoute('/account-settings')({
    component: () => (
        <AuthGuard>
            <AccountSettings />
        </AuthGuard>
    ),
})
