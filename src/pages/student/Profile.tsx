import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import type { TestAttempt } from '@/types';
import {
  Crown,
  Clock,
  Bookmark,
  BarChart3,
  AlertCircle,
  Trophy,
  CreditCard,
  Settings as SettingsIcon,
  LifeBuoy,
  Pencil,
  ChevronRight,
  LogOut,
  Mail,
  CheckCircle2,
  X,
  Phone,
  RefreshCw,
  Check,
  Target,
  MessageSquare,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { StudentSupportModal } from '@/components/student/StudentSupportModal';
import { ExamSelectorModal } from '@/components/student/ExamSelectorModal';
import { OnboardingModal } from '@/components/student/OnboardingModal';

export const Profile: React.FC = () => {
  const { user, isPro, updateProfile, logout } = useAuth();
  const { selectedExam } = useExam();
  const { subscriptionDetails } = useSubscription();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(true);

  // Modal states
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportModalTab, setSupportModalTab] = useState<'create' | 'history'>('create');
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);

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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/landing');
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
    try {
      const data = await api.getUserAttempts(user.id);
      setAttempts(data || []);
    } catch (err) {
      console.error('Failed to load user attempts for profile:', err);
    } finally {
      setLoadingAttempts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  // Compute genuine performance metrics
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

  // Menu items config matching Screen 17
  const menuItems = [
    {
      id: 'my-tests',
      title: 'My Tests',
      subtitle: 'View attempted mock tests, solutions & ranks',
      icon: Clock,
      color: 'bg-blue-50 text-blue-600',
      action: () => navigate('/results'),
    },
    {
      id: 'saved-questions',
      title: 'Saved Questions',
      subtitle: 'Revise bookmarks & important notes',
      icon: Bookmark,
      color: 'bg-purple-50 text-purple-600',
      action: () => navigate('/practice?tab=bookmarks'),
    },
    {
      id: 'my-results',
      title: 'My Results & Analytics',
      subtitle: 'Scorecards, percentiles & performance charts',
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-600',
      action: () => navigate('/results'),
    },
    {
      id: 'mistakes',
      title: 'Mistake Bank',
      subtitle: 'Focus on questions answered incorrectly',
      icon: AlertCircle,
      color: 'bg-rose-50 text-rose-600',
      action: () => navigate('/practice?tab=mistakes'),
    },
    {
      id: 'rank',
      title: 'Rank',
      subtitle: 'All Bengal aspirant ranks & top scores',
      icon: Trophy,
      color: 'bg-amber-50 text-amber-600',
      action: () => navigate('/rank'),
    },
    {
      id: 'subscription',
      title: 'My Subscriptions',
      subtitle: 'Manage Pro Pass, billing & invoice details',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
      action: () => navigate('/subscription'),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Target exam, app preferences & security',
      icon: SettingsIcon,
      color: 'bg-slate-100 text-slate-700',
      action: () => navigate('/settings'),
    },
    {
      id: 'support',
      title: 'Support & Help Desk',
      subtitle: 'Raise tickets & report issues to administration',
      icon: LifeBuoy,
      color: 'bg-sky-50 text-sky-600',
      action: () => {
        setSupportModalTab('create');
        setIsSupportModalOpen(true);
      },
    },
    {
      id: 'tour',
      title: 'Platform Tour & Guide',
      subtitle: 'Watch animated tour of mock tests, PYQ and rank features',
      icon: Sparkles,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      action: () => setIsOnboardingModalOpen(true),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-28 md:pb-16">
      {/* Toast Alert */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Responsive Layout: 1-col on mobile, 12-col grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (Desktop 5 cols): Candidate Hero Card + Support Desk + Logout */}
        <div className="lg:col-span-5 space-y-5">
          {/* Screen 17: Dark Navy Candidate Hero Header */}
          <div className="rounded-3xl bg-gradient-to-br from-[#063585] via-[#0940a0] to-[#04245c] text-white p-6 shadow-xl relative overflow-hidden">
            {/* Glow backdrop shapes */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Top Row: User Avatar & Info */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-400 to-indigo-300 text-[#063585] flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/20 shrink-0">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <button
                      type="button"
                      onClick={openNameEditor}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white text-[#063585] shadow-md hover:bg-blue-50 transition-transform hover:scale-110"
                      title="Edit profile"
                      aria-label="Edit profile"
                    >
                      <Pencil className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <span>{user?.fullName || 'Student Aspirant'}</span>
                    </h1>
                    <p className="text-xs text-blue-200/80 flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                      <span className="truncate max-w-[180px] sm:max-w-xs">{user?.email}</span>
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={openNameEditor}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 shrink-0"
                  title="Edit details"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Target Exam Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-semibold">
                <div className="flex items-center gap-2 text-blue-100">
                  <Target className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Target:</span>
                  <span className="text-white font-bold">{selectedExam?.title || 'Competitive Exams'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(true)}
                  className="text-amber-300 hover:text-amber-200 text-xs font-extrabold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Screen 17: Pro Plan Status Card */}
              {activeSub ? (
                <div className="rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 p-4 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Crown className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Pro Pass Active
                        </span>
                        <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
                          PRO
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800">
                        {daysRemaining > 0
                          ? `${daysRemaining} Days Remaining • All tests unlocked`
                          : 'Unlimited Mock Tests & Solutions'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="px-3.5 py-1.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-xs font-black shadow-sm shrink-0 transition-transform active:scale-95"
                  >
                    Manage
                  </button>
                </div>
              ) : isExpired ? (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider">Pro Pass Expired</span>
                      <p className="text-[11px] text-amber-100 font-medium">Renew for full mock test access</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="px-3.5 py-1.5 rounded-full bg-white text-orange-950 hover:bg-amber-50 text-xs font-black shadow-sm shrink-0 transition-transform active:scale-95"
                  >
                    Renew ₹299
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 p-4 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Crown className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Free Aspirant Plan
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800">
                        Upgrade to Pro for full mock tests & PYQ
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="px-4 py-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-xs font-black shadow-sm shrink-0 transition-transform active:scale-95"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Support Desk Card (Desktop view) */}
          <div className="hidden lg:block p-5 rounded-3xl border border-blue-100 dark:border-slate-700 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Direct Support Desk
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open a support ticket to get help with payments or tests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSupportModalTab('history');
                  setIsSupportModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex-1 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ticket History</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSupportModalTab('create');
                  setIsSupportModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex-1 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            </div>
          </div>

          {/* Screen 17: Log Out Button (Desktop view) */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden lg:flex w-full p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of PracticeKoro</span>
          </button>
        </div>

        {/* RIGHT COLUMN (Desktop 7 cols): Performance Metrics + Menu Grid */}
        <div className="lg:col-span-7 space-y-5">
          {/* Screen 17: Performance Metrics Bar */}
          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tests</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {loadingAttempts ? '–' : testsAttemptedCount}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Score</p>
              <p className="text-lg sm:text-xl font-black text-blue-600 mt-0.5">
                {loadingAttempts ? '–' : `${avgScore}%`}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</p>
              <p className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
                {loadingAttempts ? '–' : `${avgAccuracy}%`}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions</p>
              <p className="text-lg sm:text-xl font-black text-purple-600 mt-0.5">
                {loadingAttempts ? '–' : totalQuestionsPracticed}
              </p>
            </div>
          </div>

          {/* Screen 17: Menu Items List (Mobile) & 2-Col Card Grid (Desktop) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xs p-3 sm:p-4">
            <div className="px-2 py-2 mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Account & Study Services</h3>
                <p className="text-[11px] text-slate-400">Manage your tests, preparation, and support</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-blue-50/60 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all text-left group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOBILE ONLY: Dedicated Support Desk Card & Logout (Screen 17 mobile order) */}
          <div className="lg:hidden space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl border border-blue-100 dark:border-slate-700 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Direct Support Desk</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Raise tickets for payment issues, test questions, or scorecard inquiries.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSupportModalTab('history');
                    setIsSupportModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5 grow sm:grow-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ticket History</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSupportModalTab('create');
                    setIsSupportModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 grow sm:grow-0 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of PracticeKoro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Student Profile</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-blue-50/40 border border-blue-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {nameInput.trim()
                    ? nameInput.trim().charAt(0).toUpperCase()
                    : user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {nameInput.trim() || user?.fullName || 'Candidate Name'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Student display preview across portal
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isSavingName}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 text-slate-900 dark:text-white dark:bg-slate-700 transition-all"
                  maxLength={60}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Phone (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={isSavingName}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 text-slate-900 dark:text-white dark:bg-slate-700 transition-all"
                  maxLength={20}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  disabled={isSavingName}
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingName || !nameInput.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingName ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Exam Selection Modal */}
      <ExamSelectorModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        mode="flow"
      />

      {/* Student Support Ticket Modal */}
      <StudentSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        initialTab={supportModalTab}
      />

      {/* Animated Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
};
