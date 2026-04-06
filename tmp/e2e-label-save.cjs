const fs = require('fs');
const { chromium } = require('playwright');
const FRONTEND_URL = 'http://localhost:5173';
const DASHBOARD_URL = `${FRONTEND_URL}/beeyield-dashboard?tab=label-generator`;
const LOG_PATH = 'tmp/e2e-label-save.log';

function readEnvValue(key) {
  const envText = fs.readFileSync('.env', 'utf8');
  const line = envText.split(/\r?\n/).find((entry) => entry.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
}

function base64UrlJson(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function makeDevToken(userId) {
  return [
    base64UrlJson({ alg: 'HS256', typ: 'JWT' }),
    base64UrlJson({ sub: userId, email: 'codex@example.com', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 }),
    Buffer.from('dev-signature').toString('base64url'),
  ].join('.');
}

function log(...args) {
  const line = `[e2e] ${args.join(' ')}\n`;
  fs.appendFileSync(LOG_PATH, line);
  process.stdout.write(line);
}

async function tryRegister(page) {
  const createAccountButton = page.getByRole('button', { name: /create an account/i });
  if (!(await createAccountButton.isVisible().catch(() => false))) {
    return false;
  }

  const stamp = Date.now();
  const email = `codex-label-${stamp}@example.com`;
  const password = 'CodexPass!234';

  log('registering temp user', email);
  await createAccountButton.click();
  await page.getByLabel(/first name/i).fill('Codex');
  await page.getByLabel(/last name/i).fill('Tester');
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm/i).fill(password);
  await page.getByRole('button', { name: /create account/i }).click();

  await page.waitForTimeout(4000);

  if (/beeyield-login/i.test(page.url())) {
    const emailField = page.getByLabel(/^email$/i);
    if (await emailField.isVisible().catch(() => false)) {
      log('registration stayed on auth page, attempting sign-in');
      await emailField.fill(email);
      await page.getByLabel(/^password$/i).fill(password);
      await page.getByRole('button', { name: /^sign in$/i }).click();
      await page.waitForTimeout(4000);
    }
  }

  return true;
}

async function main() {
  fs.writeFileSync(LOG_PATH, '');
  const watchdog = setTimeout(() => {
    log('watchdog timeout exceeded');
    process.exit(1);
  }, 120000);

  const userId = '11111111-1111-1111-1111-111111111111';
  const accessToken = makeDevToken(userId);
  const session = {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'dev-refresh-token',
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'codex@example.com',
      user_metadata: {
        first_name: 'Codex',
        last_name: 'Tester',
        role: 'professional',
        beeyield_active: true,
        full_name: 'Codex Tester',
      },
    },
  };
  log('using synthetic BeeYield session', userId);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  await context.route('http://localhost:8000/api/v1/labels*', async (route) => {
    const redirected = route.request().url().replace('http://localhost:8000/', 'http://127.0.0.1:8002/');
    log('proxying label request', route.request().method(), redirected);
    const response = await route.fetch({ url: redirected });
    await route.fulfill({ response });
  });
  await context.addInitScript((session) => {
    window.localStorage.setItem('sb-auth-token-beeyield', JSON.stringify(session));
    window.localStorage.setItem('authBackend', 'beeyield');
    window.localStorage.setItem('authReturnTo', '/beeyield-dashboard');
  }, session);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  let saveResponse = null;
  let saveResponseResolver = null;
  const saveResponsePromise = new Promise((resolve) => {
    saveResponseResolver = resolve;
  });
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/labels')) {
      log('label request started', request.method(), request.url());
    }
  });
  page.on('requestfailed', (request) => {
    if (request.url().includes('/api/v1/labels')) {
      log('label request failed', request.failure() ? request.failure().errorText : 'unknown');
    }
  });
  page.on('response', async (response) => {
    if (response.url().includes('/api/v1/labels') && response.request().method() === 'POST') {
      let body = '';
      try {
        body = await response.text();
      } catch {
        body = '<unreadable>';
      }
      saveResponse = {
        status: response.status(),
        url: response.url(),
        body,
      };
      log('captured label save response', response.status());
      if (saveResponseResolver) {
        saveResponseResolver(saveResponse);
        saveResponseResolver = null;
      }
    }
  });
  page.on('console', (msg) => log('console', msg.type(), msg.text()));
  page.on('pageerror', (err) => log('pageerror', err.message));

  await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  log('initial url', page.url());

  log('dashboard url', page.url());
  await page.screenshot({ path: 'tmp/label-generator-page.png', fullPage: true });

  const titleText = await page.locator('body').innerText();
  log('body excerpt', titleText.slice(0, 800).replace(/\s+/g, ' '));

  const buttons = await page.locator('button').evaluateAll((els) =>
    els.map((el) => ({
      text: (el.textContent || '').trim(),
      aria: el.getAttribute('aria-label') || '',
      title: el.getAttribute('title') || '',
    }))
  );
  log('buttons', JSON.stringify(buttons, null, 2));

  let saveClicked = false;
  const saveButtonCandidates = [
    page.getByRole('button', { name: /^save$/i }),
    page.getByRole('button', { name: /save design/i }),
    page.getByRole('button', { name: /save label/i }),
    page.getByLabel(/save/i),
    page.getByTitle(/save/i),
  ];

  for (const candidate of saveButtonCandidates) {
    if (await candidate.first().isVisible().catch(() => false)) {
      log('clicking save control');
      await candidate.first().click({ force: true });
      saveClicked = true;
      break;
    }
  }

  if (!saveClicked) {
    const saveLike = buttons.filter((btn) => /save/i.test(`${btn.text} ${btn.aria} ${btn.title}`));
    log('no clickable save button found; save-like controls:', JSON.stringify(saveLike, null, 2));
    await browser.close();
    return;
  }

  await Promise.race([
    saveResponsePromise,
    page.waitForTimeout(12000),
  ]);
  const toastText = await page.locator('body').innerText();
  log('post-save body excerpt', toastText.slice(0, 1200).replace(/\s+/g, ' '));
  if (saveResponse) {
    log('save response detail', JSON.stringify(saveResponse, null, 2));
  } else {
    log('no /api/v1/labels POST response captured');
  }

  await page.screenshot({ path: 'tmp/label-generator-after-save.png', fullPage: true });
  await browser.close();
  clearTimeout(watchdog);
}

main().catch((error) => {
  console.error('[e2e] fatal', error);
  process.exitCode = 1;
});
