import { defineConfig } from '@tanstack/start/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    tsr: {
        appDirectory: 'src',
    },
    vite: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    },
})
