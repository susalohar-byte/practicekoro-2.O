import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Layers,
  Search,
  Star,
  Target,
} from 'lucide-react';
import './landing.css';

// West Bengal & Central Competitive Exams Coverage
export const SUPPORTED_EXAM_CATEGORIES = [
  'WBP Constable',
  'Kolkata Police',
  'WBCS Prelims',
  'WBPSC Clerkship',
  'Railway Group D',
  'Primary & Upper Primary TET',
];

const EXAMS = [
  {
    title: 'WBP Constable',
    subtitle: 'West Bengal Police',
    icon: '/images/exams/wbp_police.png',
    route: '/exams/wbp-constable',
    categories: ['all', 'west-bengal', 'state'],
  },
  {
    title: 'Kolkata Police',
    subtitle: 'Kolkata Police',
    icon: '/images/exams/icon_kolkata_police.png',
    route: '/exams/kp-police-si',
    categories: ['all', 'west-bengal', 'state'],
  },
  {
    title: 'Railway (RRB)',
    subtitle: 'Indian Railways',
    icon: '/images/exams/icon_railway_exact.png',
    route: '/exams/railway-group-d',
    categories: ['all', 'central'],
  },
  {
    title: 'SSC GD',
    subtitle: 'Staff Selection Commission',
    icon: '/images/exams/icon_ssc_clean.png',
    route: '/exams',
    categories: ['all', 'central'],
  },
  {
    title: 'SSC MTS',
    subtitle: 'Staff Selection Commission',
    icon: '/images/exams/icon_ssc_clean.png',
    route: '/exams',
    categories: ['all', 'central'],
  },
  {
    title: 'WBSSC',
    subtitle: 'School Service Commission',
    icon: '/images/exams/wbssc_emblem.png',
    route: '/exams',
    categories: ['all', 'west-bengal', 'teaching', 'state'],
  },
  {
    title: 'Group C & D',
    subtitle: 'West Bengal',
    icon: '/images/exams/icon_primary_tet.png',
    route: '/exams',
    categories: ['all', 'west-bengal', 'state'],
  },
  {
    title: 'More Exams',
    subtitle: 'Explore other exams',
    icon: '',
    isCustomIcon: true,
    route: '/exams',
    categories: ['all', 'west-bengal', 'central', 'state', 'teaching'],
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Exams' },
  { id: 'west-bengal', label: 'West Bengal' },
  { id: 'central', label: 'Central' },
  { id: 'state', label: 'State' },
  { id: 'teaching', label: 'Teaching' },
];

const TOOLS = [
  {
    icon: FileText,
    code: '01',
    title: 'Mock Tests',
    bengaliTag: 'রিয়েল পরীক্ষার সিমুলেটর',
    description: 'Real exam pattern, real exam pressure. Timed full-length simulations.',
  },
  {
    icon: CheckCircle2,
    code: '02',
    title: 'Previous Year Questions',
    bengaliTag: 'PYQ প্রশ্নব্যাংক',
    description: 'Practice PYQs to read the trend before it reads you.',
  },
  {
    icon: Target,
    code: '03',
    title: 'Topic-wise Practice',
    bengaliTag: 'অধ্যায়ভিত্তিক প্রস্তুতি',
    description: 'Isolate weak chapters and turn them into scoring zones.',
  },
  {
    icon: BarChart3,
    code: '04',
    title: 'Performance Analysis',
    bengaliTag: 'নির্ভুল অ্যানালিসিস ও র‍্যাঙ্ক',
    description: 'Accuracy, speed and rank after every single attempt.',
  },
  {
    icon: Bookmark,
    code: '05',
    title: 'Bookmarks & Notes',
    bengaliTag: 'গুরুত্বপূর্ণ নোটস',
    description: 'Flag important questions and revise them in one sweep.',
  },
  {
    icon: Clock,
    code: '06',
    title: 'Mistakes Notebook',
    bengaliTag: 'ভুল সংশোধন খাতা',
    description: 'Every wrong answer files itself here for targeted revision.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'PracticeKoro helped me improve my score by 40%. The mock tests are really helpful!',
    name: 'Ritwik Das',
    role: 'WBP Constable Aspirant',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'The PYQ section is a game changer. Easy to use and very useful for serious aspirants.',
    name: 'Puja Saha',
    role: 'SSC GD Aspirant',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'Best platform for West Bengal exams. Clean UI and relevant questions.',
    name: 'Arindam Pal',
    role: 'Railway Aspirant',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5,
  },
];

const FAQS = [
  {
    q: 'ভুল সংশোধন খাতা (Mistakes Notebook) কীভাবে কাজ করে?',
    a: 'টেস্ট সাবমিট করার পর আপনার ভুল হওয়া প্রশ্নগুলো স্বয়ংক্রিয়ভাবে আপনার Mistakes Notebook-এ জমা হয়ে যায়। সেখানে প্রতিটি ভুলের সঠিক ব্যাখ্যা দেখে আপনি ভুল শুধরে নেওয়ার প্র্যাকটিস করতে পারবেন।',
  },
  {
    q: 'PracticeKoro-র মক টেস্টগুলো কি সম্পূর্ণ বাংলায়?',
    a: 'হ্যাঁ! প্রতিটি মক টেস্ট বাংলা এবং ইংরেজি উভয় ভাষাতেই উপলব্ধ। টেস্ট চলাকালীন যেকোনো সময় এক ক্লিকে প্রশ্নের ভাষা পরিবর্তন করা যায়।',
  },
  {
    q: 'প্রো পাস নিলে কি সব পরীক্ষার মক টেস্ট পাবো?',
    a: 'হ্যাঁ। একটি মাত্র All-Access Pro Pass (₹২৯৯ / ৩৬৫ দিন) নিলে WBP, KP, WBCS, WBPSC, Railway সহ সমস্ত পরীক্ষার সমস্ত প্রিমিয়াম টেস্ট আনলক হয়ে যায়।',
  },
  {
    q: 'আমি কি বিনামূল্যে কোনো টেস্ট দিতে পারবো?',
    a: 'অবশ্যই! PracticeKoro-তে ফ্রি মক টেস্ট সবসময় উপলব্ধ (ফ্রি টায়ার ₹০)। আপনি অ্যাকাউন্ট খুলেই টেস্ট দিয়ে পরখ করতে পারেন।',
  },
];

const MARQUEE_EXAMS = [
  'WBP Constable',
  'Kolkata Police SI',
  'WBCS Prelims',
  'WBPSC Clerkship',
  'Railway Group D',
  'Primary TET',
  'SSC GD',
  'SSC MTS',
  'WBSSC',
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const filteredPopularExams = EXAMS.filter((exam) => {
    const matchesCategory =
      selectedCategory === 'all' || exam.categories.includes(selectedCategory);
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ctaClick = (path: string) => navigate(path);

  return (
    <div
      data-landing
      className="min-h-screen flex flex-col selection:bg-[#155dfc] selection:text-white"
    >
      {/* ============================== NAV ============================== */}
      <header className="sticky top-0 z-50 border-b border-[#e5e4df] bg-[#fafaf8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-icon-transparent.png"
              alt="PracticeKoro"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
            <span className="lk-display text-xl sm:text-2xl tracking-tight">
              Practice<span className="text-[#155dfc]">Koro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold tracking-wide text-[#4a5361]">
            <a href="#exams" className="hover:text-[#155dfc] transition-colors">
              Exams
            </a>
            <a href="#features" className="hover:text-[#155dfc] transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#155dfc] transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-[#155dfc] transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <button
                type="button"
                onClick={() => ctaClick(dashboardUrl)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#101418] px-5 text-[13px] font-bold text-white transition-transform hover:-translate-y-px active:translate-y-0"
              >
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => ctaClick('/login')}
                  className="hidden sm:inline-flex h-10 items-center rounded-full border border-[#e5e4df] bg-white px-5 text-[13px] font-bold text-[#101418] transition-colors hover:border-[#155dfc] hover:text-[#155dfc]"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => ctaClick('/register')}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#155dfc] px-5 text-[13px] font-bold text-white shadow-[0_1px_0_rgba(16,20,24,0.15)] transition-transform hover:-translate-y-px active:translate-y-0"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden">
        {/* left content / right exam-hall rail: asymmetric split */}
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 lg:grid-cols-[7fr_5fr]">
          {/* Content column */}
          <div className="flex flex-col justify-center px-4 pb-10 pt-10 sm:px-6 sm:pt-16 lg:pr-0 lg:pb-14">
            <h1 className="lk-display text-[2.6rem] sm:text-6xl lg:text-[4.2rem]">
              Crack Your
              <br />
              <span className="text-[#155dfc]">Dream</span> Exam.
            </h1>

            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-[#4a5361] sm:text-lg">
              Mock tests, PYQs and topic practice for West Bengal's competitive exams. Bilingual,
              timed, exam-hall accurate.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => ctaClick(dashboardUrl)}
                  className="inline-flex h-13 min-h-[52px] items-center gap-2 rounded-full bg-[#155dfc] px-8 text-base font-bold text-white transition-transform hover:-translate-y-px active:translate-y-0"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => ctaClick('/register')}
                  className="inline-flex h-13 min-h-[52px] items-center gap-2 rounded-full bg-[#155dfc] px-8 text-base font-bold text-white transition-transform hover:-translate-y-px active:translate-y-0"
                >
                  Start Free Practice
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex h-13 min-h-[52px] items-center rounded-full border-2 border-[#101418] bg-transparent px-8 text-base font-bold text-[#101418] transition-colors hover:bg-[#101418] hover:text-white"
              >
                View Exams
              </button>
            </div>

            {/* receipt strip: free-first pricing proof */}
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#e5e4df] pt-4 text-[13px] font-bold text-[#4a5361]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#155dfc]" />
                Free tier, no card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="lk-mono text-xs text-[#155dfc]">₹299</span>
                Pro Pass unlocks everything
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-[#155dfc]" />
                English + বাংলা
              </span>
            </div>
          </div>

          {/* Exam-hall rail: OMR backdrop + answer sheet card */}
          <div className="relative min-h-[420px] border-t border-[#e5e4df] bg-white lg:border-l lg:border-t-0">
            <div className="lk-omr absolute inset-0" aria-hidden="true" />

            {/* answer-sheet card */}
            <div className="absolute left-1/2 top-1/2 w-[min(340px,88%)] -translate-x-1/2 -translate-y-1/2 rotate-[1.5deg] rounded-lg border border-[#e5e4df] bg-white shadow-[0_18px_50px_-20px_rgba(16,20,24,0.25)]">
              {/* sheet header like a hall ticket */}
              <div className="flex items-center justify-between border-b border-[#e5e4df] px-4 py-3">
                <div>
                  <p className="lk-mono text-[10px] uppercase tracking-[0.14em] text-[#4a5361]">
                    Mock Test 01
                  </p>
                  <p className="lk-display text-sm">West Bengal & Central</p>
                </div>
                <span className="lk-mono rounded bg-[#101418] px-2 py-1 text-[10px] text-white">
                  60:00
                </span>
              </div>

              {/* OMR rows: real exam UI, not a fake dashboard */}
              <div className="space-y-2.5 px-4 py-4">
                {[
                  { q: '01', opts: ['A', 'B', 'C', 'D'], picked: 'B' },
                  { q: '02', opts: ['A', 'B', 'C', 'D'], picked: null, marked: true },
                  { q: '03', opts: ['A', 'B', 'C', 'D'], picked: 'A' },
                  { q: '04', opts: ['A', 'B', 'C', 'D'], picked: null },
                  { q: '05', opts: ['A', 'B', 'C', 'D'], picked: 'C' },
                ].map((row) => (
                  <div key={row.q} className="flex items-center justify-between gap-3">
                    <span className="lk-mono text-xs text-[#101418]">{row.q}</span>
                    <div className="flex flex-1 items-center justify-end gap-2.5">
                      {row.opts.map((opt) => {
                        const picked = row.picked === opt;
                        return (
                          <span
                            key={opt}
                            className={`lk-mono inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                              picked
                                ? 'border-[#155dfc] bg-[#155dfc] text-white'
                                : 'border-[#e5e4df] text-[#4a5361]'
                            } ${row.marked ? 'ring-2 ring-[#155dfc]/25' : ''}`}
                          >
                            {opt}
                          </span>
                        );
                      })}
                      {row.marked && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#155dfc]">
                          Review
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* stub footer */}
              <div className="lk-stub flex items-center justify-between px-4 py-3">
                <span className="text-[11px] font-bold text-[#4a5361]">
                  Q.06 <span className="text-[#155dfc]">Next question</span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#155dfc]" />
              </div>
            </div>

            {/* floating badge */}
            <div className="absolute bottom-5 right-5 hidden rotate-[-2deg] rounded-lg border border-[#e5e4df] bg-white px-3.5 py-2.5 shadow-[0_10px_30px_-12px_rgba(16,20,24,0.3)] sm:block">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#4a5361]">
                For a
              </p>
              <p className="lk-display text-sm text-[#155dfc]">Stronger West Bengal</p>
            </div>
          </div>
        </div>

        {/* exam name marquee */}
        <div className="lk-marquee py-3.5" aria-hidden="true">
          <div className="lk-marquee-track gap-10 pr-10">
            {[...MARQUEE_EXAMS, ...MARQUEE_EXAMS].map((name, i) => (
              <span
                key={i}
                className="lk-display flex shrink-0 items-center gap-10 whitespace-nowrap text-lg text-[#c9c8c2]"
              >
                {name}
                <span className="lk-mono text-xs text-[#155dfc]">/</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== EXAMS CATALOG ============================== */}
      <section id="exams" className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="lk-display text-3xl sm:text-4xl">
              Explore <span className="text-[#155dfc]">Your Exam</span>
            </h2>
            <p className="max-w-[40ch] text-sm leading-relaxed text-[#4a5361]">
              Choose your target exam and start with topic-wise tests, PYQs and full mocks.
            </p>
          </div>

          {/* filter tabs + search */}
          <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div
              className="flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Exam category"
            >
              {CATEGORY_TABS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`h-9 rounded-full px-4 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#101418] text-white'
                        : 'border border-[#e5e4df] bg-white text-[#4a5361] hover:border-[#101418] hover:text-[#101418]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a5361]" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search exams"
                className="h-11 w-full rounded-full border border-[#e5e4df] bg-white pl-10 pr-4 text-sm text-[#101418] placeholder-[#9aa1ad] focus:border-[#155dfc] focus:outline-none"
              />
            </div>
          </div>

          {/* exam grid */}
          {filteredPopularExams.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPopularExams.map((exam, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => ctaClick(exam.route)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-[#e5e4df] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#155dfc] active:translate-y-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {exam.isCustomIcon ? (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e5e4df] bg-[#eaf1ff] text-[#155dfc]">
                        <Layers className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e5e4df] bg-[#fafaf8] p-1">
                        <img src={exam.icon} alt="" className="h-8 w-8 object-contain" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#101418] group-hover:text-[#155dfc]">
                        {exam.title}
                      </span>
                      <span className="block truncate text-[11px] text-[#4a5361]">
                        {exam.subtitle}
                      </span>
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#c9c8c2] transition-colors group-hover:text-[#155dfc]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-[#e5e4df] bg-white px-6 py-12 text-center">
              <p className="lk-display text-lg">No exams match "{searchQuery}"</p>
              <p className="mt-1 text-sm text-[#4a5361]">
                Try a different name, or browse all exams.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 h-10 rounded-full border border-[#101418] px-5 text-sm font-bold text-[#101418] transition-colors hover:bg-[#101418] hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={() => ctaClick('/exams')}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#101418] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-px active:translate-y-0"
            >
              View All Exams
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section
        id="how-it-works"
        className="lk-ruled border-y border-[#e5e4df] bg-white py-14 sm:py-20"
      >
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="lk-display text-3xl sm:text-4xl">
              From Preparation to <span className="text-[#155dfc]">Progress</span>
            </h2>
            <p className="max-w-[40ch] text-sm leading-relaxed text-[#4a5361]">
              Pick an exam, sit a timed mock, get graded analysis. That's the whole loop.
            </p>
          </div>

          {/* numbered vertical ledger rows (not 3 equal cards) */}
          <div className="mt-10 divide-y divide-[#e5e4df] border-y border-[#e5e4df]">
            {[
              {
                code: '01',
                icon: Layers,
                title: 'Choose Your Exam',
                desc: "Select the exam you're preparing for. Every test maps to its real syllabus.",
                iconPath: (
                  <span className="grid grid-cols-2 gap-1.5">
                    {[
                      '/images/exams/wbp_police.png',
                      '/images/exams/icon_kolkata_police.png',
                      '/images/exams/icon_railway_exact.png',
                      '/images/exams/icon_ssc_clean.png',
                    ].map((src) => (
                      <img key={src} src={src} alt="" className="h-6 w-6 object-contain" />
                    ))}
                  </span>
                ),
              },
              {
                code: '02',
                icon: Target,
                title: 'Practice & Test',
                desc: 'Full mocks, PYQs and chapter tests with the same timer and negative marking as the real hall.',
                iconPath: (
                  <span className="flex items-center gap-2">
                    {['A', 'B', 'C'].map((o) => (
                      <span
                        key={o}
                        className={`lk-mono inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
                          o === 'B'
                            ? 'border-[#155dfc] bg-[#155dfc] text-white'
                            : 'border-[#e5e4df] text-[#4a5361]'
                        }`}
                      >
                        {o}
                      </span>
                    ))}
                  </span>
                ),
              },
              {
                code: '03',
                icon: BarChart3,
                title: 'Check Your Results',
                desc: 'Score, accuracy, rank and a mistakes notebook that tells you exactly what to fix next.',
                iconPath: (
                  <span className="lk-display text-2xl text-[#155dfc]">
                    78<span className="text-sm">%</span>
                  </span>
                ),
              },
            ].map((step) => (
              <div
                key={step.code}
                className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 py-6 sm:grid-cols-[auto_auto_1fr_auto]"
              >
                <span className="lk-mono text-2xl text-[#c9c8c2] sm:text-3xl">{step.code}</span>
                <span className="hidden h-14 w-14 items-center justify-center rounded-md border border-[#e5e4df] bg-[#fafaf8] sm:flex">
                  {step.iconPath}
                </span>
                <span className="col-span-2 sm:col-span-1">
                  <span className="block lk-display text-lg sm:text-xl">{step.title}</span>
                  <span className="mt-1 block max-w-[52ch] text-sm leading-relaxed text-[#4a5361]">
                    {step.desc}
                  </span>
                </span>
                <step.icon className="hidden h-5 w-5 text-[#155dfc] sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== TOOLS ============================== */}
      <section id="features" className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <h2 className="lk-display text-3xl sm:text-4xl">
            Tools That Help You <span className="text-[#155dfc]">Improve</span>
          </h2>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-[#4a5361]">
            Everything you need for focused and effective preparation.
          </p>

          {/* 2x3 asymmetric grid with Bengali tags */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <div
                key={tool.code}
                className="group relative flex flex-col rounded-lg border border-[#e5e4df] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#155dfc]"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eaf1ff] text-[#155dfc]">
                    <tool.icon className="h-5 w-5" />
                  </span>
                  <span className="lk-mono text-xs text-[#c9c8c2] group-hover:text-[#155dfc]">
                    {tool.code}
                  </span>
                </div>
                <h3 className="lk-display mt-4 text-base">{tool.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#4a5361]">{tool.description}</p>
                <p className="mt-3 border-t border-[#e5e4df] pt-3 text-xs font-bold text-[#155dfc]">
                  {tool.bengaliTag}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== PRICING / PRO PASS ============================== */}
      <section id="pricing" className="px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-[1180px] rounded-2xl bg-[#101418] px-6 py-12 text-white sm:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[7fr_5fr]">
            <div>
              <h2 className="lk-display text-3xl sm:text-4xl text-white">
                One Pass. All Premium Tests.
              </h2>
              <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-[#9aa1ad]">
                Unlock unlimited mock tests, PYQs, detailed analysis and the mistakes notebook
                across every exam we cover.
              </p>

              {/* mono price line */}
              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <span className="lk-stat text-4xl text-white">₹299</span>
                  <span className="ml-2 text-sm font-bold text-[#9aa1ad]">/ 365 days</span>
                </div>
                <button
                  type="button"
                  onClick={() => ctaClick('/subscription')}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#155dfc] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-px active:translate-y-0"
                >
                  Get Pro Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* receipt-style inclusion list */}
            <div className="rounded-lg border border-white/15 bg-white/5 p-5">
              <p className="lk-mono text-[10px] uppercase tracking-[0.14em] text-[#9aa1ad]">
                What's included
              </p>
              <ul className="mt-3 space-y-2.5">
                {[
                  'Unlimited premium mock tests',
                  'Full PYQ question bank',
                  'Detailed analytics & rank',
                  'Mistakes Notebook & bookmarks',
                  'Priority support',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-semibold text-white/90"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#155dfc]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="lk-stub mt-4 flex items-center justify-between pt-3 border-white/15">
                <span className="lk-mono text-[10px] uppercase tracking-[0.14em] text-[#9aa1ad]">
                  less than ₹1 / day
                </span>
                <span className="lk-mono text-[10px] text-[#155dfc]">PK-PRO-365</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== TESTIMONIALS ============================== */}
      <section className="border-y border-[#e5e4df] bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <h2 className="lk-display text-3xl sm:text-4xl">
            Trusted by Aspirants <span className="text-[#155dfc]">Across</span> West Bengal
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between rounded-lg border border-[#e5e4df] bg-[#fafaf8] p-5"
              >
                <blockquote className="text-sm leading-relaxed text-[#101418]">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between border-t border-[#e5e4df] pt-4">
                  <span className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      loading="lazy"
                      className="h-10 w-10 rounded-full border border-[#e5e4df] object-cover"
                    />
                    <span>
                      <span className="block text-sm font-bold text-[#101418]">{t.name}</span>
                      <span className="block text-[11px] text-[#4a5361]">{t.role}</span>
                    </span>
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-amber-400"
                    aria-label={`${t.rating} star rating`}
                  >
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA BANNER ============================== */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#e5e4df] bg-white p-8 sm:p-12 md:grid-cols-[auto_1fr_auto]">
            {/* OMR-style target: filled bubbles = goal */}
            <div
              className="mx-auto flex h-32 w-32 grid-cols-4 grid-rows-4 flex-wrap items-center justify-center gap-2 md:mx-0"
              aria-hidden="true"
            >
              {['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'].map(
                (opt, i) => (
                  <span
                    key={i}
                    className={`lk-mono inline-flex h-6 w-6 items-center justify-center rounded-full border text-[9px] ${
                      i < 11
                        ? 'border-[#155dfc] bg-[#155dfc] text-white'
                        : 'border-[#e5e4df] text-[#4a5361]'
                    }`}
                  >
                    {opt}
                  </span>
                )
              )}
            </div>

            <div>
              <h2 className="lk-display text-3xl sm:text-4xl">
                Start Practicing <span className="text-[#155dfc]">Today</span>
              </h2>
              <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-[#4a5361]">
                Join thousands of aspirants and take a step closer to your goal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => ctaClick('/register')}
              className="inline-flex h-13 min-h-[52px] items-center gap-2 justify-self-start rounded-full bg-[#155dfc] px-8 text-base font-bold text-white transition-transform hover:-translate-y-px active:translate-y-0 md:justify-self-end"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="border-t border-[#e5e4df] bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="lk-display text-2xl sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-1 text-xs font-bold text-[#4a5361]">
            সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নাবলি ও সঠিক উত্তর
          </p>

          <div className="mt-6 divide-y divide-[#e5e4df] border-y border-[#e5e4df]">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-bold text-[#101418] hover:text-[#155dfc]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#4a5361] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#155dfc]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && <p className="pb-4 text-sm leading-relaxed text-[#4a5361]">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer
        id="about"
        className="border-t border-[#e5e4df] bg-[#101418] py-12 text-white sm:py-16"
      >
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo-icon-transparent.png"
                  alt="PracticeKoro"
                  className="h-7 w-7 object-contain"
                />
                <span className="lk-display text-xl">
                  Practice<span className="text-[#155dfc]">Koro</span>
                </span>
              </Link>
              <p className="max-w-[30ch] text-xs leading-relaxed text-[#9aa1ad]">
                Smart practice for a brighter tomorrow. Made for West Bengal's aspirants.
              </p>
              <p className="text-xs font-semibold text-[#9aa1ad]">
                Email:{' '}
                <a
                  href="mailto:support@practicekoro.com"
                  className="text-[#60a5fa] hover:underline"
                >
                  support@practicekoro.com
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="lk-mono text-[10px] uppercase tracking-[0.14em] text-[#9aa1ad]">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm font-semibold">
                <li>
                  <a href="#exams" className="text-white/85 hover:text-[#60a5fa]">
                    Exams
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-white/85 hover:text-[#60a5fa]">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-white/85 hover:text-[#60a5fa]">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-white/85 hover:text-[#60a5fa]">
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="lk-mono text-[10px] uppercase tracking-[0.14em] text-[#9aa1ad]">
                Support
              </h4>
              <ul className="space-y-2 text-sm font-semibold">
                <li>
                  <a
                    href="mailto:support@practicekoro.com"
                    className="text-white/85 hover:text-[#60a5fa]"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@practicekoro.com"
                    className="text-white/85 hover:text-[#60a5fa]"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link to="/privacy" className="text-white/85 hover:text-[#60a5fa]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-white/85 hover:text-[#60a5fa]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="lk-mono text-[10px] uppercase tracking-[0.14em] text-[#9aa1ad]">
                Follow Us
              </h4>
              <div className="flex items-center gap-2.5">
                {[
                  {
                    name: 'YouTube',
                    href: 'https://youtube.com',
                    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
                  },
                  {
                    name: 'Telegram',
                    href: 'https://telegram.org',
                    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z',
                  },
                  {
                    name: 'Instagram',
                    href: 'https://instagram.com',
                    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                  },
                  {
                    name: 'Facebook',
                    href: 'https://facebook.com',
                    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/85 transition-colors hover:border-[#155dfc] hover:bg-[#155dfc] hover:text-white"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#9aa1ad] sm:flex-row">
            <p>© 2025 PracticeKoro. All rights reserved.</p>
            <p>Designed for serious West Bengal & Central competitive exam preparation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
