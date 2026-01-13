import { createFileRoute } from '@tanstack/react-router'
import Blogs from '@/pages/Blogs'

export const Route = createFileRoute('/blogs')({
    component: Blogs,
})
