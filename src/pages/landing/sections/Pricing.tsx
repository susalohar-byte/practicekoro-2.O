import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import {
  Crown,
  ArrowRight,
  BarChart3,
  Target,
  FileText,
  Sparkles,
  Zap,
  Check,
  ShieldCheck,
} from 'lucide-react';

const INCLUDED = [
  { icon: FileText, label: 'Unlimited mock tests' },
  { icon: BarChart3, label: 'Detailed analytics & rank' },
  { icon: Target, label: 'Topic-wise & PYQ tests' },
  { icon: Zap, label: 'Priority support' },
];

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-16 sm:py-24 bg-white scroll-mt-24 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pro Pass"
          title={
            <>
              One Pass.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                All Premium Tests.
              </span>
            </>
          }
          description="A single All-Access pass for every exam — WBP, KP, WBCS, WBPSC, Railway & more."
        />

        <Reveal>
          <div className="rounded-[1.75rem] bg-[#091122] text-white p-8 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Ambient glows + grid */}
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_80%_at_30%_50%,black,transparent)] pointer-events-none"
            />

            {/* Left Content */}
            <div className="relative space-y-6 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.12em] shadow-lg shadow-blue-500/30">
                <Crown className="w-3.5 h-3.5 fill-white" />
                All-Access Pro Pass
              </div>

              {/* Price */}
              <div className="flex items-end justify-center lg:justify-start gap-2.5">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  ₹299
                </span>
                <span className="text-sm text-slate-400 font-semibold pb-2">/ 365 days</span>
                <span className="mb-2 ml-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                  ≈ ₹0.82/day
                </span>
              </div>

              {/* Checklist */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left">
                {INCLUDED.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-semibold text-slate-100"
                  >
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-blue-300" strokeWidth={3} />
                    </span>
                    <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/subscription')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/40 text-sm gap-2 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  <span>Get Pro Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  One payment • Full year • All exams
                </p>
              </div>
            </div>

            {/* Right Glowing Crown Card */}
            <div className="relative flex flex-col items-center justify-center shrink-0">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[1.75rem] bg-gradient-to-br from-blue-600/40 to-indigo-600/20 border border-blue-400/40 backdrop-blur-md flex items-center justify-center shadow-inner">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
                </div>
                <Sparkles className="w-4 h-4 text-blue-300 absolute top-3 left-4 animate-pulse" />
                <Sparkles className="w-5 h-5 text-indigo-300 absolute bottom-4 right-4 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-center text-slate-300 mt-4 max-w-[200px]">
                Take your preparation to the next level
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
