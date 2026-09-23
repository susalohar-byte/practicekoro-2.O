import { describe, expect, it } from 'vitest';
import { BANNER_THEMES, getBannerTheme } from './bannerTheme';

describe('bannerTheme', () => {
  it('covers all seven theme ids with complete class sets', () => {
    const ids = ['blue', 'indigo', 'purple', 'emerald', 'amber', 'rose', 'cyan'] as const;
    expect(Object.keys(BANNER_THEMES).sort()).toEqual([...ids].sort());
    for (const id of ids) {
      const t = getBannerTheme(id);
      expect(t.cardBg).toContain('bg-gradient-to-r');
      expect(t.badge).toBeTruthy();
      expect(t.primaryBtn).toBeTruthy();
      expect(t.secondaryBtn).toBeTruthy();
      expect(t.highlightText).toMatch(/^text-\[/);
      expect(t.pillIcon).toMatch(/^text-\[/);
    }
  });

  it('falls back to blue for unknown, null or undefined themes', () => {
    expect(getBannerTheme('nope')).toEqual(BANNER_THEMES.blue);
    expect(getBannerTheme(null)).toEqual(BANNER_THEMES.blue);
    expect(getBannerTheme(undefined)).toEqual(BANNER_THEMES.blue);
    expect(getBannerTheme('')).toEqual(BANNER_THEMES.blue);
  });
});
