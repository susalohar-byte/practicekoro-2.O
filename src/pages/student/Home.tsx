import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
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
    totalMarksPossible > 0
      ? ((totalScoreEarned / totalMarksPossible) * 100).toFixed(1)
      : '0';

  const totalCorrect = completedAttempts.reduce((sum, a) => sum + (a.correctCount || 0), 0);
  const totalWrong = completedAttempts.reduce((sum, a) => sum + (a.wrongCount || 0), 0);
  const totalAnswered = totalCorrect + totalWrong;
  const overallAccuracy =
    totalAnswered > 0
      ? ((totalCorrect / totalAnswered) * 100).toFixed(1)
      : '0';

  // Derived Recommended Practice
  const attemptedTestIds = new Set(recentAttempts.map((a) => a.testId));
  const unattemptedTest = tests.find((t) => !attemptedTestIds.has(t.id));

  // Days remaining for Pro Pass
  const daysRemaining = subscriptionDetails?.daysRemaining ?? (isPro ? 365 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 pb-20">
      {/* ERROR BANNER */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-3 text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-rose-700 border-rose-300 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: HEADER & TARGET EXAM QUICK-SWITCHER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        {/* Left: Greeting & Student Name */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {getGreeting()}
            </span>
            {isPro && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                <Crown className="w-2.5 h-2.5 fill-white" />
                PRO PASS
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {user?.fullName || 'Student Aspirant'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Targeted preparation and rigorous mock tests for West Bengal competitive exams.
          </p>
        </div>

        {/* Right: Target Exam Switcher & Profile Quick Action */}
        <div className="flex items-center gap-2.5">
          {/* Target Exam Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-brand-500 hover:bg-slate-50 transition-all text-xs font-bold text-slate-800 active:scale-[0.98]"
              title="Click to switch your target exam"
            >
              <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-slate-500 font-medium">Target:</span>
              <span className="text-brand-700 max-w-[140px] sm:max-w-[200px] truncate">
                {selectedExam?.title || 'Select Exam'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Exam Dropdown Menu */}
            {isExamDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsExamDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-40 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                          className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-brand-50 text-brand-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{exam.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {exam.category.toUpperCase()} • {exam.totalVacancies || 'Govt'} Vacancies
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Avatar / Quick Link */}
          <Link
            to="/profile"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 flex items-center justify-center font-bold text-sm text-slate-700 hover:text-brand-700 transition-all shrink-0 shadow-xs relative"
            title="View Profile & Subscription"
          >
            {user?.fullName?.charAt(0) || 'U'}
            {isPro && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <Crown className="w-2.5 h-2.5 text-white fill-white" />
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: CONTINUE PRACTICE (High Priority Resumption / Onboarding)
          ========================================================================= */}
      {loading ? (
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
      ) : inProgressAttempt ? (
        // Priority A: In-Progress Test Resumption
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-5 sm:p-6 shadow-md border border-indigo-800/60 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                <Clock className="w-3 h-3 animate-spin" />
                TEST IN PROGRESS
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {inProgressAttempt.testTitle || 'Active Mock Test'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                You have an incomplete attempt. Your previous answers are safely saved.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-indigo-200">
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
              onClick={() => navigate(`/exam/${inProgressAttempt.testId}?attemptId=${inProgressAttempt.id}`)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-600/40 shrink-0"
              leftIcon={<Play className="w-4 h-4 fill-white" />}
            >
              Resume Test Now
            </Button>
          </div>
        </div>
      ) : latestCompletedAttempt ? (
        // Priority B: Latest Completed Test Performance & Review
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              LATEST ATTEMPT COMPLETED
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {latestCompletedAttempt.testTitle || 'Mock Test Completed'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {latestCompletedAttempt.examTitle || selectedExam?.title}
                {latestCompletedAttempt.subjectName ? ` • ${latestCompletedAttempt.subjectName}` : ''}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                Score: <span className="text-brand-700 font-bold">{latestCompletedAttempt.score}</span> / {latestCompletedAttempt.totalMarks}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                Accuracy: <span className="text-emerald-700 font-bold">{Math.round(latestCompletedAttempt.accuracy)}%</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                Correct: <span className="text-emerald-700">{latestCompletedAttempt.correctCount}</span> | Wrong: <span className="text-rose-700">{latestCompletedAttempt.wrongCount}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/results/${latestCompletedAttempt.id}`)}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-brand-600" />}
              className="text-xs font-bold"
            >
              Review Solutions
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/exam/${latestCompletedAttempt.testId}`)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs font-bold"
            >
              Re-attempt
            </Button>
          </div>
        </div>
      ) : (
        // Priority C: Clean First-Test Onboarding CTA
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 sm:p-7 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              TARGET PREPARATION • {selectedExam?.title || 'WBP CONSTABLE'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Start Your Preparation With a Free Mock Test
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience the exact test environment with timer countdown, bilingual questions, instant scoring, negative marking, and error analysis.
            </p>
          </div>
          <Button
            onClick={() => {
              const freeTest = tests.find((t) => !t.isPremium);
              if (freeTest) {
                navigate(`/exam/${freeTest.id}`);
              } else {
                navigate('/tests');
              }
            }}
            className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-600/40 shrink-0"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start First Mock Test
          </Button>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: QUICK PRACTICE ENTRY (3 Pillars)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Pillar 1: All Mock Tests */}
        <Card
          hoverable
          onClick={() => navigate('/tests')}
          className="p-4 sm:p-5 flex items-start gap-3.5 border-slate-200/90"
        >
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                All Mock Tests
              </h3>
              <Badge variant="outline" size="sm" className="font-semibold text-[10px]">
                {tests.length} Tests
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Chapter-wise, Subject-wise, and Full-length practice sets.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-brand-600 mt-2.5">
              <span>Open Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Card>

        {/* Pillar 2: Mistakes Notebook */}
        <Card
          hoverable
          onClick={() => navigate('/practice')}
          className="p-4 sm:p-5 flex items-start gap-3.5 border-amber-200/80 bg-gradient-to-br from-white to-amber-50/20"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                Mistakes Notebook
              </h3>
              <Badge
                variant={mistakesCount > 0 ? 'warning' : 'outline'}
                size="sm"
                className="font-bold text-[10px]"
              >
                {mistakesCount} Pending
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ভুল সংশোধন খাতা: Auto-collected incorrect answers for targeted revision.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 mt-2.5">
              <span>{mistakesCount > 0 ? 'Revise Errors' : 'View Notebook'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Card>

        {/* Pillar 3: Saved Bookmarks */}
        <Card
          hoverable
          onClick={() => navigate('/practice')}
          className="p-4 sm:p-5 flex items-start gap-3.5 border-blue-200/80 bg-gradient-to-br from-white to-blue-50/20"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                Saved Questions
              </h3>
              <Badge variant="info" size="sm" className="font-bold text-[10px]">
                {bookmarksCount} Saved
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              সংরক্ষিত প্রশ্নাবলি: High-yield questions pinned during practice.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-700 mt-2.5">
              <span>View Bookmarks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          SECTION 4: FEATURED TEST SERIES (For Target Exam)
          ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Curated Test Series
            </h2>
            <p className="text-xs text-slate-500">
              Structured mock test series mapped to the official {selectedExam?.title} syllabus
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>All Series</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : testSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {testSeries.map((series) => {
              const count = series.testCount ?? series.testsCount ?? 0;
              return (
                <Card
                  key={series.id}
                  hoverable
                  onClick={() => navigate(`/tests?series=${series.id}`)}
                  className="p-5 flex flex-col justify-between border-slate-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={series.isPremium ? 'premium' : 'free'} size="sm">
                        {series.isPremium ? 'PRO PASS' : 'FREE SERIES'}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {count} {count === 1 ? 'Mock Test' : 'Mock Tests'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {series.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {series.description || `Comprehensive mock tests designed for ${selectedExam?.title} aspirants.`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      Exam: {series.examTitle || selectedExam?.title}
                    </span>
                    <span className="font-bold text-brand-600 flex items-center gap-1">
                      Explore Series <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-5 text-center border-dashed border-slate-200 bg-slate-50/50">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">
              No curated test series for {selectedExam?.title} yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You can practice individual subject and chapter tests below.
            </p>
          </Card>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: AVAILABLE / RECENT MOCK TESTS
          ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Available Mock Tests
            </h2>
            <p className="text-xs text-slate-500">
              Real-time simulated tests with negative marking and detailed Bengali & English solutions
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All ({tests.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Compact Subject Chips */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium shrink-0">Subjects:</span>
            {subjects.map((subj) => (
              <button
                key={subj.id}
                onClick={() => navigate(`/tests?subject=${subj.id}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors border border-slate-200/60"
              >
                {subj.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
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
                <Card key={test.id} className="p-5 flex flex-col justify-between border-slate-200">
                  <div className="space-y-2.5">
                    {/* Top row badges */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={test.isPremium ? 'premium' : 'free'} size="sm">
                        {test.isPremium ? 'PRO PASS' : 'FREE TEST'}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-400 capitalize">
                        {test.testType.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Test Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {test.description || `Strictly mapped to the ${selectedExam?.title} pattern.`}
                      </p>
                    </div>

                    {/* Hierarchy metadata pills */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {test.subjectName && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                          {test.subjectName}
                        </span>
                      )}
                      {test.chapterName && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                          {test.chapterName}
                        </span>
                      )}
                    </div>

                    {/* Test Specs Bar */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {test.durationMinutes} Mins
                      </span>
                      <span>•</span>
                      <span>{test.totalQuestions} Questions</span>
                      <span>•</span>
                      <span>{test.totalMarks} Marks</span>
                      <span>•</span>
                      <span className="text-rose-600 font-medium">
                        -{test.negativeMarking} Neg
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Attempt Status indicator */}
                    <div>
                      {isCompleted ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Scored {userAttempt?.score}/{test.totalMarks}
                        </span>
                      ) : isInProgress ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          Not Attempted
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div>
                      {isInProgress ? (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/exam/${test.id}?attemptId=${userAttempt.id}`)}
                          className="font-bold text-xs"
                        >
                          Resume
                        </Button>
                      ) : isCompleted ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/results/${userAttempt.id}`)}
                            className="font-bold text-xs"
                          >
                            Solutions
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/exam/${test.id}`)}
                            className="font-bold text-xs"
                          >
                            Retake
                          </Button>
                        </div>
                      ) : requiresPro ? (
                        <Button
                          size="sm"
                          variant="pro"
                          onClick={() => navigate('/profile')}
                          leftIcon={<Crown className="w-3.5 h-3.5 fill-white" />}
                          className="font-bold text-xs"
                        >
                          Unlock Pro
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/exam/${test.id}`)}
                          className="font-bold text-xs"
                        >
                          Start Test
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">
              No mock tests available for {selectedExam?.title} yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select another target exam above to explore available tests.
            </p>
          </Card>
        )}
      </section>

      {/* =========================================================================
          SECTION 6: RECOMMENDED / NEXT PRACTICE (Deterministic Logic)
          ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/40 via-white to-brand-50/20 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-xl">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 border border-brand-200">
            {mistakesCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : unattemptedTest ? (
              <Target className="w-5 h-5 text-brand-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
              Recommended Next Practice
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {mistakesCount > 0
                ? `Revise ${mistakesCount} Question${mistakesCount > 1 ? 's' : ''} in Mistakes Notebook`
                : unattemptedTest
                ? `Attempt: ${unattemptedTest.title}`
                : `Review & Re-attempt ${selectedExam?.title} Mock Tests`}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
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
              navigate(`/exam/${unattemptedTest.id}`);
            } else {
              navigate('/tests');
            }
          }}
          className="font-bold text-xs sm:text-sm shrink-0 shadow-xs"
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
      <section className="space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Performance Snapshot
          </h2>
          <p className="text-xs text-slate-500">
            Verified analytics computed strictly from your actual completed mock tests
          </p>
        </div>

        {totalCompleted > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Metric 1: Tests Taken */}
            <Card className="p-4 sm:p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tests Taken
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{totalCompleted}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Completed tests
              </p>
            </Card>

            {/* Metric 2: Average Score */}
            <Card className="p-4 sm:p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Average Score
                </span>
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-brand-700 mt-2">
                {avgScorePercentage}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {totalScoreEarned.toFixed(1)} / {totalMarksPossible} marks
              </p>
            </Card>

            {/* Metric 3: Accuracy */}
            <Card className="p-4 sm:p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Accuracy
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                {overallAccuracy}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {totalCorrect} Correct • {totalWrong} Wrong
              </p>
            </Card>

            {/* Metric 4: Questions Practiced */}
            <Card className="p-4 sm:p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Questions Practiced
                </span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-700 mt-2">
                {totalAnswered}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Total questions answered
              </p>
            </Card>
          </div>
        ) : (
          <Card className="p-6 text-center border-dashed border-slate-200 bg-slate-50/50">
            <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-slate-700">
              No test attempts recorded yet
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Attempt your first mock test to unlock real-time accuracy, score averages, and question analysis based strictly on your genuine performance.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/tests')}
              className="mt-3 text-xs font-bold"
            >
              Attempt First Test
            </Button>
          </Card>
        )}
      </section>

      {/* =========================================================================
          SECTION 8: PRO PASS CONVERSION / STATUS
          ========================================================================= */}
      {!isPro ? (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <Crown className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-white" />
                One Pass • All Exams
              </div>
              <h3 className="text-base sm:text-lg font-black">
                PracticeKoro All-Access Pro Pass — ₹299 / 365 Days
              </h3>
              <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
                Unlock all premium mock tests, complete bilingual solution keys, and targeted error notebooks across WBCS, WBP Constable, WBPSC, and Primary TET.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/profile')}
            className="bg-white text-slate-900 hover:bg-slate-100 font-black text-xs sm:text-sm whitespace-nowrap shadow-md shrink-0 self-stretch sm:self-auto"
          >
            Get Pro Pass ₹299
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">
                  All-Access Pro Pass Active
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {daysRemaining} Days Remaining
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Universal access unlocked to all premium tests, questions, and solution keys.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
          >
            <span>Subscription Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
