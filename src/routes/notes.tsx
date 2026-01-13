import { createFileRoute } from '@tanstack/react-router'
import Notes from '@/pages/Notes'

export const Route = createFileRoute('/notes')({
    component: Notes,
})
