import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { examCategories, popularExams } from '../data';
import { ArrowRight, ChevronRight, Search, Layers } from 'lucide-react';

export const PopularExams: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPopularExams = popularExams.filter((exam) => {
    const matchesCategory =
      selectedCategory === 'all' || exam.categories.includes(selectedCategory);
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* =========================================================================
          3. SECTION 2: POPULAR EXAMS ("Explore Your Exam")
          ========================================================================= */}
      <section
        id="exams"
        className="py-16 sm:py-20 bg-slate-50/50 border-t border-b border-slate-100"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              POPULAR EXAMS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Explore <span className="text-blue-600">Your Exam</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Choose your target exam and start practicing with topic-wise tests, PYQs and full mock
              tests.
            </p>
          </div>

          {/* Filter Tabs & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {examCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs"
              />
            </div>
          </div>

          {/* 8 Exam Cards Grid (4 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredPopularExams.map((exam, index) => (
              <div
                key={index}
                onClick={() => navigate(exam.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(exam.route)}
                className="group rounded-2xl bg-white border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {exam.isCustomIcon ? (
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-1 group-hover:border-blue-200 transition-colors">
                      <img src={exam.icon} alt={exam.title} className="w-8 h-8 object-contain" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {exam.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{exam.subtitle}</p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom "View All Exams" Button */}
          <div className="text-center mt-10">
            <Button
              size="lg"
              onClick={() => navigate('/exams')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm gap-2"
            >
              <span>View All Exams</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
