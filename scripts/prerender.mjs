/**
 * Post-build prerender: serves ./dist, renders public routes in headless
 * Chromium (puppeteer) and writes the resulting HTML to dist/<route>/index.html
 * so crawlers see real content. Never fails the build: on any error the
 * regular SPA output in dist/ is left untouched.
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

async function main() {
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
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${server.address().port}`;

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let ok = 0;
    for (const route of ROUTES) {
        const page = await browser.newPage();
        try {
            await page.goto(base + route, { waitUntil: 'networkidle2', timeout: 30000 });
            // Wait until the splash is gone and the app has rendered real content.
            await page.waitForFunction(
                () => !document.getElementById('splash') && document.body.innerText.trim().split(/\s+/).length > 50,
                { timeout: 15000 },
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
            await page.close();
        }
    }

    await browser.close();
    server.close();
    console.log(`[prerender] done: ${ok}/${ROUTES.length} routes`);
}

main().catch((e) => console.warn('[prerender] failed, keeping SPA output:', e.message));
