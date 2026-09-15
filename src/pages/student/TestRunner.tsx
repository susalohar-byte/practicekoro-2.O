import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Languages,
  Grid,
  X,
} from 'lucide-react';
import { formatSeconds } from '@/lib/utils';
import type { MockTest, StudentTestQuestion, AttemptAnswerState } from '@/types';

export const TestRunner: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId') || '';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [test, setTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<StudentTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Attempt State
  const [answers, setAnswers] = useState<Record<string, AttemptAnswerState>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('practicekoro_language') as 'bn' | 'en') || 'bn';
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submitTestRef = useRef<() => void>(() => undefined);

  // 1. Initialize Test Data, Questions, and Attempt
  useEffect(() => {
    async function init() {
      if (!testId || !user) return;
      setLoading(true);
      try {
        const [testData, qData, attemptData] = await Promise.all([
          api.getTestById(testId),
          api.getStudentTestQuestions(testId),
          api.getTestAttempt(attemptId),
        ]);

        // If attempt is already completed, redirect to results immediately (idempotency)
        if (attemptData?.status === 'completed') {
          navigate(`/exams/${testId}/results/${attemptId}`, { replace: true });
          return;
        }

        setTest(testData);
        setQuestions(qData);

        // Load or initialize attempt answers from localStorage
        const savedCache = localStorage.getItem(`practicekoro_attempt_${attemptId}`);
        if (savedCache) {
          try {
            const parsed = JSON.parse(savedCache);
            if (Array.isArray(parsed.answers)) {
              const map: Record<string, AttemptAnswerState> = {};
              parsed.answers.forEach((a: AttemptAnswerState) => {
                map[a.questionId] = a;
              });
              setAnswers(map);
            }
          } catch {
            // ignore
          }
        }

        // SERVER-SYNCHRONIZED COUNTDOWN TIMER:
        // Duration is locked to attempt.startTime + test.durationMinutes
        const totalDurationSecs = (testData?.durationMinutes || 15) * 60;
        const startTimestamp = attemptData?.startTime
          ? new Date(attemptData.startTime).getTime()
          : Date.now();
        const elapsedSecs = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
        const remainingSecs = Math.max(0, totalDurationSecs - elapsedSecs);

        setTimeRemaining(remainingSecs);
        setTimeSpent(elapsedSecs);

        if (qData.length > 0) {
          setVisited(new Set([qData[0].id]));
        }

        // If test time has already elapsed on load, submit immediately
        if (remainingSecs <= 0 && attemptData?.status === 'in_progress') {
          submitTestRef.current();
        }
      } catch (err) {
        console.error('Failed to load test runner data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [testId, attemptId, user, navigate]);

  // Submit test handler (Server-authoritative identity via auth.uid())
  const handleSubmitTest = useCallback(async () => {
    if (submitting || !user || !testId) return;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const answersArray = Object.values(answers);
      await api.submitTestAttempt(attemptId, answersArray, timeSpent, testId);

      navigate(`/exams/${testId}/results/${attemptId}`, { replace: true });
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Error submitting test. Please try again.');
      setSubmitting(false);
    }
  }, [submitting, user, testId, answers, attemptId, timeSpent, navigate]);

  submitTestRef.current = handleSubmitTest;

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitTest(); // Auto-submit when time reaches zero
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeRemaining, handleSubmitTest]);

  // 3. Debounced Autosave to Server
  useEffect(() => {
    if (loading || Object.keys(answers).length === 0) return;

    const handler = setTimeout(() => {
      api.saveAnswers(attemptId, Object.values(answers), timeSpent);
    }, 2000);

    return () => clearTimeout(handler);
  }, [answers, attemptId, timeSpent, loading]);

  const currentQ = questions[currentIndex];

  // Mark question as visited when changing questions
  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    const qId = questions[index].id;
    setVisited((prev) => new Set(prev).add(qId));
    setPaletteOpen(false);
  };

  // Option selection
  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const existing = prev[currentQ.id] || {
        questionId: currentQ.id,
        selectedOption: null,
        isMarkedForReview: false,
        timeSpentSeconds: 0,
      };

      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          selectedOption: option,
        },
      };
    });
  };

  // Clear answer
  const handleClearAnswer = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const existing = prev[currentQ.id];
      if (!existing) return prev;
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          selectedOption: null,
        },
      };
    });
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const existing = prev[currentQ.id] || {
        questionId: currentQ.id,
        selectedOption: null,
        isMarkedForReview: false,
        timeSpentSeconds: 0,
      };

      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          isMarkedForReview: !existing.isMarkedForReview,
        },
      };
    });
  };

  // Question status derivation for the Question Palette
  const getQuestionState = (qId: string) => {
    const ans = answers[qId];
    const isAnswered = ans && ans.selectedOption !== null;
    const isMarked = ans && ans.isMarkedForReview;
    const isVisited = visited.has(qId);

    if (isAnswered && isMarked) return 'answered_and_marked';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (isVisited) return 'skipped';
    return 'unvisited';
  };

  // Summary counts
  const answeredCount = Object.values(answers).filter((a) => a.selectedOption !== null).length;
  const markedCount = Object.values(answers).filter((a) => a.isMarkedForReview).length;
  const unansweredCount = questions.length - answeredCount;
  const isTimeCritical = timeRemaining > 0 && timeRemaining <= 120; // less than 2 minutes

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading Secure Exam Session...</p>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return null;
  }

  const currentAnswer = answers[currentQ.id]?.selectedOption || null;
  const isCurrentMarked = answers[currentQ.id]?.isMarkedForReview || false;

  // Language content fallback
  const displayedQuestionText =
    language === 'bn' && currentQ.questionBengaliText
      ? currentQ.questionBengaliText
      : currentQ.questionText;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans select-none">
      {/* 1. TOP EXAM HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="/logo-icon-transparent.png"
            alt="PracticeKoro"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg shrink-0"
          />
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">
              {test?.title || 'Mock Test Session'}
            </h1>
            <span className="text-[10px] font-semibold text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Center: Live Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm transition-all border ${
            isTimeCritical
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
              : 'bg-slate-800 text-emerald-400 border-slate-700'
          }`}
        >
          <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span>{formatSeconds(timeRemaining)}</span>
        </div>

        {/* Right Actions: Language Switcher & Submit */}
        <div className="flex items-center gap-2">
          {/* Bilingual Toggle */}
          <button
            onClick={() => {
              const next = language === 'bn' ? 'en' : 'bn';
              setLanguage(next);
              localStorage.setItem('practicekoro_language', next);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
            title="Toggle Question Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বাংলা' : 'ENG'}</span>
          </button>

          {/* Palette Toggle on mobile */}
          <button
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Submit Test CTA */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
          >
            Submit
          </Button>
        </div>
      </header>

      {/* 2. MAIN BODY (QUESTION PANE & PALETTE) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: QUESTION AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {/* Question Top Info Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                  Q {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Marks: <strong className="text-emerald-600">+{currentQ.marks}</strong> /{' '}
                  <span className="text-rose-600">-{currentQ.negativeMarks}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentMarked && (
                  <Badge variant="premium" size="sm" className="gap-1">
                    <Bookmark className="w-3 h-3 fill-amber-500 text-amber-600" />
                    Marked for Review
                  </Badge>
                )}
              </div>
            </div>

            {/* Question Content */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {displayedQuestionText}
              </p>

              {/* If Bengali selected and English exists, show secondary subtext */}
              {language === 'bn' && currentQ.questionBengaliText && (
                <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                    English Reference:
                  </span>
                  {currentQ.questionText}
                </p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const optText = currentQ[`option${optKey}` as keyof StudentTestQuestion] as string;
                const isSelected = currentAnswer === optKey;

                return (
                  <div
                    key={optKey}
                    onClick={() => handleSelectOption(optKey)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                      isSelected
                        ? 'bg-brand-50/70 border-brand-600 text-brand-950 font-bold shadow-sm ring-1 ring-brand-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {optKey}
                    </div>
                    <span className="text-sm flex-1 leading-snug">{optText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM CONTROLS BAR */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <Button
                size="sm"
                variant={isCurrentMarked ? 'secondary' : 'outline'}
                onClick={handleToggleMarkForReview}
                leftIcon={
                  <Bookmark
                    className={`w-4 h-4 ${isCurrentMarked ? 'fill-current text-amber-600' : ''}`}
                  />
                }
              >
                {isCurrentMarked ? 'Unmark Review' : 'Mark for Review'}
              </Button>

              {currentAnswer && (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1"
                >
                  Clear Answer
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => goToQuestion(currentIndex + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowSubmitModal(true)}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Review & Submit
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT: QUESTION PALETTE (DESKTOP & MOBILE DRAWER) */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 p-5 flex flex-col justify-between shadow-xl lg:shadow-none transition-transform duration-200 ${
            paletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Grid className="w-4 h-4 text-brand-600" />
                Question Palette
              </h3>
              <button
                onClick={() => setPaletteOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Semantic State Legend */}
            <div className="grid grid-cols-2 gap-2 my-4 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
                <span>Skipped ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-600 shrink-0" />
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 shrink-0" />
                <span>Unvisited</span>
              </div>
            </div>

            {/* Numbered Palette Grid */}
            <div className="grid grid-cols-5 gap-2.5 max-h-[55vh] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const state = getQuestionState(q.id);
                const isCurrent = currentIndex === idx;

                const bgColors = {
                  answered: 'bg-emerald-500 text-white hover:bg-emerald-600',
                  marked: 'bg-purple-600 text-white hover:bg-purple-700',
                  answered_and_marked:
                    'bg-purple-600 text-white ring-2 ring-emerald-400 hover:bg-purple-700',
                  skipped: 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200',
                  unvisited: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                };

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all relative ${bgColors[state]} ${
                      isCurrent ? 'ring-2 ring-brand-600 ring-offset-2 scale-105 shadow-md' : ''
                    }`}
                  >
                    {idx + 1}
                    {state === 'answered_and_marked' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button
              className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowSubmitModal(true)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Test ({answeredCount}/{questions.length})
            </Button>
          </div>
        </aside>
      </div>

      {/* 3. SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Submit Mock Test?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to complete and submit your exam attempt?
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 my-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Answered</p>
                <p className="text-base font-black text-emerald-600">{answeredCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Unanswered</p>
                <p className="text-base font-black text-amber-600">{unansweredCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Marked</p>
                <p className="text-base font-black text-purple-600">{markedCount}</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200 mb-5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full font-bold bg-emerald-600 hover:bg-emerald-700"
                isLoading={submitting}
                onClick={handleSubmitTest}
              >
                Yes, Submit My Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
              >
                Return to Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
