import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Layers, Search, ChevronRight, BookOpen, Award, History, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exam } from '@/types';

const getExamEmblem = (exam: Exam): { emblem: string; bgColor: string } => {
  const t = (exam.title + ' ' + (exam.slug || '') + ' ' + (exam.category || '')).toLowerCase();
  if (t.includes('wbssc') || t.includes('school service') || t.includes('group d')) {
    return { emblem: '/images/exams/emblem_wbssc.svg', bgColor: 'bg-[#FFE8EC] dark:bg-rose-950/40' };
  }
  if (t.includes('police') || t.includes('wbp') || t.includes('constable') || t.includes('kp')) {
    return { emblem: '/images/exams/emblem_wbp.svg', bgColor: 'bg-[#FFE8EC] dark:bg-blue-950/40' };
  }
  if (t.includes('wbpsc') || t.includes('clerk') || t.includes('psc') || t.includes('miscellaneous') || t.includes('food si')) {
    return { emblem: '/images/exams/emblem_wbpsc.svg', bgColor: 'bg-[#FFF6E5] dark:bg-amber-950/40' };
  }
  if (t.includes('tet') || t.includes('primary') || t.includes('teacher') || t.includes('ctet')) {
    return { emblem: '/images/exams/emblem_tet.svg', bgColor: 'bg-[#FFE8EC] dark:bg-emerald-950/40' };
  }
  if (t.includes('railway') || t.includes('rrb') || t.includes('ntpc')) {
    return { emblem: '/images/exams/emblem_railway.svg', bgColor: 'bg-slate-900 dark:bg-slate-800' };
  }
  if (t.includes('ssc') || t.includes('cgl') || t.includes('chsl') || t.includes('mts') || t.includes('gd')) {
    return { emblem: '/images/exams/emblem_ssc.svg', bgColor: 'bg-[#F1F5F9] dark:bg-sky-950/40' };
  }
  return { emblem: '/images/exams/emblem_wbpsc.svg', bgColor: 'bg-blue-50 dark:bg-blue-950/40' };
};

export const ExamsCatalog: React.FC = () => {
  const { exams, selectedExam, setSelectedExam, loading } = useExam();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    exams.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return ['all', ...Array.from(cats)];
  }, [exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exam.category && exam.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || exam.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [exams, searchQuery, selectedCategory]);

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    navigate(`/exams/${exam.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 pk-student-page transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>West Bengal &amp; Central Examinations</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Target Examinations
            </h1>
            <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed">
              Select your examination to access curated Full Mock Tests, Previous Year Question
              Papers (PYQ), and Syllabus-wise Topic Tests in Bengali &amp; English.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exam by name or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Exams' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No examinations found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find any exams matching your search. Try resetting your search filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const isSelected = selectedExam?.id === exam.id;
              const emblemData = getExamEmblem(exam);

              return (
                <Card
                  key={exam.id}
                  hoverable
                  className={cn(
                    'flex flex-col justify-between border transition-all duration-200 cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-slate-900 group',
                    isSelected
                      ? 'ring-2 ring-brand-500 border-brand-500 bg-brand-50/10 dark:bg-blue-950/20'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-md'
                  )}
                  onClick={() => handleSelectExam(exam)}
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Emblem & Category/Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center p-2 shrink-0 shadow-2xs group-hover:scale-105 transition-transform',
                            emblemData.bgColor
                          )}
                        >
                          <img
                            src={emblemData.emblem}
                            alt={exam.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-0.5 rounded-md border border-brand-100 dark:border-brand-900/60">
                            {exam.category || 'Competitive Exam'}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Target Exam
                        </span>
                      ) : (
                        exam.totalVacancies && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {exam.totalVacancies.toLocaleString()} Vacancies
                          </span>
                        )
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-blue-400 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {exam.description ||
                          'Complete exam preparation package with simulated full mocks, PYQs, and topic drills.'}
                      </p>
                    </div>

                    {/* 3 Pillars Badge Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-extrabold text-brand-700 dark:text-blue-400 flex items-center justify-center gap-1">
                          <Award className="w-3 h-3" /> Full Mock
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Exam Simulation
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                          <History className="w-3 h-3" /> PYQ
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Official Papers
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-extrabold text-blue-700 dark:text-indigo-400 flex items-center justify-center gap-1">
                          <BookOpen className="w-3 h-3" /> Topic Test
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Chapter Drills
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">View all tests</span>
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="gap-1 font-bold text-xs active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectExam(exam);
                      }}
                    >
                      <span>Explore Exam</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
