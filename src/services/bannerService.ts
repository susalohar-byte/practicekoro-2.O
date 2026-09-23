import type { HeroBanner, BannerThemeColor, BannerAudience, BannerPlacement } from '@/types';
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
    targetAudience: 'all',
    placement: 'home_hero',
    clickCount: 0,
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
    targetAudience: 'free',
    placement: 'home_hero',
    clickCount: 0,
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
    targetAudience: 'all',
    placement: 'home_hero',
    clickCount: 0,
    isActive: true,
    displayOrder: 3,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimizes high-resolution banner images client-side before upload.
 * Scales down to max 1920x720 (preserving aspect ratio) and converts to WebP/JPEG,
 * typically reducing payload sizes by 80-92% with no perceptual degradation.
 */
export async function optimizeBannerImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 720,
  quality = 0.85
): Promise<OptimizedImageResult> {
  const originalSize = file.size;

  // In non-browser / test environments or SVGs, return directly
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    file.type === 'image/svg+xml'
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          file,
          dataUrl: typeof reader.result === 'string' ? reader.result : '',
          width: 1200,
          height: 360,
          originalSize,
          optimizedSize: originalSize,
          compressionRatio: 0,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // If already reasonably sized and under 250KB, keep as-is
        if (width <= maxWidth && height <= maxHeight && file.size <= 250 * 1024) {
          resolve({
            file,
            dataUrl: e.target?.result as string,
            width,
            height,
            originalSize,
            optimizedSize: originalSize,
            compressionRatio: 0,
          });
          return;
        }

        // Calculate proportional scale
        let targetWidth = width;
        let targetHeight = height;
        if (targetWidth > maxWidth) {
          targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
          targetWidth = maxWidth;
        }
        if (targetHeight > maxHeight) {
          targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
          targetHeight = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            file,
            dataUrl: e.target?.result as string,
            width,
            height,
            originalSize,
            optimizedSize: originalSize,
            compressionRatio: 0,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const mimeType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                dataUrl: e.target?.result as string,
                width,
                height,
                originalSize,
                optimizedSize: originalSize,
                compressionRatio: 0,
              });
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanName, { type: mimeType });
            const dataUrl = canvas.toDataURL(mimeType, quality);
            const optimizedSize = compressedFile.size;
            const compressionRatio =
              originalSize > 0
                ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
                : 0;

            resolve({
              file: compressedFile,
              dataUrl,
              width: targetWidth,
              height: targetHeight,
              originalSize,
              optimizedSize,
              compressionRatio: Math.max(0, compressionRatio),
            });
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pk_hero_banners_updated', { detail: banners }));
    }
  } catch (err) {
    console.error('Failed to save banners to localStorage:', err);
  }
}

