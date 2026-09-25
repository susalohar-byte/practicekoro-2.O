import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from './Reveal';
import {
  Crown,
  ArrowRight,
  BarChart3,
  Target,
  FileText,
  Zap,
  ShieldCheck,
  Users,
  Trophy,
  Star,
  Moon,
  ChevronRight,
} from 'lucide-react';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="pro-pass"
      className="relative py-16 sm:py-20 lg:py-24 bg-[#F8FAFC] dark:bg-slate-950 scroll-mt-24 overflow-hidden"
    >
      {/* Anchor for backward compatibility with #pricing */}
      <span id="pricing" className="absolute -top-24 pointer-events-none" aria-hidden="true" />

      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* ==============================================================
                LEFT COLUMN: Content, Feature Grid, Pricing Card & Trust Bar
                ============================================================== */}
            <div className="lg:col-span-7 flex flex-col space-y-6 sm:space-y-7 text-center sm:text-left">
              {/* Eyebrow Pill */}
              <div className="flex justify-center sm:justify-start">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-[#0062FF] dark:text-blue-400 text-xs font-black tracking-wider uppercase shadow-2xs">
                  <Crown className="w-3.5 h-3.5 fill-[#0062FF] dark:fill-blue-400 text-[#0062FF] dark:text-blue-400" />
                  <span>PRO PASS</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5">
                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                  One Pass.{' '}
                  <span className="text-[#0062FF] dark:text-blue-400">
                    All Premium Tests.
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl mx-auto sm:mx-0">
                  A single All-Access pass for every exam — WBP, KP, WBCS, WBPSC, Railway &amp; more.
                </p>
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* 1. Unlimited mock tests */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#0062FF] dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                      Unlimited mock tests
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Practice without limits
                    </p>
                  </div>
                </div>

                {/* 2. Detailed analytics & rank */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                      Detailed analytics &amp; rank
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Track your progress
                    </p>
                  </div>
                </div>

                {/* 3. Topic-wise & PYQ tests */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                      Topic-wise &amp; PYQ tests
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Focus on weak areas
                    </p>
                  </div>
                </div>

                {/* 4. Priority support */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                      Priority support
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Get help whenever you need
                    </p>
                  </div>
                </div>
              </div>

              {/* Blue Pricing Banner Card */}
              <div className="rounded-2xl bg-gradient-to-r from-[#0062FF] via-[#0055EE] to-[#0047D4] p-5 sm:p-6 text-white shadow-xl shadow-blue-600/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-1.5 text-center sm:text-left z-10">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-100">
                    <Crown className="w-3.5 h-3.5 fill-blue-200 text-blue-200" />
                    <span>ALL-ACCESS PRO PASS</span>
                  </div>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
                      ₹199
                    </span>
                    <span className="text-sm font-semibold text-blue-100">/ 365 days</span>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/30 text-emerald-300 text-xs font-black">
                      ₹0.54/day
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto z-10">
                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0062FF] font-black text-sm sm:text-[15px] shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Get Pro Now</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 stroke-[2.5]" />
                  </button>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-blue-100 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>One payment • Full year • All exams</span>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-left">
                {/* 1. Aspirants */}
                <div className="flex items-center gap-2.5">
                  <Users className="w-6 h-6 text-[#0062FF] dark:text-blue-400 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                      10,000+ Aspirants
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Already Trust Us
                    </p>
                  </div>
                </div>

                {/* 2. Exams */}
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-6 h-6 text-amber-500 fill-amber-400/30 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                      All Major Exams
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      In One Pass
                    </p>
                  </div>
                </div>

                {/* 3. Safe & Secure */}
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 fill-emerald-400/20 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                      Safe &amp; Secure
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      One Time Payment
                    </p>
                  </div>
                </div>

                {/* 4. Most Loved */}
                <div className="flex items-center gap-2.5">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                      Most Loved
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      By Aspirants
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==============================================================
                RIGHT COLUMN: Mobile Phone Mockup & Orbit Floating Icons
                ============================================================== */}
            <div className="lg:col-span-5 flex justify-center items-center relative py-6 select-none">
              {/* Orbiting dotted lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg
                  className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] text-blue-300 dark:text-blue-900"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="170"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="6 8"
                    opacity="0.45"
                  />
                  <circle
                    cx="200"
                    cy="200"
                    r="195"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 8"
                    opacity="0.3"
                  />
                </svg>
              </div>

              {/* Floating Orbit Badges */}
              {/* 1. Purple Chart Badge - Mid-Left */}
              <div className="absolute top-[28%] -left-2 sm:-left-4 w-12 h-12 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl border border-white/60 dark:border-slate-700 flex items-center justify-center z-20 transition-transform hover:scale-110">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>

              {/* 2. Emerald Target Badge - Lower-Left */}
              <div className="absolute bottom-[24%] -left-1 sm:left-2 w-12 h-12 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl border border-white/60 dark:border-slate-700 flex items-center justify-center z-20 transition-transform hover:scale-110">
                <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* 3. Amber Zap Badge - Top-Right */}
              <div className="absolute top-[20%] -right-2 sm:right-2 w-12 h-12 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl border border-white/60 dark:border-slate-700 flex items-center justify-center z-20 transition-transform hover:scale-110">
                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>

              {/* 4. Blue File Badge - Lower-Right */}
              <div className="absolute bottom-[28%] -right-2 sm:-right-4 w-12 h-12 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl border border-white/60 dark:border-slate-700 flex items-center justify-center z-20 transition-transform hover:scale-110">
                <FileText className="w-6 h-6 text-[#0062FF] dark:text-blue-400" />
              </div>

              {/* The Realistic Mobile Phone Frame */}
              <div className="relative w-[285px] sm:w-[315px] rounded-[3.2rem] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-[3px] border-slate-600/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.15)_inset] z-10">
                {/* Top Dynamic Island */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800/60" />
                </div>

                {/* Side Buttons */}
                <div className="absolute -left-[4.5px] top-24 w-[2.5px] h-10 bg-slate-600 rounded-l-xs" />
                <div className="absolute -left-[4.5px] top-38 w-[2.5px] h-10 bg-slate-600 rounded-l-xs" />
                <div className="absolute -right-[4.5px] top-28 w-[2.5px] h-14 bg-slate-600 rounded-r-xs" />

                {/* Inner Screen */}
                <div className="rounded-[2.6rem] overflow-hidden bg-white text-slate-900 flex flex-col pt-7 pb-4 px-3.5 space-y-3 shadow-inner">
                  {/* Phone Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[#0062FF]">
                      <Crown className="w-3.5 h-3.5 fill-[#0062FF]" />
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-bold text-slate-900 leading-tight">Pro Pass</div>
                      <div className="text-[9px] text-slate-400 font-medium">One Pass, All Premium Tests.</div>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center text-slate-400">
                      <Moon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Student Photo Card */}
                  <div className="rounded-xl overflow-hidden h-28 relative shadow-xs border border-slate-100">
                    <img
                      src="/images/hero_student_study_bg.jpg"
                      alt="Student studying with PracticeKoro"
                      className="w-full h-full object-cover object-[center_35%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* 4 Feature List Rows with Chevrons */}
                  <div className="space-y-1.5">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#0062FF] shrink-0" />
                        <span>Unlimited mock tests</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Detailed analytics &amp; rank</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Topic-wise &amp; PYQ tests</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        <span>Priority support</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Phone Bottom Price & CTA */}
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900">₹199</span>
                        <span className="text-[10px] text-slate-400 font-semibold">/ 365 days</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
                        ₹0.54/day
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/subscription')}
                      className="w-full py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0052E0] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/30 transition-all cursor-pointer"
                    >
                      <span>Get Pro Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export const ProPass = Pricing;
