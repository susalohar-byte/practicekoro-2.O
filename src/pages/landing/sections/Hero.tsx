import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SUPPORTED_EXAM_CATEGORIES } from '../data';
import { Reveal } from './Reveal';
import {
  GraduationCap,
  LayoutGrid,
  BookOpen,
  ArrowRight,
  Star,
  FileText,
  BarChart3,
  Target,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-screen min-h-[100dvh] flex flex-col justify-between pt-24 pb-4 sm:pt-28 sm:pb-6 lg:pt-30 lg:pb-6 bg-slate-950 text-white">
      {/* Background Lifestyle Video of Indian Aspirant Studying */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/hero_student_study_bg.jpg"
          className="w-full h-full object-cover object-[center_35%] opacity-90 transition-opacity duration-300"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/Hero video.mp4" type="video/mp4" />
          <source src="/Hero%20video.mp4" type="video/mp4" />
          {/* Fallback image if video cannot be played */}
          <img
            src="/images/hero_student_study_bg.jpg"
            alt="Government Exam Aspirant Studying at Home"
            className="w-full h-full object-cover object-[center_35%]"
          />
        </video>
        {/* Dark cinematic gradient scrim - replaces white blur, keeps video visible, gives 100% text focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/65" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Main Content Column */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center my-auto py-2">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl text-center">
            {/* Top Eyebrow Badge */}
            <Reveal>
              <div className="inline-flex items-center justify-center gap-2">
                <span className="text-amber-400 font-bold select-none text-xs sm:text-sm">✨</span>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs sm:text-sm font-semibold text-slate-100 shadow-lg shadow-black/20">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>For Government Job Exam Aspirants</span>
                </div>
                <span className="text-amber-400 font-bold select-none text-xs sm:text-sm">✨</span>
              </div>
            </Reveal>

            {/* Main Headline */}
            <Reveal delay={80}>
              <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-[3.35rem] font-extrabold text-white tracking-tight leading-[1.22] font-headline text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                আত্মবিশ্বাসের সাথে জয় <br className="hidden sm:inline" />
                করো স্বপ্নের সরকারি{' '}
                <span className="text-blue-400 font-extrabold drop-shadow-[0_0_25px_rgba(96,165,250,0.6)]">
                  চাকরি।
                </span>
              </h1>
            </Reveal>

            {/* Subheadline */}
            <Reveal delay={160}>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-[17px] text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium text-balance drop-shadow-sm">
                আসল পরীক্ষার ধাঁচে মক টেস্ট, ১০+ বছরের সমাধানসহ PYQ ও টপিক-ভিত্তিক প্র্যাকটিস। WBP, WBPSC, WBSSC, Primary TET ও Railways-এর জন্য।
              </p>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={240}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate(user ? dashboardUrl : '/register')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/35 hover:shadow-blue-500/50 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('exams');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 backdrop-blur-md shadow-md font-bold text-sm sm:text-base transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span>Explore Exams &amp; Tests</span>
                </button>
              </div>
            </Reveal>

            {/* Rating / Social Proof Pill */}
            <Reveal delay={320}>
              <div className="mt-5 sm:mt-6 inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 px-4 sm:px-5 py-2.5 sm:py-3 shadow-xl shadow-black/25 mx-auto">
                <div className="flex items-center -space-x-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center border-2 border-slate-900 shadow-2xs">
                    S
                  </span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center border-2 border-slate-900 shadow-2xs">
                    A
                  </span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center border-2 border-slate-900 shadow-2xs">
                    R
                  </span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center border-2 border-slate-900 shadow-2xs">
                    P
                  </span>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-900 shadow-2xs">
                    10K+
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="ml-1 text-xs sm:text-sm font-bold text-white">
                      Loved by 10,000+ Aspirants
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-slate-300 font-medium">
                    Free forever to start • Instant Statewide Rank • Detailed Analysis
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Three Glassmorphic Feature Cards */}
            <Reveal delay={400}>
              <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto">
                <div className="rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-3 sm:p-3.5 shadow-xl shadow-black/20 flex items-center gap-3 text-left transition-all hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      Full-Length Mock Tests
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Exam pattern based
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-3 sm:p-3.5 shadow-xl shadow-black/20 flex items-center gap-3 text-left transition-all hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      10+ Years Solved PYQs
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      With detailed solutions
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-3 sm:p-3.5 shadow-xl shadow-black/20 flex items-center gap-3 text-left transition-all hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      Topic-wise Practice
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Strengthen weak areas
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Exam marquee strip */}
      <Reveal delay={150}>
        <div className="relative w-full pb-3 sm:pb-5 mt-auto">
          {/* Centered Floating Badge */}
          <div className="flex justify-center -mb-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/95 border border-slate-700 shadow-md text-[11px] font-extrabold tracking-wider text-amber-400 uppercase">
              <span>🔥</span>
              <span>POPULAR EXAMS</span>
            </div>
          </div>

          {/* Marquee row with right arrow navigation button */}
          <div className="relative flex items-center">
            <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_92%,transparent)] py-2">
              <div className="flex w-max animate-marquee gap-3 pr-3">
                {[...SUPPORTED_EXAM_CATEGORIES, ...SUPPORTED_EXAM_CATEGORIES].map((exam, i) => (
                  <span
                    key={`${exam}-${i}`}
                    aria-hidden={i >= SUPPORTED_EXAM_CATEGORIES.length}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs sm:text-sm font-bold text-slate-100 whitespace-nowrap shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{exam}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right arrow button */}
            <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('exams');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                aria-label="View more exams"
                className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 shadow-md flex items-center justify-center text-white hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
