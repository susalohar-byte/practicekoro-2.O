import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  RotateCcw,
  Layers,
  X,
  Upload,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { bannerService, DEFAULT_HERO_BANNERS } from '@/services/bannerService';
import type { HeroBanner, BannerThemeColor } from '@/types';

const THEME_OPTIONS: { id: BannerThemeColor; label: string; bgClass: string; textClass: string }[] = [
  { id: 'blue', label: 'Classic Blue', bgClass: 'from-blue-50 to-blue-100 border-blue-200', textClass: 'text-blue-600' },
  { id: 'indigo', label: 'Deep Indigo', bgClass: 'from-indigo-50 to-indigo-100 border-indigo-200', textClass: 'text-indigo-600' },
  { id: 'purple', label: 'Royal Purple', bgClass: 'from-purple-50 to-purple-100 border-purple-200', textClass: 'text-purple-600' },
  { id: 'emerald', label: 'Success Emerald', bgClass: 'from-emerald-50 to-emerald-100 border-emerald-200', textClass: 'text-emerald-600' },
  { id: 'amber', label: 'Warm Amber', bgClass: 'from-amber-50 to-amber-100 border-amber-200', textClass: 'text-amber-600' },
  { id: 'rose', label: 'Vibrant Rose', bgClass: 'from-rose-50 to-rose-100 border-rose-200', textClass: 'text-rose-600' },
  { id: 'cyan', label: 'Electric Cyan', bgClass: 'from-cyan-50 to-cyan-100 border-cyan-200', textClass: 'text-cyan-600' },
];

const SYSTEM_BANNER_PRESETS = [
  {
    label: 'WBPSC & WBP Exam Series Banner',
    url: '/images/exam_hero_banner.png',
    target: '/exams',
  },
  {
    label: 'PracticeKoro Pro Pass Banner',
    url: '/images/student_hero_banner.jpg',
    target: '/subscription',
  },
  {
    label: 'Daily 10 Rapid Challenge Banner',
    url: '/images/daily_10_banner_exact.png',
    target: '/practice',
  },
];

const QUICK_TARGET_LINKS = [
  { label: 'Exams (/exams)', url: '/exams' },
  { label: 'Pro Pass (/subscription)', url: '/subscription' },
  { label: 'Dashboard (/dashboard)', url: '/dashboard' },
  { label: 'Topic Practice (/practice)', url: '/practice' },
];

/**
 * Compact mirror of the student Home hero theme mapping, so the in-modal
 * live preview renders exactly what students will see.
 */
const PREVIEW_THEMES: Record<
  BannerThemeColor,
  { card: string; badge: string; primaryBtn: string; secondaryBtn: string; highlight: string }
