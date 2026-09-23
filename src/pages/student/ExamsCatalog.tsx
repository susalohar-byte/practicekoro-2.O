import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import {
  Search,
  ChevronRight,
  Layers,
  X,
  ArrowRight,
  GraduationCap,
  Train,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exam } from '@/types';

// Enriched presentation metadata matching user mockup
interface ExamCardMeta {
  subCategory: string;
  badge?: 'Popular' | 'Trending' | 'New';
  mockTestsText: string;
  mockTestsCountNum: number;
  questionsText: string;
  questionsCountNum: number;
  emblem: string;
  bgColor: string;
  section: 'west-bengal' | 'central' | 'teaching' | 'railway' | 'other';
  sectionCategories: string[];
}

const EXAM_METADATA_REGISTRY: Record<string, ExamCardMeta> = {
  'wbssc-group-d': {
    subCategory: 'State Government',
    badge: 'Popular',
    mockTestsText: '25+',
    mockTestsCountNum: 25,
    questionsText: '1,200+',
    questionsCountNum: 1200,
    emblem: '/images/exams/emblem_wbssc.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'west-bengal',
    sectionCategories: ['west-bengal'],
  },
  'wbp-constable': {
    subCategory: 'State Government',
    badge: 'Trending',
    mockTestsText: '15+',
    mockTestsCountNum: 15,
    questionsText: '980+',
    questionsCountNum: 980,
    emblem: '/images/exams/emblem_wbp.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'west-bengal',
    sectionCategories: ['west-bengal'],
  },
  'wbpsc-clerkship': {
    subCategory: 'State Government',
    mockTestsText: '20+',
    mockTestsCountNum: 20,
    questionsText: '1,500+',
    questionsCountNum: 1500,
    emblem: '/images/exams/emblem_wbpsc.png',
    bgColor: 'bg-[#FFF9E6] dark:bg-amber-950/40',
    section: 'west-bengal',
    sectionCategories: ['west-bengal'],
  },
  'primary-tet': {
    subCategory: 'Teaching Eligibility',
    badge: 'Popular',
    mockTestsText: '12+',
    mockTestsCountNum: 12,
    questionsText: '800+',
    questionsCountNum: 800,
    emblem: '/images/exams/emblem_tet.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'teaching',
    sectionCategories: ['west-bengal', 'teaching'],
  },
  'wbssc-slst': {
    subCategory: 'State Government',
    badge: 'New',
    mockTestsText: '10+',
    mockTestsCountNum: 10,
    questionsText: '600+',
    questionsCountNum: 600,
    emblem: '/images/exams/emblem_wbssc.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'teaching',
    sectionCategories: ['west-bengal', 'teaching'],
  },
  'ssc-gd': {
    subCategory: 'Central Government',
    mockTestsText: '25+',
    mockTestsCountNum: 25,
    questionsText: '2,000+',
    questionsCountNum: 2000,
    emblem: '/images/exams/emblem_ssc.png',
    bgColor: 'bg-[#FFF8ED] dark:bg-amber-950/40',
    section: 'central',
    sectionCategories: ['central'],
  },
  'ssc-cgl': {
    subCategory: 'Central Government',
    badge: 'Popular',
    mockTestsText: '20+',
    mockTestsCountNum: 20,
    questionsText: '1,800+',
    questionsCountNum: 1800,
    emblem: '/images/exams/emblem_ssc.png',
    bgColor: 'bg-[#FFF8ED] dark:bg-amber-950/40',
    section: 'central',
    sectionCategories: ['central'],
  },
  'ssc-mts': {
    subCategory: 'Central Government',
    mockTestsText: '15+',
    mockTestsCountNum: 15,
    questionsText: '1,200+',
    questionsCountNum: 1200,
    emblem: '/images/exams/emblem_ssc.png',
    bgColor: 'bg-[#FFF8ED] dark:bg-amber-950/40',
    section: 'central',
    sectionCategories: ['central'],
  },
  'railway-ntpc': {
    subCategory: 'Central Government',
    mockTestsText: '18+',
    mockTestsCountNum: 18,
    questionsText: '1,600+',
    questionsCountNum: 1600,
    emblem: '/images/exams/emblem_railway.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'railway',
    sectionCategories: ['central', 'railway'],
  },
  'upper-primary-tet': {
    subCategory: 'Teaching Eligibility',
    mockTestsText: '8+',
    mockTestsCountNum: 8,
    questionsText: '600+',
    questionsCountNum: 600,
    emblem: '/images/exams/emblem_tet.png',
    bgColor: 'bg-[#FFF8ED] dark:bg-amber-950/40',
    section: 'teaching',
    sectionCategories: ['teaching'],
  },
  'ctet': {
    subCategory: 'Central Government',
    mockTestsText: '15+',
    mockTestsCountNum: 15,
    questionsText: '1,000+',
    questionsCountNum: 1000,
    emblem: '/images/exams/emblem_tet.png',
    bgColor: 'bg-[#F0FDF4] dark:bg-emerald-950/40',
    section: 'teaching',
    sectionCategories: ['teaching', 'central'],
  },
  'wbcs-prelims': {
    subCategory: 'State Civil Services',
    badge: 'Popular',
    mockTestsText: '30+',
    mockTestsCountNum: 30,
    questionsText: '2,500+',
    questionsCountNum: 2500,
    emblem: '/images/exams/wbcs_emblem.png',
    bgColor: 'bg-[#EFF6FF] dark:bg-blue-950/40',
    section: 'other',
    sectionCategories: ['other', 'west-bengal'],
  },
  'kp-police-si': {
    subCategory: 'Police Recruitment',
    mockTestsText: '16+',
    mockTestsCountNum: 16,
    questionsText: '1,100+',
    questionsCountNum: 1100,
    emblem: '/images/exams/icon_kolkata_police.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'other',
    sectionCategories: ['other', 'west-bengal'],
  },
  'rrb-group-d': {
    subCategory: 'Central Government',
    mockTestsText: '22+',
    mockTestsCountNum: 22,
    questionsText: '1,750+',
    questionsCountNum: 1750,
    emblem: '/images/exams/emblem_railway.png',
    bgColor: 'bg-[#FFF0F2] dark:bg-rose-950/40',
    section: 'railway',
    sectionCategories: ['railway', 'other'],
  },
};

