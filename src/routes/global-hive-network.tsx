import { createFileRoute } from '@tanstack/react-router'
import GlobalHiveNetwork from '@/pages/GlobalHiveNetwork'

export const Route = createFileRoute('/global-hive-network')({
    component: GlobalHiveNetwork,
})