> = {
  blue: {
    card: 'bg-gradient-to-r from-[#eef6ff] via-[#e6f2fe] to-[#cee9fe] border-blue-200/80',
    badge: 'bg-blue-100/80 border-blue-200/60 text-blue-700',
    primaryBtn: 'bg-[#0158FC] text-white',
    secondaryBtn: 'bg-white border-blue-200 text-slate-700',
    highlight: 'text-[#0158FC]',
  },
  indigo: {
    card: 'bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#c7d2fe] border-indigo-200/80',
    badge: 'bg-indigo-100/90 border-indigo-200/80 text-indigo-800',
    primaryBtn: 'bg-[#4f46e5] text-white',
    secondaryBtn: 'bg-white border-indigo-200 text-slate-700',
    highlight: 'text-[#4f46e5]',
  },
  purple: {
    card: 'bg-gradient-to-r from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe] border-purple-200/80',
    badge: 'bg-purple-100/90 border-purple-200/80 text-purple-800',
    primaryBtn: 'bg-[#7c3aed] text-white',
    secondaryBtn: 'bg-white border-purple-200 text-slate-700',
    highlight: 'text-[#7c3aed]',
  },
  emerald: {
    card: 'bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0] border-emerald-200/80',
    badge: 'bg-emerald-100/90 border-emerald-200/80 text-emerald-800',
    primaryBtn: 'bg-[#059669] text-white',
    secondaryBtn: 'bg-white border-emerald-200 text-slate-700',
    highlight: 'text-[#059669]',
  },
  amber: {
    card: 'bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-amber-200/80',
    badge: 'bg-amber-100/90 border-amber-200/80 text-amber-900',
    primaryBtn: 'bg-[#d97706] text-white',
    secondaryBtn: 'bg-white border-amber-200 text-slate-700',
    highlight: 'text-[#d97706]',
  },
  rose: {
    card: 'bg-gradient-to-r from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] border-rose-200/80',
    badge: 'bg-rose-100/90 border-rose-200/80 text-rose-800',
    primaryBtn: 'bg-[#e11d48] text-white',
    secondaryBtn: 'bg-white border-rose-200 text-slate-700',
    highlight: 'text-[#e11d48]',
  },
  cyan: {
    card: 'bg-gradient-to-r from-[#ecfeff] via-[#cffafe] to-[#a5f3fc] border-cyan-200/80',
    badge: 'bg-cyan-100/90 border-cyan-200/80 text-cyan-800',
    primaryBtn: 'bg-[#0891b2] text-white',
    secondaryBtn: 'bg-white border-cyan-200 text-slate-700',
    highlight: 'text-[#0891b2]',
  },
};

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewBannerId, setPreviewBannerId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Image Upload & Linking state
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('/images/exam_hero_banner.png');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banner Details
  const [title, setTitle] = useState('');
  const [primaryCtaLink, setPrimaryCtaLink] = useState('/exams');
  const [bannerType, setBannerType] = useState<'full_image' | 'text_overlay'>('full_image');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  // Advanced Overlay (optional)
  const [badgeText, setBadgeText] = useState('');
  const [highlightWord, setHighlightWord] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [primaryCtaText, setPrimaryCtaText] = useState('Start Now');
  const [secondaryCtaText, setSecondaryCtaText] = useState('');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('');
  const [featurePillsRaw, setFeaturePillsRaw] = useState('');
  const [themeGradient, setThemeGradient] = useState<BannerThemeColor>('blue');

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBanners();
      setBanners(data);
      if (data.length > 0) {
        setPreviewBannerId((prev) => prev || data[0].id);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to load banners.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Process image file for upload
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await bannerService.uploadBannerImage(file);
      setImageUrl(uploadedUrl);
      showToast('success', 'Banner image uploaded successfully!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setPrimaryCtaLink('/exams');
    setImageUrl('/images/exam_hero_banner.png');
    setBannerType('full_image');
    setIsActive(true);
    setDisplayOrder(banners.length + 1);
    setBadgeText('TARGET 2026 🎯');
    setHighlightWord('');
    setSubtitle('');
    setPrimaryCtaText('Start Now');
    setSecondaryCtaText('');
    setSecondaryCtaLink('');
    setFeaturePillsRaw('');
    setThemeGradient('blue');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setPrimaryCtaLink(banner.primaryCtaLink || '/exams');
    setImageUrl(banner.imageUrl || '/images/exam_hero_banner.png');
    setBannerType(banner.bannerType || 'full_image');
    setIsActive(banner.isActive);
    setDisplayOrder(banner.displayOrder);
    setBadgeText(banner.badgeText || '');
    setHighlightWord(banner.highlightWord || '');
    setSubtitle(banner.subtitle || '');
    setPrimaryCtaText(banner.primaryCtaText || 'Start Now');
    setSecondaryCtaText(banner.secondaryCtaText || '');
    setSecondaryCtaLink(banner.secondaryCtaLink || '');
    setFeaturePillsRaw((banner.featurePills || []).join(', '));
    setThemeGradient(banner.themeGradient || 'blue');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Banner Name / Title is required.');
      return;
    }
    if (!imageUrl.trim()) {
      showToast('error', 'Please upload or provide a banner image link.');
      return;
    }
    const destLink = primaryCtaLink.trim() || '/exams';
    if (!/^(\/|https?:\/\/)/.test(destLink)) {
      showToast('error', 'Destination link must start with / (e.g. /exams) or http(s)://.');
      return;
    }
    const secondaryLink = secondaryCtaLink.trim();
    if (secondaryLink && !/^(\/|https?:\/\/)/.test(secondaryLink)) {
      showToast('error', 'Secondary button link must start with / or http(s)://.');
      return;
    }

    const pills = featurePillsRaw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      const payload = {
        title: title.trim(),
        primaryCtaLink: destLink,
        imageUrl: imageUrl.trim(),
        bannerType,
        badgeText: badgeText.trim(),
        highlightWord: highlightWord.trim(),
        subtitle: subtitle.trim(),
        primaryCtaText: primaryCtaText.trim() || 'Start Now',
        secondaryCtaText: secondaryCtaText.trim(),
        secondaryCtaLink: secondaryLink,
        featurePills: pills,
        themeGradient,
        isActive,
        displayOrder: Number(displayOrder) || 1,
      };

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, payload);
        showToast('success', 'Banner updated successfully!');
      } else {
        await bannerService.createBanner(payload);
        showToast('success', 'New banner created successfully!');
      }

      setIsModalOpen(false);
      await fetchBanners();
    } catch {
      showToast('error', 'Failed to save banner.');
    }
  };

  const handleToggleStatus = async (banner: HeroBanner) => {
    try {
      await bannerService.toggleBannerStatus(banner.id, !banner.isActive);
      showToast('success', `Banner ${banner.isActive ? 'hidden from students' : 'activated'}!`);
      await fetchBanners();
    } catch {
      showToast('error', 'Failed to update status.');
    }
  };

  const handleDelete = async (banner: HeroBanner) => {
    if (confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      try {
        await bannerService.deleteBanner(banner.id);
        showToast('success', 'Banner deleted.');
        if (previewBannerId === banner.id) {
          setPreviewBannerId(null);
        }
        await fetchBanners();
      } catch {
        showToast('error', 'Failed to delete banner.');
      }
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    const orderedIds = newBanners.map((b) => b.id);
    await bannerService.reorderBanners(orderedIds);
    await fetchBanners();
    showToast('success', 'Banner order updated.');
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset all banners to default system presets? Custom changes will be overwritten.')) {
      await bannerService.resetToDefaults();
      await fetchBanners();
      showToast('success', 'Reset to default hero banners.');
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;
  const currentPreviewBanner =
    banners.find((b) => b.id === previewBannerId) || banners[0] || DEFAULT_HERO_BANNERS[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promotional Banners</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hero Banners</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload full promotional graphics, set click destination links, and control slides on the student dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Reset to default banners"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0158FC] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Banners</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{banners.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Configured in system</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active on Home</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeCount > 1 ? `Carousel enabled (${activeCount} slides)` : 'Single banner displayed'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hidden / Drafts</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-400 mt-2">{banners.length - activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Saved as drafts</p>
        </div>
      </div>

      {/* Live Preview Section */}
      {currentPreviewBanner && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0158FC]" />
              <h2 className="text-sm font-bold text-slate-900">Student Dashboard Live Preview</h2>
              <span className="text-[11px] text-slate-400 truncate max-w-xs">({currentPreviewBanner.title})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-1 border border-blue-100">
                <Link2 className="w-3 h-3" />
                <span>Target: <b>{currentPreviewBanner.primaryCtaLink || '/exams'}</b></span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentPreviewBanner.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {currentPreviewBanner.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
          </div>

          {/* Full Banner Render Preview */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 max-w-full">
            {currentPreviewBanner.imageUrl ? (
              <div className="relative group">
                <img
                  src={currentPreviewBanner.imageUrl}
                  alt={currentPreviewBanner.title}
                  onError={(e) => {
                    e.currentTarget.src = '/images/exam_hero_banner.png';
                  }}
                  className="w-full h-auto max-h-[260px] sm:max-h-[300px] object-cover sm:object-fill transition-transform duration-300 group-hover:scale-[1.005]"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors pointer-events-none" />
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Click redirect: <b className="text-blue-300">{currentPreviewBanner.primaryCtaLink || '/exams'}</b></span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-semibold">No banner graphic uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banners List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">All Hero Banners ({banners.length})</h2>
          <span className="text-xs text-slate-500">Sorted by display order on student dashboard</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-[#0158FC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No banners created yet.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0158FC] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Banner</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banners.map((banner, index) => {
              const isSelected = previewBannerId === banner.id;
              return (
                <div
                  key={banner.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left: Order, Banner Image Thumbnail, Details */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Order Controls */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{banner.displayOrder}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === banners.length - 1}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Wide Banner Image Thumbnail */}
                    <div className="w-32 sm:w-44 h-16 sm:h-20 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          onError={(e) => {
                            e.currentTarget.src = '/images/exam_hero_banner.png';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            banner.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {banner.isActive ? 'Active' : 'Hidden'}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {banner.bannerType === 'text_overlay' ? 'Text Overlay' : 'Full Graphic Banner'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {banner.title}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-medium truncate">
                        <Link2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="text-slate-500">Redirects to:</span>
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {banner.primaryCtaLink || '/exams'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(banner)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        banner.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {banner.isActive ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewBannerId(banner.id)}
                      className={`p-2 rounded-xl text-slate-600 hover:bg-slate-100 border transition-all cursor-pointer ${
                        isSelected ? 'border-blue-400 text-[#0158FC] bg-blue-50' : 'border-slate-200'
                      }`}
                      title="Preview on top"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                      title="Edit banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(banner)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingBanner ? 'Edit Promotional Banner' : 'Upload New Hero Banner'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your full promotional banner image or provide a link with click redirect.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* 0. Live Student-View Preview (updates as you type — no need to save first) */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Live Preview — exactly how students will see it
                  </span>
                  <span className="text-[10px] font-semibold text-blue-500 shrink-0">
                    {bannerType === 'full_image' ? 'Full Graphic mode' : 'Text Overlay mode'}
                  </span>
                </div>
                {(() => {
                  const theme = PREVIEW_THEMES[themeGradient] || PREVIEW_THEMES.blue;
                  const pills = featurePillsRaw
                    .split(',')
                    .map((p) => p.trim())
                    .filter(Boolean);
                  if (bannerType === 'text_overlay') {
                    return (
                      <div className={`rounded-xl border ${theme.card} p-4 overflow-hidden`}>
                        <div className="min-w-0">
                          {badgeText.trim() && (
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}
                            >
                              {badgeText.trim()}
                            </span>
                          )}
                          <p className="text-sm font-black text-slate-900 mt-1.5 leading-snug">
                            {title.trim() || 'Banner headline goes here'}{' '}
                            {highlightWord.trim() && (
                              <span className={theme.highlight}>{highlightWord.trim()}</span>
                            )}
                          </p>
                          {subtitle.trim() && (
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                              {subtitle.trim()}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${theme.primaryBtn}`}
                            >
                              {primaryCtaText.trim() || 'Start Now'}
                            </span>
                            {secondaryCtaText.trim() && (
                              <span
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border ${theme.secondaryBtn}`}
                              >
                                {secondaryCtaText.trim()}
                              </span>
                            )}
                          </div>
                          {pills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pills.slice(0, 5).map((pill, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-600"
                                >
                                  {pill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return imageUrl.trim() ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img
                        src={imageUrl.trim()}
                        alt={title.trim() || 'Banner preview'}
                        onError={(e) => {
                          e.currentTarget.src = '/images/exam_hero_banner.png';
                        }}
                        className="w-full h-auto max-h-44 object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2.5 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5">
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                        <span>
                          Click redirect:{' '}
                          <b className="text-blue-300">{primaryCtaLink.trim() || '/exams'}</b>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-[11px] text-slate-400 font-semibold">
                      Upload an image above to preview the full graphic banner.
                    </div>
                  );
                })()}
              </div>

              {/* 1. Full Banner Image (Upload or Link) */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>Full Promotional Banner Image *</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload your ready-made banner artwork or paste an image URL.
                    </p>
                  </div>

                  {/* Mode toggle (Upload file vs Link) */}
                  <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-2xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 className="w-3 h-3 inline mr-1" />
                      Image Link
                    </button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Upload Mode Box */}
                {imageInputMode === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/70'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-100/60 bg-white'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-xs font-bold text-slate-800">Uploading banner image...</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Please wait a moment</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload banner or drag & drop image here
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          PNG, JPG, WebP, SVG (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Mode Input */
                  <div>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/banner.png or /images/exam_hero_banner.png"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Built-in Presets */}
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Or pick an existing template:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                    {SYSTEM_BANNER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          if (!primaryCtaLink) setPrimaryCtaLink(preset.target);
                        }}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:bg-white bg-white/70'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-7 object-cover rounded-md border border-slate-200 shrink-0"
                        />
                        <span className="text-[10px] font-bold text-slate-700 line-clamp-1">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Banner Image Preview */}
                {imageUrl && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Live Image Preview</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-36 bg-slate-900 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Banner preview"
                        onError={(e) => {
                          e.currentTarget.src = '/images/exam_hero_banner.png';
                        }}
                        className="w-full h-auto max-h-36 object-contain"
                      />
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-2">
                      💡 <b>Recommended Size:</b> 1200 × 360 px (approx. 3:1 ratio). Create your complete artwork with headline, discount, and illustrations directly inside the image.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Banner Name / Title */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Banner Name / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. WBPSC Food SI Special Mock Banner 2026"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Identifies the banner in admin lists and serves as accessibility alt text for students.
                </span>
              </div>

              {/* 3. Target Destination Link */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Click Destination Link (URL) *</span>
                </label>
                <input
                  type="text"
                  value={primaryCtaLink}
                  onChange={(e) => setPrimaryCtaLink(e.target.value)}
                  required
                  placeholder="e.g. /exams or /subscription or /practice"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {/* Quick Target Link Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {QUICK_TARGET_LINKS.map((link, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrimaryCtaLink(link.url)}
                      className="text-[10.5px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Display Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    Lower number appears first (#1, #2, #3...)
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-700">
                    {isActive ? 'Active on Student Dashboard' : 'Draft / Inactive'}
                  </span>
                </div>
              </div>

              {/* 5. Banner Texts & Call-to-Action Buttons (always visible) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-2">
                <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Banner Texts & Call-to-Action Buttons</span>
                </div>

                <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                    {/* Display Mode Selection */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-700">Display Mode</span>
                        <p className="text-[11px] text-slate-400">Choose how the banner is rendered</p>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setBannerType('full_image')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            bannerType === 'full_image'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          Full Graphic
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerType('text_overlay')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            bannerType === 'text_overlay'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          Text Overlay
                        </button>
                      </div>
                    </div>

                    {/* Top Badge */}
                    <div>
                      <label className="text-xs font-bold text-slate-700">Badge Text</label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="e.g. TARGET 2026 🎯 or {GREETING}, {USER} 🎓"
                        className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Highlight text & Subtitle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Highlight Text (Colored)</label>
                        <input
                          type="text"
                          value={highlightWord}
                          onChange={(e) => setHighlightWord(e.target.value)}
                          placeholder="e.g. All-India Standard Mocks"
                          className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Subtitle</label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="Short description..."
                          className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Primary button label */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Primary Button Text</label>
                        <input
                          type="text"
                          value={primaryCtaText}
                          onChange={(e) => setPrimaryCtaText(e.target.value)}
                          placeholder="e.g. Start Now"
                          className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Feature Pills (Comma-separated)</label>
                        <input
                          type="text"
                          value={featurePillsRaw}
                          onChange={(e) => setFeaturePillsRaw(e.target.value)}
                          placeholder="Mock Tests, PYQ, Full Solutions"
                          className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Secondary button (optional second CTA shown next to primary) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700">
                          Secondary Button Text <span className="font-medium text-slate-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={secondaryCtaText}
                          onChange={(e) => setSecondaryCtaText(e.target.value)}
                          placeholder="e.g. View Test Series"
                          className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">
                          Secondary Button Link <span className="font-medium text-slate-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={secondaryCtaLink}
                          onChange={(e) => setSecondaryCtaLink(e.target.value)}
                          placeholder="e.g. /exams or /dashboard"
                          className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Theme selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700">Color Gradient Theme</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                        {THEME_OPTIONS.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setThemeGradient(theme.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                              themeGradient === theme.id
                                ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className={theme.textClass}>{theme.label}</span>
                            {themeGradient === theme.id && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-[#0158FC] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner ? 'Save Changes' : 'Upload Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
