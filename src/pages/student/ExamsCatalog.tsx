import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Layers, Search, ChevronRight, BookOpen, Award, History, CheckCircle2 } from 'lucide-react';
import type { Exam } from '@/types';

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-200">
              <Layers className="w-3.5 h-3.5 text-brand-300" />
              <span>Examination Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Target Examinations
            </h1>
            <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed">
              Select your examination to access curated Full Mock Tests, Previous Year Question
              Papers (PYQ), and Syllabus-wise Topic Tests.
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
              <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No examinations found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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

              return (
                <Card
                  key={exam.id}
                  hoverable
                  className={`flex flex-col justify-between border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-brand-500 border-brand-500 bg-brand-50/10'
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => handleSelectExam(exam)}
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Category & Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                        {exam.category || 'Competitive Exam'}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Target Exam
                        </span>
                      ) : (
                        exam.totalVacancies && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {exam.totalVacancies.toLocaleString()} Vacancies
                          </span>
                        )
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {exam.description ||
                          'Complete exam preparation package with simulated full mocks, PYQs, and topic drills.'}
                      </p>
                    </div>

                    {/* 3 Pillars Badge Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                        <div className="text-xs font-extrabold text-brand-700 flex items-center justify-center gap-1">
                          <Award className="w-3 h-3" /> Full Mock
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          Exam Simulation
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                        <div className="text-xs font-extrabold text-amber-700 flex items-center justify-center gap-1">
                          <History className="w-3 h-3" /> PYQ
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          Official Papers
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                        <div className="text-xs font-extrabold text-blue-700 flex items-center justify-center gap-1">
                          <BookOpen className="w-3 h-3" /> Topic Test
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          Chapter Drills
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">View all tests</span>
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="gap-1 font-bold text-xs"
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
