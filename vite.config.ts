import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Detect if running inside `tauri dev`
const isTauri = !!process.env.TAURI_ENV_PLATFORM

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    // Tauri expects a fixed port in dev mode
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        // Limit HMR warmup to key entry files (avoids scanning 25k+ files)
        warmup: {
            clientFiles: [
                './src/main.tsx',
                './src/pages/AdminDashboard.tsx',
                './src/pages/PollinationServices.tsx'
            ],
        },
    },
    // Expose TAURI flag to frontend code via import.meta.env
    define: {
        __TAURI__: isTauri,
    },
    // Prevent Vite from obscuring Rust errors in Tauri dev
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    // Pre-bundle heavy deps so HMR doesn't re-process them
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@supabase/supabase-js',
            '@tanstack/react-query',
            'axios',
            'lucide-react',
            'recharts',
            'framer-motion',
            'date-fns',
            'lodash',
            'clsx',
            'tailwind-merge'
        ],
        exclude: ['@tauri-apps/api', '@tauri-apps/plugin-shell']
    },
    resolve: {
        alias: {
            '@': path.resolve(rootDir, './src'),
            '@tanstack/react-router': path.resolve(rootDir, './src/tanstack-router-shim.ts'),
            '@tanstack/react-start': path.resolve(rootDir, './src/tanstack-router-shim.ts'),
            '@tanstack/start': path.resolve(rootDir, './src/tanstack-router-shim.ts'),
            '@tanstack/router-plugin': path.resolve(rootDir, './src/tanstack-router-shim.ts'),
            'node:async_hooks': path.resolve(rootDir, './src/node-shim.ts'),
        },
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        cssMinify: true,
        chunkSizeWarningLimit: 1500,
    },
})
