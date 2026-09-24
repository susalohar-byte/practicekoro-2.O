import React, { useState } from 'react';
import { useExam } from '@/context/ExamContext';
import { Search, ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import type { Exam } from '@/types';

interface ExamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'choose' | 'primary' | 'flow'; // 'flow' runs choose -> primary
  onExamSelected?: (exam: Exam) => void;
}

export const ExamSelectorModal: React.FC<ExamSelectorModalProps> = ({
  isOpen,
  onClose,
  mode = 'flow',
  onExamSelected,
}) => {
  const { exams, selectedExam, setSelectedExam } = useExam();
  const [currentStep, setCurrentStep] = useState<'choose' | 'primary'>(
    mode === 'primary' ? 'primary' : 'choose'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('West Bengal');
  const [tempSelectedExam, setTempSelectedExam] = useState<Exam | null>(selectedExam || null);

  // Sync selected exam
  React.useEffect(() => {
    if (selectedExam && !tempSelectedExam) {
      setTempSelectedExam(selectedExam);
    }
  }, [selectedExam, tempSelectedExam]);

  if (!isOpen) return null;

  // Filter categories matching Screen 5: [West Bengal, SSC, Railway, All]
  const categories = ['West Bengal', 'SSC', 'Railway', 'All'];

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.category && exam.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'West Bengal') {
      return (
        exam.category.toLowerCase().includes('wb') ||
        exam.category.toLowerCase().includes('police') ||
        exam.category.toLowerCase().includes('psc') ||
        exam.category.toLowerCase().includes('state') ||
        exam.category.toLowerCase().includes('tet') ||
        exam.title.toLowerCase().includes('wbp') ||
        exam.title.toLowerCase().includes('wbssc') ||
        exam.title.toLowerCase().includes('wbpsc')
      );
    }
    if (selectedCategory === 'SSC') {
      return (
        exam.category.toLowerCase().includes('ssc') || exam.title.toLowerCase().includes('ssc')
      );
    }
    if (selectedCategory === 'Railway') {
      return (
        exam.category.toLowerCase().includes('rail') ||
        exam.category.toLowerCase().includes('rrb') ||
        exam.title.toLowerCase().includes('rail') ||
        exam.title.toLowerCase().includes('ntpc')
      );
    }

    return true;
  });

  const handleSelectExamFromList = (exam: Exam) => {
    setTempSelectedExam(exam);
    if (mode === 'choose') {
      setSelectedExam(exam);
      if (onExamSelected) onExamSelected(exam);
      onClose();
    } else {
      setCurrentStep('primary');
    }
  };

  const handleConfirmPrimary = () => {
    if (tempSelectedExam) {
      setSelectedExam(tempSelectedExam);
      if (onExamSelected) onExamSelected(tempSelectedExam);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* =========================================================================
            SCREEN 5: CHOOSE YOUR EXAM
            ========================================================================= */}
        {currentStep === 'choose' && (
          <>
            {/* Top App Bar */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Choose Your Exam
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the exam you want to prepare for
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exams..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter Pills (Screen 5) */}
            <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Exams List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExams.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-semibold">No exams found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredExams.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => handleSelectExamFromList(exam)}
                    className="w-full pt-2.5 pb-2 flex items-center justify-between text-left group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 text-blue-600 font-black text-xs shadow-xs">
                        {exam.title.substring(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                          {exam.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {exam.category.toUpperCase()} • State Government
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* =========================================================================
            SCREEN 6: SET YOUR PRIMARY EXAM
            ========================================================================= */}
        {currentStep === 'primary' && (
          <>
            {/* Top Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('choose')}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Set Your Primary Exam
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This helps us personalize your experience.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Radio List (Screen 6) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {exams.map((exam) => {
                const isSelected = tempSelectedExam?.id === exam.id;
                return (
                  <div
                    key={exam.id}
                    onClick={() => setTempSelectedExam(exam)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio Circle */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isSelected
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {exam.title}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white tracking-wide">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sticky Bottom Continue Button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={handleConfirmPrimary}
                disabled={!tempSelectedExam}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-transform active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
