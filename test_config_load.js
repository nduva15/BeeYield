import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';

async function test() {
    const configFile = 'app.config.ts';
    const out = `test.config.timestamp_${Date.now()}.js`;
    try {
        console.log('Bundling...');
        const esbuild = await import('esbuild');
        await esbuild.build({
            entryPoints: [configFile],
            bundle: true,
            outfile: out,
            platform: 'node',
            format: 'esm',
            resolveExtensions: ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.mts'],
            plugins: [
                {
                    name: "externalize-deps",
                    setup(build) {
                        build.onResolve(
                            { filter: /^[^.].*/ },
                            async ({ path: id, importer, kind }) => {
                                if (kind === "entry-point" || path.isAbsolute(id) || id.match(/node:.*/)) {
                                    return;
                                }
                                return { external: true };
                            },
                        );
                    },
                },
            ],
            loader: {
                '.js': 'js',
                '.ts': 'ts',
                '.jsx': 'jsx',
                '.tsx': 'tsx',
                '.mjs': 'js',
                '.mts': 'ts',
            },
        });
        console.log('Bundled to:', out);
        const url = pathToFileURL(path.resolve(out)).href;
        console.log('Importing from:', url);
        const m = await import(url);
        let app = m.default;
        console.log('Export type:', typeof app);
        if (app && typeof app.then === 'function') {
            console.log('Export is a Promise, awaiting...');
            app = await app;
        }
        console.log('App found:', !!app);
        if (app) {
            console.log('App keys:', Object.keys(app));
            if (app.config) {
                console.log('App.config keys:', Object.keys(app.config));
            }
        }
    } catch (e) {
        console.error('FAILED:', e);
    }
}

test();
