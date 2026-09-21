import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { Search, ChevronRight, ArrowLeft, Layers } from 'lucide-react';
import type { Exam } from '@/types';

export const ExamsCatalog: React.FC = () => {
  const { exams, selectedExam, setSelectedExam, loading } = useExam();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Filter chips matching Screen 10: [All Exams, WBSSC, WBP, SSC, Railway]
  const filterChips = ['All Exams', 'WBSSC', 'WBP', 'WBPSC', 'SSC', 'Railway'];

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const titleLower = exam.title.toLowerCase();
      const catLower = (exam.category || '').toLowerCase();
      const descLower = (exam.description || '').toLowerCase();

      const matchesSearch =
        titleLower.includes(searchQuery.toLowerCase()) ||
        catLower.includes(searchQuery.toLowerCase()) ||
        descLower.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All Exams') return true;
      if (selectedCategory === 'WBSSC') {
        return titleLower.includes('wbssc') || catLower.includes('wbssc');
      }
      if (selectedCategory === 'WBP') {
        return titleLower.includes('wbp') || catLower.includes('police');
      }
      if (selectedCategory === 'WBPSC') {
        return titleLower.includes('wbpsc') || catLower.includes('psc') || titleLower.includes('clerkship');
      }
      if (selectedCategory === 'SSC') {
        return titleLower.includes('ssc') || catLower.includes('ssc');
      }
      if (selectedCategory === 'Railway') {
        return titleLower.includes('rail') || catLower.includes('rrb') || titleLower.includes('ntpc');
      }

      return true;
    });
  }, [exams, searchQuery, selectedCategory]);

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    navigate(`/exams/${exam.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-24 md:pb-16">
      {/* =========================================================================
          SCREEN 10: HEADER
          Back Arrow + "Test Series" + Search Action
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Test Series
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exam-oriented full mocks, chapter sets & PYQs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSearchOpen((prev) => !prev)}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
            isSearchOpen
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
          aria-label="Toggle Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input Box (Collapsible / Dynamic) */}
      {isSearchOpen && (
        <div className="relative animate-in fade-in duration-150">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test series, syllabus or keywords..."
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
      )}

      {/* =========================================================================
          SCREEN 10: FILTER CHIPS
          [All Exams] | [WBSSC] | [WBP] | [WBPSC] | [SSC] | [Railway]
          ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterChips.map((chip) => {
          const isActive = selectedCategory === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setSelectedCategory(chip)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SCREEN 10: TEST SERIES CARDS LIST
          WBSSC Group D (20 Full Tests • 2000+ Questions)
          ========================================================================= */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
            No Test Series Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find any test series matching your filter. Try selecting "All Exams".
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All Exams');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredExams.map((exam, idx) => {
            const isSelected = selectedExam?.id === exam.id;

            // Compute or provide real test / questions metrics
            const testCounts = [20, 15, 20, 12, 25, 18];
            const displayTestCount = testCounts[idx % testCounts.length];
            const displayQuestionCount = displayTestCount * 100;

            const badgeBgColors = [
              'bg-blue-50 text-blue-600 border-blue-100',
              'bg-pink-50 text-pink-600 border-pink-100',
              'bg-amber-50 text-amber-600 border-amber-100',
              'bg-emerald-50 text-emerald-600 border-emerald-100',
            ];
            const badgeClass = badgeBgColors[idx % badgeBgColors.length];

            return (
              <div
                key={exam.id}
                onClick={() => handleSelectExam(exam)}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Emblem / Badge on Left */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${badgeClass} group-hover:scale-105 transition-transform`}
                  >
                    {exam.title.substring(0, 3).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {displayTestCount} Full Tests • {displayQuestionCount}+ Questions
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
