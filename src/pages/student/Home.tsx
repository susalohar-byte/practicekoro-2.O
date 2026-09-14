import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  ArrowRight,
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Crown,
  ChevronRight,
  ChevronDown,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  Check,
  Zap,
  RefreshCw,
} from 'lucide-react';
import type { MockTest, Subject, TestAttempt, TestSeries } from '@/types';

export const Home: React.FC = () => {
  const { user, isPro } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const { subscriptionDetails } = useSubscription();
  const navigate = useNavigate();

  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<TestAttempt[]>([]);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState<boolean>(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Load data for active exam and user
  const loadData = useCallback(async () => {
    if (!selectedExam) return;
    setLoading(true);
    setError(null);
    try {
      const [subjData, testsData, seriesData] = await Promise.all([
        api.getSubjects(selectedExam.id),
        api.getTests(undefined, selectedExam.id),
        api.getTestSeries(selectedExam.id),
      ]);
      setSubjects(subjData || []);
      setTests(testsData || []);
      setTestSeries(seriesData || []);

      if (user) {
        const [attemptsData, mistakesData, bookmarksData] = await Promise.all([
          api.getUserAttempts(user.id),
          api.getMistakes(user.id),
          api.getBookmarks(user.id),
        ]);
        setRecentAttempts(attemptsData || []);
        setMistakesCount(mistakesData ? mistakesData.length : 0);
        setBookmarksCount(bookmarksData ? bookmarksData.length : 0);
      } else {
        setRecentAttempts([]);
        setMistakesCount(0);
        setBookmarksCount(0);
      }
    } catch (err: any) {
      console.error('Home load error:', err);
      setError('Unable to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedExam, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Continue Practice state
  const inProgressAttempt = recentAttempts.find((a) => a.status === 'in_progress');
  const completedAttempts = recentAttempts.filter((a) => a.status === 'completed');
  const latestCompletedAttempt = completedAttempts[0];

  // Derived Performance Metrics (strictly real data)
  const totalCompleted = completedAttempts.length;
  const totalScoreEarned = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
  const totalMarksPossible = completedAttempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
  const avgScorePercentage =
    totalMarksPossible > 0 ? ((totalScoreEarned / totalMarksPossible) * 100).toFixed(1) : '0';

  const totalCorrect = completedAttempts.reduce((sum, a) => sum + (a.correctCount || 0), 0);
  const totalWrong = completedAttempts.reduce((sum, a) => sum + (a.wrongCount || 0), 0);
  const totalAnswered = totalCorrect + totalWrong;
  const overallAccuracy =
    totalAnswered > 0 ? ((totalCorrect / totalAnswered) * 100).toFixed(1) : '0';

  // Derived Recommended Practice
  const attemptedTestIds = new Set(recentAttempts.map((a) => a.testId));
  const unattemptedTest = tests.find((t) => !attemptedTestIds.has(t.id));

  // Days remaining for Pro Pass
  const daysRemaining = subscriptionDetails?.daysRemaining ?? (isPro ? 365 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 sm:space-y-8 pb-24 md:pb-16">
      {/* ERROR BANNER */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 sm:p-5 flex items-center justify-between gap-3 text-rose-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-rose-700 border-rose-300 hover:bg-rose-100 font-bold text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: HEADER & TARGET EXAM QUICK-SWITCHER
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-blue-50/25 to-white border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-blue-400/10 via-indigo-400/15 to-blue-400/10 blur-2xl pointer-events-none" />

        {/* Top Badges Row (Centered) */}
        <div className="relative inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-wider">{getGreeting()}</span>
          </span>

          {isPro ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
              <Crown className="w-3 h-3 fill-white" />
              PRO PASS ACTIVE
            </span>
          ) : (
            <Link
              to="/subscription"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              Free Tier
            </Link>
          )}
        </div>

        {/* Grand Centered Student Greeting & Name */}
        <div className="relative space-y-2 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              {user?.fullName || 'Student Aspirant'}
            </span>{' '}
            👋
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed">
            Targeted preparation and rigorous mock tests for West Bengal competitive exams.
          </p>
        </div>

        {/* Centered Target Exam Quick-Switcher Pill */}
        <div className="relative pt-1">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
              className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 hover:bg-blue-50/40 transition-all text-xs sm:text-sm font-bold text-slate-800 active:scale-[0.98]"
              title="Click to switch your target exam"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-slate-500 font-medium">Target Exam:</span>
              <span className="text-blue-700 font-extrabold max-w-[200px] sm:max-w-[280px] truncate">
                {selectedExam?.title || 'Select Exam'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExamDropdownOpen ? 'rotate-180 text-blue-600' : ''}`}
              />
            </button>

            {/* Exam Dropdown Menu */}
            {isExamDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsExamDropdownOpen(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-40 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Target Exam
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {exams.map((exam) => {
                      const isSelected = selectedExam?.id === exam.id;
                      return (
                        <button
                          key={exam.id}
                          type="button"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsExamDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{exam.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {exam.category.toUpperCase()} • {exam.totalVacancies || 'Govt'}{' '}
                              Vacancies
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Features Row (Centered) */}
        <div className="pt-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[11px] sm:text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{tests.length} Mock Tests Available</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Syllabus Aligned</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Real Exam Simulator</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: CONTINUE PRACTICE (High Priority Resumption / Onboarding)
          ========================================================================= */}
      {loading ? (
        <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
      ) : inProgressAttempt ? (
        // Priority A: In-Progress Test Resumption
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 shadow-xl border border-blue-500/30 ring-4 ring-blue-500/10 relative overflow-hidden">
          {/* Subtle top shimmer glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                TEST IN PROGRESS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {inProgressAttempt.testTitle || 'Active Mock Test'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                You have an incomplete attempt. Your previous answers are safely saved.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-200/80 font-medium">
                <span>{inProgressAttempt.examTitle || selectedExam?.title}</span>
                {inProgressAttempt.subjectName && (
                  <>
                    <span>•</span>
                    <span>{inProgressAttempt.subjectName}</span>
                  </>
                )}
                {inProgressAttempt.timeSpentSeconds > 0 && (
                  <>
                    <span>•</span>
                    <span>{Math.round(inProgressAttempt.timeSpentSeconds / 60)} mins elapsed</span>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={() =>
                navigate(
                  `/exams/${inProgressAttempt.testId}/runner?attemptId=${inProgressAttempt.id}`
                )
              }
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/30 px-6 py-3.5 rounded-xl shrink-0 transition"
              leftIcon={<Play className="w-4 h-4 fill-white" />}
            >
              Resume Test Now
            </Button>
          </div>
        </div>
      ) : latestCompletedAttempt ? (
        // Priority B: Latest Completed Test Performance & Review
        <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              LATEST ATTEMPT COMPLETED
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {latestCompletedAttempt.testTitle || 'Mock Test Completed'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {latestCompletedAttempt.examTitle || selectedExam?.title}
                {latestCompletedAttempt.subjectName
                  ? ` • ${latestCompletedAttempt.subjectName}`
                  : ''}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 pt-1">
              <span className="inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Score:{' '}
                <span className="text-blue-700 font-bold">{latestCompletedAttempt.score}</span> /{' '}
                {latestCompletedAttempt.totalMarks}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Accuracy:{' '}
                <span className="text-emerald-700 font-bold">
                  {Math.round(latestCompletedAttempt.accuracy)}%
                </span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Correct:{' '}
                <span className="text-emerald-700">{latestCompletedAttempt.correctCount}</span> |
                Wrong: <span className="text-rose-700">{latestCompletedAttempt.wrongCount}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/exams/${latestCompletedAttempt.testId}/solutions/${latestCompletedAttempt.id}`
                )
              }
              leftIcon={<CheckCircle2 className="w-4 h-4 text-blue-600" />}
              className="text-xs font-bold py-2.5 px-4 rounded-xl border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
            >
              Review Solutions
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/exams/${latestCompletedAttempt.testId}`)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-200"
            >
              Re-attempt
            </Button>
          </div>
        </div>
      ) : (
        // Priority C: Clean First-Test Onboarding CTA
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-7 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              TARGET PREPARATION • {selectedExam?.title || 'WBP CONSTABLE'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Start Your Preparation With a Free Mock Test
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience the exact test environment with timer countdown, bilingual questions,
              instant scoring, negative marking, and error analysis.
            </p>
          </div>
          <Button
            onClick={() => {
              const freeTest = tests.find((t) => !t.isPremium);
              if (freeTest) {
                navigate(`/exams/${freeTest.id}`);
              } else {
                navigate('/exams');
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/30 px-6 py-3.5 rounded-xl shrink-0"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start First Mock Test
          </Button>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: QUICK PRACTICE ENTRY (3 Pillars)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Pillar 1: All Mock Tests */}
        <div
          onClick={() => navigate('/exams')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/exams')}
          className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  All Mock Tests
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {tests.length} Tests
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                Chapter-wise, Subject-wise, and Full-length practice sets.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
            <span>Open Catalog</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Mistakes Notebook */}
        <div
          onClick={() => navigate('/practice')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/practice')}
          className="group rounded-2xl sm:rounded-3xl bg-white border border-amber-200/80 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-amber-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                  Mistakes Notebook
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    mistakesCount > 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {mistakesCount} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                ভুল সংশোধন খাতা: Auto-collected incorrect answers for targeted revision.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
            <span>{mistakesCount > 0 ? 'Revise Errors' : 'View Notebook'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Saved Bookmarks */}
        <div
          onClick={() => navigate('/practice')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/practice')}
          className="group rounded-2xl sm:rounded-3xl bg-white border border-blue-200/80 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-blue-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200 group-hover:scale-105 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-xs">
              <Bookmark className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                  Saved Questions
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                  {bookmarksCount} Saved
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                সংরক্ষিত প্রশ্নাবলি: High-yield questions pinned during practice.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:text-sky-800">
            <span>View Bookmarks</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: FEATURED TEST SERIES (For Target Exam)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Curated Test Series
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Structured mock test series mapped to the official {selectedExam?.title} syllabus
            </p>
          </div>
          <Link
            to="/exams"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>All Series</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : testSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSeries.map((series) => {
              const count = series.testCount ?? series.testsCount ?? 0;
              return (
                <div
                  key={series.id}
                  onClick={() => navigate(`/exams/${selectedExam?.id || 'wbp-constable'}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && navigate(`/exams/${selectedExam?.id || 'wbp-constable'}`)
                  }
                  className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                          series.isPremium
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {series.isPremium ? 'PRO PASS' : 'FREE SERIES'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                        {count} {count === 1 ? 'Mock Test' : 'Mock Tests'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {series.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {series.description ||
                        `Comprehensive mock tests designed for ${selectedExam?.title} aspirants.`}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium truncate">
                      Exam: {series.examTitle || selectedExam?.title}
                    </span>
                    <span className="font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1 shrink-0">
                      Explore Series{' '}
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">
              No curated test series for {selectedExam?.title} yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You can practice individual subject and chapter tests below.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: AVAILABLE / RECENT MOCK TESTS
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Available Mock Tests
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time simulated tests with negative marking and detailed Bengali & English
              solutions
            </p>
          </div>
          <Link
            to="/exams"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>View All ({tests.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Compact Subject Chips */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 text-xs scrollbar-none">
            <span className="text-slate-400 text-xs font-semibold shrink-0">Subjects:</span>
            {subjects.map((subj) => (
              <button
                key={subj.id}
                onClick={() =>
                  navigate(`/exams/${selectedExam?.id || 'wbp-constable'}?tab=topic-tests`)
                }
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold whitespace-nowrap transition-all border border-slate-200/80 shadow-xs shrink-0 active:scale-[0.98]"
              >
                {subj.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.slice(0, 4).map((test) => {
              // Check user attempt status for this specific test
              const userAttempt = recentAttempts.find((a) => a.testId === test.id);
              const isCompleted = userAttempt?.status === 'completed';
              const isInProgress = userAttempt?.status === 'in_progress';
              const requiresPro = test.isPremium && !isPro;

              return (
                <div
                  key={test.id}
                  className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top row badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                          test.isPremium
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {test.isPremium ? 'PRO PASS' : 'FREE TEST'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 capitalize bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {test.testType.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Test Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {test.description ||
                          `Strictly mapped to the ${selectedExam?.title} pattern.`}
                      </p>
                    </div>

                    {/* Hierarchy metadata pills */}
                    {(test.subjectName || test.chapterName) && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {test.subjectName && (
                          <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200/70">
                            {test.subjectName}
                          </span>
                        )}
                        {test.chapterName && (
                          <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200/70">
                            {test.chapterName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Test Specs Bar */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-2.5 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {test.durationMinutes} Mins
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium">{test.totalQuestions} Questions</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium">{test.totalMarks} Marks</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-rose-600 font-bold">-{test.negativeMarking} Neg</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Attempt Status indicator */}
                    <div>
                      {isCompleted ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Scored {userAttempt?.score}/{test.totalMarks}
                        </span>
                      ) : isInProgress ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          Not Attempted
                        </span>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-2">
                      {isInProgress ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/exams/${test.id}/runner?attemptId=${userAttempt.id}`)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 px-4 py-2 rounded-xl"
                        >
                          Resume
                        </Button>
                      ) : isCompleted ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/exams/${test.id}/solutions/${userAttempt.id}`)
                            }
                            className="font-bold text-xs py-2 px-3.5 rounded-xl border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            Solutions
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/exams/${test.id}`)}
                            className="font-bold text-xs py-2 px-3 rounded-xl hover:bg-slate-200"
                          >
                            Retake
                          </Button>
                        </>
                      ) : requiresPro ? (
                        <Button
                          size="sm"
                          variant="pro"
                          onClick={() => navigate('/subscription')}
                          leftIcon={<Crown className="w-3.5 h-3.5 fill-white" />}
                          className="font-bold text-xs py-2 px-4 rounded-xl shadow-md"
                        >
                          Get Pro Pass
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/exams/${test.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 px-4 py-2 rounded-xl"
                        >
                          Start Test
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">
              No mock tests available for {selectedExam?.title} yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select another target exam above to explore available tests.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 6: RECOMMENDED / NEXT PRACTICE (Deterministic Logic)
          ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
            {mistakesCount > 0 ? (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            ) : unattemptedTest ? (
              <Target className="w-6 h-6 text-blue-600" />
            ) : (
              <Sparkles className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div className="space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              Recommended Next Practice
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {mistakesCount > 0
                ? `Revise ${mistakesCount} Question${mistakesCount > 1 ? 's' : ''} in Mistakes Notebook`
                : unattemptedTest
                  ? `Attempt: ${unattemptedTest.title}`
                  : `Review & Re-attempt ${selectedExam?.title} Mock Tests`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {mistakesCount > 0
                ? 'Eliminate negative marking by reviewing questions you previously answered incorrectly.'
                : unattemptedTest
                  ? 'You have not attempted this test yet. Complete it to benchmark your current speed and accuracy.'
                  : 'You have attempted all available tests for this exam. Re-attempt them to improve your score and speed.'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            if (mistakesCount > 0) {
              navigate('/practice');
            } else if (unattemptedTest) {
              navigate(`/exams/${unattemptedTest.id}`);
            } else {
              navigate('/exams');
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shrink-0 shadow-lg shadow-blue-500/20 px-5 py-3 rounded-xl self-stretch sm:self-auto"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {mistakesCount > 0
            ? 'Open Mistakes Notebook'
            : unattemptedTest
              ? 'Attempt Mock Test'
              : 'Explore Mock Tests'}
        </Button>
      </div>

      {/* =========================================================================
          SECTION 7: PERFORMANCE SNAPSHOT (Zero Fake Data Guarantee)
          ========================================================================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Performance Snapshot
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified analytics computed strictly from your actual completed mock tests
          </p>
        </div>

        {totalCompleted > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Metric 1: Tests Taken */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tests Taken
                </span>
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-3">
                {totalCompleted}
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">Completed tests</p>
            </div>

            {/* Metric 2: Average Score */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Average Score
                </span>
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-blue-600 mt-3">
                {avgScorePercentage}%
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {totalScoreEarned.toFixed(1)} / {totalMarksPossible} marks
              </p>
            </div>

            {/* Metric 3: Accuracy */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Accuracy
                </span>
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-3">
                {overallAccuracy}%
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {totalCorrect} Correct • {totalWrong} Wrong
              </p>
            </div>

            {/* Metric 4: Questions Practiced */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Questions Practiced
                </span>
                <div className="w-9 h-9 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-sky-700 mt-3">
                {totalAnswered}
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">Total questions answered</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No test attempts recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Attempt your first mock test to unlock real-time accuracy, score averages, and
              question analysis based strictly on your genuine performance.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/exams')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Attempt First Test
            </Button>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 8: PRO PASS CONVERSION / STATUS (PART F)
          ========================================================================= */}
      {!isPro ? (
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-orange-500/20">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <Crown className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                <Zap className="w-3.5 h-3.5 fill-white" />
                One pass. All premium tests.
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black">
                Unlock Every Premium Mock Test — ₹299 / 365 days
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
                PracticeKoro All-Access Pro Pass: One pass. All premium tests. Unlock all premium
                mock tests, complete bilingual solution keys, and targeted error notebooks across
                WBCS, WBP Constable, and WBPSC Clerkship.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/subscription')}
            className="bg-white text-slate-950 hover:bg-slate-100 font-black text-xs sm:text-sm whitespace-nowrap shadow-lg shrink-0 self-stretch sm:self-auto px-6 py-3.5 rounded-xl border border-white/40"
          >
            Get Pro Pass
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-amber-500/30 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-white">All-Access Pro Pass Active</h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {daysRemaining} Days Remaining
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Your premium access is active. Universal access unlocked to all premium tests.
              </p>
            </div>
          </div>
          <Link
            to="/subscription"
            className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 shrink-0 group self-stretch sm:self-auto justify-end"
          >
            <span>Subscription Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};
