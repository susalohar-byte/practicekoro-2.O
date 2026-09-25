import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { SUPPORTED_EXAM_CATEGORIES } from '../data';
import { Reveal } from './Reveal';
import { testimonials } from '../data';
import {
  ArrowRight,
  CheckCircle2,
  Target,
  FileText,
  Sparkles,
  Star,
} from 'lucide-react';



export const Hero: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf2fe] via-[#f7faff] to-white dark:from-slate-950 dark:via-[#0a1230] dark:to-slate-950 pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
      {/* Mesh gradient orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/10 blur-3xl pointer-events-none"
      />
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
        <div className="flex flex-col items-center">
          {/* Centered Content Column */}
          <div className="w-full max-w-3xl text-center">
            {/* Eyebrow */}
            <Reveal>
              <div className="inline-flex rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-[1.5px] shadow-md shadow-blue-500/20">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('hero.eyebrow')}</span>
                </div>
              </div>
            </Reveal>

            {/* Main Headline */}
            <Reveal delay={90}>
              <h1
                aria-label={`${t('hero.headlineLead')} ${t('hero.headlineHighlight')}${t('hero.headlineTail')}`}
                className="mt-5 text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.18] text-balance font-letterpress"
              >
                {t('hero.headlineLead')}{' '}
                <span className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  {t('hero.headlineHighlight')}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 220 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 w-full h-2.5 text-blue-500/60"
                  >
                    <path
                      d="M3 9 C 60 3, 160 3, 217 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                {t('hero.headlineTail')}
              </h1>
            </Reveal>

            {/* Subheadline */}
            <Reveal delay={180}>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal text-balance">
                {t('hero.subLead')}{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{t('hero.subExams')}</span>
                {t('hero.subMid')}{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">{t('hero.subBilingual')}</span>
                {t('hero.subEnd')}
              </p>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={260}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
              {user ? (
                <InteractiveHoverButton
                  text={t('hero.ctaDashboard')}
                  onClick={() => navigate(dashboardUrl)}
                  className="w-48 h-12 text-sm sm:text-base border-blue-200 text-blue-600 shadow-md"
                />
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 text-sm sm:text-base gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative">{t('hero.ctaPrimary')}</span>
                  <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('exams');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-0.5 font-bold px-7 py-3.5 rounded-xl text-sm sm:text-base cursor-pointer transition-all"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </div>
            </Reveal>

            {/* Trust row */}
            <Reveal delay={340}>
            <div className="mt-7 inline-flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur px-5 py-3.5 shadow-xs mx-auto">
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
                <span className="w-8 h-8 -ml-2.5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center">
                  10k+
                </span>
              </div>
              <div className="hidden sm:block w-px self-stretch bg-slate-200 dark:bg-slate-800" />
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
            </Reveal>

            {/* Feature Pills */}
            <Reveal delay={420}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: FileText, label: 'Full-Length Mocks' },
                { icon: CheckCircle2, label: '10+ Yrs Solved PYQs' },
                { icon: Target, label: 'Topic Practice' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5 transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            </Reveal>
          </div>

        </div>

        {/* Exam marquee strip */}
        <Reveal delay={150}>
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
        </Reveal>
      </div>
    </section>
  );
};
