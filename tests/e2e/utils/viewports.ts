/**
 * Canonical viewport presets for responsive testing (desktop / tablet / mobile)
 * plus the breakpoints the application is expected to honour.
 */
export interface Viewport {
  name: string;
  width: number;
  height: number;
  /** Loose classification used by responsive assertions. */
  kind: 'desktop' | 'tablet' | 'mobile';
}

export const VIEWPORTS = {
  desktop: { name: 'Desktop 1440x900', width: 1440, height: 900, kind: 'desktop' },
  desktopWide: { name: 'Desktop 1920x1080', width: 1920, height: 1080, kind: 'desktop' },
  laptop: { name: 'Laptop 1366x768', width: 1366, height: 768, kind: 'desktop' },
  tablet: { name: 'Tablet 1024x768', width: 1024, height: 768, kind: 'tablet' },
  tabletPortrait: { name: 'Tablet 768x1024', width: 768, height: 1024, kind: 'tablet' },
  mobile: { name: 'Mobile 390x844', width: 390, height: 844, kind: 'mobile' },
  mobileSmall: { name: 'Mobile 360x740', width: 360, height: 740, kind: 'mobile' },
} as const satisfies Record<string, Viewport>;

/** The standard three-tier set most responsive specs iterate over. */
export const RESPONSIVE_MATRIX: Viewport[] = [VIEWPORTS.desktop, VIEWPORTS.tablet, VIEWPORTS.mobile];
