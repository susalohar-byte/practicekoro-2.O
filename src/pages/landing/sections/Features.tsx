import React from 'react';
import { toolsFeatures } from '../data';
import { Bell, Zap } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <>
      {/* =========================================================================
          5. SECTION 4: TOOLS THAT HELP YOU IMPROVE ("Practice Smarter")
          ========================================================================= */}
      <section
        id="features"
        className="py-16 sm:py-20 bg-slate-50/50 border-t border-b border-slate-100"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              PRACTICE SMARTER
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tools That Help You <span className="text-blue-600">Improve</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Everything you need for focused and effective preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left 6 Feature Cards (2x3 Grid) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {toolsFeatures.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tool.color}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {tool.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Interactive Mobile Student App Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[280px] sm:w-[320px] bg-slate-900 rounded-[2.8rem] p-3 shadow-2xl ring-1 ring-slate-800">
                {/* Speaker Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20" />

                {/* Inner Screen Content */}
                <div className="bg-slate-50 rounded-[2.2rem] overflow-hidden p-4 space-y-3.5 border border-slate-100 text-slate-900">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1 pt-2">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Good Morning,</p>
                      <p className="text-xs font-black text-slate-900">Keep Practicing!</p>
                    </div>
                    <div className="p-1.5 rounded-full bg-slate-100 text-slate-600">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Your Progress Widget */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800">Your Progress</span>
                      <span className="text-blue-600 text-[10px]">View All</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Radial indicator */}
                      <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-slate-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-black text-slate-900">68%</span>
                        <span className="text-[7px] text-slate-400">Overall</span>
                      </div>
                      <div className="text-[10px] space-y-1 text-slate-500">
                        <p>
                          <span className="font-bold text-slate-800">12</span> Tests Taken
                        </p>
                        <p>
                          <span className="font-bold text-slate-800">8</span> Topics Completed
                        </p>
                        <p>
                          <span className="font-bold text-slate-800">4</span> Tests Pending
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Test Card */}
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-700">Recent Test</span>
                      <span className="text-blue-600">See All</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">
                      <p className="text-[11px] font-bold text-slate-800">
                        WBP Constable Mock Test 01
                      </p>
                      <p className="text-[9px] text-slate-400">100 Questions • 60 Minutes</p>
                    </div>
                  </div>

                  {/* Your Strength Bars */}
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-2">
                    <p className="text-[10px] font-bold text-slate-700">Your Strength</p>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold">
                      <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-lg border border-emerald-100">
                        85%
                        <span className="block text-[8px] text-slate-500 font-normal">
                          Reasoning
                        </span>
                      </div>
                      <div className="bg-blue-50 text-blue-700 p-1.5 rounded-lg border border-blue-100">
                        72%
                        <span className="block text-[8px] text-slate-500 font-normal">GK</span>
                      </div>
                      <div className="bg-rose-50 text-rose-700 p-1.5 rounded-lg border border-rose-100">
                        60%
                        <span className="block text-[8px] text-slate-500 font-normal">Maths</span>
                      </div>
                    </div>
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
