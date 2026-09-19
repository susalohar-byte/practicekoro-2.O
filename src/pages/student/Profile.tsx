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
  ChevronRight,
  Pencil,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  X,
  CheckCircle2,
  Phone,
  LifeBuoy,
  MessageSquare,
} from 'lucide-react';
import { StudentSupportModal } from '@/components/student/StudentSupportModal';

export const Profile: React.FC = () => {
  const { user, isPro, updateProfile } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const { subscriptionDetails } = useSubscription();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(true);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  // Student name edit states
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportModalTab, setSupportModalTab] = useState<'create' | 'history'>('create');

  const openNameEditor = () => {
    setNameInput(user?.fullName || '');
    setPhoneInput(user?.phone || '');
    setEditError(null);
    setIsEditingName(true);
  };

  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setEditError('Please enter a valid full name (at least 2 characters).');
      return;
    }
    if (trimmed.length > 60) {
      setEditError('Full name must not exceed 60 characters.');
      return;
    }

    setIsSavingName(true);
    setEditError(null);

    const res = await updateProfile({
      fullName: trimmed,
      phone: phoneInput.trim() || undefined,
    });

    setIsSavingName(false);

    if (res.error) {
      setEditError(res.error.message || 'Failed to update name. Please try again.');
    } else {
      setIsEditingName(false);
      setSaveSuccessMessage('Profile name updated successfully!');
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    }
  };

  const activeSub = subscriptionDetails?.isActive || isPro;
  const isExpired =
    subscriptionDetails?.status === 'expired' ||
    (!activeSub && !!subscriptionDetails?.hasSubscription);
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
  const avgScore =
    testsAttemptedCount > 0
      ? totalMaxMarks > 0
        ? Math.round((totalScore / totalMaxMarks) * 100)
        : Math.round(totalScore / testsAttemptedCount)
      : 0;

  const totalAccuracy = completedAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0);
  const avgAccuracy = testsAttemptedCount > 0 ? Math.round(totalAccuracy / testsAttemptedCount) : 0;

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
      {/* Save Success Toast Banner */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* A1. Profile Header */}
      <Card className="p-6 sm:p-7 border-slate-200/90 bg-gradient-to-br from-white via-blue-50/25 to-indigo-50/20 relative overflow-hidden shadow-sm">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md ring-4 ring-white shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <button
                type="button"
                onClick={openNameEditor}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white text-blue-600 shadow-md border border-slate-200 hover:bg-blue-50 transition-transform hover:scale-110"
                title="Edit student name"
                aria-label="Edit student name"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{user?.fullName || 'Student Aspirant'}</span>
                  <button
                    type="button"
                    onClick={openNameEditor}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                    title="Edit Name"
                    aria-label="Edit student name"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </h1>
                {activeSub ? (
                  <Badge variant="premium" className="gap-1 font-bold shadow-sm">
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
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100 flex items-center gap-1">
                  <span>🎯</span>
                  <span>Preparing for {selectedExam?.title || 'Competitive Exams'}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  Student Account
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={openNameEditor}
              leftIcon={<Pencil className="w-3.5 h-3.5 text-blue-600" />}
              className="text-blue-700 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-100/70 border-blue-200 text-xs font-bold"
            >
              Edit Name
            </Button>
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
              Switching your target exam personalizes mock tests, subjects, and revision across
              PracticeKoro
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
          {loadingAttempts && <span className="text-xs text-slate-400">Loading metrics…</span>}
        </div>

        {loadingAttempts ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 animate-pulse space-y-2"
              >
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
                Your test scores, accuracy, and practice question stats will be tracked
                automatically.
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
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{avgScore}%</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Accuracy
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{avgAccuracy}%</p>
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
                <h3 className="text-xl font-black pt-1">₹299 / 365 Days</h3>
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
                <h3 className="text-lg font-black text-slate-900 pt-1">Pro Pass Expired</h3>
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
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Account Information</h2>
          <button
            type="button"
            onClick={openNameEditor}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <Pencil className="w-3 h-3" />
            <span>Edit Name</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {user?.fullName || 'Not provided'}
              </p>
            </div>
            <button
              type="button"
              onClick={openNameEditor}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {user?.email || 'Not provided'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Account Role</span>
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5 capitalize">
              {user?.role ? `${user.role} Account` : 'Student Account'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Member Since</span>
            </p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{memberSince}</p>
          </div>
        </div>
      </Card>

      {/* A6. Quick Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Access</h2>
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

          <button
            type="button"
            onClick={() => {
              setSupportModalTab('create');
              setIsSupportModalOpen(true);
            }}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Support & Help Desk
                </p>
                <p className="text-[11px] text-slate-500">
                  সাহায্য ও সাপোর্ট: Raise tickets & report issues
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Dedicated Support Desk Card */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>সাপোর্ট ও অভিযোগ ডেস্ক (Direct Support Desk)</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                পেমেন্ট বিলম্ব, টেস্টের প্রশ্ন বা স্কোরকার্ড সংক্রান্ত যেকোনো বিষয়ে সরাসরি অভিযোগ
                বা প্রশ্ন জানান।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSupportModalTab('history');
                setIsSupportModalOpen(true);
              }}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              className="text-xs font-bold grow sm:grow-0"
            >
              টিকেট হিস্ট্রি
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setSupportModalTab('create');
                setIsSupportModalOpen(true);
              }}
              leftIcon={<LifeBuoy className="w-3.5 h-3.5" />}
              className="text-xs font-bold grow sm:grow-0"
            >
              টিকেট তৈরি করুন
            </Button>
          </div>
        </div>
      </div>

      {/* Name Edit Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Student Profile</h3>
                  <p className="text-xs text-slate-500">
                    Update your name for mock tests and scorecard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSavingName && setIsEditingName(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveName} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Avatar Live Preview */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-blue-50/40 border border-blue-100">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'Candidate'}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm ring-1 ring-blue-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {nameInput.trim()
                      ? nameInput.trim().charAt(0).toUpperCase()
                      : user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {nameInput.trim() || user?.fullName || 'Candidate Name'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Student display preview across portal
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSavingName}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 text-slate-900 transition-all"
                    maxLength={60}
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Minimum 2 characters. Only genuine candidate names recommended for official
                  scorecard alignment.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Phone (Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    disabled={isSavingName}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 text-slate-900 transition-all"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingName}
                  onClick={() => setIsEditingName(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingName || !nameInput.trim()}
                  className="text-xs font-bold"
                  leftIcon={
                    isSavingName ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {isSavingName ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Support Ticket Modal */}
      <StudentSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        initialTab={supportModalTab}
      />
    </div>
  );
};
