import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  
  Crown,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  BarChart3,
  RefreshCw,
  Lock,
  Play,
  CheckCircle2,
  Target
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const exams = [
    {
      title: 'WBP Constable & Lady Constable',
      category: 'পশ্চিমবঙ্গ পুলিশ',
      icon: '/images/exams/icon_wbp_clean.png',
      fallbackIcon: '👮',
      questions: 85,
      duration: '60 মিনিট',
      negativeMarking: '-0.25',
      badge: 'জনপ্রিয়',
      badgeVariant: 'info' as const,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Kolkata Police SI & Sergeant',
      category: 'কলকাতা পুলিশ',
      icon: '/images/exams/icon_kolkata_police.png',
      fallbackIcon: '⭐',
      questions: 100,
      duration: '90 মিনিট',
      negativeMarking: '-0.25',
      badge: 'নতুন ভ্যাকেন্সি',
      badgeVariant: 'success' as const,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'WBCS Prelims (Executive)',
      category: 'পশ্চিমবঙ্গ সিভিল সার্ভিস',
      icon: '/images/exams/wbcs_emblem.png',
      fallbackIcon: '🏛️',
      questions: 200,
      duration: '150 মিনিট',
      negativeMarking: '-0.33',
      badge: 'প্রিমিয়াম',
      badgeVariant: 'warning' as const,
      color: 'from-amber-600 to-orange-700',
    },
    {
      title: 'WBPSC Clerkship & Miscellaneous',
      category: 'পাবলিক সার্ভিস কমিশন',
      icon: '/images/exams/icon_wbssc_clean.png',
      fallbackIcon: '📝',
      questions: 100,
      duration: '90 মিনিট',
      negativeMarking: '-0.25',
      badge: 'সিলেবাস আপডেট',
      badgeVariant: 'info' as const,
      color: 'from-purple-600 to-indigo-700',
    },
    {
      title: 'Railway Group D & NTPC',
      category: 'রেলওয়ে রিক্রুটমেন্ট বোর্ড',
      icon: '/images/exams/icon_railway.png',
      fallbackIcon: '🚆',
      questions: 100,
      duration: '90 মিনিট',
      negativeMarking: '-0.33',
      badge: 'অল ইন্ডিয়া',
      badgeVariant: 'default' as const,
      color: 'from-rose-600 to-red-700',
    },
    {
      title: 'Primary & Upper Primary TET',
      category: 'শিক্ষক নিয়োগ পরীক্ষা',
      icon: '/images/exams/icon_primary_tet.png',
      fallbackIcon: '📚',
      questions: 150,
      duration: '150 মিনিট',
      negativeMarking: 'কোনো নেগেটিভ নেই',
      badge: 'টেট স্পেশাল',
      badgeVariant: 'success' as const,
      color: 'from-cyan-600 to-blue-700',
    },
  ];

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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo-transparent.png"
                alt="PracticeKoro"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#exams" className="hover:text-brand-600 transition-colors">
                পরীক্ষাসমূহ (Exams)
              </a>
              <a href="#features" className="hover:text-brand-600 transition-colors">
                বৈশিষ্ট্য (Features)
              </a>
              <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
                কীভাবে কাজ করে
              </a>
              <a href="#pricing" className="hover:text-brand-600 transition-colors">
                প্রো পাস (Pricing)
              </a>
              <a href="#faq" className="hover:text-brand-600 transition-colors">
                FAQ
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600"
              >
                লগইন (Sign In)
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="text-xs sm:text-sm font-bold shadow-sm shadow-brand-600/20"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                ফ্রি শুরু করুন
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
                <span>পশ্চিমবঙ্গ সরকারি চাকরি পরীক্ষার ১ নম্বর মক টেস্ট প্ল্যাটফর্ম</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                স্বপ্নপূরণের প্রস্তুতি হোক{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                  নির্ভুল ও স্মার্ট
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                WBP Constable, KP SI, WBCS, WBPSC Clerkship ও রেলওয়ে পরীক্ষার জন্য বাস্তব পরীক্ষার ইন্টারফেসে মক টেস্ট দিন। স্বয়ংক্রিয় ভুল সংশোধন খাতা ও বিস্তারিত বাংলা সমাধানের সাথে আপনার প্রস্তুতিকে নিয়ে যান সফলতার শীর্ষে।
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto text-sm sm:text-base font-bold shadow-lg shadow-brand-600/25 px-8 py-3.5"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  বিনামূল্যে মক টেস্ট দিন
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const elem = document.getElementById('exams');
                    elem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6 py-3.5 border-slate-300 hover:bg-slate-50"
                  leftIcon={<Layers className="w-4 h-4 text-slate-500" />}
                >
                  এক্সাম লিস্ট দেখুন
                </Button>
              </div>

              {/* Trust Indicators Strip */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">১০,০০০+</p>
                  <p className="text-xs font-semibold text-slate-500">অ্যাসপিরেন্টস</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">১০০%</p>
                  <p className="text-xs font-semibold text-slate-500">বাংলা ও ইংরেজি</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-brand-600">₹২৯৯</p>
                  <p className="text-xs font-semibold text-slate-500">৩৬৫ দিন প্রো পাস</p>
                </div>
              </div>
            </div>

            {/* Right: Simulated Real Exam Runner Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200/80">
                {/* Header of Simulated Exam */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo-icon-transparent.png"
                      alt="PracticeKoro"
                      className="w-5 h-5 object-contain rounded-md"
                    />
                    <span className="text-xs font-bold text-slate-800">WBP Constable Mock Test #01</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-mono text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>42:18</span>
                  </div>
                </div>

                {/* Simulated Question Card */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Question 14 of 85</span>
                    <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-bold">বাংলা • English</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    হরপ্পা সভ্যতার প্রাচীন বন্দর শহর কোনটি ছিল?
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Which was the ancient port city of the Indus Valley Civilization?
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                      <span>A. মহেঞ্জোদারো (Mohenjo-daro)</span>
                    </div>
                    <div className="p-2.5 rounded-xl border-2 border-brand-600 bg-brand-50/70 text-xs font-bold text-brand-900 flex items-center justify-between">
                      <span>B. লোথাল (Lothal)</span>
                      <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                      <span>C. কালিবঙ্গান (Kalibangan)</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                      <span>D. বানাওয়ালি (Banawali)</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Palette Preview */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 font-medium">১২ উত্তর দেওয়া</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-600 font-medium">২ রিভিউ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-slate-600 font-medium">৭১ বাকি</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl py-2 px-3.5 shadow-xl flex items-center gap-2 border border-white/20">
                <Crown className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold">ভুল সংশোধন খাতা অন্তর্ভুক্ত</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. POPULAR EXAM CATEGORIES SECTION
          ========================================================================= */}
      <section id="exams" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="info" className="font-bold px-3 py-1">
              টার্গেট পরীক্ষা
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              পশ্চিমবঙ্গের শীর্ষ সরকারি চাকরির মক টেস্ট
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              নির্দিষ্ট সিলেবাস, লেটেস্ট কোয়েশ্চেন প্যাটার্ন এবং এক্সপার্টদের দ্বারা প্রস্তুত মক টেস্ট সিরিজ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                      <img
                        src={exam.icon}
                        alt={exam.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to text icon if image fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <Badge variant={exam.badgeVariant} className="font-bold text-[11px]">
                      {exam.badge}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-brand-600 mb-1">
                    {exam.category}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-3">
                    {exam.title}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center my-3 bg-slate-50/60 rounded-xl">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">প্রশ্ন</p>
                      <p className="text-xs font-bold text-slate-800">{exam.questions}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">সময়</p>
                      <p className="text-xs font-bold text-slate-800">{exam.duration}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">নেগেটিভ</p>
                      <p className="text-xs font-bold text-rose-600">{exam.negativeMarking}</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 text-xs font-bold"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  মক টেস্ট শুরু করুন
                </Button>
              </div>
            ))}
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
