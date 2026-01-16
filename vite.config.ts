import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@tanstack/react-router': path.resolve(__dirname, './src/tanstack-router-shim.ts'),
            '@tanstack/react-start': path.resolve(__dirname, './src/tanstack-router-shim.ts'),
            '@tanstack/start': path.resolve(__dirname, './src/tanstack-router-shim.ts'),
            '@tanstack/router-plugin': path.resolve(__dirname, './src/tanstack-router-shim.ts'),
            'node:async_hooks': path.resolve(__dirname, './src/node-shim.ts'),
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
                },
            },
        },
    },
})
