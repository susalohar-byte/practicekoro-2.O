import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Crown,
  Clock,
  ArrowRight,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Target,
  FileText,
  Bookmark,
  Search,
  Sparkles,
  LayoutDashboard,
  Bell,
  Star,
  Layers,
  Zap,
  ChevronDown
} from 'lucide-react';

// West Bengal & Central Competitive Exams Coverage
export const SUPPORTED_EXAM_CATEGORIES = [
  'WBP Constable',
  'Kolkata Police',
  'WBCS Prelims',
  'WBPSC Clerkship',
  'Railway Group D',
  'Primary & Upper Primary TET',
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const examCategories = [
    { id: 'all', label: 'All Exams' },
    { id: 'west-bengal', label: 'West Bengal' },
    { id: 'central', label: 'Central' },
    { id: 'state', label: 'State' },
    { id: 'teaching', label: 'Teaching' },
  ];

  const popularExams = [
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

  const filteredPopularExams = popularExams.filter((exam) => {
    const matchesCategory =
      selectedCategory === 'all' || exam.categories.includes(selectedCategory);
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toolsFeatures = [
    {
      icon: FileText,
      title: 'Mock Tests',
      bengaliTag: 'রিয়েল পরীক্ষার সিমুলেটর',
      description: 'Select the exam with real exam pattern.',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: CheckCircle2,
      title: 'Previous Year Questions',
      bengaliTag: 'PYQ প্রশ্নব্যাংক',
      description: 'Practice PYQs to understand the exam trend.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: Target,
      title: 'Topic-wise Practice',
      bengaliTag: 'অধ্যায়ভিত্তিক প্রস্তুতি',
      description: 'Focus on your weak topics and build strong concepts.',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      icon: BarChart3,
      title: 'Performance Analysis',
      bengaliTag: 'নির্ভুল অ্যানালিসিস ও র‍্যাঙ্ক',
      description: 'Detailed analysis to track your progress.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      icon: Bookmark,
      title: 'Bookmarks & Notes',
      bengaliTag: 'গুরুত্বপূর্ণ নোটস',
      description: 'Save important questions for quick revision.',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      icon: Clock,
      title: 'Practice History',
      bengaliTag: 'ভুল সংশোধন খাতা',
      description: 'Keep track of all your tests and improve consistently.',
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
  ];

  const testimonials = [
    {
      quote: "PracticeKoro helped me improve my score by 40%. The mock tests are really helpful!",
      name: "Ritwik Das",
      role: "WBP Constable Aspirant",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote: "The PYQ section is a game changer. Easy to use and very useful for serious aspirants.",
      name: "Puja Saha",
      role: "SSC GD Aspirant",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote: "Best platform for West Bengal exams. Clean UI and relevant questions.",
      name: "Arindam Pal",
      role: "Railway Aspirant",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'ভুল সংশোধন খাতা (Mistakes Notebook) কীভাবে কাজ করে?',
      a: 'টেস্ট সাবমিট করার পর আপনার ভুল হওয়া প্রশ্নগুলো স্বয়ংক্রিয়ভাবে আপনার Mistakes Notebook-এ জমা হয়ে যায়। সেখানে প্রতিটি ভুলের সঠিক ব্যাখ্যা দেখে আপনি ভুল শুধরে নেওয়ার প্র্যাকটিস করতে পারবেন।',
    },
    {
      q: 'PracticeKoro-র মক টেস্টগুলো কি সম্পূর্ণ বাংলায়?',
      a: 'হ্যাঁ! প্রতিটি মক টেস্ট বাংলা এবং ইংরেজি উভয় ভাষাতেই উপলব্ধ। টেস্ট চলাকালীন যেকোনো সময় এক ক্লিকে প্রশ্নের ভাষা পরিবর্তন করা যায়।',
    },
    {
      q: 'প্রো পাস নিলে কি সব পরীক্ষার মক টেস্ট পাবো?',
      a: 'হ্যাঁ। একটি মাত্র All-Access Pro Pass (₹২৯৯ / ৩৬৫ দিন) নিলে WBP, KP, WBCS, WBPSC, Railway সহ সমস্ত পরীক্ষার সমস্ত প্রিমিয়াম টেস্ট আনলক হয়ে যায়।',
    },
    {
      q: 'আমি কি বিনামূল্যে কোনো টেস্ট দিতে পারবো?',
      a: 'অবশ্যই! PracticeKoro-তে ফ্রি মক টেস্ট সবসময় উপলব্ধ (ফ্রি টায়ার ₹০)। আপনি অ্যাকাউন্ট খুলেই টেস্ট দিয়ে পরখ করতে পারেন।',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          1. NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo-icon-transparent.png"
                alt="PracticeKoro"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center">
                Practice<span className="text-blue-600">Koro</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#exams" className="hover:text-blue-600 transition-colors">
                Exams
              </a>
              <a href="#features" className="hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">
                Pricing
              </a>
              <a href="#about" className="hover:text-blue-600 transition-colors">
                About
              </a>
            </nav>

            {/* Auth / Dashboard CTA */}
            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  size="sm"
                  onClick={() => navigate(dashboardUrl)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl shadow-sm gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 border-slate-200 hover:bg-blue-50 hover:border-blue-300 px-4 sm:px-5 py-2 rounded-xl"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-xl shadow-md shadow-blue-500/20"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-white pt-10 pb-16 sm:py-16 lg:py-20">
        {/* Soft background glow */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              {/* Eyebrow / Tagline */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold tracking-wider text-blue-700 uppercase">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>PRACTICE MORE. WORRY LESS.</span>
              </div>

              {/* Main Headline */}
              <h1 aria-label="Crack Your Dream Exam." className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Crack Your <br />
                {/* Crack Your Dream Exam. */}
                <span className="text-blue-600">Dream</span> Exam.
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Smart practice for West Bengal's competitive exams.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 text-sm sm:text-base gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('exams');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50/70 font-bold px-7 py-3.5 rounded-xl text-sm sm:text-base"
                >
                  View Exams
                </Button>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-semibold text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mock Tests</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>PYQs</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-semibold text-slate-700">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>Topic Practice</span>
                </div>
              </div>
            </div>

            {/* Right Graphic Column: Phone Mockup + Bengal Silhouette */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              {/* Silhouette Map of West Bengal */}
              <div className="absolute -right-4 sm:right-4 top-1/2 -translate-y-1/2 w-[280px] sm:w-[350px] opacity-35 pointer-events-none select-none z-0">
                <img
                  src="/images/west_bengal_silhouette.svg"
                  alt="West Bengal Map"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* "For a Stronger West Bengal" badge */}
              <div className="absolute right-2 sm:right-6 bottom-8 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-100 shadow-md text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  For a
                </p>
                <p className="text-xs font-black text-blue-700">
                  Stronger West Bengal
                </p>
              </div>

              {/* Smartphone Container */}
              <div className="relative z-10 w-[270px] sm:w-[310px] bg-slate-900 rounded-[2.8rem] p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800">
                {/* Phone Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20" />

                {/* Inner Screen */}
                <div className="bg-white rounded-[2.2rem] overflow-hidden pt-7 pb-4 px-3 sm:px-4 shadow-inner border border-slate-100">
                  <div className="text-center pb-3 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-800">
                      West Bengal & Central Exams
                    </p>
                  </div>

                  {/* Exam list inside phone */}
                  <div className="divide-y divide-slate-100 py-1 space-y-1">
                    {[
                      {
                        name: 'WBP Constable',
                        sub: 'West Bengal Police',
                        icon: '/images/exams/wbp_police.png',
                      },
                      {
                        name: 'Kolkata Police',
                        sub: 'Kolkata Police',
                        icon: '/images/exams/icon_kolkata_police.png',
                      },
                      {
                        name: 'RRB',
                        sub: 'Indian Railways',
                        icon: '/images/exams/icon_railway_exact.png',
                      },
                      {
                        name: 'SSC GD',
                        sub: 'Staff Selection Commission',
                        icon: '/images/exams/icon_ssc_clean.png',
                      },
                      {
                        name: 'SSC MTS',
                        sub: 'Staff Selection Commission',
                        icon: '/images/exams/icon_ssc_clean.png',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-7 h-7 object-contain"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.sub}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION 2: POPULAR EXAMS ("Explore Your Exam")
          ========================================================================= */}
      <section id="exams" className="py-16 sm:py-20 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              POPULAR EXAMS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Explore <span className="text-blue-600">Your Exam</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Choose your target exam and start practicing with topic-wise tests, PYQs and full mock tests.
            </p>
          </div>

          {/* Filter Tabs & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {examCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs"
              />
            </div>
          </div>

          {/* 8 Exam Cards Grid (4 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredPopularExams.map((exam, index) => (
              <div
                key={index}
                onClick={() => navigate(exam.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(exam.route)}
                className="group rounded-2xl bg-white border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {exam.isCustomIcon ? (
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-1 group-hover:border-blue-200 transition-colors">
                      <img
                        src={exam.icon}
                        alt={exam.title}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {exam.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {exam.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom "View All Exams" Button */}
          <div className="text-center mt-10">
            <Button
              size="lg"
              onClick={() => navigate('/exams')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm gap-2"
            >
              <span>View All Exams</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SECTION 3: HOW PRACTICEKORO WORKS ("From Preparation to Progress")
          ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              HOW PRACTICEKORO WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              From <span className="text-blue-600">Preparation</span> to{' '}
              <span className="text-blue-600">Progress</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A simple way to practice, test and improve — all in one place.
            </p>
          </div>

          {/* 3 Step Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 transition-all text-center flex flex-col items-center relative">
              {/* Step number badge */}
              <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                01
              </div>

              {/* Graphic container */}
              <div className="w-36 h-28 bg-blue-50/50 rounded-xl border border-blue-100/60 flex items-center justify-center mb-6 mt-4 p-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <img src="/images/exams/wbp_police.png" alt="WBP" className="w-8 h-8 object-contain" />
                  <img src="/images/exams/icon_kolkata_police.png" alt="KP" className="w-8 h-8 object-contain" />
                  <img src="/images/exams/icon_railway_exact.png" alt="Railway" className="w-8 h-8 object-contain" />
                  <img src="/images/exams/icon_ssc_clean.png" alt="SSC" className="w-8 h-8 object-contain" />
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Choose Your Exam
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                Select the exam you're preparing for.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 transition-all text-center flex flex-col items-center relative">
              {/* Step number badge */}
              <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                02
              </div>

              {/* Graphic container */}
              <div className="w-36 h-28 bg-blue-50/50 rounded-xl border border-blue-100/60 flex flex-col justify-center px-4 py-3 mb-6 mt-4 space-y-1.5">
                <div className="h-2 bg-slate-200 rounded-full w-full" />
                <div className="space-y-1 pt-1 text-left text-[9px] font-bold text-slate-600">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-slate-300" /> Option A</div>
                  <div className="flex items-center gap-1.5 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-600" /> Option B (Selected)</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-slate-300" /> Option C</div>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Practice & Test
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                Take full mock tests, PYQs and topic-wise tests.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 transition-all text-center flex flex-col items-center relative">
              {/* Step number badge */}
              <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                03
              </div>

              {/* Graphic container */}
              <div className="w-36 h-28 bg-blue-50/50 rounded-xl border border-blue-100/60 flex flex-col items-center justify-center mb-6 mt-4 p-2">
                <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-blue-200 flex items-center justify-center bg-white shadow-xs">
                  <span className="text-[11px] font-black text-slate-800">78%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-1">Your Score</span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Check Your Results
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                Get detailed analysis, find weak areas and improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECTION 4: TOOLS THAT HELP YOU IMPROVE ("Practice Smarter")
          ========================================================================= */}
      <section id="features" className="py-16 sm:py-20 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              PRACTICE SMARTER
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tools That Help You <span className="text-blue-600">Improve</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Everything you need for focused and effective preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left 6 Feature Cards (2x3 Grid) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {toolsFeatures.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tool.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {tool.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Interactive Mobile Student App Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[280px] sm:w-[320px] bg-slate-900 rounded-[2.8rem] p-3 shadow-2xl ring-1 ring-slate-800">
                {/* Speaker Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20" />

                {/* Inner Screen Content */}
                <div className="bg-slate-50 rounded-[2.2rem] overflow-hidden p-4 space-y-3.5 border border-slate-100 text-slate-900">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1 pt-2">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Good Morning,</p>
                      <p className="text-xs font-black text-slate-900">Keep Practicing!</p>
                    </div>
                    <div className="p-1.5 rounded-full bg-slate-100 text-slate-600">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Your Progress Widget */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800">Your Progress</span>
                      <span className="text-blue-600 text-[10px]">View All</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Radial indicator */}
                      <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-slate-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-black text-slate-900">68%</span>
                        <span className="text-[7px] text-slate-400">Overall</span>
                      </div>
                      <div className="text-[10px] space-y-1 text-slate-500">
                        <p><span className="font-bold text-slate-800">12</span> Tests Taken</p>
                        <p><span className="font-bold text-slate-800">8</span> Topics Completed</p>
                        <p><span className="font-bold text-slate-800">4</span> Tests Pending</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Test Card */}
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-700">Recent Test</span>
                      <span className="text-blue-600">See All</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">
                      <p className="text-[11px] font-bold text-slate-800">WBP Constable Mock Test 01</p>
                      <p className="text-[9px] text-slate-400">100 Questions • 60 Minutes</p>
                    </div>
                  </div>

                  {/* Your Strength Bars */}
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-2">
                    <p className="text-[10px] font-bold text-slate-700">Your Strength</p>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold">
                      <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-lg border border-emerald-100">
                        85%
                        <span className="block text-[8px] text-slate-500 font-normal">Reasoning</span>
                      </div>
                      <div className="bg-blue-50 text-blue-700 p-1.5 rounded-lg border border-blue-100">
                        72%
                        <span className="block text-[8px] text-slate-500 font-normal">GK</span>
                      </div>
                      <div className="bg-rose-50 text-rose-700 p-1.5 rounded-lg border border-rose-100">
                        60%
                        <span className="block text-[8px] text-slate-500 font-normal">Maths</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION 5: PRO PASS BANNER ("One Pass. All Premium Tests.")
          ========================================================================= */}
      <section id="pricing" className="py-14 sm:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#091122] text-white p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Ambient Background Radial Glow */}
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="space-y-5 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                PRO
                <span className="sr-only">অল-অ্যাক্সেস প্রো পাস</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                One Pass. All Premium Tests.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Unlock unlimited mock tests, PYQs, detailed analysis and more.
              </p>

              {/* 4 Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Unlimited Tests
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  Detailed Analytics
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  Topic-wise Tests
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Priority Support
                </span>
              </div>

              {/* Price & CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3">
                <div>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                    ₹299
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 font-semibold ml-2">
                    / 365 Days
                  </span>
                  <span className="sr-only">₹২৯৯ ৩৬৫ দিন ₹০ অল-অ্যাক্সেস প্রো পাস</span>
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate('/subscription')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 text-sm gap-2"
                >
                  <span>Get Pro Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Glowing Crown Card */}
            <div className="flex flex-col items-center justify-center relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-blue-600/30 border border-blue-400/40 backdrop-blur-md flex items-center justify-center shadow-inner relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
                </div>
                {/* Sparkle icons */}
                <Sparkles className="w-4 h-4 text-blue-300 absolute top-3 left-4 animate-pulse" />
                <Sparkles className="w-5 h-5 text-blue-300 absolute bottom-4 right-4 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-center text-slate-300 mt-4 max-w-[180px]">
                Take Your Preparation to the Next Level
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. SECTION 6: TESTIMONIALS ("Trusted by Aspirants Across West Bengal")
          ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              WHAT OUR USERS SAY
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by Aspirants <span className="text-blue-600">Across</span> West Bengal
            </h2>
          </div>

          {/* 3 Testimonials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t.role}
                      </p>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. SECTION 7: BOTTOM CTA BANNER ("Start Practicing Today")
          ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-100/90 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left 3D Target Dartboard Illustration */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center relative">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
                {/* Outer ring */}
                <circle cx="100" cy="100" r="90" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="4" />
                <circle cx="100" cy="100" r="70" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
                <circle cx="100" cy="100" r="50" fill="#38bdf8" />
                <circle cx="100" cy="100" r="30" fill="#ffffff" />
                <circle cx="100" cy="100" r="14" fill="#2563eb" />
                {/* Dart Arrow */}
                <path d="M 100 100 L 160 40 L 170 50 L 110 110 Z" fill="#1d4ed8" />
                <polygon points="160,40 180,20 170,50" fill="#ef4444" />
                <circle cx="100" cy="100" r="4" fill="#ffffff" />
              </svg>
            </div>

            {/* Center Content */}
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                YOUR DREAM IS CLOSER
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Start Practicing <span className="text-blue-600">Today</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Join thousands of aspirants and take a step closer to your goal.
              </p>
            </div>

            {/* Right Button */}
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm gap-2 shrink-0 self-stretch sm:self-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FAQ SECTION (Interactive Accordion)
          ========================================================================= */}
      <section className="py-12 bg-slate-50/50 border-t border-slate-100">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl font-bold text-slate-900">
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-slate-500">
              সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নাবলি ও সঠিক উত্তর
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
          ========================================================================= */}
      <footer id="about" className="bg-white border-t border-slate-200 py-12 sm:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo-icon-transparent.png"
                  alt="PracticeKoro"
                  className="w-7 h-7 object-contain"
                />
                <span className="font-black text-xl text-slate-900 tracking-tight">
                  Practice<span className="text-blue-600">Koro</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart practice for a brighter tomorrow. Made for West Bengal's aspirants.
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Email: <a href="mailto:support@practicekoro.com" className="text-blue-600 hover:underline">support@practicekoro.com</a>
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><a href="#exams" className="hover:text-blue-600 transition-colors">Exams</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#about" className="hover:text-blue-600 transition-colors">About</a></li>
              </ul>
            </div>

            {/* Col 3: Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Support
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li><a href="mailto:support@practicekoro.com" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="mailto:support@practicekoro.com" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Col 4: Follow Us */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Follow Us
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 PracticeKoro. All rights reserved.</p>
            <p className="text-slate-400">
              Designed for serious West Bengal & Central competitive exam preparation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
