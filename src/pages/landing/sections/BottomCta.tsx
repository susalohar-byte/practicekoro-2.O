import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const BottomCta: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* =========================================================================
          8. SECTION 7: BOTTOM CTA BANNER ("Start Practicing Today")
          ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-100/90 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left 3D Target Dartboard Illustration */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center relative">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
                {/* Outer ring */}
                <circle cx="100" cy="100" r="90" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="4" />
                <circle cx="100" cy="100" r="70" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
                <circle cx="100" cy="100" r="50" fill="#38bdf8" />
                <circle cx="100" cy="100" r="30" fill="#ffffff" />
                <circle cx="100" cy="100" r="14" fill="#2563eb" />
                {/* Dart Arrow */}
                <path d="M 100 100 L 160 40 L 170 50 L 110 110 Z" fill="#1d4ed8" />
                <polygon points="160,40 180,20 170,50" fill="#ef4444" />
                <circle cx="100" cy="100" r="4" fill="#ffffff" />
              </svg>
            </div>

            {/* Center Content */}
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                YOUR DREAM IS CLOSER
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Start Practicing <span className="text-blue-600">Today</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Join thousands of aspirants and take a step closer to your goal.
              </p>
            </div>

            {/* Right Button */}
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm gap-2 shrink-0 self-stretch sm:self-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