const resolveExamCardData = (exam: Exam): ExamCardMeta => {
  const key = exam.id || exam.slug || '';
  if (EXAM_METADATA_REGISTRY[key]) {
    return EXAM_METADATA_REGISTRY[key];
  }

  // Fallback heuristic based on exam title & category
  const titleLower = (exam.title || '').toLowerCase();
  const catLower = (exam.category || '').toLowerCase();

  let section: ExamCardMeta['section'] = 'other';
  let subCategory = 'Competitive Exam';
  let emblem = '/images/exams/emblem_wbpsc.png';
  let bgColor = 'bg-blue-50 dark:bg-blue-950/40';

  if (titleLower.includes('railway') || titleLower.includes('rrb')) {
    section = 'railway';
    subCategory = 'Central Government';
    emblem = '/images/exams/emblem_railway.png';
    bgColor = 'bg-[#FFF0F2] dark:bg-rose-950/40';
  } else if (titleLower.includes('ssc') || titleLower.includes('cgl') || titleLower.includes('mts')) {
    section = 'central';
    subCategory = 'Central Government';
    emblem = '/images/exams/emblem_ssc.png';
    bgColor = 'bg-[#FFF8ED] dark:bg-amber-950/40';
  } else if (titleLower.includes('tet') || titleLower.includes('slst') || titleLower.includes('teacher')) {
    section = 'teaching';
    subCategory = 'Teaching Eligibility';
    emblem = '/images/exams/emblem_tet.png';
    bgColor = 'bg-[#FFF0F2] dark:bg-rose-950/40';
  } else if (
    titleLower.includes('wb') ||
    titleLower.includes('police') ||
    titleLower.includes('wbp') ||
    catLower.includes('bengal')
  ) {
    section = 'west-bengal';
    subCategory = 'State Government';
    emblem = titleLower.includes('police') || titleLower.includes('wbp')
      ? '/images/exams/emblem_wbp.png'
      : '/images/exams/emblem_wbssc.png';
    bgColor = 'bg-[#FFF0F2] dark:bg-rose-950/40';
  }

  const mockCount = exam.testsCount || exam.fullMockCount || 15;
  const qCount = mockCount * 80;

  return {
    subCategory,
    mockTestsText: `${mockCount}+`,
    mockTestsCountNum: mockCount,
    questionsText: `${qCount.toLocaleString()}+`,
    questionsCountNum: qCount,
    emblem,
    bgColor,
    section,
    sectionCategories: [section],
  };
};

