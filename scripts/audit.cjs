// Automated UI defect audit for Pulse 1.1.0_TEST.
// Logs in, walks every route at desktop + mobile, captures full-page
// screenshots, and records automated defect signals to audit.json.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv/config');

const BASE = process.env.APP_URL || 'https://test.alt-pulse.com/';
const EMAIL = process.env.APP_EMAIL || 'orgadmintest@alt-pulse.com';
const PASSWORD = process.env.APP_PASSWORD || 'Pass@#$&123';

const SHOTS = path.join('QA', 'bug-report', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const STORAGE_STATE = path.join('tests', 'e2e', '.auth', 'user.json');

const ROUTES = [
  ['Portfolio Dashboard', '/'],
  ['Asset Management', '/asset-management'],
  ['Overview Map', '/overview-map'],
  ['AI Reports', '/reports'],
  ['AI Insights', '/ai-insights'],
  ['AI Chat', '/ai-chat'],
  ['Energy Intelligence', '/energy-savings'],
  ['Compliance', '/compliance'],
  ['Work Orders', '/maintenance'],
  ['Maintenance Calendar', '/maintenance-calendar'],
  ['Fault Detection', '/fdd'],
  ['Smart Commissioning', '/smart-cx'],
  ['HVAC Optimization', '/start-stop'],
  ['Profile', '/settings/profile'],
  ['Theme Settings', '/settings/theme-settings'],
  ['Users', '/settings/users'],
  ['Roles', '/settings/roles'],
  ['Permission Matrix', '/settings/roles/permission-matrix'],
  ['Workflow', '/settings/roles/workflow'],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const DIAGNOSTICS = `() => {
  const out = {};
  const doc = document.documentElement;
  out.horizontalOverflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
  const vw = window.innerWidth;

  // Elements whose right/left edge clearly spills outside the viewport.
  const spill = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right - vw > 8 || r.left < -8) {
      spill.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), right: Math.round(r.right), left: Math.round(r.left), text: (el.innerText || '').trim().slice(0, 40) });
      if (spill.length > 8) break;
    }
  }
  out.overflowingElements = spill;

  // Broken images.
  out.brokenImages = [...document.querySelectorAll('img')]
    .filter((i) => i.complete && i.naturalWidth === 0)
    .map((i) => i.getAttribute('src') || i.getAttribute('alt') || '(no src)')
    .slice(0, 10);

  // Raw / leaked placeholder values rendered to the user.
  const body = document.body.innerText;
  const placeholders = [];
  for (const re of [/\\{\\{[^}]+\\}\\}/g, /\\bundefined\\b/g, /\\bNaN\\b/g, /\\[object Object\\]/g, /\\bnull\\b/g, /Lorem ipsum/gi]) {
    const m = body.match(re);
    if (m) placeholders.push(...m.slice(0, 3));
  }
  out.rawPlaceholders = [...new Set(placeholders)].slice(0, 10);

  // Empty / loading "zero-state" markers where data is expected.
  out.zeroStateMarkers = [...new Set(
    (body.match(/Scanning[^\\n]{0,30}|0 devices[^\\n]{0,20}|0 online of 0 total|No data available|Integration Pending|Failed to load|Something went wrong/gi) || [])
  )].slice(0, 10);

  // Overlapping visible buttons (alignment / layout defects).
  const btns = [...document.querySelectorAll('button, a[role="button"]')]
    .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none'; })
    .slice(0, 80)
    .map((b) => ({ r: b.getBoundingClientRect(), t: (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 24) }));
  const overlaps = [];
  for (let i = 0; i < btns.length; i++) {
    for (let j = i + 1; j < btns.length; j++) {
      const a = btns[i].r, b = btns[j].r;
      const ox = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const oy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const area = ox * oy;
      const minArea = Math.min(a.width * a.height, b.width * b.height);
      if (area > 0 && minArea > 0 && area / minArea > 0.35) {
        overlaps.push({ a: btns[i].t, b: btns[j].t, overlap: Math.round((area / minArea) * 100) + '%' });
        if (overlaps.length > 6) break;
      }
    }
  }
  out.buttonOverlaps = overlaps;

  out.h1Count = document.querySelectorAll('h1').length;
  out.mainCount = document.querySelectorAll('main').length;
  out.bodyTextLen = body.trim().length;
  return out;
}`;

(async () => {
  const browser = await chromium.launch();
  const useStorage = fs.existsSync(STORAGE_STATE);
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: useStorage ? STORAGE_STATE : undefined,
  });
  const page = await ctx.newPage();
  const consoleErrors = {};
  let currentKey = '';
  const IGNORE = [/favicon/i, /status of 4\d\d/i, /net::ERR_/i, /ResizeObserver/i, /React DevTools/i, /\[mobx\]/i, /Google Maps/i, /WebGL/i, /web\s?socket/i, /wss?:\/\//i, /establish a connection/i];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORE.some((re) => re.test(t))) return;
    (consoleErrors[currentKey] ||= []).push(t.slice(0, 200));
  });
  page.on('pageerror', (e) => {
    if (IGNORE.some((re) => re.test(e.message))) return;
    (consoleErrors[currentKey] ||= []).push('PAGEERROR: ' + e.message.slice(0, 200));
  });

  // Authenticate: reuse saved storage state if it still works, otherwise log in.
  await page.goto(new URL('/', BASE).href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  if (/\/login/.test(page.url()) || !useStorage) {
    await page.goto(new URL('/login', BASE).href, { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('you@company.com').fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 45000 });
    await page.waitForTimeout(2000);
    try { await ctx.storageState({ path: STORAGE_STATE }); } catch {}
  }

  const report = [];
  for (const [name, route] of ROUTES) {
    const key = slug(name);
    currentKey = key;
    const entry = { name, route, desktop: {}, mobile: {} };

    // Desktop.
    await ctx.pages()[0].setViewportSize({ width: 1440, height: 900 });
    await page.goto(new URL(route, BASE).href, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(4500);
    entry.finalUrl = page.url();
    try { entry.desktop.diag = await page.evaluate(`(${DIAGNOSTICS})()`); } catch (e) { entry.desktop.error = String(e).slice(0, 150); }
    const dShot = path.join(SHOTS, key + '.desktop.png');
    await page.screenshot({ path: dShot, fullPage: true }).catch(() => {});
    entry.desktop.shot = dShot.replace(/\\/g, '/');

    // Mobile.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL(route, BASE).href, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(3500);
    try { entry.mobile.diag = await page.evaluate(`(${DIAGNOSTICS})()`); } catch (e) { entry.mobile.error = String(e).slice(0, 150); }
    const mShot = path.join(SHOTS, key + '.mobile.png');
    await page.screenshot({ path: mShot, fullPage: true }).catch(() => {});
    entry.mobile.shot = mShot.replace(/\\/g, '/');

    entry.consoleErrors = consoleErrors[key] || [];
    report.push(entry);
    console.log('done:', name);
  }

  fs.writeFileSync('QA/bug-report/audit.json', JSON.stringify(report, null, 2));
  console.log('AUDIT_COMPLETE');
  await browser.close();
})();
