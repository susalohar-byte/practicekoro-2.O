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
    icon: '/images/exams/wbp_police.png',
    badge: 'Popular',
  },
  {
    name: 'Kolkata Police SI',
    sub: 'KP Recruitment Board',
    tests: '28 Mocks',
    icon: '/images/exams/icon_kolkata_police.png',
    badge: 'New',
  },
  {
    name: 'RRB Railway Group D',
    sub: 'Indian Railways',
    tests: '35 Mocks',
    icon: '/images/exams/icon_railway_exact.png',
    badge: 'Bengali',
  },
  {
    name: 'SSC GD Constable',
    sub: 'Staff Selection Comm.',
    tests: '25 Mocks',
    icon: '/images/exams/icon_ssc_clean.png',
  },
];

export const Hero: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
      {/* Mesh gradient orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 -right-32 w-[460px] h-[460px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur border border-blue-100 text-[11px] font-extrabold tracking-[0.12em] text-blue-700 uppercase shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Practice more. Worry less.</span>
            </div>

            {/* Main Headline */}
            <h1
              aria-label="Crack Your Dream Exam."
              className="mt-5 text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-slate-900 tracking-tight leading-[1.08]"
            >
              Crack Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Dream
              </span>{' '}
              Exam.
            </h1>

            {/* Subheadline */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Mock tests, PYQs &amp; topic-wise practice for West Bengal&apos;s competitive exams —
              in <span className="font-semibold text-slate-800">বাংলা ও English</span>.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              {user ? (
                <InteractiveHoverButton
                  text="Dashboard"
                  onClick={() => navigate(dashboardUrl)}
                  className="w-44 h-12 text-sm sm:text-base border-blue-200 text-blue-700 shadow-md"
                />
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 text-sm sm:text-base gap-2 transition-all hover:-translate-y-0.5"
                >
                  <span>Get Started Free</span>
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
                className="border-2 border-blue-500/70 bg-white/70 backdrop-blur text-blue-600 hover:bg-blue-50 font-bold px-7 py-3.5 rounded-xl text-sm sm:text-base"
              >
                View Exams
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
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm first:ml-0 -ml-2.5"
                    style={{ zIndex: testimonials.length - i }}
                  />
                ))}
                <span className="w-8 h-8 -ml-2.5 rounded-full bg-blue-600 text-white text-[10px] font-black border-2 border-white shadow-sm flex items-center justify-center">
                  6+
                </span>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-slate-700">
                    Loved by aspirants
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                  Free to start • No card required
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              {[
                { icon: FileText, label: 'Mock Tests' },
                { icon: CheckCircle2, label: 'PYQs' },
                { icon: Target, label: 'Topic Practice' },
                { icon: Languages, label: 'বাংলা + English' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur border border-blue-100 text-xs font-semibold text-slate-700 shadow-xs"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Graphic Column */}
          <div className="lg:col-span-6 flex items-center justify-center relative py-4 lg:py-0">
            {/* Silhouette Map of West Bengal */}
            <div className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-[260px] sm:w-[320px] opacity-25 dark:opacity-15 pointer-events-none select-none z-0">
              <img
                src="/images/west_bengal_silhouette.svg"
                alt=""
                aria-hidden="true"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Ambient Device Glow */}
            <div className="absolute -inset-2 sm:-inset-6 bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-500/20 rounded-[3.5rem] blur-2xl -z-10 opacity-70" />

            {/* Phone & Floating Badges Relative Container */}
            <div className="relative w-fit mx-auto">
              {/* Floating Glass Card - Avg Score (Left) */}
              <div className="absolute right-[calc(100%+14px)] top-16 z-30 animate-float hidden md:flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pl-2.5 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl pointer-events-none select-none">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </span>
                <span>
                  <span className="block text-base font-black text-slate-900 dark:text-white leading-none">
                    78%
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">
                    Avg. Mock Score
                  </span>
                </span>
              </div>

              {/* Floating Glass Card - Streak (Right) */}
              <div className="absolute left-[calc(100%+14px)] bottom-24 z-30 animate-float-soft hidden md:flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pl-2.5 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl pointer-events-none select-none">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                  <Flame className="w-5 h-5 text-white" />
                </span>
                <span>
                  <span className="block text-base font-black text-slate-900 dark:text-white leading-none">
                    12-Day
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">
                    Active Streak 🔥
                  </span>
                </span>
              </div>

              {/* Realistic Flagship Smartphone Mockup */}
              <div className="relative z-10 w-[290px] sm:w-[315px] md:w-[325px] h-[590px] sm:h-[635px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-[10px] sm:p-[12px] rounded-[3.2rem] sm:rounded-[3.6rem] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_30px_rgba(59,130,246,0.1)] ring-1 ring-slate-800 select-none">
                {/* Hardware Side Buttons */}
                {/* Left: Action Button */}
                <div className="absolute -left-[3.5px] top-24 w-[3.5px] h-6 bg-slate-700 rounded-l-xs shadow-inner" />
                {/* Left: Volume Up */}
                <div className="absolute -left-[3.5px] top-35 w-[3.5px] h-11 bg-slate-700 rounded-l-xs shadow-inner" />
                {/* Left: Volume Down */}
                <div className="absolute -left-[3.5px] top-49 w-[3.5px] h-11 bg-slate-700 rounded-l-xs shadow-inner" />
                {/* Right: Power / Lock Button */}
                <div className="absolute -right-[3.5px] top-32 w-[3.5px] h-14 bg-slate-700 rounded-r-xs shadow-inner" />

                {/* Screen Glass Surface */}
                <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[2.4rem] sm:rounded-[2.8rem] overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 shadow-inner">
                  {/* Subtle Screen Gloss Glare */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />

                  {/* 1. iOS Status Bar & Dynamic Island */}
                  <div className="relative z-20 pt-2.5 px-6 pb-1 flex items-center justify-between text-slate-800 dark:text-slate-200 shrink-0">
                    {/* Time */}
                    <span className="text-[11px] font-semibold tracking-tight">9:41</span>

                    {/* Dynamic Island (Centered Absolutely) */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 sm:w-26 h-5 bg-black rounded-full flex items-center justify-end pr-2.5 shadow-sm">
                      {/* Front Camera Lens */}
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-blue-950" />
                      </div>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Wifi className="w-3 h-3" />
                      {/* Battery */}
                      <div className="w-5 h-2.5 border border-slate-700 dark:border-slate-300 rounded-[3px] p-[1px] flex items-center">
                        <div className="w-3 h-1.5 bg-slate-800 dark:bg-slate-200 rounded-[1.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Mobile App Header */}
                  <div className="px-4 pt-1 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                        PK
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                            PracticeKoro
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">
                          🎯 WBP Constable 2025
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 relative">
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>
                  </div>

                  {/* 3. Screen Main Content (App Body) */}
                  <div className="px-3.5 py-2 flex-1 flex flex-col justify-between space-y-2.5 overflow-hidden">
                    {/* Live Mock Hero Banner */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-3 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE MOCK TEST
                        </span>
                        <span className="text-[9px] text-blue-100 font-medium">1,420 Active</span>
                      </div>
                      <p className="mt-1.5 text-xs font-black tracking-tight leading-snug">
                        WBP Constable Prelims #01
                      </p>
                      <p className="text-[10px] text-blue-100/90 font-medium mt-0.5">
                        85 Questions • 60 Mins • বাংলা + EN
                      </p>
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/15">
                        <span className="text-[10px] font-semibold text-white/90">Free Test</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-blue-600 px-2.5 py-1 rounded-lg shadow-xs hover:bg-blue-50 transition-colors">
                          Start Test <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>

                    {/* Quick Practice Chips */}
                    <div className="grid grid-cols-3 gap-1.5">
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
                          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-2xs"
                        >
                          <span
                            className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center mb-1`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Popular Exams List */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 px-0.5">
                        <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">
                          Popular Exams
                        </span>
                        <span className="text-[9px] font-bold text-blue-600 hover:underline">
                          View All
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {PHONE_EXAMS.slice(0, 3).map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800/80 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-1 shrink-0">
                                <img
                                  src={item.icon}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-5 h-5 object-contain"
                                />
                              </span>
                              <div className="text-left">
                                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {item.name}
                                </p>
                                <p className="text-[9px] text-slate-400">
                                  {item.tests} • {item.sub}
                                </p>
                              </div>
                            </div>
                            {item.badge ? (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md">
                                {item.badge}
                              </span>
                            ) : (
                              <ChevronRight className="w-3 h-3 text-slate-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Full CTA Button */}
                    <button
                      onClick={() => navigate(dashboardUrl)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[11px] font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      <span>Explore All 500+ Mocks</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 4. Bottom Tab Bar & Home Indicator */}
                  <div className="pt-1.5 pb-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 shrink-0">
                    <div className="flex items-center justify-around px-2 text-slate-400">
                      <div className="flex flex-col items-center gap-0.5 text-blue-600">
                        <Home className="w-4 h-4" />
                        <span className="text-[8px] font-bold">Home</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <FileText className="w-4 h-4" />
                        <span className="text-[8px] font-medium">Tests</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Target className="w-4 h-4" />
                        <span className="text-[8px] font-medium">Practice</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <User className="w-4 h-4" />
                        <span className="text-[8px] font-medium">Profile</span>
                      </div>
                    </div>
                    {/* iOS Home Indicator Bar */}
                    <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 mb-0.5" />
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
