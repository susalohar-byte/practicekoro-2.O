import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import type { TestAttempt } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Crown,
  Clock,
  BookOpen,
  Settings as SettingsIcon,
  Check,
  Zap,
  FileText,
  BarChart3,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isPro } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const { subscriptionDetails } = useSubscription();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(true);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  const activeSub = subscriptionDetails?.isActive || isPro;
  const isExpired = subscriptionDetails?.status === 'expired' || (!activeSub && !!subscriptionDetails?.hasSubscription);
  const daysRemaining = subscriptionDetails?.daysRemaining ?? (activeSub ? 365 : 0);

  const fetchAttempts = useCallback(async () => {
    if (!user) {
      setLoadingAttempts(false);
      return;
    }
    setLoadingAttempts(true);
    setAttemptsError(null);
    try {
      const data = await api.getUserAttempts(user.id);
      setAttempts(data || []);
    } catch (err) {
      console.error('Failed to load user attempts for profile:', err);
      setAttemptsError('Unable to load preparation summary. Please try again.');
    } finally {
      setLoadingAttempts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  // Compute genuine student metrics from completed attempts
  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const testsAttemptedCount = completedAttempts.length;

  const totalScore = completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const totalMaxMarks = completedAttempts.reduce((acc, a) => acc + (a.totalMarks || 100), 0);
  const avgScore = testsAttemptedCount > 0
    ? totalMaxMarks > 0
      ? Math.round((totalScore / totalMaxMarks) * 100)
      : Math.round(totalScore / testsAttemptedCount)
    : 0;

  const totalAccuracy = completedAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0);
  const avgAccuracy = testsAttemptedCount > 0
    ? Math.round(totalAccuracy / testsAttemptedCount)
    : 0;

  const totalQuestionsPracticed = completedAttempts.reduce(
    (acc, a) => acc + (a.correctCount || 0) + (a.wrongCount || 0),
    0
  );

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Active Student';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* A1. Profile Header */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-2xl border-2 border-brand-200 shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {user?.fullName || 'Student Aspirant'}
                </h1>
                {activeSub ? (
                  <Badge variant="premium" className="gap-1 font-bold">
                    <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    PRO PASS ACTIVE
                  </Badge>
                ) : isExpired ? (
                  <Badge variant="warning" className="gap-1 font-bold">
                    PRO PASS EXPIRED
                  </Badge>
                ) : (
                  <Badge variant="default" className="font-semibold">
                    FREE TIER
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100 flex items-center gap-1">
                  <span>🎯</span>
                  <span>Preparing for {selectedExam?.title || 'Competitive Exams'}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Student Account
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
              leftIcon={<SettingsIcon className="w-4 h-4 text-slate-500" />}
              className="text-slate-700 hover:text-slate-900 border-slate-200 text-xs font-bold"
            >
              Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* A2. Target Exam */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Your Target Exam 🎯</span>
              {selectedExam && (
                <span className="text-brand-600 font-extrabold">{selectedExam.title}</span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switching your target exam personalizes mock tests, subjects, and revision across PracticeKoro
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exams.map((exam) => {
            const isSelected = selectedExam?.id === exam.id;
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedExam(exam)}
                className={`p-3.5 rounded-xl text-left border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{exam.title}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{exam.category}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* A3. Preparation Summary */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              Preparation Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Genuine performance statistics from your completed mock tests
            </p>
          </div>
          {loadingAttempts && (
            <span className="text-xs text-slate-400">Loading metrics…</span>
          )}
        </div>

        {loadingAttempts ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-4 rounded-xl bg-slate-50 border border-slate-100 animate-pulse space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-6 w-10 bg-slate-300 rounded" />
              </div>
            ))}
          </div>
        ) : attemptsError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{attemptsError}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAttempts}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs border-rose-200 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </div>
        ) : testsAttemptedCount === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                No tests attempted yet. Start your first mock test to see your progress here.
              </p>
              <p className="text-[11px] text-slate-500">
                Your test scores, accuracy, and practice question stats will be tracked automatically.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/exams')}
              className="font-bold text-xs"
            >
              Browse Mock Tests
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Tests Attempted
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {testsAttemptedCount}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Average Score
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {avgScore}%
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Accuracy
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {avgAccuracy}%
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Questions Practiced
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {totalQuestionsPracticed}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* A4. Pro Pass Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Pro Pass Status
            </h2>
            <p className="text-xs text-slate-500">
              One active subscription gives you universal access to all premium mock tests
            </p>
          </div>
          <Link
            to="/subscription"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1"
          >
            Manage Subscription
          </Link>
        </div>

        {activeSub ? (
          <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  Pro Pass Active
                </div>
                <h3 className="text-xl font-black pt-1">
                  ₹299 / 365 Days
                </h3>
                <p className="text-xs text-amber-100 font-medium">
                  {daysRemaining > 0
                    ? `${daysRemaining} Days Remaining • All premium mock tests unlocked`
                    : 'Active • Universal Access to All Mock Tests'}
                </p>
                {subscriptionDetails?.expiresAt && (
                  <p className="text-[11px] text-amber-100/90 pt-1">
                    Expires on{' '}
                    {new Date(subscriptionDetails.expiresAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <Button
                  size="sm"
                  className="bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs shadow-sm"
                  onClick={() => navigate('/subscription')}
                >
                  View Subscription
                </Button>
              </div>
            </div>
          </Card>
        ) : isExpired ? (
          <Card className="p-6 bg-amber-50 border border-amber-300 text-slate-900 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="gap-1 font-bold">
                    PRO PASS EXPIRED
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 pt-1">
                  Pro Pass Expired
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Renew your Pro Pass to unlock premium mock tests.
                </p>
                <p className="text-[11px] text-amber-800">
                  Premium mock tests are currently locked.
                </p>
              </div>
              <Button
                variant="pro"
                size="md"
                onClick={() => navigate('/subscription')}
                className="font-bold text-xs shrink-0 shadow-sm"
              >
                Renew Pro Pass — ₹299
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  Free Plan
                </div>
                <h3 className="text-lg font-bold text-slate-900 pt-1">
                  Unlock all premium mock tests with Pro Pass.
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Transparent pricing: ₹299 / 365 Days
                </p>
              </div>
              <Button
                variant="pro"
                size="md"
                onClick={() => navigate('/subscription')}
                leftIcon={<Zap className="w-3.5 h-3.5" />}
                className="font-bold text-xs shrink-0 shadow-sm"
              >
                Get Pro Pass
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* A5. Account Information */}
      <Card className="p-6 border-slate-200 space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900">
          Account Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Full Name
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {user?.fullName || 'Not provided'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {user?.email || 'Not provided'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Account Role
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5 capitalize">
              {user?.role ? `${user.role} Account` : 'Student Account'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Member Since
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {memberSince}
            </p>
          </div>
        </div>
      </Card>

      {/* A6. Quick Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/results"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  My Tests
                </p>
                <p className="text-[11px] text-slate-500">
                  View completed attempts, scores & solutions
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/practice"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Practice & Revision
                </p>
                <p className="text-[11px] text-slate-500">
                  Revise mistake bank and bookmarked questions
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/subscription"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Subscription & Pass
                </p>
                <p className="text-[11px] text-slate-500">
                  Manage your All-Access Pro Pass & billing
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/settings"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                  Settings & Preferences
                </p>
                <p className="text-[11px] text-slate-500">
                  Language, target exam & account security
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
};
