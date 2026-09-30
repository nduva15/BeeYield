import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Detect if running inside `tauri dev`
const isTauri = !!process.env.TAURI_ENV_PLATFORM

function apisenseSensorPlugin() {
    return {
        name: 'apisense-sensor-middleware',
        configureServer(server: any) {
            server.middlewares.use((req: any, res: any, next: any) => {
                const match = req.url && req.url.match(/^\/api\/v1\/sensors\/([^/?]+)\/telemetry/);
                if (match && req.method === 'GET') {
                    const serial = decodeURIComponent(match[1]).trim().toUpperCase();
                    const isH261 = serial.startsWith('H261');
                    const unitNum = isH261 && serial.length >= 3 && !isNaN(Number(serial.slice(-3))) ? Number(serial.slice(-3)) : 1;
                    const battery = unitNum === 1 ? 42 : Math.max(35, 42 - (unitNum % 15));
                    const rssi = unitNum === 1 ? -70 : -70 - (unitNum % 8);

                    const payload = {
                        serial_number: serial,
                        connection_type: 'bluetooth_le',
                        rssi_dbm: rssi,
                        battery_percentage: battery,
                        last_report: '2026-09-30T19:50:00',
                        last_measurement: '2026-09-30T19:00:00',
                        hardware_version: '4.1.0',
                        software_version: '1.8.8',
                        sync_status: 'fully_synced'
                    };

                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify(payload));
                    return;
                }
                next();
            });
        }
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        apisenseSensorPlugin(),
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
        esbuildOptions: {
            target: 'esnext',
        },
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
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                },
            },
        },
    },
})
