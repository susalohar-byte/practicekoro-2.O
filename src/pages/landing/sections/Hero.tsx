import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ArrowRight, ChevronRight, CheckCircle2, Target, FileText, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();

  return (
    <>
      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-white pt-10 pb-16 sm:py-16 lg:py-20">
        {/* Soft background glow */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              {/* Eyebrow / Tagline */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold tracking-wider text-blue-700 uppercase">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>PRACTICE MORE. WORRY LESS.</span>
              </div>

              {/* Main Headline */}
              <h1
                aria-label="Crack Your Dream Exam."
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]"
              >
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
                {user ? (
                  <InteractiveHoverButton
                    text="Dashboard"
                    onClick={() => navigate(dashboardUrl)}
                    className="w-40 sm:w-44 h-12 text-sm sm:text-base border-blue-200 text-blue-700 shadow-md"
                  />
                ) : (
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 text-sm sm:text-base gap-2"
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
              <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-[240px] sm:w-[300px] opacity-35 pointer-events-none select-none z-0">
                <img
                  src="/images/west_bengal_silhouette.svg"
                  alt="West Bengal Map"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* "For a Stronger West Bengal" badge */}
              <div className="absolute right-0 sm:right-2 bottom-8 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-100 shadow-md text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  For a
                </p>
                <p className="text-xs font-black text-blue-700">Stronger West Bengal</p>
              </div>

              {/* Smartphone Container */}
              <div className="relative z-10 w-[260px] sm:w-[290px] bg-slate-900 rounded-[2.8rem] p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800">
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
                          <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{item.sub}</p>
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
    </>
  );
};
