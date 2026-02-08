import { createFileRoute } from '@tanstack/react-router'
import MyDevices from '@/pages/MyDevices'

export const Route = createFileRoute('/my-devices')({
    component: MyDevices,
})
