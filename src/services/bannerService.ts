import type { HeroBanner, BannerThemeColor } from '@/types';
import { supabaseRuntime, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'pk_hero_banners';

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-wb-exam-series',
    badgeText: 'TARGET 2026 🎯',
    title: 'Ace WBPSC & WBP Exams with All-India Standard Mocks',
    highlightWord: 'All-India Standard Mocks',
    subtitle:
      'Real exam simulation, detailed bilingual solutions & in-depth AI performance rank analysis.',
    primaryCtaText: 'Attempt Free Mock',
    primaryCtaLink: '/exams',
    secondaryCtaText: 'View Test Series',
    secondaryCtaLink: '/exams',
    featurePills: [
      'Real Exam Interface',
      'Instant Rank',
      'Bilingual (EN/BN)',
      'Negative Marking',
      'Full Solutions',
    ],
    imageUrl: '/images/exam_hero_banner.png',
    bannerType: 'full_image',
    themeGradient: 'blue',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'banner-pro-pass-special',
    badgeText: 'UNLIMITED ACCESS 👑',
    title: 'Upgrade to Pro Pass & Unlock 1,000+ Mock Tests & PYQs',
    highlightWord: '1,000+ Mock Tests & PYQs',
    subtitle:
      'Get complete 1-year access to all West Bengal & Central government exam test series with detailed solutions.',
    primaryCtaText: 'Get Pro Pass Now',
    primaryCtaLink: '/subscription',
    secondaryCtaText: 'Explore Features',
    secondaryCtaLink: '/dashboard',
    featurePills: [
      'All Exams Unlocked',
      'Chapter-wise Quizzes',
      'Performance Tracking',
      'Detailed Analytics',
      'Ad-Free Experience',
    ],
    imageUrl: '/images/student_hero_banner.jpg',
    bannerType: 'full_image',
    themeGradient: 'amber',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'banner-daily-10',
    badgeText: 'DAILY QUIZ ⚡',
    title: 'Daily 10 Challenge - Solve 10 Rapid MCQs Daily',
    highlightWord: 'Daily 10 Challenge',
    subtitle:
      'Build daily consistency with fast topic-wise practice questions & explanations.',
    primaryCtaText: 'Start Daily 10',
    primaryCtaLink: '/practice',
    secondaryCtaText: 'Practice Topics',
    secondaryCtaLink: '/practice',
    featurePills: [
      'Daily Habit',
      'Speed & Accuracy',
      'Subject Revision',
      'Streak Badges',
    ],
    imageUrl: '/images/daily_10_banner_exact.png',
    bannerType: 'full_image',
    themeGradient: 'indigo',
    isActive: true,
    displayOrder: 3,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

function getStoredBanners(): HeroBanner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredBanners(DEFAULT_HERO_BANNERS);
      return DEFAULT_HERO_BANNERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveStoredBanners(DEFAULT_HERO_BANNERS);
    return DEFAULT_HERO_BANNERS;
  } catch {
    return DEFAULT_HERO_BANNERS;
  }
}

function saveStoredBanners(banners: HeroBanner[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent('pk_hero_banners_updated', { detail: banners }));
  } catch (err) {
    console.error('Failed to save banners to localStorage:', err);
  }
}

