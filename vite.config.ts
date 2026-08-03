import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

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
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        cssMinify: true,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                            return 'vendor-react';
                        }
                        if (id.includes('lucide-react') || id.includes('@radix-ui')) {
                            return 'vendor-ui';
                        }
                        if (id.includes('recharts') || id.includes('d3') || id.includes('recharts-scale')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('@supabase') || id.includes('@tanstack')) {
                            return 'vendor-query-supabase';
                        }
                        return 'vendor-utils';
                    }
                }
            }
        }
    },
})
