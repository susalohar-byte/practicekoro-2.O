import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, BarChart3, Target, FileText, Sparkles, Zap } from 'lucide-react';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* =========================================================================
          6. SECTION 5: PRO PASS BANNER ("One Pass. All Premium Tests.")
          ========================================================================= */}
      <section id="pricing" className="py-14 sm:py-16 bg-white">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">₹299</span>
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
    </>
  );
};
