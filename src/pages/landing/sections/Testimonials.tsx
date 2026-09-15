import React from 'react';
import { testimonials } from '../data';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <>
      {/* =========================================================================
          7. SECTION 6: TESTIMONIALS ("Trusted by Aspirants Across West Bengal")
          ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              WHAT OUR USERS SAY
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by Aspirants <span className="text-blue-600">Across</span> West Bengal
            </h2>
          </div>

          {/* 3 Testimonials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
