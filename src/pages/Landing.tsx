import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Crown,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  BarChart3,
  RefreshCw,
  Lock,
  Play,
  CheckCircle2,
  Target,
  FileText,
  LayoutDashboard,
  Wifi,
  Battery,
  Search,
  LayoutGrid
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      title: 'Railway',
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

  const features = [
    {
      icon: Clock,
      title: 'রিয়েল পরীক্ষার সিমুলেটর',
      titleEn: 'Real Exam Simulator',
      desc: 'NTA ও WBPRB-র অফিসিয়াল পরীক্ষার অনুরূপ কাউন্টডাউন টাইমার, 5-কালার স্ট্যাটাস প্যালেট এবং তাৎক্ষণিক বাংলা ও ইংরেজি প্রশ্ন টগল।',
      badge: 'বাস্তব অভিজ্ঞতা',
    },
    {
      icon: RefreshCw,
      title: 'ভুল সংশোধন খাতা',
      titleEn: 'Mistakes Notebook',
      desc: 'টেস্টে যে প্রশ্নগুলো ভুল হবে, সেগুলো স্বয়ংক্রিয়ভাবে আপনার ব্যক্তিগত রিভিশন খাতায় জমা হবে। ভুল শুধরে আবার প্র্যাকটিস করার অনন্য সুবিধা।',
      badge: 'স্কোর বুস্টার',
    },
    {
      icon: BarChart3,
      title: 'নির্ভুল অ্যানালিসিস ও র‍্যাঙ্ক',
      titleEn: 'Honest Performance Analytics',
      desc: 'কোনো ভুয়া র‍্যাঙ্ক বা ফেক ডেটা নয়। সঠিক Accuracy %, নেগেটিভ মার্কিং হিসাব, এবং বিষয়ভিত্তিক দুর্বলতা চিহ্নিতকরণ।',
      badge: '১০০% বাস্তবসম্মত',
    },
    {
      icon: Crown,
      title: 'অল-অ্যাক্সেস প্রো পাস',
      titleEn: 'All-Access Pro Pass',
      desc: 'প্রতিটি পরীক্ষার জন্য আলাদা টেস্ট কেনার ঝামেলা নেই। মাত্র ₹২৯৯-এ ৩৬৫ দিন সমস্ত পরীক্ষার প্রিমিয়াম মক টেস্ট আনলক।',
      badge: '₹২৯৯ / বছর',
    },
  ];

  const loopSteps = [
    {
      step: '০১',
      title: 'পরীক্ষা বেছে নিন',
      desc: 'WBP, WBCS, WBPSC বা Railway—আপনার টার্গেট পরীক্ষা নির্বাচন করুন।',
      icon: Target,
    },
    {
      step: '০২',
      title: 'রিয়েল মক টেস্ট দিন',
      desc: 'পরীক্ষার হলের মতো নির্দিষ্ট সময় ও নেগেটিভ মার্কিং সহ টেস্ট শুরু করুন।',
      icon: Play,
    },
    {
      step: '০৩',
      title: 'স্কোরকার্ড ও অ্যানালিসিস',
      desc: 'টেস্ট সাবমিটের সঙ্গে সঙ্গে নির্ভুল স্কোর, অ্যাকুরেসি এবং র‍্যাঙ্ক দেখুন।',
      icon: BarChart3,
    },
    {
      step: '০৪',
      title: 'ভুল সংশোধন ও রি-অ্যাটেম্পট',
      desc: 'ভুল সংশোধন খাতা থেকে দুর্বল প্রশ্নগুলো রিভিশন দিয়ে প্রস্তুতি সম্পূর্ণ করুন।',
      icon: RefreshCw,
    },
  ];

  const faqs = [
    {
      q: 'PracticeKoro-র মক টেস্টগুলো কি সম্পূর্ণ বাংলায়?',
      a: 'হ্যাঁ! প্রতিটি মক টেস্ট বাংলা এবং ইংরেজি উভয় ভাষাতেই উপলব্ধ। টেস্ট চলাকালীন যেকোনো সময় এক ক্লিকে প্রশ্নের ভাষা বাংলা থেকে ইংরেজিতে বা উল্টোটা পরিবর্তন করা যায়।',
    },
    {
      q: 'প্রো পাস নিলে কি সব পরীক্ষার মক টেস্ট পাবো?',
      a: 'হ্যাঁ। PracticeKoro-তে কোনো আলাদা টেস্ট বা মাসিক ফি নেই। একটি মাত্র Pro Pass (₹২৯৯ / ৩৬৫ দিন) নিলে WBP, KP, WBCS, WBPSC, Railway সহ সমস্ত পরীক্ষার সমস্ত প্রিমিয়াম টেস্ট আনলক হয়ে যায়।',
    },
    {
      q: 'ভুল সংশোধন খাতা (Mistakes Notebook) কীভাবে কাজ করে?',
      a: 'টেস্ট সাবমিট করার পর আপনার ভুল হওয়া প্রশ্নগুলো স্বয়ংক্রিয়ভাবে আপনার "Practice & Revision" সেকশনের Mistakes Notebook-এ জমা হয়ে যায়। সেখানে প্রতিটি ভুলের সঠিক ব্যাখ্যা দেখে আপনি ভুল শুধরে নেওয়ার প্র্যাকটিস করতে পারবেন।',
    },
    {
      q: 'আমি কি বিনামূল্যে কোনো টেস্ট দিতে পারবো?',
      a: 'অবশ্যই! PracticeKoro-তে ফ্রি মক টেস্ট সবসময় উপলব্ধ। আপনি অ্যাকাউন্ট খুলে কোনো টাকা না দিয়েই ফ্রি টেস্ট দিয়ে আমাদের প্ল্যাটফর্ম ও রিয়েল এক্সাম সিমুলেটর পরখ করে দেখতে পারেন।',
    },
    {
      q: 'পেমেন্ট কি সম্পূর্ণ নিরাপদ?',
      a: 'হ্যাঁ, সম্পূর্ণ নিরাপদ। পেমেন্ট সম্পন্ন হয় Razorpay সিকিউর গেটওয়ের মাধ্যমে 256-বিট এনক্রিপশনের সাথে। UPI (Google Pay, PhonePe, Paytm), ডেবিট/ক্রেডিট কার্ড এবং নেট ব্যাংকিং সমর্থিত।',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* =========================================================================
          1. PUBLIC HEADER / NAVBAR
          ========================================================================= */}
      {/* =========================================================================
          1. PUBLIC HEADER / NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo-icon-transparent.png"
                alt="PracticeKoro"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl transition-transform group-hover:scale-105"
              />
              <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center">
                Practice<span className="text-blue-600">Koro</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
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
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                About
              </a>
            </nav>

            {/* Auth / Dashboard Buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  size="sm"
                  onClick={() => navigate(dashboardUrl)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
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
                    className="text-xs sm:text-sm font-semibold text-blue-600 border border-blue-500 hover:bg-blue-50 px-4 sm:px-5 py-2 rounded-xl transition"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-xl shadow-sm transition"
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
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-white border-b border-slate-100">
        {/* Soft cyan-blue radial background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[500px] h-[500px] lg:w-[650px] lg:h-[650px] bg-gradient-to-tr from-sky-200/50 via-blue-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-5 text-center lg:text-left">
              {/* Eyebrow / Tagline */}
              <p className="text-xs sm:text-sm font-bold text-sky-600 tracking-[0.2em] uppercase mb-4">
                PRACTICE MORE. WORRY LESS.
              </p>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.1]">
                Crack Your <br />
                <span className="text-blue-600">Dream Exam.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-md mt-4 leading-relaxed mx-auto lg:mx-0">
                Smart practice for West Bengal's competitive exams.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-6">
                {user ? (
                  <Button
                    size="lg"
                    onClick={() => navigate(dashboardUrl)}
                    className="w-full sm:w-auto text-sm sm:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="w-full sm:w-auto text-sm sm:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const elem = document.getElementById('exams');
                    elem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto text-sm sm:text-base font-bold bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-500/30 hover:border-blue-600 px-7 py-3.5 rounded-xl transition"
                >
                  View Exams
                </Button>
              </div>

              {/* Feature Pills Underneath Buttons */}
              <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-8 text-slate-700 text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Mock Tests</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>PYQs</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Target className="w-4 h-4" />
                  </div>
                  <span>Topic Practice</span>
                </div>
              </div>
            </div>

            {/* Center: Smartphone Mockup */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-[280px] sm:w-[310px] rounded-[44px] bg-slate-950 p-2.5 shadow-2xl ring-1 ring-slate-800 border-[3px] border-slate-700/60">
                {/* Screen Content */}
                <div className="rounded-[34px] overflow-hidden bg-white p-4 pt-3 flex flex-col shadow-inner">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 px-2 pb-2">
                    <span>9:41</span>
                    <div className="w-16 h-3.5 bg-slate-950 rounded-full mx-auto" />
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="inline-block w-2.5 h-2 bg-slate-800 rounded-sm" />
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* App Screen Header */}
                  <p className="font-bold text-slate-900 text-xs sm:text-sm mt-2 mb-3 px-1">
                    West Bengal & Central Exams
                  </p>

                  {/* Exam List Cards */}
                  <div className="space-y-2">
                    {/* WBP Constable */}
                    <div
                      onClick={() => navigate('/exams/wbp-constable')}
                      className="group p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-200 shadow-sm flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/exams/wbp_police.png"
                          alt="WBP"
                          className="w-7 h-7 object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            WBP Constable
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">West Bengal Police</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>

                    {/* Kolkata Police */}
                    <div
                      onClick={() => navigate('/exams/kp-police-si')}
                      className="group p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-200 shadow-sm flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/exams/icon_kolkata_police.png"
                          alt="Kolkata Police"
                          className="w-7 h-7 object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            Kolkata Police
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Kolkata Police</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>

                    {/* RRB */}
                    <div
                      onClick={() => navigate('/exams/railway-group-d')}
                      className="group p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-200 shadow-sm flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/exams/icon_railway_exact.png"
                          alt="RRB"
                          className="w-7 h-7 object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            RRB
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Indian Railways</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>

                    {/* SSC GD */}
                    <div
                      onClick={() => navigate('/exams')}
                      className="group p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-200 shadow-sm flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/exams/icon_ssc_clean.png"
                          alt="SSC GD"
                          className="w-7 h-7 object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            SSC GD
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Staff Selection Commission</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>

                    {/* SSC MTS */}
                    <div
                      onClick={() => navigate('/exams')}
                      className="group p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-200 shadow-sm flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/exams/icon_ssc_clean.png"
                          alt="SSC MTS"
                          className="w-7 h-7 object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            SSC MTS
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Staff Selection Commission</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: West Bengal Map & Motto */}
            <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-center lg:items-start justify-center gap-6 text-center lg:text-left">
              {/* West Bengal Map Silhouette */}
              <div className="relative">
                <svg
                  viewBox="0 0 200 320"
                  className="w-36 sm:w-44 lg:w-48 h-auto drop-shadow-sm opacity-90 transition-transform hover:scale-105"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M108 8 C115 12, 126 28, 122 42 C118 52, 112 65, 118 78 C124 90, 116 102, 106 112 C98 120, 94 130, 92 142 C90 155, 102 165, 110 178 C118 190, 116 205, 114 218 C112 232, 118 248, 112 265 C106 282, 94 294, 82 292 C74 290, 70 280, 68 270 C66 255, 52 240, 50 222 C48 205, 54 190, 52 175 C50 162, 44 150, 56 140 C66 132, 74 122, 78 110 C82 98, 88 85, 94 72 C98 60, 96 42, 100 24 Z"
                    className="fill-sky-100 stroke-sky-300"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Motto */}
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-slate-800 font-bold text-xl sm:text-2xl leading-tight tracking-tight">
                  For a<br />
                  Stronger<br />
                  West Bengal
                </span>
                <div className="w-12 h-1.5 bg-blue-600 rounded-full mt-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. POPULAR EXAM CATEGORIES SECTION
          ========================================================================= */}
      <section id="exams" className="relative py-20 bg-slate-50/40 overflow-hidden border-b border-slate-100">
        {/* Soft ambient corner blobs matching the design */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Header */}
          <div className="text-center max-w-2xl mx-auto mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-sky-100/80 text-blue-600 text-xs font-bold tracking-widest uppercase mb-3">
              POPULAR EXAMS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Explore <span className="text-blue-600">Your Exam</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 font-normal leading-relaxed">
              Choose your target exam and start practicing with topic-wise tests, PYQs and full mock tests.
            </p>
          </div>

          {/* Filter Tabs & Search Bar Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 mb-8">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-center md:justify-start">
              {examCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'bg-white/90 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exams..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
              />
            </div>
          </div>

          {/* 8 Exam Cards Grid (4 columns × 2 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredPopularExams.map((exam, index) => (
              <div
                key={index}
                onClick={() => navigate(exam.route)}
                className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {exam.isCustomIcon ? (
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <LayoutGrid className="w-6 h-6" />
                      </div>
                    ) : (
                      <img
                        src={exam.icon}
                        alt={exam.title}
                        className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {exam.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Button */}
          <div className="text-center mt-10">
            <Button
              size="lg"
              onClick={() => navigate('/exams')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 inline-flex items-center gap-2 transition"
            >
              <span>View All Exams</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. 4 CORE PRODUCT PILLARS
          ========================================================================= */}
      <section id="features" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="info" className="font-bold px-3 py-1">
              কেন PracticeKoro?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              অ্যাসপিরেন্টদের সফলতার জন্য ৪টি শক্তিশালী ফিচার
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              শুধুমাত্র সাধারণ কুইজ নয়—একটি পূর্ণাঙ্গ এক্সাম ও রিভিশন ইকোসিস্টেম
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                          {feat.badge}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {feat.titleEn}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 pt-1">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. THE 4-STEP STUDENT LOOP
          ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="info" className="font-bold px-3 py-1">
              প্রস্তুতি চক্র
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              কীভাবে PracticeKoro আপনার নম্বর বৃদ্ধি করে?
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              Exam → Attempt → Result → Mistakes → Revision: প্রতিটি ধাপে সর্বোচ্চ আত্মবিশ্বাস
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loopSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-300 font-mono">
                        {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 pt-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TRANSPARENT PRICING (PRO PASS)
          ========================================================================= */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="premium" className="font-bold px-3 py-1">
              স্বচ্ছ সাবস্ক্রিপশন
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              একটি পাস। সমস্ত প্রিমিয়াম মক টেস্ট।
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              কোনো পৃথক টেস্ট বিক্রি নেই, কোনো মাসিক চার্জ নেই। বছরে একবার মাত্র ₹২৯৯।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free Tier Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <Badge variant="default" className="font-bold">ফ্রি প্ল্যান</Badge>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">₹০</span>
                    <span className="text-xs font-semibold text-slate-500">/ আজীবনের জন্য ফ্রি</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    প্রতিটি পরীক্ষার ফ্রি ডেমো মক টেস্ট দিয়ে প্ল্যাটফর্ম যাচাই করুন
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ফ্রি ফুল মক টেস্টে এক্সেস</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>রিয়েল এক্সাম সিমুলেটর ও কাউন্টডাউন টাইমার</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>তাৎক্ষণিক রেজাল্ট ও স্কোরকার্ড</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>প্রিমিয়াম ফুল মক টেস্ট সিরিজ</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>স্বয়ংক্রিয় ভুল সংশোধন খাতা (Mistakes Notebook)</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-8 font-bold text-xs"
                onClick={() => navigate('/register')}
              >
                ফ্রি অ্যাকাউন্ট তৈরি করুন
              </Button>
            </div>

            {/* Pro Pass Featured Card */}
            <div className="relative rounded-3xl border-2 border-brand-500 bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white p-8 shadow-2xl flex flex-col justify-between">
              {/* Popular Tag */}
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                👑 সেরা পছন্দ (Best Value)
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                      অল-অ্যাক্সেস প্রো পাস
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white">₹২৯৯</span>
                    <span className="text-xs font-semibold text-slate-300">/ ৩৬৫ দিন</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    একটি সক্রিয় পাসেই বর্তমান ও ভবিষ্যতের সমস্ত পরীক্ষার সমস্ত প্রিমিয়াম টেস্ট আনলক
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-6 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">সমস্ত সরকারি চাকরির প্রিমিয়াম মক টেস্ট আনলক</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>চ্যাপ্টার-ওয়াইজ ও সাবজেক্ট-ওয়াইজ অ্যাডভান্সড টেস্ট</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>স্বয়ংক্রিয় ভুল সংশোধন খাতা (Mistakes Notebook)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>দ্বিভাষিক সমাধান ও ব্যাখ্যা (বাংলা & English)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>আনলিমিটেড রি-অ্যাটেম্পট ও স্কোর ট্র্যাকিং</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>কোনো বিজ্ঞাপন বা বিভ্রান্তি নেই</span>
                  </div>
                </div>
              </div>

              <Button
                variant="pro"
                className="w-full mt-8 font-extrabold text-xs sm:text-sm py-3"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                এখনই প্রো পাস নিয়ে প্রস্তুতি শুরু করুন
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FAQ SECTION
          ========================================================================= */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="info" className="font-bold px-3 py-1">
              সাধারণ প্রশ্নোত্তর
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              আপনার মনে কি কোনো প্রশ্ন আছে?
            </h2>
            <p className="text-sm text-slate-500">
              PracticeKoro সম্পর্কে অ্যাসপিরেন্টদের বহুল জিজ্ঞাসিত প্রশ্নের উত্তর
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-900 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-4 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FINAL CALL TO ACTION
          ========================================================================= */}
      <section className="py-20 bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <Badge variant="premium" className="font-bold px-3 py-1">
            স্বপ্নপূরণের যাত্রা শুরু হোক
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            আজই শুরু করুন আপনার সফলতার নির্ভুল প্রস্তুতি
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-2xl mx-auto leading-relaxed">
            হাজার হাজার অ্যাসপিরেন্টের মতো আপনিও প্রতিদিন মক টেস্ট দিন, ভুল সংশোধন করুন এবং পরীক্ষার হলের ভয় দূর করুন।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-100 font-extrabold px-8 py-3.5 shadow-xl text-sm"
              rightIcon={<ArrowRight className="w-4 h-4 text-brand-700" />}
            >
              ফ্রি অ্যাকাউন্ট খুলুন
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-white hover:bg-white/10 font-bold px-8 py-3.5 border border-white/30 text-sm"
            >
              আগের অ্যাকাউন্ট থাকলে লগইন করুন
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. PUBLIC FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="/logo-icon-transparent.png"
                  alt="PracticeKoro"
                  className="w-8 h-8 object-contain rounded-xl"
                />
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Practice<span className="text-brand-500">Koro</span>
                </span>
              </Link>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                পশ্চিমবঙ্গের সরকারি চাকরি পরীক্ষার্থীদের জন্য তৈরি ফোকাসড মক টেস্ট ও ভুল সংশোধন প্ল্যাটফর্ম।
              </p>
              <p className="text-[11px] text-slate-500">
                WBP • Kolkata Police • WBCS • WBPSC Clerkship • Railway • Primary TET
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-white">ন্যাভিগেশন</p>
              <ul className="space-y-2">
                <li><a href="#exams" className="hover:text-white transition-colors">পরীক্ষাসমূহ (Exams)</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">বৈশিষ্ট্যসমূহ</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">প্রো পাস সাবস্ক্রিপশন</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">সাধারণ প্রশ্নোত্তর</a></li>
              </ul>
            </div>

            {/* Col 3: Legal & Support */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-white">যোগাযোগ ও সহায়তা</p>
              <ul className="space-y-2">
                <li><span className="text-slate-400">সাপোর্ট ইমেইল:</span> support@practicekoro.com</li>
                <li><Link to="/login" className="hover:text-white transition-colors">লগইন করুন</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">নতুন অ্যাকাউন্ট</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">সাবস্ক্রিপশন পলিসি</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} PracticeKoro. All rights reserved. Made for West Bengal Aspirants.</p>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">v2.0 Production Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
