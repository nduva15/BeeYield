import { createFileRoute } from '@tanstack/react-router'
import { UsbHubConnection } from '@/pages/UsbHubConnection'

export const Route = createFileRoute('/hub-setup')({
    component: UsbHubConnection,
})
