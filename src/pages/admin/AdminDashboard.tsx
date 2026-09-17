import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import {
  IndianRupee,
  Users,
  UserPlus,
  FileQuestion,
  FileText,
  Shield,
  CreditCard,
  Crown,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Layers,
  ScrollText,
  Activity,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
  Zap,
  GraduationCap,
} from 'lucide-react';
import type { AdminDashboardV2Stats } from '@/types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardV2Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await api.getAdminDashboardV2Stats();
      setStats(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Maximum value for revenue trend chart calculation
  const maxTrend = Math.max(...(stats?.revenueTrend?.map((t) => t.amount) || [100]), 100);

  // Conversion calculations
  const totalStudents = stats?.totalStudents ?? 0;
  const proStudents = stats?.proStudents ?? 0;
  const freeStudents = stats?.freeStudents ?? 0;
  const proConversionRate =
    totalStudents > 0 ? ((proStudents / totalStudents) * 100).toFixed(1) : '0.0';

  // Question distribution percentages
  const totalQuestions = stats?.totalQuestions ?? 0;
  const topicQuestions = stats?.topicQuestions ?? 0;
  const fullMockQuestions = stats?.fullMockQuestions ?? 0;
  const pyqQuestions = stats?.pyqQuestions ?? 0;

  const topicQPercent =
    totalQuestions > 0 ? Math.round((topicQuestions / totalQuestions) * 100) : 0;
  const fullMockQPercent =
    totalQuestions > 0 ? Math.round((fullMockQuestions / totalQuestions) * 100) : 0;
  const pyqQPercent = totalQuestions > 0 ? Math.max(0, 100 - topicQPercent - fullMockQPercent) : 0;

  return (
    <div className="space-y-7">
      {/* ─── 1. TOP HERO COMMAND BANNER ─── */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs overflow-hidden transition-all">
        {/* Subtle background ambient glows */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: Branding & Status */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50 dark:ring-indigo-950/40">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Admin Command Center
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operational Metrics
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Real-time platform intelligence: Financial revenue, student conversion, question
                repository, and test performance.
              </p>
            </div>
          </div>

          {/* Right: Actions & Last Updated */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Last updated
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                {lastRefreshed.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              title="Refresh Dashboard Statistics"
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold inline-flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`}
              />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. PRIMARY 4 HERO KPI CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <Link
          to="/admin/subscriptions"
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              This Month
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {isLoading ? '...' : `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            </h3>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span>₹{(stats?.monthRevenue ?? 0).toLocaleString('en-IN')} earned this month</span>
            </p>
          </div>
        </Link>

        {/* Card 2: Pro Students */}
        <Link
          to="/admin/subscriptions"
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/40 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {proConversionRate}% Ratio
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pro Subscribers
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {isLoading ? '...' : (stats?.proStudents ?? 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
              {(stats?.activeSubscriptions ?? 0).toLocaleString('en-IN')} active subscription passes
            </p>
          </div>
        </Link>

        {/* Card 3: Total Questions */}
        <Link
          to="/admin/question-bank"
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs group-hover:scale-105 transition-transform">
              <FileQuestion className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Repository
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Questions
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {isLoading ? '...' : (stats?.totalQuestions ?? 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1 truncate">
              {stats?.topicQuestions ?? 0} Topic • {stats?.pyqQuestions ?? 0} PYQ questions
            </p>
          </div>
        </Link>

        {/* Card 4: Total Mock Tests */}
        <Link
          to="/admin/tests"
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/40 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Test Series
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Mock Tests
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {isLoading ? '...' : (stats?.totalTests ?? 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-1 truncate">
              {stats?.fullMockTests ?? 0} Full Mock • {stats?.topicTests ?? 0} Topic Tests
            </p>
          </div>
        </Link>
      </div>

      {/* ─── 3. SECONDARY COMPACT METRICS BAR ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/admin/subscriptions"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Total Students
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : (stats?.totalStudents ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </Link>

        <Link
          to="/admin/subscriptions"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-900/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
              New (30 Days)
            </span>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
              +{isLoading ? '...' : (stats?.newStudents ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </Link>

        <Link
          to="/admin/subscriptions"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Free Aspirants
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : (stats?.freeStudents ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </Link>

        <Link
          to="/admin/exams"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Active Exams
            </span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400">
              {isLoading ? '...' : (stats?.totalExams ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </Link>
      </div>

      {/* ─── 4. QUICK ACTION STUDIO (CREATION TILES) ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Quick Creation Studio
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct shortcuts to create questions, build tests, or manage exams.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Click any tile to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Action 1: Add Questions */}
          <button
            type="button"
            onClick={() => navigate('/admin/question-bank')}
            className="group relative text-left p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-4 h-4 stroke-[2.2]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Add Questions
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Import TXT file or add single MCQs
            </p>
          </button>

          {/* Action 2: Create Full Mock */}
          <button
            type="button"
            onClick={() => navigate('/admin/tests?create=full_mock')}
            className="group relative text-left p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4 stroke-[2.2]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Create Full Mock
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Timed exam simulation with ranking
            </p>
          </button>

          {/* Action 3: Create Topic Test */}
          <button
            type="button"
            onClick={() => navigate('/admin/tests?create=topic')}
            className="group relative text-left p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Create Topic Test
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Chapter & subject syllabus quiz
            </p>
          </button>

          {/* Action 4: Create PYQ */}
          <button
            type="button"
            onClick={() => navigate('/admin/tests?create=pyq')}
            className="group relative text-left p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shadow-amber-600/30 group-hover:scale-105 transition-transform">
                <ScrollText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Create PYQ Paper
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Previous year solved question papers
            </p>
          </button>

          {/* Action 5: Add Exam */}
          <button
            type="button"
            onClick={() => navigate('/admin/exams?action=create')}
            className="group relative text-left p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/50 to-transparent dark:from-rose-950/20 dark:to-transparent hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Add Target Exam
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Setup exam categories & patterns
            </p>
          </button>
        </div>
      </div>

      {/* ─── 5. REVENUE PERFORMANCE & 7-DAY REVENUE ANALYTICS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Financial Breakdown Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Revenue Breakdown
              </h2>
            </div>
            <Link
              to="/admin/subscriptions"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1"
            >
              All Passes <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total All-Time
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block tracking-tight">
                ₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Lifetime gross</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Today
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block tracking-tight">
                ₹{(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Since midnight</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                This Month
              </span>
              <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-1 block tracking-tight">
                ₹{(stats?.monthRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Current month</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                This Year
              </span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 block tracking-tight">
                ₹{(stats?.yearRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Fiscal year</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Revenue Analytics (Last 7 Days)
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Daily completed subscriptions volume verified via payment records.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              ₹
              {(
                stats?.revenueTrend?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0
              ).toLocaleString('en-IN')}{' '}
              Past 7 Days
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
            {stats?.revenueTrend && stats.revenueTrend.length > 0 ? (
              stats.revenueTrend.map((point) => {
                const heightPercent = Math.max(8, Math.round((point.amount / maxTrend) * 100));
                return (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{point.amount}
                    </span>
                    <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-950 rounded-t-xl overflow-hidden flex items-end h-28 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500 transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 group-hover:from-emerald-600 group-hover:to-teal-400 transition-all duration-300 rounded-t-lg shadow-sm"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                      {point.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-slate-500 py-10">
                No recent payment transactions recorded in the last 7 days.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 6. DUAL INTELLIGENCE: STUDENT BASE & CONTENT ENGINE ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Overview & Pro Conversion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Student Base & Conversion
              </h2>
            </div>
            <Link
              to="/admin/subscriptions"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1"
            >
              Manage Students <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Pro Subscriber Conversion
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                {proConversionRate}% ({proStudents} Pro / {totalStudents} Total)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, parseFloat(proConversionRate))}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Total Registered Aspirants
                </span>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {totalStudents.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  New Registrations (30 Days)
                </span>
              </div>
              <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                +{(stats?.newStudents ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Pro Subscribed Students
                </span>
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {proStudents.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Free Tier Aspirants
                </span>
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                {freeStudents.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Engine & Repository Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Content Engine Distribution
              </h2>
            </div>
            <Link
              to="/admin/question-bank"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1"
            >
              Open Question Bank <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Question Distribution
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {totalQuestions} Total Questions
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${topicQPercent}%` }}
                title={`Topic Tests: ${topicQPercent}%`}
                className="h-full bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{ width: `${fullMockQPercent}%` }}
                title={`Full Mock: ${fullMockQPercent}%`}
                className="h-full bg-indigo-500 transition-all duration-500"
              />
              <div
                style={{ width: `${pyqQPercent}%` }}
                title={`PYQ: ${pyqQPercent}%`}
                className="h-full bg-amber-500 transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Topic ({topicQPercent}%)
              </span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Full Mock (
                {fullMockQPercent}%)
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> PYQ ({pyqQPercent}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Topic Test Questions
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {topicQuestions}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Across {stats?.topicTests ?? 0} Topic Tests
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Full Mock Questions
              </span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {fullMockQuestions}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Across {stats?.fullMockTests ?? 0} Full Tests
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                PYQ Questions
              </span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {pyqQuestions}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Across {stats?.pyqTests ?? 0} PYQ Papers
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Exams
              </span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400 mt-1 block">
                {stats?.totalExams ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                State syllabus targets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 7. LIVE OPERATIONAL ACTIVITY FEED ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Live Platform Activity Stream
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Recent user enrollments, payments, and system updates
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {stats.recentActivity.map((act) => {
              const isPayment = act.type === 'payment';
              const isRegistration = act.type === 'registration';
              const isTest = act.type === 'test_created';

              return (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPayment
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400'
                          : isRegistration
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400'
                            : isTest
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'
                              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isPayment ? (
                        <CreditCard className="w-4 h-4" />
                      ) : isRegistration ? (
                        <UserPlus className="w-4 h-4" />
                      ) : isTest ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                      {act.description}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-1">
            <Activity className="w-8 h-8 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold">No recent platform activity logged yet</p>
            <p className="text-[11px]">Real-time student actions and payments will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