export const bannerService = {
  /**
   * Upload a full banner image file (PNG/JPG/WebP/SVG)
   * Tries Supabase Storage bucket 'banners', falls back to 'question-images',
   * and if neither is available, safely falls back to a clean Base64 Data URL.
   */
  async uploadBannerImage(file: File): Promise<string> {
    if (isSupabaseConfigured) {
      try {
        const ext = file.name.split('.').pop() || 'png';
        const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
        const filePath = `banners/${fileName}`;

        // Attempt 1: 'banners' bucket
        const { data: bData, error: bError } = await supabaseRuntime.storage
          .from('banners')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!bError && bData?.path) {
          const { data: pUrl } = supabaseRuntime.storage.from('banners').getPublicUrl(bData.path);
          if (pUrl?.publicUrl) return pUrl.publicUrl;
        }

        // Attempt 2: 'question-images' bucket (already active in production)
        const { data: qData, error: qError } = await supabaseRuntime.storage
          .from('question-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!qError && qData?.path) {
          const { data: qUrl } = supabaseRuntime.storage.from('question-images').getPublicUrl(qData.path);
          if (qUrl?.publicUrl) return qUrl.publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload error, falling back to base64:', err);
      }
    }

    // Attempt 3: Safe Base64 Data URL
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to data URL.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Fetch all banners for Admin panel management
   */
  async getBanners(): Promise<HeroBanner[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseRuntime
          .from('hero_banners')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: HeroBanner[] = data.map((row: any) => ({
            id: String(row.id),
            badgeText: row.badge_text || '',
            title: row.title || '',
            highlightWord: row.highlight_word || '',
            subtitle: row.subtitle || '',
            primaryCtaText: row.primary_cta_text || 'Start Now',
            primaryCtaLink: row.primary_cta_link || '/exams',
            secondaryCtaText: row.secondary_cta_text || '',
            secondaryCtaLink: row.secondary_cta_link || '',
            featurePills: Array.isArray(row.feature_pills)
              ? row.feature_pills
              : typeof row.feature_pills === 'string'
              ? JSON.parse(row.feature_pills)
              : [],
            imageUrl: row.image_url || '/images/exam_hero_banner.png',
            bannerType: row.banner_type || 'full_image',
            themeGradient: (row.theme_gradient as BannerThemeColor) || 'blue',
            isActive: Boolean(row.is_active),
            displayOrder: Number(row.display_order) || 1,
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || undefined,
          }));
          saveStoredBanners(mapped);
          return mapped;
        }
      } catch {
        // Fallback to localStorage seamlessly
      }
    }

    return getStoredBanners().sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /**
   * Fetch only active banners sorted by displayOrder for Student Home
   */
  async getActiveBanners(): Promise<HeroBanner[]> {
    const all = await this.getBanners();
    const active = all.filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    return active.length > 0 ? active : [DEFAULT_HERO_BANNERS[0]];
  },

  /**
   * Create a new hero banner
   */
  async createBanner(
    input: Omit<HeroBanner, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<HeroBanner> {
    const newId = 'banner-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    const newBanner: HeroBanner = {
      ...input,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      try {
        await supabaseRuntime.from('hero_banners').insert([
          {
            id: newBanner.id,
            badge_text: newBanner.badgeText,
            title: newBanner.title,
            highlight_word: newBanner.highlightWord,
            subtitle: newBanner.subtitle,
            primary_cta_text: newBanner.primaryCtaText,
            primary_cta_link: newBanner.primaryCtaLink,
            secondary_cta_text: newBanner.secondaryCtaText,
            secondary_cta_link: newBanner.secondaryCtaLink,
            feature_pills: newBanner.featurePills,
            image_url: newBanner.imageUrl,
            banner_type: newBanner.bannerType || 'full_image',
            theme_gradient: newBanner.themeGradient,
            is_active: newBanner.isActive,
            display_order: newBanner.displayOrder,
            created_at: newBanner.createdAt,
            updated_at: newBanner.updatedAt,
          },
        ]);
      } catch {
        // Handled locally
      }
    }

    const current = getStoredBanners();
    const updated = [...current, newBanner].sort((a, b) => a.displayOrder - b.displayOrder);
    saveStoredBanners(updated);
    return newBanner;
  },

  /**
   * Update an existing banner
   */
  async updateBanner(id: string, updates: Partial<HeroBanner>): Promise<HeroBanner> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = { updated_at: now };
        if (updates.badgeText !== undefined) payload.badge_text = updates.badgeText;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.highlightWord !== undefined) payload.highlight_word = updates.highlightWord;
        if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
        if (updates.primaryCtaText !== undefined) payload.primary_cta_text = updates.primaryCtaText;
        if (updates.primaryCtaLink !== undefined) payload.primary_cta_link = updates.primaryCtaLink;
        if (updates.secondaryCtaText !== undefined)
          payload.secondary_cta_text = updates.secondaryCtaText;
        if (updates.secondaryCtaLink !== undefined)
          payload.secondary_cta_link = updates.secondaryCtaLink;
        if (updates.featurePills !== undefined) payload.feature_pills = updates.featurePills;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
        if (updates.bannerType !== undefined) payload.banner_type = updates.bannerType;
        if (updates.themeGradient !== undefined) payload.theme_gradient = updates.themeGradient;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;

        await supabaseRuntime.from('hero_banners').update(payload).eq('id', id);
      } catch {
        // Handled locally
      }
    }

    const current = getStoredBanners();
    let updatedBanner: HeroBanner | null = null;
    const updated = current.map((b) => {
      if (b.id === id) {
        updatedBanner = {
          ...b,
          ...updates,
          updatedAt: now,
        };
        return updatedBanner;
      }
      return b;
    });

    if (!updatedBanner) {
      throw new Error(`Banner with ID ${id} not found.`);
    }

    saveStoredBanners(updated.sort((a, b) => a.displayOrder - b.displayOrder));
    return updatedBanner;
  },

  /**
   * Delete a banner
   */
  async deleteBanner(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabaseRuntime.from('hero_banners').delete().eq('id', id);
      } catch {
        // Handled locally
      }
    }

    const current = getStoredBanners();
    const filtered = current.filter((b) => b.id !== id);
    saveStoredBanners(filtered);
    return true;
  },

  /**
   * Toggle active status
   */
  async toggleBannerStatus(id: string, isActive: boolean): Promise<HeroBanner> {
    return this.updateBanner(id, { isActive });
  },

  /**
   * Reorder banners
   */
  async reorderBanners(orderedIds: string[]): Promise<void> {
    const current = getStoredBanners();
    const updated = current.map((b) => {
      const idx = orderedIds.indexOf(b.id);
      if (idx !== -1) {
        return { ...b, displayOrder: idx + 1 };
      }
      return b;
    });

    updated.sort((a, b) => a.displayOrder - b.displayOrder);
    saveStoredBanners(updated);

    if (isSupabaseConfigured) {
      try {
        for (const b of updated) {
          await supabaseRuntime
            .from('hero_banners')
            .update({ display_order: b.displayOrder })
            .eq('id', b.id);
        }
      } catch {
        // Handled locally
      }
    }
  },

  /**
   * Reset to default initial banners
   */
  async resetToDefaults(): Promise<HeroBanner[]> {
    saveStoredBanners(DEFAULT_HERO_BANNERS);
    return DEFAULT_HERO_BANNERS;
  },
};
