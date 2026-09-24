import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  BookOpen,
  Sigma,
  Brain,
  Languages,
  GraduationCap,
  Play,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  LayoutGrid,
  RefreshCw,
  X,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { BookmarkItem } from '@/types';

// Subject badge color and icon mapper matching the reference design
function getSubjectTheme(subjectName?: string) {
  const norm = (subjectName || '').toLowerCase();
  if (norm.includes('knowledge') || norm.includes('gk') || norm.includes('general')) {
    return {
      icon: BookOpen,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
  }
  if (norm.includes('math') || norm.includes('arithmetic') || norm.includes('quant')) {
    return {
      icon: Sigma,
      iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/50',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
  }
  if (norm.includes('reason') || norm.includes('mental') || norm.includes('gi')) {
    return {
      icon: Brain,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
  }
  if (norm.includes('bengali') || norm.includes('bangla')) {
    return {
      icon: Languages,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
  }
  if (norm.includes('english')) {
    return {
      icon: GraduationCap,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
  }
  return {
    icon: HelpCircle,
    iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    return `Saved on ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  } catch {
    return 'Saved recently';
  }
}

export const SavedQuestions: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'difficulty_easy' | 'difficulty_hard' | 'subject'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Popovers
  const [practiceItem, setPracticeItem] = useState<BookmarkItem | null>(null);
  const [practiceSelectedOption, setPracticeSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [practiceAnswerChecked, setPracticeAnswerChecked] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOrganizedView, setIsOrganizedView] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getBookmarks(user.id);
      setItems(data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Subject statistics
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const sub = item.subjectName || 'General';
      counts[sub] = (counts[sub] || 0) + 1;
    });
    return counts;
  }, [items]);

  const uniqueSubjects = useMemo(() => {
    return Object.keys(subjectCounts).sort();
  }, [subjectCounts]);

  // Filtered & sorted questions
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Subject Filter
    if (selectedSubject !== 'all') {
      result = result.filter(
        (item) => (item.subjectName || 'General').toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Difficulty Filter
    if (difficultyFilter !== 'all') {
      result = result.filter((item) => {
        const diff = (item.question.difficulty || 'medium').toLowerCase();
        return diff === difficultyFilter;
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const text = (item.question.questionText || '').toLowerCase();
        const bText = (item.question.questionBengaliText || '').toLowerCase();
        const optA = (item.question.optionA || '').toLowerCase();
        const optB = (item.question.optionB || '').toLowerCase();
        const optC = (item.question.optionC || '').toLowerCase();
        const optD = (item.question.optionD || '').toLowerCase();
        const sub = (item.subjectName || '').toLowerCase();
        const exam = (item.examTitle || '').toLowerCase();
        return (
          text.includes(q) ||
          bText.includes(q) ||
          optA.includes(q) ||
          optB.includes(q) ||
          optC.includes(q) ||
          optD.includes(q) ||
          sub.includes(q) ||
          exam.includes(q)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'difficulty_easy') {
        const score = { easy: 1, medium: 2, hard: 3 };
        const aScore = score[(a.question.difficulty as 'easy' | 'medium' | 'hard') || 'medium'] || 2;
        const bScore = score[(b.question.difficulty as 'easy' | 'medium' | 'hard') || 'medium'] || 2;
        return aScore - bScore;
      }
      if (sortBy === 'difficulty_hard') {
        const score = { easy: 1, medium: 2, hard: 3 };
        const aScore = score[(a.question.difficulty as 'easy' | 'medium' | 'hard') || 'medium'] || 2;
        const bScore = score[(b.question.difficulty as 'easy' | 'medium' | 'hard') || 'medium'] || 2;
        return bScore - aScore;
      }
      if (sortBy === 'subject') {
        return (a.subjectName || '').localeCompare(b.subjectName || '');
      }
      return 0;
    });

    return result;
  }, [items, selectedSubject, difficultyFilter, searchQuery, sortBy]);

  // Bulk Selection Handlers
  const allFilteredSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredItemIds = new Set(filteredItems.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredItemIds.has(id)));
    } else {
      const idsToAdd = filteredItems.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Remove single item
  const handleRemoveItem = async (item: BookmarkItem) => {
    if (!user) return;
    try {
      await api.toggleBookmark(user.id, item.questionId);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      showToast('Question removed from saved list');
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  // Bulk remove
  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    const itemsToDelete = items.filter((i) => selectedIds.includes(i.id));
    const questionIds = itemsToDelete.map((i) => i.questionId);

    try {
      await api.removeBookmarks(user.id, questionIds);
      setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      showToast(`Removed ${selectedIds.length} questions`);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to bulk delete bookmarks:', err);
    }
  };

  // Clear all
  const handleClearAll = async () => {
    if (!user) return;
    try {
      await api.clearAllBookmarks(user.id);
      setItems([]);
      setSelectedIds([]);
      setShowClearConfirm(false);
      showToast('All saved questions cleared');
    } catch (err) {
      console.error('Failed to clear bookmarks:', err);
    }
  };

  // Practice Single Item
  const handleStartPractice = (item: BookmarkItem) => {
    setPracticeItem(item);
    setPracticeSelectedOption(null);
    setPracticeAnswerChecked(false);
  };

  const handleNextPracticeQuestion = () => {
    if (!practiceItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === practiceItem.id);
    if (currentIndex >= 0 && currentIndex < filteredItems.length - 1) {
      setPracticeItem(filteredItems[currentIndex + 1]);
      setPracticeSelectedOption(null);
      setPracticeAnswerChecked(false);
    } else {
      setPracticeItem(null);
      showToast('Practice session completed!');
    }
  };

  // Copy Question Text
  const handleCopyQuestion = (item: BookmarkItem) => {
    const text = `${item.question.questionText}\n\nA. ${item.question.optionA}\nB. ${item.question.optionB}\nC. ${item.question.optionC}\nD. ${item.question.optionD}\n\nCorrect Answer: ${item.question.correctOption}\n${item.question.explanation ? `Explanation: ${item.question.explanation}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    showToast('Question copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

  // Print / Download as PDF
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 print:hidden">
          <Link to="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200">Saved Questions</span>
        </nav>

        {/* 1. Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-[#d6e5f8] dark:border-slate-800 bg-gradient-to-r from-[#f4f9fd] via-[#eef6fe] to-[#e4f0ff] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/90 p-6 sm:p-8 shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl z-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a8a] dark:text-blue-300 tracking-tight">
                Saved Questions
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Your bookmarked questions for focused revision. Revisit important questions anytime and practice smarter.
              </p>
            </div>

            {/* Banner Illustration */}
            <div className="relative shrink-0 flex items-center justify-end">
              <img
                src="/images/saved_questions_hero_art.png"
                alt="Revise Reinforce Remember Succeed"
                className="h-28 sm:h-36 w-auto object-contain drop-shadow-sm select-none pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Questions & Actions (col-span-8 or 9) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">
            {/* Subject Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar print:hidden">
              <button
                type="button"
                onClick={() => setSelectedSubject('all')}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-sm ${
                  selectedSubject === 'all'
                    ? 'bg-[#0158fc] text-white shadow-blue-500/25 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                }`}
              >
                All ({items.length})
              </button>

              {uniqueSubjects.map((sub) => {
                const count = subjectCounts[sub] || 0;
                const isActive = selectedSubject.toLowerCase() === sub.toLowerCase();
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      isActive
                        ? 'bg-[#0158fc] text-white font-bold shadow-blue-500/25 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sub} ({count})
                  </button>
                );
              })}
            </div>

            {/* Action Bar / Toolbar */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
              {/* Left: Bulk Selection */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    disabled={filteredItems.length === 0}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {selectedIds.length} selected
                  </span>
                </label>

                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const firstSelected = items.find((i) => selectedIds.includes(i.id));
                        if (firstSelected) handleStartPractice(firstSelected);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                    >
                      <Play className="h-3 w-3 fill-current" /> Practice Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-3 py-1.5 text-xs font-bold hover:bg-rose-600 hover:text-white transition"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Search, Filter, Sort */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved questions..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 pl-8 pr-7 py-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Popover Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                      difficultyFilter !== 'all'
                        ? 'border-blue-300 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                    {difficultyFilter !== 'all' && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </button>

                  {/* Difficulty Filter Dropdown Menu */}
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Difficulty
                      </p>
                      {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setDifficultyFilter(level);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                            difficultyFilter === level
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{level === 'all' ? 'All Difficulties' : level}</span>
                          {difficultyFilter === level && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort saved questions"
                    className="appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer shadow-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="difficulty_easy">Easy to Hard</option>
                    <option value="difficulty_hard">Hard to Easy</option>
                    <option value="subject">Subject (A-Z)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* 3. Questions List */}
            {loading ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center py-20 text-sm font-semibold text-slate-500">
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mb-3" />
                <span>Loading saved questions...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                  <Bookmark className="h-8 w-8 stroke-[2]" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  No saved questions found
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery || difficultyFilter !== 'all' || selectedSubject !== 'all'
                    ? 'No questions matched your current filter criteria. Try clearing filters.'
                    : 'Bookmark important questions while taking tests or practicing to review them here anytime.'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {(searchQuery || difficultyFilter !== 'all' || selectedSubject !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setDifficultyFilter('all');
                        setSelectedSubject('all');
                      }}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                  <Link
                    to="/test-series"
                    className="rounded-xl bg-[#0158fc] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
                  >
                    Explore Test Series
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {isOrganizedView && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Organized by Subject view active
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOrganizedView(false)}
                      className="text-purple-600 hover:text-purple-800 font-bold underline"
                    >
                      Reset to Default View
                    </button>
                  </div>
                )}
                {filteredItems.map((item) => {
                  const theme = getSubjectTheme(item.subjectName);
                  const SubjectIcon = theme.icon;
                  const isSelected = selectedIds.includes(item.id);
                  const difficulty = (item.question.difficulty || 'medium').toLowerCase();

                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl border transition-all duration-150 p-5 bg-white dark:bg-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/10 dark:border-blue-500'
                          : 'border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-2 shrink-0 print:hidden">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                          />
                        </div>

                        {/* Subject Icon Box */}
                        <div
                          className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${theme.iconBg}`}
                        >
                          <SubjectIcon className="h-5 w-5" />
                        </div>

                        {/* Middle: Badges, Question Text, Options Preview, Date */}
                        <div className="min-w-0 flex-1">
                          {/* Badges line */}
                          <div className="flex flex-wrap items-center gap-2">
                            {item.subjectName && (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${theme.badgeBg}`}
                              >
                                {item.subjectName}
                              </span>
                            )}
                            {item.examTitle && (
                              <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                {item.examTitle}
                              </span>
                            )}
                          </div>

                          {/* Question Text */}
                          <h3 className="mt-2 text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {item.question.questionText}
                          </h3>

                          {/* Options Preview */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <span>
                              <strong className="text-slate-900 dark:text-slate-200 mr-1">A.</strong>
                              {item.question.optionA}
                            </span>
                            <span>
                              <strong className="text-slate-900 dark:text-slate-200 mr-1">B.</strong>
                              {item.question.optionB}
                            </span>
                            <span>
                              <strong className="text-slate-900 dark:text-slate-200 mr-1">C.</strong>
                              {item.question.optionC}
                            </span>
                            <span>
                              <strong className="text-slate-900 dark:text-slate-200 mr-1">D.</strong>
                              {item.question.optionD}
                            </span>
                          </div>

                          {/* Footer Meta */}
                          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Bookmark, Difficulty, More Menu, Practice Button */}
                        <div className="flex flex-col items-end justify-between shrink-0 gap-3 self-stretch print:hidden">
                          {/* Top Row: Bookmark Icon, Difficulty Badge, 3-dots */}
                          <div className="flex items-center gap-2">
                            {/* Bookmark Ribbon Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              title="Remove from saved"
                              className="p-1 rounded-lg text-[#0158fc] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                            >
                              <Bookmark className="h-4 w-4 fill-current stroke-current" />
                            </button>

                            {/* Difficulty Pill */}
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize border ${
                                difficulty === 'easy'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                  : difficulty === 'hard'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              }`}
                            >
                              {difficulty}
                            </span>

                            {/* 3-dots Options Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId((prev) => (prev === item.id ? null : item.id))
                                }
                                aria-label="More question options"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {activeMenuId === item.id && (
                                <div className="absolute right-0 mt-1 w-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-20 space-y-1 animate-in fade-in duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleStartPractice(item);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                  >
                                    <Play className="h-3.5 w-3.5 text-blue-600" /> Practice Now
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyQuestion(item)}
                                    className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                                    )}
                                    Copy Question
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRemoveItem(item);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: Practice Now Button */}
                          <button
                            type="button"
                            onClick={() => handleStartPractice(item)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/40 px-3.5 py-1.5 text-xs font-bold text-[#0158fc] dark:text-blue-400 hover:bg-[#0158fc] hover:text-white dark:hover:bg-[#0158fc] dark:hover:text-white transition shadow-sm"
                          >
                            <Play className="h-3 w-3 fill-current" /> Practice Now
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Statistics, Subject-wise, Quick Actions, Quote (col-span-4 or 3) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 print:hidden">
            {/* Card 1: Your Saved Questions Total */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your Saved Questions</h4>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#0158fc] dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Bookmark className="h-7 w-7 fill-blue-500/20 stroke-[#0158fc]" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    {items.length}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Questions Saved
                  </div>
                </div>
              </div>
              <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                Great! Keep saving important questions.
              </p>
            </div>

            {/* Card 2: Subject-wise Breakdown */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Subject-wise</h4>
                <button
                  type="button"
                  onClick={() => setSelectedSubject('all')}
                  className="text-xs font-bold text-[#0158fc] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1">
                {uniqueSubjects.map((sub) => {
                  const theme = getSubjectTheme(sub);
                  const Icon = theme.icon;
                  const count = subjectCounts[sub] || 0;
                  const isCurrent = selectedSubject.toLowerCase() === sub.toLowerCase();

                  return (
                    <div
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/50 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {sub}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Quick Actions */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {/* 1. Practice Saved Questions */}
                <button
                  type="button"
                  onClick={() => {
                    if (items.length > 0) handleStartPractice(items[0]);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left group"
                >
                  <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0158fc] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Practice Saved Questions
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Start a test with your saved questions
                    </div>
                  </div>
                </button>

                {/* 2. Organize by Subject */}
                <button
                  type="button"
                  onClick={() => setIsOrganizedView((prev) => !prev)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left group"
                >
                  <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Organize by Subject
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      View subject-wise saved questions
                    </div>
                  </div>
                </button>

                {/* 3. Download as PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left group"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Download as PDF
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Export your saved questions
                    </div>
                  </div>
                </button>

                {/* 4. Clear All */}
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={items.length === 0}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition text-left group disabled:opacity-40"
                >
                  <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Clear All
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Remove all saved questions
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Card 4: Motivational Quote Card */}
            <div className="rounded-2xl border border-[#d2e4f7] dark:border-slate-800 bg-gradient-to-br from-[#ebf4fd] via-[#f0f7fe] to-[#e4f0fc] dark:from-slate-900 dark:to-slate-850 p-5 relative overflow-hidden shadow-sm">
              <div className="text-4xl sm:text-5xl font-serif text-blue-400/50 dark:text-blue-400/30 leading-none select-none">
                “
              </div>
              <p className="text-xs sm:text-sm font-semibold italic text-[#063585] dark:text-blue-200 mt-1 leading-relaxed">
                "The questions you save today, build your success tomorrow."
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  — PracticeKoro
                </span>
                <img
                  src="/images/saved_questions_target.png"
                  alt="Target"
                  className="h-10 w-10 object-contain drop-shadow-sm select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Practice Modal ("Practice Now") */}
      {practiceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold text-[#0158fc]">
                  {practiceItem.subjectName || 'Practice'}
                </span>
                {practiceItem.examTitle && (
                  <span className="rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs font-semibold text-slate-500">
                    {practiceItem.examTitle}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPracticeItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Question Text */}
            <div>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {practiceItem.question.questionText}
              </p>
              {practiceItem.question.questionBengaliText && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {practiceItem.question.questionBengaliText}
                </p>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {[
                { letter: 'A' as const, text: practiceItem.question.optionA },
                { letter: 'B' as const, text: practiceItem.question.optionB },
                { letter: 'C' as const, text: practiceItem.question.optionC },
                { letter: 'D' as const, text: practiceItem.question.optionD },
              ].map(({ letter, text }) => {
                const isSelected = practiceSelectedOption === letter;
                const isCorrect = practiceItem.question.correctOption === letter;

                let optClass =
                  'border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-slate-800';

                if (practiceAnswerChecked) {
                  if (isCorrect) {
                    optClass =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optClass =
                      'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold';
                  } else {
                    optClass = 'border-slate-200 dark:border-slate-800 opacity-60';
                  }
                } else if (isSelected) {
                  optClass =
                    'border-[#0158fc] bg-blue-50/60 dark:bg-blue-950/50 text-[#0158fc] dark:text-blue-300 font-bold shadow-sm';
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={practiceAnswerChecked}
                    onClick={() => setPracticeSelectedOption(letter)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${optClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          practiceAnswerChecked && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : practiceAnswerChecked && isSelected && !isCorrect
                              ? 'bg-rose-500 text-white'
                              : isSelected
                                ? 'bg-[#0158fc] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {letter}
                      </span>
                      <span>{text}</span>
                    </div>

                    {practiceAnswerChecked && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                    {practiceAnswerChecked && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box (Visible once checked) */}
            {practiceAnswerChecked && (
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0158fc] dark:text-blue-300">
                  <Sparkles className="h-4 w-4" /> Explanation & Insight
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {practiceItem.question.explanation ||
                    `The correct answer is Option ${practiceItem.question.correctOption}.`}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Difficulty:{' '}
                <strong className="capitalize text-slate-700 dark:text-slate-300">
                  {practiceItem.question.difficulty || 'medium'}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                {!practiceAnswerChecked ? (
                  <button
                    type="button"
                    disabled={!practiceSelectedOption}
                    onClick={() => setPracticeAnswerChecked(true)}
                    className="rounded-xl bg-[#0158fc] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-40 shadow-sm"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextPracticeQuestion}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0158fc] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clear All Saved Questions?</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove all {items.length} bookmarked questions? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete {selectedIds.length} Selected Questions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Remove the selected questions from your saved revision list.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
