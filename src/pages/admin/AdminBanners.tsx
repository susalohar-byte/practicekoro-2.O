import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  X,
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

const PRESET_IMAGES = [
  {
    label: '3D Student with Tablet & Motivational Chart',
    url: '/images/hero_student_illustration.png',
  },
  {
    label: '3D Student Portrait',
    url: '/images/student_hero_3d.jpg',
  },
  {
    label: 'Pro Pass Crown Asset',
    url: '/images/subscription_crown.png',
  },
];

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewBannerId, setPreviewBannerId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form fields
  const [badgeText, setBadgeText] = useState('');
  const [title, setTitle] = useState('');
  const [highlightWord, setHighlightWord] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [primaryCtaText, setPrimaryCtaText] = useState('Start a Mock Test');
  const [primaryCtaLink, setPrimaryCtaLink] = useState('/exams');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Explore Exams');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('/exams');
  const [featurePillsRaw, setFeaturePillsRaw] = useState(
    'Mock Tests, Topic Practice, PYQ, Detailed Solutions, Performance Analysis'
  );
  const [imageUrl, setImageUrl] = useState('/images/hero_student_illustration.png');
  const [themeGradient, setThemeGradient] = useState<BannerThemeColor>('blue');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBanners();
      setBanners(data);
      if (data.length > 0 && !previewBannerId) {
        setPreviewBannerId(data[0].id);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to load banners.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setBadgeText('{GREETING}, {USER} 🎓');
    setTitle('Small Steps Today,');
    setHighlightWord('Big Results Tomorrow.');
    setSubtitle('Join thousands of aspirants preparing smarter with PracticeKoro.');
    setPrimaryCtaText('Start a Mock Test');
    setPrimaryCtaLink('/exams');
    setSecondaryCtaText('Explore Exams');
    setSecondaryCtaLink('/exams');
    setFeaturePillsRaw('Mock Tests, Topic Practice, PYQ, Detailed Solutions, Performance Analysis');
    setImageUrl('/images/hero_student_illustration.png');
    setThemeGradient('blue');
    setIsActive(true);
    setDisplayOrder(banners.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setBadgeText(banner.badgeText || '');
    setTitle(banner.title);
    setHighlightWord(banner.highlightWord || '');
    setSubtitle(banner.subtitle || '');
    setPrimaryCtaText(banner.primaryCtaText || '');
    setPrimaryCtaLink(banner.primaryCtaLink || '/exams');
    setSecondaryCtaText(banner.secondaryCtaText || '');
    setSecondaryCtaLink(banner.secondaryCtaLink || '');
    setFeaturePillsRaw((banner.featurePills || []).join(', '));
    setImageUrl(banner.imageUrl || '/images/hero_student_illustration.png');
    setThemeGradient(banner.themeGradient || 'blue');
    setIsActive(banner.isActive);
    setDisplayOrder(banner.displayOrder);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Title is required');
      return;
    }

    const pills = featurePillsRaw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, {
          badgeText: badgeText.trim(),
          title: title.trim(),
          highlightWord: highlightWord.trim(),
          subtitle: subtitle.trim(),
          primaryCtaText: primaryCtaText.trim(),
          primaryCtaLink: primaryCtaLink.trim(),
          secondaryCtaText: secondaryCtaText.trim(),
          secondaryCtaLink: secondaryCtaLink.trim(),
          featurePills: pills,
          imageUrl: imageUrl.trim(),
          themeGradient,
          isActive,
          displayOrder: Number(displayOrder) || 1,
        });
        showToast('success', 'Banner updated successfully!');
      } else {
        await bannerService.createBanner({
          badgeText: badgeText.trim(),
          title: title.trim(),
          highlightWord: highlightWord.trim(),
          subtitle: subtitle.trim(),
          primaryCtaText: primaryCtaText.trim(),
          primaryCtaLink: primaryCtaLink.trim(),
          secondaryCtaText: secondaryCtaText.trim(),
          secondaryCtaLink: secondaryCtaLink.trim(),
          featurePills: pills,
          imageUrl: imageUrl.trim(),
          themeGradient,
          isActive,
          displayOrder: Number(displayOrder) || banners.length + 1,
        });
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
      showToast('success', `Banner ${banner.isActive ? 'deactivated' : 'activated'}!`);
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
            <span>Content Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hero Banners</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, reorder, and customize promotional banners displayed on the student home dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            title="Reset to default banners"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0158FC] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
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
            {activeCount > 1 ? `Multi-banner carousel enabled (${activeCount} slides)` : 'Single static banner mode'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inactive / Hidden</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-400 mt-2">{banners.length - activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Saved as drafts</p>
        </div>
      </div>

      {/* Live Preview Section */}
      {currentPreviewBanner && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0158FC]" />
              <h2 className="text-sm font-bold text-slate-900">Live Student View Preview</h2>
              <span className="text-[11px] text-slate-400">({currentPreviewBanner.title})</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
              Theme: {currentPreviewBanner.themeGradient || 'blue'}
            </span>
          </div>

          {/* Mini Render of Student Hero */}
          <div className="rounded-2xl bg-gradient-to-r from-[#eef6ff] via-[#e6f2fe] to-[#cee9fe] border border-blue-200/80 p-5 sm:p-7 relative overflow-hidden shadow-2xs">
            <div className="max-w-md relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 border border-blue-200 text-blue-700 text-[10px] font-black tracking-wider uppercase mb-2.5">
                <span>{currentPreviewBanner.badgeText || 'GOOD AFTERNOON, CANDIDATE 🎓'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {currentPreviewBanner.title}{' '}
                {currentPreviewBanner.highlightWord && (
                  <span className="text-[#0158FC] block">{currentPreviewBanner.highlightWord}</span>
                )}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {currentPreviewBanner.subtitle}
              </p>
              <div className="flex items-center gap-2.5 mt-4">
                <span className="px-4 py-2 rounded-xl bg-[#0158FC] text-white text-xs font-bold shadow-xs">
                  {currentPreviewBanner.primaryCtaText || 'Start Now'} →
                </span>
                {currentPreviewBanner.secondaryCtaText && (
                  <span className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-slate-700 text-xs font-bold">
                    {currentPreviewBanner.secondaryCtaText}
                  </span>
                )}
              </div>
              {currentPreviewBanner.featurePills && currentPreviewBanner.featurePills.length > 0 && (
                <div className="flex items-center gap-1.5 mt-4 overflow-x-auto">
                  {currentPreviewBanner.featurePills.map((pill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/90 border border-slate-200/80 text-[10px] font-semibold text-slate-700 shrink-0"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex absolute right-2 sm:right-4 bottom-0 w-[240px] sm:w-[280px] h-[200px] items-end justify-end pointer-events-none pr-2 overflow-hidden">
              <img
                src={currentPreviewBanner.imageUrl || '/images/hero_student_illustration.png'}
                alt="Banner illustration"
                onError={(e) => {
                  e.currentTarget.src = '/images/hero_student_illustration.png';
                }}
                className="w-full h-full object-contain object-bottom"
              />
            </div>
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
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0158FC] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Banner</span>
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
                  {/* Left: Order, Thumbnail, Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Order Controls */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
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
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                      <img
                        src={banner.imageUrl || '/images/hero_student_illustration.png'}
                        alt={banner.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {banner.badgeText && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {banner.badgeText}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          Theme: {banner.themeGradient || 'blue'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            banner.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {banner.title}{' '}
                        {banner.highlightWord && (
                          <span className="text-[#0158FC]">{banner.highlightWord}</span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{banner.subtitle}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <span>Primary: <b className="text-slate-600">{banner.primaryCtaText}</b> ({banner.primaryCtaLink})</span>
                        {banner.secondaryCtaText && (
                          <>
                            <span>•</span>
                            <span>Secondary: <b className="text-slate-600">{banner.secondaryCtaText}</b></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(banner)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                      className={`p-2 rounded-xl text-slate-600 hover:bg-slate-100 border transition-all ${
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
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
                      title="Edit banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(banner)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all"
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
                  {editingBanner ? 'Edit Hero Banner' : 'Create New Hero Banner'}
                </h3>
                <p className="text-xs text-slate-500">
                  Customize text, colors, action buttons, and graphic artwork.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Badge Text */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Top Badge Text</label>
                  <span className="text-[11px] text-slate-400">Supports {'{GREETING}'} and {'{USER}'}</span>
                </div>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. {GREETING}, {USER} 🎓 or TARGET 2026 🎯"
                  className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setBadgeText('{GREETING}, {USER} 🎓')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    Preset: Greeting
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeText('TARGET 2026 🎯')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    Preset: Exam Target
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeText('UNLIMITED ACCESS 👑')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    Preset: Pro Pass
                  </button>
                </div>
              </div>

              {/* Title & Highlight Word */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Main Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Small Steps Today,"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Highlight Text (Colored)</label>
                  <input
                    type="text"
                    value={highlightWord}
                    onChange={(e) => setHighlightWord(e.target.value)}
                    placeholder="e.g. Big Results Tomorrow."
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold text-slate-700">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Join thousands of aspirants preparing smarter with PracticeKoro."
                  className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Primary CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Primary Button Label</label>
                  <input
                    type="text"
                    value={primaryCtaText}
                    onChange={(e) => setPrimaryCtaText(e.target.value)}
                    placeholder="e.g. Start a Mock Test"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Primary Button URL</label>
                  <input
                    type="text"
                    value={primaryCtaLink}
                    onChange={(e) => setPrimaryCtaLink(e.target.value)}
                    placeholder="e.g. /exams or /mock-tests"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Secondary CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Secondary Button Label</label>
                  <input
                    type="text"
                    value={secondaryCtaText}
                    onChange={(e) => setSecondaryCtaText(e.target.value)}
                    placeholder="e.g. Explore Exams"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Secondary Button URL</label>
                  <input
                    type="text"
                    value={secondaryCtaLink}
                    onChange={(e) => setSecondaryCtaLink(e.target.value)}
                    placeholder="e.g. /exams"
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Feature Pills */}
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Feature Pills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={featurePillsRaw}
                  onChange={(e) => setFeaturePillsRaw(e.target.value)}
                  placeholder="Mock Tests, Topic Practice, PYQ, Detailed Solutions, Performance Analysis"
                  className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700">Color Gradient Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeGradient(theme.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        themeGradient === theme.id
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={theme.textClass}>{theme.label}</span>
                      {themeGradient === theme.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL / Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700">Banner Illustration Image</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        imageUrl === preset.url
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-8 h-8 object-contain rounded" />
                      <span className="text-[11px] font-semibold text-slate-800 line-clamp-2">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <span className="text-[11px] text-slate-400">Or custom image URL:</span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="mt-1 w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
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

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0158FC] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-[0.98]"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
