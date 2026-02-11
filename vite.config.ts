import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// Detect if running inside `tauri dev`
const isTauri = !!process.env.TAURI_ENV_PLATFORM

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
    ],
    // Tauri expects a fixed port in dev mode
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
    },
    // Expose TAURI flag to frontend code via import.meta.env
    define: {
        __TAURI__: isTauri,
    },
    // Prevent Vite from obscuring Rust errors in Tauri dev
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
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
