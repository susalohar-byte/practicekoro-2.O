import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { SUPPORTED_EXAM_CATEGORIES } from '../data';
import { testimonials } from '../data';
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Target,
  FileText,
  Sparkles,
  Star,
  Languages,
  Flame,
  Trophy,
  Wifi,
  Bell,
  Home,
  BookOpen,
  User,
  Zap,
} from 'lucide-react';

const PHONE_EXAMS = [
  {
    name: 'WBP Constable 2025',
    sub: 'West Bengal Police',
    tests: '42 Mocks',
    icon: '/images/exams/emblem_wbp.svg',
    badge: 'Popular',
  },
  {
    name: 'WBPSC Clerkship',
    sub: 'Public Service Comm.',
    tests: '35 Mocks',
    icon: '/images/exams/emblem_wbpsc.svg',
    badge: 'Hot',
  },
  {
    name: 'RRB Railway Group D',
    sub: 'Indian Railways',
    tests: '28 Mocks',
    icon: '/images/exams/emblem_railway.svg',
    badge: 'Bengali',
  },
  {
    name: 'SSC GD Constable',
    sub: 'Staff Selection Comm.',
    tests: '25 Mocks',
    icon: '/images/exams/emblem_ssc.svg',
  },
];

export const Hero: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pk-blue-light/50 via-white to-white pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
      {/* Mesh gradient orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-pk-primary/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 -right-32 w-[460px] h-[460px] bg-pk-primary-interactive/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-pk-primary-bright/10 rounded-full blur-3xl pointer-events-none"
      />
      {/* Dot grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,116,139,0.22)_1px,transparent_0)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)] pointer-events-none"
      />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-blue-200 dark:border-slate-800 text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-slate-200 uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>West Bengal's #1 Govt Exam Practice Platform</span>
            </div>

            {/* Main Headline */}
            <h1
              aria-label="আত্মবিশ্বাসের সাথে জয় করো স্বপ্নের সরকারি চাকরি।"
              className="mt-5 text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.25]"
            >
              আত্মবিশ্বাসের সাথে জয় করো{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                স্বপ্নের সরকারি চাকরি
              </span>
              ।
            </h1>

            {/* Subheadline */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              আসল পরীক্ষার ধাঁচে মক টেস্ট, ১০+ বছরের সমাধানসহ PYQ ও টপিক-ভিত্তিক
              প্র্যাকটিস{' '}
              <span className="font-semibold text-slate-900 dark:text-white">WBP, WBPSC, WBSSC, Primary TET ও Railways</span>-এর
              জন্য —{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">বাংলা ও English</span>-এ।
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              {user ? (
                <InteractiveHoverButton
                  text="Go to Dashboard"
                  onClick={() => navigate(dashboardUrl)}
                  className="w-48 h-12 text-sm sm:text-base border-blue-200 text-blue-600 shadow-md"
                />
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 text-sm sm:text-base gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Start Free Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('exams');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold px-7 py-3.5 rounded-xl text-sm sm:text-base cursor-pointer"
              >
                Explore Exams &amp; Tests
              </Button>
            </div>

            {/* Trust row */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center">
                {testimonials.map((t, i) => (
                  <img
                    key={t.name}
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-xs first:ml-0 -ml-2.5"
                    style={{ zIndex: testimonials.length - i }}
                  />
                ))}
                <span className="w-8 h-8 -ml-2.5 rounded-full bg-blue-600 text-white text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center">
                  10k+
                </span>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Loved by 10,000+ Aspirants
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                  Free forever to start • Instant Statewide Rank &amp; Analysis
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {[
                { icon: FileText, label: 'Full-Length Mocks' },
                { icon: CheckCircle2, label: '10+ Yrs Solved PYQs' },
                { icon: Target, label: 'Topic Practice' },
                { icon: Languages, label: 'বাংলা ও English' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Graphic Column: Simplified, Compact Smartphone Mockup */}
          <div className="lg:col-span-6 flex items-center justify-center relative py-4 lg:py-0">
            {/* Silhouette Map of West Bengal */}
            <div className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-[210px] sm:w-[260px] opacity-20 dark:opacity-10 pointer-events-none select-none z-0">
              <img
                src="/images/west_bengal_silhouette.svg"
                alt=""
                aria-hidden="true"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Ambient Device Glow */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-purple-500/15 rounded-[2.8rem] blur-2xl -z-10 opacity-60" />

            {/* Phone & Floating Badges Relative Container */}
            <div className="relative w-fit mx-auto">
              {/* Floating Glass Card - Avg Score (Left) */}
              <div className="absolute right-[calc(100%+8px)] top-10 z-30 animate-float hidden md:flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-lg pointer-events-none select-none">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xs shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </span>
                <span>
                  <span className="block text-xs font-black text-slate-900 dark:text-white leading-none">
                    78%
                  </span>
                  <span className="block text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                    Avg. Mock Score
                  </span>
                </span>
              </div>

              {/* Floating Glass Card - Streak (Right) */}
              <div className="absolute left-[calc(100%+8px)] bottom-12 z-30 animate-float-soft hidden md:flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-lg pointer-events-none select-none">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-xs shrink-0">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </span>
                <span>
                  <span className="block text-xs font-black text-slate-900 dark:text-white leading-none">
                    12-Day
                  </span>
                  <span className="block text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                    Active Streak 🔥
                  </span>
                </span>
              </div>

              {/* Sleek, Simplified & Smaller Smartphone Frame */}
              <div className="relative z-10 w-[240px] sm:w-[255px] md:w-[265px] h-[480px] sm:h-[505px] bg-slate-900 p-[7px] sm:p-[8px] rounded-[2.6rem] sm:rounded-[2.8rem] shadow-[0_20px_50px_-10px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.12)_inset] ring-1 ring-slate-800/90 select-none">
                {/* Screen Glass Surface */}
                <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[2.1rem] sm:rounded-[2.3rem] overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 shadow-inner">
                  {/* Subtle Screen Gloss Glare */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />

                  {/* 1. iOS Status Bar & Minimal Camera Pill */}
                  <div className="relative z-20 pt-2 px-4 pb-0.5 flex items-center justify-between text-slate-800 dark:text-slate-200 shrink-0">
                    {/* Time */}
                    <span className="text-[9.5px] font-semibold tracking-tight">9:41</span>

                    {/* Minimal Sleek Camera Notch Pill */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full flex items-center justify-center shadow-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 ml-auto mr-1.5" />
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Wifi className="w-2.5 h-2.5" />
                      {/* Battery */}
                      <div className="w-3.5 h-1.5 border border-slate-700 dark:border-slate-300 rounded-[2px] p-[0.5px] flex items-center">
                        <div className="w-2 h-0.5 bg-slate-800 dark:bg-slate-200 rounded-[0.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Mobile App Header */}
                  <div className="px-3 pt-0.5 pb-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-[9px] shadow-xs">
                        PK
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9.5px] font-black text-slate-900 dark:text-white">
                            PracticeKoro
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[8px] text-slate-400 font-medium leading-none">
                          🎯 WBP Constable 2025
                        </p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 relative">
                      <Bell className="w-2.5 h-2.5" />
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>
                  </div>

                  {/* 3. Screen Main Content (Clean & Simple App Body) */}
                  <div className="px-2.5 py-1.5 flex-1 flex flex-col justify-between space-y-1.5 overflow-hidden">
                    {/* Live Mock Hero Banner */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-2.5 text-white shadow-md shadow-blue-500/15 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[7.5px] font-bold bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE MOCK TEST
                        </span>
                        <span className="text-[8px] text-blue-100 font-medium">1,420 Active</span>
                      </div>
                      <p className="mt-1 text-[10.5px] font-black tracking-tight leading-snug">
                        WBP Constable Prelims #01
                      </p>
                      <p className="text-[8.5px] text-blue-100/90 font-medium mt-0.5">
                        85 Questions • 60 Mins • বাংলা ও English
                      </p>
                      <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-white/15">
                        <span className="text-[8.5px] font-bold text-white/90">Free Test</span>
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-white text-blue-600 px-2 py-0.5 rounded-md shadow-xs">
                          Start Test <ArrowRight className="w-2 h-2" />
                        </span>
                      </div>
                    </div>

                    {/* Quick Practice 3-Grid */}
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        {
                          icon: Zap,
                          label: 'Speed Test',
                          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
                        },
                        {
                          icon: Target,
                          label: 'Topic Quiz',
                          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
                        },
                        {
                          icon: BookOpen,
                          label: 'PYQ Bank',
                          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                        },
                      ].map(({ icon: Icon, label, color }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center justify-center py-1 px-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-2xs"
                        >
                          <span
                            className={`w-4 h-4 rounded-md ${color} flex items-center justify-center mb-0.5`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                          </span>
                          <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Popular Exams List (2 crisp, clean rows) */}
                    <div>
                      <div className="flex items-center justify-between mb-1 px-0.5">
                        <span className="text-[9px] font-extrabold text-slate-800 dark:text-slate-200">
                          Popular Exams
                        </span>
                        <span className="text-[8px] font-bold text-blue-600">
                          View All
                        </span>
                      </div>
                      <div className="space-y-1">
                        {PHONE_EXAMS.slice(0, 2).map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-0.5 shrink-0">
                                <img
                                  src={item.icon}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-3.5 h-3.5 object-contain"
                                />
                              </span>
                              <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {item.name}
                                </p>
                                <p className="text-[7.5px] text-slate-400 leading-none mt-0.5">
                                  {item.tests} • {item.sub}
                                </p>
                              </div>
                            </div>
                            {item.badge ? (
                              <span className="text-[7px] font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md">
                                {item.badge}
                              </span>
                            ) : (
                              <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile CTA Button */}
                    <button
                      onClick={() => navigate(dashboardUrl)}
                      className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[9px] font-bold shadow-md shadow-blue-500/15 flex items-center justify-center gap-1 hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      <span>Explore All 500+ Mocks</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* 4. Bottom Tab Bar & Home Indicator */}
                  <div className="pt-1 pb-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 shrink-0">
                    <div className="flex items-center justify-around px-2 text-slate-400">
                      <div className="flex flex-col items-center gap-0.5 text-blue-600">
                        <Home className="w-3 h-3" />
                        <span className="text-[7px] font-bold">Home</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <FileText className="w-3 h-3" />
                        <span className="text-[7px] font-medium">Tests</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Target className="w-3 h-3" />
                        <span className="text-[7px] font-medium">Practice</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <User className="w-3 h-3" />
                        <span className="text-[7px] font-medium">Profile</span>
                      </div>
                    </div>
                    {/* iOS Home Indicator Bar */}
                    <div className="w-16 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-1 mb-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam marquee strip */}
        <div className="relative mt-12 sm:mt-16 -mx-4 sm:mx-0">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-3 pr-3">
              {[...SUPPORTED_EXAM_CATEGORIES, ...SUPPORTED_EXAM_CATEGORIES].map((exam, i) => (
                <span
                  key={`${exam}-${i}`}
                  aria-hidden={i >= SUPPORTED_EXAM_CATEGORIES.length}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-xs font-bold text-slate-600 whitespace-nowrap shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {exam}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
