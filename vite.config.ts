import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// Detect if running inside `tauri dev`
const isTauri = !!process.env.TAURI_ENV_PLATFORM

// https://vitejs.dev/config/
export default defineConfig({
    css: {
        postcss: {
            plugins: [
                tailwindcss,
                autoprefixer,
            ],
        },
    },
    plugins: [
        react(),
        tsconfigPaths(),
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
                './src/pages/BeeYieldDashboard.tsx',
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
        minify: 'esbuild',
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-core': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-backend': ['@supabase/supabase-js', '@tanstack/react-query', 'axios'],
                    'vendor-ui': ['framer-motion', 'clsx', 'tailwind-merge', 'sonner'],
                    'vendor-icons': ['lucide-react'],
                    'vendor-charts': ['recharts'],
                    'vendor-utils': ['lodash', 'date-fns', 'uuid', 'zod'],
                    'vendor-pdf': ['jspdf', 'jspdf-autotable', '@react-pdf/renderer'],
                    'vendor-qrcode': ['html5-qrcode', 'qrcode'],
                    'vendor-tf': ['@tensorflow/tfjs', '@tensorflow-models/mobilenet'],
                },
            },
        },
    },
})
