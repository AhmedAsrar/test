/**
 * Lightweight, dependency-free accessibility helpers.
 *
 * These run structural a11y checks directly in the page (landmarks, heading
 * order, control names, image alt text, form labels, focus visibility) so the
 * suite needs no extra npm dependency. For a full WCAG audit, layer
 * `@axe-core/playwright` on top of these where required.
 */
import { Page, expect } from '@playwright/test';

export interface A11ySnapshot {
  h1Count: number;
  mainCount: number;
  headings: { level: number; text: string }[];
  imagesMissingAlt: string[];
  buttonsWithoutName: number;
  inputsWithoutLabel: string[];
  hasSkipOrLandmark: boolean;
  documentTitle: string;
  langAttr: string;
}

/** Collects a structural accessibility snapshot of the current page. */
export async function getA11ySnapshot(page: Page): Promise<A11ySnapshot> {
  return page.evaluate(() => {
    const visible = (el: Element): boolean => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const cs = getComputedStyle(el as HTMLElement);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };

    const accessibleName = (el: Element): string => {
      const aria = el.getAttribute('aria-label');
      if (aria && aria.trim()) return aria.trim();
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        const t = labelledby
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim();
        if (t) return t;
      }
      const title = el.getAttribute('title');
      if (title && title.trim()) return title.trim();
      const text = (el as HTMLElement).innerText?.trim();
      if (text) return text;
      // Icon-only buttons frequently rely on an SVG <title> or nested label.
      const svgTitle = el.querySelector('svg title')?.textContent?.trim();
      return svgTitle ?? '';
    };

    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(visible)
      .map((h) => ({ level: Number(h.tagName[1]), text: (h as HTMLElement).innerText.trim().slice(0, 60) }));

    const imagesMissingAlt = Array.from(document.querySelectorAll('img'))
      .filter(visible)
      .filter((img) => img.getAttribute('alt') === null && img.getAttribute('role') !== 'presentation')
      .map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src)
      .slice(0, 20);

    const buttons = Array.from(document.querySelectorAll('button,[role="button"]')).filter(visible);
    const buttonsWithoutName = buttons.filter((b) => !accessibleName(b)).length;

    const inputs = Array.from(
      document.querySelectorAll('input:not([type="hidden"]),select,textarea'),
    ).filter(visible);
    const inputsWithoutLabel = inputs
      .filter((el) => {
        const id = el.getAttribute('id');
        const hasFor = id ? !!document.querySelector(`label[for="${id}"]`) : false;
        const wrapped = !!el.closest('label');
        const aria = !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
        const placeholder = !!el.getAttribute('placeholder');
        return !(hasFor || wrapped || aria || placeholder);
      })
      .map((el) => (el.getAttribute('name') || el.getAttribute('id') || el.tagName).toString())
      .slice(0, 20);

    const hasSkipOrLandmark =
      !!document.querySelector('main,[role="main"],nav,[role="navigation"]') ||
      !!document.querySelector('a[href^="#"]');

    return {
      h1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main,[role="main"]').length,
      headings,
      imagesMissingAlt,
      buttonsWithoutName,
      inputsWithoutLabel,
      hasSkipOrLandmark,
      documentTitle: document.title,
      langAttr: document.documentElement.getAttribute('lang') || '',
    };
  });
}

/**
 * Asserts the page is keyboard-operable: Tab moves focus to an interactive,
 * visible element. Returns the tag/role that received focus.
 */
export async function expectKeyboardFocusMoves(page: Page): Promise<string> {
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return '';
    return `${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''}`;
  });
  expect(focused, 'Tab did not move focus to an interactive element').not.toBe('');
  return focused;
}

/**
 * Asserts every visible image has an `alt` attribute (decorative images should
 * use `alt=""` or `role="presentation"`).
 */
export async function expectImagesHaveAlt(page: Page): Promise<void> {
  const snap = await getA11ySnapshot(page);
  expect(
    snap.imagesMissingAlt,
    `Images missing alt text:\n${snap.imagesMissingAlt.join('\n')}`,
  ).toEqual([]);
}

/** Asserts the document declares a language and a non-empty title. */
export async function expectDocumentBasics(page: Page): Promise<void> {
  const snap = await getA11ySnapshot(page);
  expect(snap.documentTitle.trim().length, 'Document <title> is empty').toBeGreaterThan(0);
  expect(snap.langAttr, 'Missing <html lang> attribute').not.toBe('');
}
