import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
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
} from 'lucide-react';
import type { AdminDashboardV2Stats } from '@/types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardV2Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await api.getAdminDashboardV2Stats();
      setStats(data);
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

  const topStatCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      subLabel: `₹${(stats?.monthRevenue ?? 0).toLocaleString('en-IN')} this month`,
      icon: IndianRupee,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'Total Students',
      value: (stats?.totalStudents ?? 0).toLocaleString('en-IN'),
      subLabel: `${stats?.freeStudents ?? 0} Free Aspirants`,
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'New Students (30d)',
      value: (stats?.newStudents ?? 0).toLocaleString('en-IN'),
      subLabel: 'Recent registrations',
      icon: UserPlus,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'Pro Students',
      value: (stats?.proStudents ?? 0).toLocaleString('en-IN'),
      subLabel: 'Active subscribers',
      icon: Crown,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'Active Subscriptions',
      value: (stats?.activeSubscriptions ?? 0).toLocaleString('en-IN'),
      subLabel: 'Active passes running',
      icon: CreditCard,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'Total Questions',
      value: (stats?.totalQuestions ?? 0).toLocaleString('en-IN'),
      subLabel: `${stats?.topicQuestions ?? 0} Topic • ${stats?.pyqQuestions ?? 0} PYQ`,
      icon: FileQuestion,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/question-bank',
    },
    {
      label: 'Total Mock Tests',
      value: (stats?.totalTests ?? 0).toLocaleString('en-IN'),
      subLabel: `${stats?.fullMockTests ?? 0} Full • ${stats?.topicTests ?? 0} Topic`,
      icon: FileText,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      link: '/admin/tests',
    },
    {
      label: 'Total Exams',
      value: (stats?.totalExams ?? 0).toLocaleString('en-IN'),
      subLabel: 'Active exam categories',
      icon: Shield,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      link: '/admin/exams',
    },
  ];

  // Maximum value for revenue trend chart calculation
  const maxTrend = Math.max(...(stats?.revenueTrend?.map((t) => t.amount) || [100]), 100);

  return (
    <div className="space-y-7">
      {/* Header with Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              PracticeKoro Admin Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Live Database Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform overview: Revenue, student growth, question repository, and test
            performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 1. TOP STAT CARDS (8 CARDS) */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          Key Platform Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {topStatCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                to={c.link}
                className="group relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl border ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {c.label}
                  </p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                    {isLoading ? '...' : c.value}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{c.subLabel}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-white dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Quick Creation Actions
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Directly jump into creating content or tests in the appropriate console.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/admin/question-bank?action=add-question')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
            >
              <FileQuestion className="w-3.5 h-3.5 mr-1" />
              Add Questions
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/tests?create=topic')}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 mr-1 text-emerald-500 dark:text-emerald-400" />
              Create Topic Test
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/tests?create=full_mock')}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-500 dark:text-indigo-400" />
              Create Full Mock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/tests?create=pyq')}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-sm"
            >
              <ScrollText className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-amber-400" />
              Create PYQ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/exams?action=create')}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 mr-1 text-rose-500 dark:text-rose-400" />
              Add Exam
            </Button>
          </div>
        </div>
      </div>

      {/* 3. REVENUE OVERVIEW & TREND CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Numbers Breakdown */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Revenue Overview
            </h2>
            <Link
              to="/admin/subscriptions"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                Total Revenue
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                ₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">All-time transactions</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                Today's Revenue
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                ₹{(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">Recorded since 00:00</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                This Month
              </span>
              <span className="text-base font-black text-cyan-600 dark:text-cyan-400 mt-1 block">
                ₹{(stats?.monthRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">Current calendar month</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                This Year
              </span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                ₹{(stats?.yearRevenue ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">Current financial year</span>
            </div>
          </div>
        </div>

        {/* Real Revenue Trend Chart (Last 7 Days) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Revenue Trend (Last 7 Days)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Daily completed subscriptions volume verified via payment records.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ₹
              {(
                stats?.revenueTrend?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0
              ).toLocaleString('en-IN')}{' '}
              7d Total
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {stats?.revenueTrend && stats.revenueTrend.length > 0 ? (
              stats.revenueTrend.map((point) => {
                const heightPercent = Math.max(8, Math.round((point.amount / maxTrend) * 100));
                return (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{point.amount}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-900 rounded-t-lg overflow-hidden flex items-end h-32 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all duration-300 rounded-t-md"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                      {point.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-slate-500 py-10">
                No recent payment transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. STUDENT OVERVIEW & CONTENT OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Overview */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Student Overview
            </h2>
            <Link
              to="/admin/subscriptions"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
            >
              Manage Subscriptions & Users <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Total Registered Students
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {stats?.totalStudents ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                New Registrations (Last 30 Days)
              </span>
              <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                +{stats?.newStudents ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Active Practicing Students
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {stats?.activeStudents ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Free Tier Aspirants
              </span>
              <span className="text-xs font-black text-slate-600 dark:text-slate-400">
                {stats?.freeStudents ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Pro Subscribed Students
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {stats?.proStudents ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Content & Question Bank Overview
            </h2>
            <Link
              to="/admin/question-bank"
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
            >
              Open Question Bank <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                Topic Test Questions
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {stats?.topicQuestions ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">
                {stats?.topicTests ?? 0} Topic Tests
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                Full Mock Questions
              </span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {stats?.fullMockQuestions ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">
                {stats?.fullMockTests ?? 0} Full Mock Tests
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                PYQ Questions
              </span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                {stats?.pyqQuestions ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">{stats?.pyqTests ?? 0} PYQ Papers</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                Total Active Exams
              </span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                {stats?.totalExams ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">State exam targets</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY FEED */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Recent Platform Activity
          </h2>
          <span className="text-[11px] text-slate-500">Live operational events</span>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {stats.recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      act.type === 'payment'
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : act.type === 'registration'
                          ? 'bg-blue-500'
                          : act.type === 'test_created'
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                    }`}
                  />
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {act.description}
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {new Date(act.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">
            No recent platform activity logged yet.
          </p>
        )}
      </div>
    </div>
  );
};