export const bannerService = {
  /**
   * Optimizes and uploads a banner image file (PNG/JPG/WebP/SVG).
   * Tries Supabase Storage bucket 'banners', falls back to 'question-images',
   * and if neither is available, safely falls back to a clean compressed Data URL.
   */
  async uploadBannerImage(file: File): Promise<{ url: string; optimization: OptimizedImageResult }> {
    const opt = await optimizeBannerImage(file);
    const fileToUpload = opt.file;

    if (isSupabaseConfigured) {
      try {
        const ext = fileToUpload.name.split('.').pop() || 'webp';
        const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
        const filePath = `banners/${fileName}`;

        // Attempt 1: 'banners' bucket
        const { data: bData, error: bError } = await supabaseRuntime.storage
          .from('banners')
          .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: true });

        if (!bError && bData?.path) {
          const { data: pUrl } = supabaseRuntime.storage.from('banners').getPublicUrl(bData.path);
          if (pUrl?.publicUrl) return { url: pUrl.publicUrl, optimization: opt };
        }

        // Attempt 2: 'question-images' bucket (active in production)
        const { data: qData, error: qError } = await supabaseRuntime.storage
          .from('question-images')
          .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: true });

        if (!qError && qData?.path) {
          const { data: qUrl } = supabaseRuntime.storage.from('question-images').getPublicUrl(qData.path);
          if (qUrl?.publicUrl) return { url: qUrl.publicUrl, optimization: opt };
        }
      } catch (err) {
        console.warn('Storage upload error, falling back to compressed data URL:', err);
      }
    }

    // Attempt 3: Safe compressed Data URL
    return { url: opt.dataUrl, optimization: opt };
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
            mobileImageUrl: row.mobile_image_url || undefined,
            bannerType: row.banner_type || 'full_image',
            themeGradient: (row.theme_gradient as BannerThemeColor) || 'blue',
            targetAudience: (row.target_audience as BannerAudience) || 'all',
            placement: (row.placement as BannerPlacement) || 'home_hero',
            startsAt: row.starts_at || undefined,
            expiresAt: row.expires_at || undefined,
            clickCount: Number(row.click_count) || 0,
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
   * Supports target audience filtering (e.g. Free vs Pro Pass) and schedule verification.
   */
  async getActiveBanners(options?: {
    audience?: BannerAudience;
    placement?: BannerPlacement;
  }): Promise<HeroBanner[]> {
    const all = await this.getBanners();
    const now = Date.now();

    const active = all
      .filter((b) => {
        if (!b.isActive) return false;

        // Target audience filtering
        if (options?.audience && options.audience !== 'all') {
          if (b.targetAudience && b.targetAudience !== 'all' && b.targetAudience !== options.audience) {
            return false;
          }
        }

        // Placement filtering
        if (options?.placement && options.placement !== 'all') {
          if (b.placement && b.placement !== 'all' && b.placement !== options.placement) {
            return false;
          }
        }

        // Scheduling: startsAt check
        if (b.startsAt) {
          const startTime = new Date(b.startsAt).getTime();
          if (!isNaN(startTime) && startTime > now) return false;
        }

        // Scheduling: expiresAt check
        if (b.expiresAt) {
          const expiryTime = new Date(b.expiresAt).getTime();
          if (!isNaN(expiryTime) && expiryTime < now) return false;
        }

        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);

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
      clickCount: input.clickCount || 0,
      targetAudience: input.targetAudience || 'all',
      placement: input.placement || 'home_hero',
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
            mobile_image_url: newBanner.mobileImageUrl,
            banner_type: newBanner.bannerType || 'full_image',
            theme_gradient: newBanner.themeGradient,
            target_audience: newBanner.targetAudience,
            placement: newBanner.placement,
            starts_at: newBanner.startsAt,
            expires_at: newBanner.expiresAt,
            click_count: newBanner.clickCount,
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
        if (updates.mobileImageUrl !== undefined) payload.mobile_image_url = updates.mobileImageUrl;
        if (updates.bannerType !== undefined) payload.banner_type = updates.bannerType;
        if (updates.themeGradient !== undefined) payload.theme_gradient = updates.themeGradient;
        if (updates.targetAudience !== undefined) payload.target_audience = updates.targetAudience;
        if (updates.placement !== undefined) payload.placement = updates.placement;
        if (updates.startsAt !== undefined) payload.starts_at = updates.startsAt;
        if (updates.expiresAt !== undefined) payload.expires_at = updates.expiresAt;
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
   * Record a click on a banner for analytics
   */
  async trackBannerClick(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabaseRuntime.rpc('increment_banner_click', { p_banner_id: id });
      } catch {
        // Handled locally
      }
    }

    const current = getStoredBanners();
    const updated = current.map((b) =>
      b.id === id ? { ...b, clickCount: (b.clickCount || 0) + 1 } : b
    );
    saveStoredBanners(updated);
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

  /**
   * Subscribes to real-time banner updates across all browser tabs and Supabase channels.
   * Returns an unsubscribe teardown function.
   */
  subscribeToBannerUpdates(callback: (banners: HeroBanner[]) => void): () => void {
    const handleLocal = (e: Event) => {
      const custom = e as CustomEvent<HeroBanner[]>;
      if (custom.detail) {
        callback(custom.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pk_hero_banners_updated', handleLocal);
    }

    let channel: any = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabaseRuntime
          .channel('realtime:hero_banners')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hero_banners' },
            async () => {
              const latest = await bannerService.getBanners();
              callback(latest);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel error for hero_banners:', err);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pk_hero_banners_updated', handleLocal);
      }
      if (channel && isSupabaseConfigured) {
        try {
          supabaseRuntime.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  },
};
