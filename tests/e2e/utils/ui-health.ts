import { Page, expect, TestInfo } from '@playwright/test';

/**
 * Third-party / environment console noise that is not a product defect.
 * Extend this list rather than loosening the whole assertion.
 */
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [
  /favicon/i,
  /Failed to load resource: the server responded with a status of 4\d\d/i, // missing static assets / optional calls
  /net::ERR_/i,
  /ResizeObserver loop/i,
  /Download the React DevTools/i,
  /\[mobx\]/i,
  /Google Maps/i,
  /WebGL/i,
  /web\s?socket/i, // realtime backend (wss://.../api/ws) not reachable from the test env
  /wss?:\/\//i,
  /establish a connection to the server/i,
];

export interface ConsoleGuard {
  errors: string[];
  pageErrors: string[];
}

/**
 * Starts collecting console errors and uncaught exceptions for a page.
 * Call before navigation so nothing is missed.
 */
export function attachConsoleGuard(page: Page): ConsoleGuard {
  const guard: ConsoleGuard = { errors: [], pageErrors: [] };

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (IGNORED_CONSOLE_PATTERNS.some((re) => re.test(text))) return;
    guard.errors.push(text);
  });

  page.on('pageerror', (err) => {
    const text = err.message;
    if (IGNORED_CONSOLE_PATTERNS.some((re) => re.test(text))) return;
    guard.pageErrors.push(text);
  });

  return guard;
}

/**
 * Asserts the rendered, visible text contains no leaked placeholder values such
 * as `undefined`, `null`, `NaN`, or `[object Object]` (acceptance criteria 4).
 */
export async function expectNoRawPlaceholders(page: Page): Promise<void> {
  const offenders = await page.evaluate(() => {
    const body = document.body;
    if (!body) return [] as string[];
    const text = (body.innerText || '').replace(/\s+/g, ' ');
    const found: string[] = [];
    const patterns: Array<[string, RegExp]> = [
      ['undefined', /(^|[\s:>(])undefined([\s.,)%<]|$)/],
      ['NaN', /(^|[\s:>(])NaN([\s.,)%<]|$)/],
      ['[object Object]', /\[object Object\]/],
      ['null', /(^|[\s:>(])null([\s.,)%<]|$)/],
    ];
    for (const [label, re] of patterns) {
      if (re.test(text)) {
        const idx = text.search(re);
        found.push(`${label} :: "${text.slice(Math.max(0, idx - 30), idx + 30)}"`);
      }
    }
    return found;
  });

  expect(offenders, `Raw placeholder values visible on page:\n${offenders.join('\n')}`).toEqual([]);
}

/**
 * Asserts there are no broken raster images (those that failed to load).
 * Icon fonts and decorative SVGs are ignored.
 */
export async function expectNoBrokenImages(page: Page): Promise<void> {
  const broken = await page.evaluate(() => {
    const imgs = Array.from(document.images);
    return imgs
      .filter((img) => {
        if (!img.currentSrc && !img.src) return false; // not yet sourced
        if (img.loading === 'lazy' && !img.complete) return false;
        return img.complete && img.naturalWidth === 0;
      })
      .map((img) => img.currentSrc || img.src);
  });

  expect(broken, `Broken images detected:\n${broken.join('\n')}`).toEqual([]);
}

/**
 * Asserts the page does not overflow horizontally (no broken/overlapping layout
 * that forces a horizontal scrollbar). A small tolerance accounts for sub-pixel
 * rounding and overlay scrollbars.
 */
export async function expectNoHorizontalOverflow(page: Page, tolerance = 4): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      innerWidth: window.innerWidth,
    };
  });

  const limit = Math.max(overflow.clientWidth, overflow.innerWidth) + tolerance;
  expect(
    overflow.scrollWidth,
    `Horizontal overflow: scrollWidth ${overflow.scrollWidth}px exceeds viewport ${limit}px`,
  ).toBeLessThanOrEqual(limit);
}

/**
 * Collects the distinct font families actually used by visible text and asserts
 * the page stays within a small, consistent set (acceptance criteria 5).
 */
export async function expectConsistentFonts(page: Page, maxFamilies = 4): Promise<void> {
  const families = await page.evaluate(() => {
    const set = new Set<string>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    let inspected = 0;
    while (node && inspected < 1500) {
      const value = node.nodeValue?.trim();
      if (value && node.parentElement) {
        const el = node.parentElement;
        const tag = el.tagName.toLowerCase();
        // Material icon ligatures use a dedicated icon font — ignore them.
        if (!/material|icon/i.test(el.className || '') && tag !== 'script' && tag !== 'style') {
          const family = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
          if (family) set.add(family.toLowerCase());
          inspected += 1;
        }
      }
      node = walker.nextNode();
    }
    return Array.from(set);
  });

  expect(
    families.length,
    `Too many primary font families in use (${families.length}): ${families.join(', ')}`,
  ).toBeLessThanOrEqual(maxFamilies);
}

/** Fails the test if the console guard captured product (non-ignored) errors. */
export function expectNoConsoleErrors(guard: ConsoleGuard): void {
  const all = [...guard.errors, ...guard.pageErrors];
  expect(all, `Console errors detected:\n${all.join('\n')}`).toEqual([]);
}

/**
 * Navigates to a route and measures how long until the network settles, then
 * attaches the timing to the test report.
 */
export async function gotoAndMeasure(page: Page, path: string, testInfo: TestInfo): Promise<number> {
  const start = Date.now();
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {
    /* networkidle can be flaky on dashboards with polling — ignore. */
  });
  const elapsed = Date.now() - start;
  await testInfo.attach(`load-time-${path.replace(/\W+/g, '_')}`, {
    body: `${elapsed}ms`,
    contentType: 'text/plain',
  });
  return elapsed;
}
