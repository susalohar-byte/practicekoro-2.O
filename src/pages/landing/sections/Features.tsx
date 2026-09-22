import React from 'react';
import { toolsFeatures } from '../data';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Bell, BookmarkCheck, Wifi } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="relative py-16 sm:py-24 bg-slate-50/50 border-t border-b border-slate-100 scroll-mt-24 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-[420px] h-[420px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Practice Smarter"
          title={
            <>
              Tools That Help You{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Improve
              </span>
            </>
          }
          description="Everything you need for focused and effective preparation."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left 6 Feature Cards (2x3 Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {toolsFeatures.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Reveal key={tool.title} delay={(index % 2) * 90} className="h-full">
                  <div className="group h-full rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 space-y-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform ${tool.color}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">
                        {tool.bengaliTag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Right Interactive Mobile Student App Showcase */}
          <Reveal delay={150} className="lg:col-span-5 flex justify-center">
            {/* Phone & Floating Badges Relative Container */}
            <div className="relative w-fit mx-auto">
              {/* Floating revision card */}
              <div className="absolute left-[calc(100%+14px)] top-20 z-30 animate-float hidden lg:flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pl-2.5 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl pointer-events-none select-none">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <BookmarkCheck className="w-5 h-5 text-white" />
                </span>
                <span>
                  <span className="block text-base font-black text-slate-900 dark:text-white leading-none">
                    Mistake Fixed!
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">
                    Notebook updated
                  </span>
                </span>
              </div>

              {/* Sleek, Simplified Smartphone Mockup */}
              <div className="relative z-10 w-[260px] sm:w-[275px] md:w-[285px] bg-slate-900 p-[8px] sm:p-[9px] rounded-[2.8rem] sm:rounded-[3.2rem] shadow-[0_22px_60px_-15px_rgba(15,23,42,0.4),0_0_0_1px_rgba(255,255,255,0.12)_inset] ring-1 ring-slate-800 select-none">
                {/* Screen Glass Surface */}
                <div className="relative w-full bg-slate-50 dark:bg-slate-950 rounded-[2.2rem] sm:rounded-[2.6rem] overflow-hidden p-3 space-y-2.5 border border-slate-200/80 dark:border-slate-800 shadow-inner">
                  {/* Subtle Screen Gloss Glare */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />

                  {/* iOS Status Bar & Minimal Camera Notch */}
                  <div className="relative z-20 pt-1 px-2 flex items-center justify-between text-slate-800 dark:text-slate-200 shrink-0">
                    <span className="text-[10px] font-semibold tracking-tight">9:41</span>

                    {/* Minimal Notch Pill */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-18 h-4 bg-black rounded-full flex items-center justify-center shadow-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 ml-auto mr-2" />
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Wifi className="w-2.5 h-2.5" />
                      <div className="w-4 h-2 border border-slate-700 dark:border-slate-300 rounded-[2.5px] p-[0.5px] flex items-center">
                        <div className="w-2.5 h-1 bg-slate-800 dark:bg-slate-200 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Good Morning,</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        Keep Practicing!
                      </p>
                    </div>
                    <div className="relative p-2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white dark:border-slate-900" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800 dark:text-slate-200">Your Progress</span>
                      <span className="text-blue-600 text-[10px]">View All</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="27"
                            fill="none"
                            strokeWidth="7"
                            className="stroke-slate-100 dark:stroke-slate-800"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="27"
                            fill="none"
                            stroke="url(#featProgress)"
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 27}`}
                            strokeDashoffset={`${2 * Math.PI * 27 * (1 - 0.68)}`}
                          />
                          <defs>
                            <linearGradient id="featProgress" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#4f46e5" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900 dark:text-white">
                          68%
                        </span>
                      </div>
                      <div className="text-[10px] space-y-1.5 text-slate-500 dark:text-slate-400">
                        {[
                          ['12', 'Tests Taken'],
                          ['8', 'Topics Completed'],
                          ['4', 'Tests Pending'],
                        ].map(([n, label]) => (
                          <p key={label}>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {n}
                            </span>{' '}
                            {label}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Recent Test</span>
                      <span className="text-blue-600">See All</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900 text-left">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        WBP Constable Mock Test 01
                      </p>
                      <p className="text-[9px] text-slate-400">100 Questions • 60 Minutes</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      Your Strength
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold">
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        85%
                        <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-normal">
                          Reasoning
                        </span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900">
                        72%
                        <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-normal">
                          GK
                        </span>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900">
                        60%
                        <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-normal">
                          Maths
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* iOS Home Indicator */}
                  <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 mb-0.5" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
