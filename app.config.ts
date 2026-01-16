import { defineConfig } from '@tanstack/react-start/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    tsr: {
        appDirectory: 'src',
    },
    vite: {
        plugins: [
            tsconfigPaths(),
        ],
    },
})