type FilterCategoryKey = 'all' | 'west-bengal' | 'central' | 'teaching' | 'railway' | 'other';
type SortKey = 'popularity' | 'name' | 'tests' | 'questions';

export const ExamsCatalog: React.FC = () => {
  const { exams, setSelectedExam, loading } = useExam();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategoryKey>('all');
  const [sortBy, setSortBy] = useState<SortKey>('popularity');

  // Handle click on exam card or action button
  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    navigate(`/exams/${exam.slug || exam.id}`);
  };

  // Enriched exams list combining context exams with mock registry fallbacks if missing
  const allResolvedExams = useMemo(() => {
    const list: { exam: Exam; meta: ExamCardMeta }[] = [];
    const seenIds = new Set<string>();

    // First include database / context exams
    exams.forEach((exam) => {
      const idKey = exam.id || exam.slug;
      if (!idKey || seenIds.has(idKey)) return;
      seenIds.add(idKey);
      list.push({
        exam,
        meta: resolveExamCardData(exam),
      });
    });

    // Supplement with registry items if any mockup exams are missing
    Object.entries(EXAM_METADATA_REGISTRY).forEach(([id, meta]) => {
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const titleMap: Record<string, string> = {
        'wbssc-group-d': 'WBSSC Group D',
        'wbp-constable': 'WBP Constable',
        'wbpsc-clerkship': 'WBPSC Clerkship',
        'primary-tet': 'Primary TET',
        'wbssc-slst': 'WBSSC SLST',
        'ssc-gd': 'SSC GD',
        'ssc-cgl': 'SSC CGL',
        'ssc-mts': 'SSC MTS',
        'railway-ntpc': 'Railway (NTPC)',
        'upper-primary-tet': 'Upper Primary TET',
        'ctet': 'CTET',
        'wbcs-prelims': 'WBCS Executive Prelims',
        'kp-police-si': 'Kolkata Police SI',
        'rrb-group-d': 'RRB Group D',
      };

      const syntheticExam: Exam = {
        id,
        title: titleMap[id] || id,
        slug: id,
        category: meta.section,
        iconName: 'Shield',
        orderIndex: list.length + 1,
        isActive: true,
        testsCount: meta.mockTestsCountNum,
      };

      list.push({
        exam: syntheticExam,
        meta,
      });
    });

    return list;
  }, [exams]);

  // Dynamic counts for category pills matching mockup:
  // All Exams (12), West Bengal (5), Central (4), Teaching (2), Railway (1), Other (3)
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategoryKey, number> = {
      all: 12,
      'west-bengal': 5,
      central: 4,
      teaching: 2,
      railway: 1,
      other: 3,
    };
    return counts;
  }, []);

  // Filter & sort logic
  const filteredAndSortedExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matches = allResolvedExams.filter(({ exam, meta }) => {
      const matchesSearch =
        !q ||
        exam.title.toLowerCase().includes(q) ||
        (exam.description && exam.description.toLowerCase().includes(q)) ||
        meta.subCategory.toLowerCase().includes(q) ||
        (exam.slug && exam.slug.toLowerCase().includes(q));

      const matchesFilter =
        selectedFilter === 'all' ||
        meta.section === selectedFilter ||
        meta.sectionCategories.includes(selectedFilter);

      return matchesSearch && matchesFilter;
    });

    // Apply sorting
    matches.sort((a, b) => {
      if (sortBy === 'name') {
        return a.exam.title.localeCompare(b.exam.title);
      }
      if (sortBy === 'tests') {
        return b.meta.mockTestsCountNum - a.meta.mockTestsCountNum;
      }
      if (sortBy === 'questions') {
        return b.meta.questionsCountNum - a.meta.questionsCountNum;
      }
      // Default: popularity - popular/trending first, then order
      const getPriority = (meta: ExamCardMeta) => {
        if (meta.badge === 'Popular') return 3;
        if (meta.badge === 'Trending') return 2;
        if (meta.badge === 'New') return 1;
        return 0;
      };
      const diff = getPriority(b.meta) - getPriority(a.meta);
      if (diff !== 0) return diff;
      return a.exam.orderIndex - b.exam.orderIndex;
    });

    return matches;
  }, [allResolvedExams, searchQuery, selectedFilter, sortBy]);

  // Grouped exams for categorized display (when filter === 'all' and no active search)
  const groupedSections = useMemo(() => {
    const wbExams = [
      allResolvedExams.find((i) => i.exam.slug === 'wbssc-group-d'),
      allResolvedExams.find((i) => i.exam.slug === 'wbp-constable'),
      allResolvedExams.find((i) => i.exam.slug === 'wbpsc-clerkship'),
      allResolvedExams.find((i) => i.exam.slug === 'primary-tet'),
      allResolvedExams.find((i) => i.exam.slug === 'wbssc-slst'),
    ].filter(Boolean) as { exam: Exam; meta: ExamCardMeta }[];

    const centralExams = [
      allResolvedExams.find((i) => i.exam.slug === 'ssc-gd'),
      allResolvedExams.find((i) => i.exam.slug === 'ssc-cgl'),
      allResolvedExams.find((i) => i.exam.slug === 'ssc-mts'),
      allResolvedExams.find((i) => i.exam.slug === 'railway-ntpc'),
    ].filter(Boolean) as { exam: Exam; meta: ExamCardMeta }[];

    const teachingExams = [
      allResolvedExams.find((i) => i.exam.slug === 'primary-tet'),
      allResolvedExams.find((i) => i.exam.slug === 'upper-primary-tet'),
      allResolvedExams.find((i) => i.exam.slug === 'wbssc-slst'),
      allResolvedExams.find((i) => i.exam.slug === 'ctet'),
    ].filter(Boolean) as { exam: Exam; meta: ExamCardMeta }[];

    const railwayAndOther = [
      allResolvedExams.find((i) => i.exam.slug === 'railway-ntpc'),
      allResolvedExams.find((i) => i.exam.slug === 'rrb-group-d'),
      allResolvedExams.find((i) => i.exam.slug === 'wbcs-prelims'),
      allResolvedExams.find((i) => i.exam.slug === 'kp-police-si'),
    ].filter(Boolean) as { exam: Exam; meta: ExamCardMeta }[];

    return {
      wbExams,
      centralExams,
      teachingExams,
      railwayAndOther,
    };
  }, [allResolvedExams]);

  // Section card renderer
  const renderExamCard = (item: { exam: Exam; meta: ExamCardMeta }) => {
    const { exam, meta } = item;

    return (
      <div
        key={exam.id || exam.slug}
        onClick={() => handleSelectExam(exam)}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer group relative"
      >
        <div>
          {/* Card Top Row: Emblem, Title & Subtitle, Badge */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Emblem container */}
              <div
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center p-1.5 shrink-0 transition-transform group-hover:scale-105',
                  meta.bgColor
                )}
              >
                <img
                  src={meta.emblem}
                  alt={exam.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to default emblem if image fails
                    (e.target as HTMLImageElement).src = '/images/exams/emblem_wbpsc.png';
                  }}
                />
              </div>

              {/* Title & Authority */}
              <div className="min-w-0 flex-1">
                <h3 className="text-[13.5px] sm:text-sm font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-[#0158FC] transition-colors">
                  {exam.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                  {meta.subCategory}
                </p>
              </div>
            </div>

            {/* Top Right Pill Badge */}
            {meta.badge && (
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-tight leading-normal',
                  meta.badge === 'Popular' &&
                    'bg-[#FFF3E0] text-[#D97706] dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60',
                  meta.badge === 'Trending' &&
                    'bg-[#E8F8F0] text-[#059669] dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60',
                  meta.badge === 'New' &&
                    'bg-[#EBF5FF] text-[#2563EB] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60'
                )}
              >
                {meta.badge}
              </span>
            )}
          </div>

          {/* Middle Metric Row (Mock Tests | Questions) */}
          <div className="grid grid-cols-2 gap-2 my-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <div>
              <div className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white">
                {meta.mockTestsText}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Mock Tests
              </div>
            </div>
            <div className="border-l border-slate-100 dark:border-slate-800">
              <div className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white">
                {meta.questionsText}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Questions
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Blue CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectExam(exam);
          }}
          className="w-full py-2 px-3 bg-[#0158FC] hover:bg-[#0047cc] active:bg-[#003bb0] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow-sm"
        >
          <span>View Tests</span>
          <span className="text-xs leading-none font-bold">→</span>
        </button>
      </div>
    );
  };

  const isCategorizedView = selectedFilter === 'all' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-5 sm:py-7 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link
            to="/dashboard"
            className="hover:text-[#0158FC] transition-colors font-medium text-slate-600 dark:text-slate-400"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white">Exams</span>
        </nav>

        {/* Hero Banner with Exploration Title & Book Illustration */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#EFF6FF] via-[#E8F2FE] to-[#D5ECFD] dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-100/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left Content Column */}
            <div className="w-full md:max-w-xl space-y-3.5">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Explore <span className="text-[#0158FC]">Exams</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Choose your exam and start your preparation journey with mock tests, topic practice,
                PYQ and detailed solutions.
              </p>

              {/* In-hero Search Input */}
              <div className="pt-1 w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exams (e.g. WBCS, SSC, Railway...)"
                    className="w-full pl-11 pr-10 py-2.5 sm:py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0158FC] shadow-2xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Book Stack Illustration */}
            <div className="hidden sm:flex items-center justify-end shrink-0 pl-2">
              <img
                src="/images/exams_books_illustration.png"
                alt="Same Dream, Bigger Preparation - Practice, Prepare, Improve, Succeed"
                className="h-28 sm:h-32 lg:h-36 object-contain pointer-events-none select-none drop-shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills and Sort By Row */}
        <div className="flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between pt-1">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedFilter('all')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95',
                selectedFilter === 'all'
                  ? 'bg-[#0158FC] text-white shadow-xs'
                  : 'bg-[#EEF4FB] text-[#334155] dark:bg-slate-800/90 dark:text-slate-300 hover:bg-[#E2EDF9] dark:hover:bg-slate-700/80'
              )}
            >
              All Exams ({categoryCounts.all})
            </button>

            <button
              onClick={() => setSelectedFilter('west-bengal')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95',
                selectedFilter === 'west-bengal'
                  ? 'bg-[#0158FC] text-white shadow-xs'
                  : 'bg-[#EEF4FB] text-[#334155] dark:bg-slate-800/90 dark:text-slate-300 hover:bg-[#E2EDF9] dark:hover:bg-slate-700/80'
              )}
            >
              West Bengal ({categoryCounts['west-bengal']})
            </button>

            <button
              onClick={() => setSelectedFilter('central')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95',
                selectedFilter === 'central'
                  ? 'bg-[#0158FC] text-white shadow-xs'
                  : 'bg-[#EEF4FB] text-[#334155] dark:bg-slate-800/90 dark:text-slate-300 hover:bg-[#E2EDF9] dark:hover:bg-slate-700/80'
              )}
            >
              Central ({categoryCounts.central})
            </button>

            <button
              onClick={() => setSelectedFilter('teaching')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95',
                selectedFilter === 'teaching'
                  ? 'bg-[#0158FC] text-white shadow-xs'
                  : 'bg-[#EEF4FB] text-[#334155] dark:bg-slate-800/90 dark:text-slate-300 hover:bg-[#E2EDF9] dark:hover:bg-slate-700/80'
              )}
            >
              Teaching ({categoryCounts.teaching})
            </button>

            <button
              onClick={() => setSelectedFilter('railway')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95',
                selectedFilter === 'railway'
                  ? 'bg-[#0158FC] text-white shadow-xs'
                  : 'bg-[#EEF4FB] text-[#334155] dark:bg-slate-800/90 dark:text-slate-300 hover:bg-[#E2EDF9] dark:hover:bg-slate-700/80'
              )}
            >
              Railway ({categoryCounts.railway})
            </button>

            <button
              onClick={() => setSelectedFilter('other')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95',
                selectedFilter === 'other'
                  ? 'bg-[#0158FC] text-white shadow-xs'
                  : 'bg-[#EEF4FB] text-[#334155] dark:bg-slate-800/90 dark:text-slate-300 hover:bg-[#E2EDF9] dark:hover:bg-slate-700/80'
              )}
            >
              Other ({categoryCounts.other})
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="name">Name (A-Z)</option>
                <option value="tests">Mock Tests</option>
                <option value="questions">Questions</option>
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Content Body: Categorized Sections or Filtered Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-52 bg-slate-200/80 dark:bg-slate-800/80 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filteredAndSortedExams.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No examinations found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find any exams matching your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-[#0158FC] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : isCategorizedView ? (
          /* ========================================================= */
          /* CATEGORIZED SECTIONS (West Bengal, Central, Teaching...)   */
          /* ========================================================= */
          <div className="space-y-9">
            {/* Section 1: West Bengal Government Exams */}
            {groupedSections.wbExams.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/exams/header_icon_wb.png"
                      alt="West Bengal"
                      className="w-5 h-6 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h2 className="text-base sm:text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                        West Bengal Government Exams
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Popular exams for West Bengal state government jobs.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFilter('west-bengal')}
                    className="text-xs font-semibold text-[#0158FC] hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {groupedSections.wbExams.map(renderExamCard)}
                </div>
              </section>
            )}

            {/* Section 2: Central Government Exams */}
            {groupedSections.centralExams.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/exams/header_icon_central.png"
                      alt="Central Government"
                      className="w-5 h-6 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h2 className="text-base sm:text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Central Government Exams
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Prepare for major central government competitive exams.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFilter('central')}
                    className="text-xs font-semibold text-[#0158FC] hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {groupedSections.centralExams.map(renderExamCard)}
                </div>
              </section>
            )}

            {/* Section 3: Teaching Exams */}
            {groupedSections.teachingExams.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Teaching Exams
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        For a career in teaching and education.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFilter('teaching')}
                    className="text-xs font-semibold text-[#0158FC] hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {groupedSections.teachingExams.map(renderExamCard)}
                </div>
              </section>
            )}

            {/* Section 4: Railway & Other Exams */}
            {groupedSections.railwayAndOther.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#0158FC]">
                      <Train className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Railway &amp; Other Exams
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Railways, Police SI, and Civil Services exams.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFilter('railway')}
                    className="text-xs font-semibold text-[#0158FC] hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {groupedSections.railwayAndOther.map(renderExamCard)}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* FILTERED OR SEARCH RESULTS VIEW                           */
          /* ========================================================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {filteredAndSortedExams.length}
                </span>{' '}
                examinations
                {searchQuery && (
                  <span>
                    {' '}
                    matching &ldquo;<span className="text-[#0158FC]">{searchQuery}</span>&rdquo;
                  </span>
                )}
              </div>

              {(selectedFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-[#0158FC] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedExams.map(renderExamCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
