import type { BannerThemeColor } from '@/types';

export interface BannerTheme {
  cardBg: string;
  badge: string;
  primaryBtn: string;
  secondaryBtn: string;
  highlightText: string;
  pillIcon: string;
}

/**
 * Single source of truth for hero banner theming, shared by the student
 * Home carousel and the admin live preview. Add a new theme here once and
 * both surfaces pick it up — never duplicate these class maps.
 */
export const BANNER_THEMES: Record<BannerThemeColor, BannerTheme> = {
  blue: {
    cardBg: 'bg-gradient-to-r from-[#eef6ff] via-[#e6f2fe] to-[#cee9fe] border-blue-200/80',
    badge: 'bg-blue-100/80 border-blue-200/60 text-blue-700',
    primaryBtn: 'bg-[#0158FC] hover:bg-[#0047cc] text-white shadow-blue-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-blue-200 text-slate-700',
    highlightText: 'text-[#0158FC]',
    pillIcon: 'text-[#0158FC]',
  },
  indigo: {
    cardBg: 'bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#c7d2fe] border-indigo-200/80',
    badge: 'bg-indigo-100/90 border-indigo-200/80 text-indigo-800',
    primaryBtn: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-indigo-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-indigo-200 text-slate-700',
    highlightText: 'text-[#4f46e5]',
    pillIcon: 'text-[#4f46e5]',
  },
  purple: {
    cardBg: 'bg-gradient-to-r from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe] border-purple-200/80',
    badge: 'bg-purple-100/90 border-purple-200/80 text-purple-800',
    primaryBtn: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-purple-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-purple-200 text-slate-700',
    highlightText: 'text-[#7c3aed]',
    pillIcon: 'text-[#7c3aed]',
  },
  emerald: {
    cardBg: 'bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0] border-emerald-200/80',
    badge: 'bg-emerald-100/90 border-emerald-200/80 text-emerald-800',
    primaryBtn: 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-emerald-200 text-slate-700',
    highlightText: 'text-[#059669]',
    pillIcon: 'text-[#059669]',
  },
  amber: {
    cardBg: 'bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-amber-200/80',
    badge: 'bg-amber-100/90 border-amber-200/80 text-amber-900',
    primaryBtn: 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-amber-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-amber-200 text-slate-700',
    highlightText: 'text-[#d97706]',
    pillIcon: 'text-[#d97706]',
  },
  rose: {
    cardBg: 'bg-gradient-to-r from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] border-rose-200/80',
    badge: 'bg-rose-100/90 border-rose-200/80 text-rose-800',
    primaryBtn: 'bg-[#e11d48] hover:bg-[#be123c] text-white shadow-rose-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-rose-200 text-slate-700',
    highlightText: 'text-[#e11d48]',
    pillIcon: 'text-[#e11d48]',
  },
  cyan: {
    cardBg: 'bg-gradient-to-r from-[#ecfeff] via-[#cffafe] to-[#a5f3fc] border-cyan-200/80',
    badge: 'bg-cyan-100/90 border-cyan-200/80 text-cyan-800',
    primaryBtn: 'bg-[#0891b2] hover:bg-[#0e7490] text-white shadow-cyan-500/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 border-cyan-200 text-slate-700',
    highlightText: 'text-[#0891b2]',
    pillIcon: 'text-[#0891b2]',
  },
};

/** Resolve a theme id to its classes; unknown ids fall back to blue. */
export function getBannerTheme(theme?: string | null): BannerTheme {
  if (theme && theme in BANNER_THEMES) {
    return BANNER_THEMES[theme as BannerThemeColor];
  }
  return BANNER_THEMES.blue;
}
