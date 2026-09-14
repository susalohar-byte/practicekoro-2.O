import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Play,
  RotateCcw,
  Crown,
  ArrowRight,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  FileText,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { formatSeconds } from '@/lib/utils';
import type { TestAttempt } from '@/types';

type FilterTab = 'all' | 'in_progress' | 'completed';
type SortOption = 'recent' | 'highest_score';

export const MyTests: React.FC = () => {
  const { user } = useAuth();
  const { selectedExam } = useExam();
  const { isPro, subscriptionDetails } = useSubscription();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const loadAttempts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserAttempts(user.id);
      setAttempts(data || []);
    } catch (err: any) {
      console.error('Failed to load user attempts:', err);
      setError('Unable to load test history. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  const activeSub = isPro || subscriptionDetails?.isActive;
  const daysRemaining = subscriptionDetails?.daysRemaining ?? (activeSub ? 365 : 0);

  // Group attempts by testId to accurately calculate attempt numbers and improvement
  const attemptsWithMeta = useMemo(() => {
    // Sort chronologically ascending to compute attempt index
    const sortedChrono = [...attempts].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const testAttemptCounts: Record<string, number> = {};
    const testPreviousScores: Record<string, number> = {};

    const enriched = sortedChrono.map((attempt) => {
      const count = (testAttemptCounts[attempt.testId] || 0) + 1;
      testAttemptCounts[attempt.testId] = count;

      const previousScore = testPreviousScores[attempt.testId];
      testPreviousScores[attempt.testId] = attempt.score;

      const scoreDiff = previousScore !== undefined ? attempt.score - previousScore : undefined;

      return {
        ...attempt,
        attemptNumber: count,
        scoreDiff,
      };
    });

    // Mark latest attempt per test
    const latestAttemptIdPerTest: Record<string, string> = {};
    enriched.forEach((a) => {
      latestAttemptIdPerTest[a.testId] = a.id;
    });

    return enriched.map((a) => ({
      ...a,
      isLatestForTest: latestAttemptIdPerTest[a.testId] === a.id,
    }));
  }, [attempts]);

  // Filter and sort attempts
  const filteredAttempts = useMemo(() => {
    let list = attemptsWithMeta;

    if (activeTab === 'in_progress') {
      list = list.filter((a) => a.status === 'in_progress');
    } else if (activeTab === 'completed') {
      list = list.filter((a) => a.status === 'completed');
    }

    if (sortBy === 'recent') {
      return [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'highest_score') {
      return [...list].sort((a, b) => b.score - a.score);
    }

    return list;
  }, [attemptsWithMeta, activeTab, sortBy]);

  const inProgressCount = attempts.filter((a) => a.status === 'in_progress').length;
  const completedCount = attempts.filter((a) => a.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            My Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track your practice, results and progress.
          </p>
        </div>

        {/* Pro Pass Status Pill or CTA */}
        {activeSub ? (
          <div className="inline-flex items-center gap-2 p-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs">
            <Crown className="w-4 h-4 fill-amber-500 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-slate-900">Pro Pass Active</span>
              <span className="text-slate-500 ml-1.5">({daysRemaining}d left)</span>
            </div>
            <Link
              to="/profile"
              className="text-[11px] font-bold text-brand-600 hover:text-brand-700 ml-2 border-l border-amber-200 pl-2"
            >
              Details
            </Link>
          </div>
        ) : (
          <Button
            size="sm"
            variant="pro"
            onClick={() => navigate('/profile')}
            leftIcon={<Crown className="w-3.5 h-3.5 fill-white" />}
            className="font-extrabold text-xs shadow-xs self-start sm:self-auto"
          >
            Upgrade to Pro Pass (₹299/yr)
          </Button>
        )}
      </div>

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
            onClick={loadAttempts}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-rose-700 border-rose-300 hover:bg-rose-100 font-bold"
          >
            Retry
          </Button>
        </div>
      )}

      {/* =========================================================================
          FILTER & SORT BAR
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Tests</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {attempts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('in_progress')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'in_progress'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress</span>
            {inProgressCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'in_progress' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {inProgressCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="highest_score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          ATTEMPTS LIST
          ========================================================================= */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : attempts.length === 0 ? (
        // Clean First-Time Empty State
        <Card className="p-10 text-center border-dashed border-slate-200 bg-slate-50/50">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            Your test history will appear here.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Take your first chapter-wise or full-length mock test to track your accuracy, solutions, and score trends.
          </p>
          <Button
            onClick={() => navigate('/tests')}
            className="mt-4 font-bold text-xs sm:text-sm shadow-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Mock Tests
          </Button>
        </Card>
      ) : filteredAttempts.length === 0 ? (
        // Filter-Specific Empty State
        <Card className="p-8 text-center border-dashed border-slate-200 bg-slate-50/50">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">
            {activeTab === 'in_progress'
              ? 'No in-progress mock tests.'
              : 'No tests matching this filter.'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'in_progress'
              ? 'All your started mock tests have been submitted!'
              : 'Try selecting a different filter tab above.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('all')}
            className="mt-3 text-xs font-bold"
          >
            View All Tests
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt: any) => {
            const isInProgress = attempt.status === 'in_progress';
            const percentage =
              attempt.totalMarks > 0
                ? Math.round((attempt.score / attempt.totalMarks) * 100)
                : 0;

            return (
              <Card
                key={attempt.id}
                className={`p-5 sm:p-6 transition-all border ${
                  isInProgress
                    ? 'border-amber-300/80 bg-gradient-to-br from-amber-50/20 via-white to-white shadow-xs'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    {/* Header Pills: Status, Attempt Number, Date */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 animate-spin" />
                          IN PROGRESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          COMPLETED
                        </span>
                      )}

                      {/* Attempt Number Badge */}
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        Attempt #{attempt.attemptNumber}
                      </span>

                      {/* Latest Result Pill */}
                      {attempt.isLatestForTest && !isInProgress && (
                        <span className="bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded text-[10px] border border-brand-200">
                          LATEST RESULT
                        </span>
                      )}

                      {/* Premium / Free Badge */}
                      <Badge
                        variant={attempt.isPremium ? 'premium' : 'free'}
                        size="sm"
                        className="text-[10px]"
                      >
                        {attempt.isPremium ? 'PRO PASS' : 'FREE'}
                      </Badge>

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        {new Date(attempt.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Test Title */}
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {attempt.testTitle}
                      </h2>
                      {/* Hierarchy Breadcrumb */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                        <span>{attempt.examTitle || selectedExam?.title || 'WBP Constable'}</span>
                        {attempt.subjectName && (
                          <>
                            <span>›</span>
                            <span>{attempt.subjectName}</span>
                          </>
                        )}
                        {attempt.chapterName && (
                          <>
                            <span>›</span>
                            <span className="text-slate-700 font-semibold">{attempt.chapterName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    {isInProgress ? (
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex flex-wrap items-center gap-4 text-xs text-amber-900">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>
                            Time Elapsed:{' '}
                            <strong className="font-bold">
                              {Math.round(attempt.timeSpentSeconds / 60)} mins
                            </strong>
                          </span>
                        </div>
                        {attempt.durationMinutes && (
                          <div>
                            Allowed Duration: <strong>{attempt.durationMinutes} mins</strong>
                          </div>
                        )}
                        <span className="text-amber-700 text-[11px]">
                          Your answers are automatically saved on the server.
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {/* Score */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">
                            {attempt.score.toFixed(2)}{' '}
                            <span className="text-xs font-normal text-slate-500">
                              / {attempt.totalMarks}
                            </span>
                          </p>
                        </div>

                        {/* Percentage */}
                        <div className="p-2.5 bg-brand-50/40 rounded-xl border border-brand-100">
                          <p className="text-[10px] uppercase font-bold text-brand-600">Percentage</p>
                          <p className="text-sm font-black text-brand-700 mt-0.5">
                            {percentage}%
                          </p>
                        </div>

                        {/* Accuracy */}
                        <div className="p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-100">
                          <p className="text-[10px] uppercase font-bold text-emerald-600">Accuracy</p>
                          <p className="text-sm font-black text-emerald-700 mt-0.5">
                            {attempt.accuracy.toFixed(1)}%
                          </p>
                        </div>

                        {/* Time Taken */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Time Taken</p>
                          <p className="text-sm font-black text-slate-700 mt-0.5">
                            {formatSeconds(attempt.timeSpentSeconds)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Breakdown & Real Improvement Notice */}
                    {!isInProgress && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {attempt.correctCount} Correct
                          </span>
                          <span className="flex items-center gap-1 text-rose-600">
                            <XCircle className="w-3.5 h-3.5" /> {attempt.wrongCount} Wrong
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MinusCircle className="w-3.5 h-3.5" /> {attempt.skippedCount} Skipped
                          </span>
                        </div>

                        {/* Real Progression/Improvement indicator */}
                        {attempt.scoreDiff !== undefined && attempt.attemptNumber > 1 && (
                          <div
                            className={`text-[11px] font-bold flex items-center gap-1 ${
                              attempt.scoreDiff > 0
                                ? 'text-emerald-700'
                                : attempt.scoreDiff < 0
                                ? 'text-rose-600'
                                : 'text-slate-500'
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>
                              {attempt.scoreDiff > 0
                                ? `+${attempt.scoreDiff.toFixed(2)} marks vs Attempt #${attempt.attemptNumber - 1}`
                                : attempt.scoreDiff < 0
                                ? `${attempt.scoreDiff.toFixed(2)} marks vs Attempt #${attempt.attemptNumber - 1}`
                                : `Same score as Attempt #${attempt.attemptNumber - 1}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Right Column */}
                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {isInProgress ? (
                      <Button
                        onClick={() =>
                          navigate(`/tests/${attempt.testId}/runner?attemptId=${attempt.id}`)
                        }
                        className="font-bold text-xs sm:text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                        leftIcon={<Play className="w-4 h-4 fill-white" />}
                      >
                        Continue Test
                      </Button>
                    ) : (
                      <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch gap-2 w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/tests/${attempt.testId}/solutions/${attempt.id}`)
                          }
                          leftIcon={<FileText className="w-3.5 h-3.5 text-brand-600" />}
                          className="font-bold text-xs flex-1 lg:flex-initial justify-center"
                        >
                          Review Solutions
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            navigate(`/tests/${attempt.testId}/results/${attempt.id}`)
                          }
                          leftIcon={<BarChart3 className="w-3.5 h-3.5 text-slate-600" />}
                          className="font-bold text-xs flex-1 lg:flex-initial justify-center"
                        >
                          View Analysis
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/tests/${attempt.testId}`)}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          className="font-bold text-xs flex-1 lg:flex-initial justify-center border-slate-200 hover:bg-slate-50"
                        >
                          Re-attempt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
