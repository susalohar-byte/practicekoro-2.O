import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <>
      {/* =========================================================================
          4. SECTION 3: HOW PRACTICEKORO WORKS ("From Preparation to Progress")
          ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <img
                    src="/images/exams/wbp_police.png"
                    alt="WBP"
                    className="w-8 h-8 object-contain"
                  />
                  <img
                    src="/images/exams/icon_kolkata_police.png"
                    alt="KP"
                    className="w-8 h-8 object-contain"
                  />
                  <img
                    src="/images/exams/icon_railway_exact.png"
                    alt="Railway"
                    className="w-8 h-8 object-contain"
                  />
                  <img
                    src="/images/exams/icon_ssc_clean.png"
                    alt="SSC"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900">Choose Your Exam</h3>
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
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border border-slate-300" /> Option A
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600" /> Option B (Selected)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border border-slate-300" /> Option C
                  </div>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900">Practice & Test</h3>
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

              <h3 className="text-base sm:text-lg font-black text-slate-900">Check Your Results</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                Get detailed analysis, find weak areas and improve.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
