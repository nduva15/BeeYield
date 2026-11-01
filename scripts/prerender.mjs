/**
 * Post-build prerender: serves ./dist, renders public routes in headless
 * Chromium (puppeteer) and writes the resulting HTML to dist/<route>/index.html
 * so crawlers see real content. Never fails the build: on any error the
 * regular SPA output in dist/ is left untouched.
 *
 * The process is always force-exited with code 0 (and has a hard global
 * deadline) so a failed Chromium launch or a hung page can never keep the
 * local HTTP server alive and stall the Vercel build.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const ROUTES = [
    '/', '/about', '/ourstory', '/team', '/careers', '/impact', '/esg', '/sdg', '/commitment',
    '/pollination-services', '/precision-pollination', '/pollination-solutions',
    '/in-land-pollination', '/crops-we-pollinate', '/honey', '/shop', '/learn', '/blogs',
    '/contact', '/traceability', '/diseases', '/media', '/panda-miti', '/privacy', '/terms',
];
const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
};
const GLOBAL_DEADLINE_MS = 5 * 60 * 1000;
const LAUNCH_TIMEOUT_MS = 30000;

// Hard stop: whatever happens, never block the build for more than the deadline.
const deadline = setTimeout(() => {
    console.warn('[prerender] global deadline reached, keeping output written so far.');
    process.exit(0);
}, GLOBAL_DEADLINE_MS);
deadline.unref();

async function main() {
    if (process.env.SKIP_PRERENDER === '1') {
        console.log('[prerender] SKIP_PRERENDER=1, skipping.');
        return;
    }

    let puppeteer;
    try {
        puppeteer = (await import('puppeteer')).default;
    } catch {
        console.warn('[prerender] puppeteer not available, skipping.');
        return;
    }

    // Always serve the original SPA shell, even after pages are written.
    const shell = await fs.readFile(path.join(DIST, 'index.html'));

    const server = http.createServer(async (req, res) => {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        const file = path.join(DIST, urlPath);
        try {
            if (!file.startsWith(DIST)) throw new Error('outside dist');
            const stat = await fs.stat(file);
            if (!stat.isFile()) throw new Error('not a file');
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(await fs.readFile(file));
        } catch {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(shell);
        }
    });

    let browser;
    try {
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        const base = `http://127.0.0.1:${server.address().port}`;

        browser = await puppeteer.launch({
            headless: true,
            timeout: LAUNCH_TIMEOUT_MS,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });

        let ok = 0;
        for (const route of ROUTES) {
            const page = await browser.newPage();
            try {
                await page.goto(base + route, { waitUntil: 'networkidle2', timeout: 20000 });
                // Wait until the splash is gone and the app has rendered real content.
                await page.waitForFunction(
                    () => !document.getElementById('splash') && document.body.innerText.trim().split(/\s+/).length > 50,
                    { timeout: 10000 },
                );
                const html = '<!DOCTYPE html>' + (await page.evaluate(() => document.documentElement.outerHTML));
                const out = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route, 'index.html');
                await fs.mkdir(path.dirname(out), { recursive: true });
                await fs.writeFile(out, html);
                ok++;
                console.log(`[prerender] ${route}`);
            } catch (e) {
                console.warn(`[prerender] skipped ${route}: ${e.message}`);
            } finally {
                await page.close().catch(() => {});
            }
        }
        console.log(`[prerender] done: ${ok}/${ROUTES.length} routes`);
    } finally {
        if (browser) await browser.close().catch(() => {});
        server.close();
        server.closeAllConnections?.();
    }
}

main()
    .catch((e) => console.warn('[prerender] failed, keeping SPA output:', e.message))
    .finally(() => process.exit(0));
