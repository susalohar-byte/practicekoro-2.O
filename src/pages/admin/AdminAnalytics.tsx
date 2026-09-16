import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  BarChart2,
  Users,
  CheckCircle2,
  FileQuestion,
  Layers,
  Shield,
  BookOpen,
  TrendingUp,
  FolderTree,
} from 'lucide-react';
import type { AdminDashboardStats, MockTest } from '@/types';

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dashboardStats, allTests] = await Promise.all([
          api.getAdminDashboardStats(),
          api.getAllAdminTests(),
        ]);
        setStats(dashboardStats);
        setTests(allTests);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const fullMockCount = tests.filter((t) => t.testType === 'full_mock').length;
  const pyqCount = tests.filter((t) => t.testType === 'pyq').length;
  const topicTestCount = tests.filter(
    (t) => t.testType === 'topic' || t.testType === 'chapter_mock'
  ).length;

  const completionPercent = stats?.totalAttempts
    ? Math.round(((stats.completedAttempts ?? 0) / stats.totalAttempts) * 100)
    : 0;

  const publishedPercent = stats?.totalTests
    ? Math.round(((stats.publishedTests ?? 0) / stats.totalTests) * 100)
    : 0;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BarChart2 className="w-6 h-6 text-indigo-400" />
              Platform Overview & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-time Metrics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Holistic data intelligence on candidate attempts, mock test distribution, and question
            bank coverage.
          </p>
        </div>
      </div>

      {/* Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Registered Aspirants
              </p>
              <p className="text-3xl font-black text-white mt-1.5">
                {isLoading ? '...' : (stats?.totalStudents ?? 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-indigo-400 mt-3 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> State exam candidates
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Total Attempts
              </p>
              <p className="text-3xl font-black text-white mt-1.5">
                {isLoading ? '...' : (stats?.totalAttempts ?? 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-400 mt-3 font-semibold">
            {stats?.completedAttempts ?? 0} completed ({completionPercent}%)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Question Bank
              </p>
              <p className="text-3xl font-black text-white mt-1.5">
                {isLoading ? '...' : (stats?.totalQuestions ?? 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-purple-400 mt-3 font-semibold">
            {stats?.activeQuestions ?? 0} verified active
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Total Tests Created
              </p>
              <p className="text-3xl font-black text-white mt-1.5">
                {isLoading ? '...' : (stats?.totalTests ?? 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-400 mt-3 font-semibold">
            {stats?.publishedTests ?? 0} published ({publishedPercent}%)
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Architecture Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Content Inventory by Format
            </h2>
            <span className="text-[11px] font-bold text-slate-400">3 Isolated Categories</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  📚
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Topic Mock Tests</p>
                  <p className="text-[11px] text-slate-400">Subject → Topic drills</p>
                </div>
              </div>
              <span className="text-base font-black text-blue-400">{topicTestCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  🎯
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Full Mock Tests</p>
                  <p className="text-[11px] text-slate-400">Exam-level full length mocks</p>
                </div>
              </div>
              <span className="text-base font-black text-indigo-400">{fullMockCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  📜
                </div>
                <div>
                  <p className="text-xs font-bold text-white">PYQ Official Papers</p>
                  <p className="text-[11px] text-slate-400">Exam → Year → Paper papers</p>
                </div>
              </div>
              <span className="text-base font-black text-amber-400">{pyqCount}</span>
            </div>
          </div>
        </div>

        {/* Syllabus Hierarchy Coverage */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              Syllabus Hierarchy Coverage
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Structure</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <Shield className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{stats?.totalExams ?? 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Exams
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <BookOpen className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{stats?.totalSubjects ?? 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Subjects
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <FolderTree className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{stats?.totalChapters ?? 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Topics / Chapters
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Attempt Completion Health</span>
              <span className="font-bold text-white">{completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats?.completedAttempts ?? 0} out of {stats?.totalAttempts ?? 0} started attempts
              were successfully submitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
