import { createFileRoute } from '@tanstack/react-router'
import Media from '@/pages/Media'

export const Route = createFileRoute('/media')({
    component: Media,
})
