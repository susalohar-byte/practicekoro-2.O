import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  Shield,
  BookOpen,
  FolderTree,
  ListOrdered,
  Layers,
  FileQuestion,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Upload,
  Activity,
  Check,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { AdminDashboardStats, MockTest } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentTests, setRecentTests] = useState<MockTest[]>([]);
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
        setRecentTests(allTests.slice(0, 5));
      } catch (err) {
        console.error('Admin overview error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = [
    {
      label: 'Target Exams',
      value: stats?.totalExams ?? 0,
      subValue: `${stats?.activeExams ?? 0} active exams`,
      icon: Shield,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/exams',
    },
    {
      label: 'Mock Tests',
      value: stats?.totalTests ?? 0,
      subValue: `${stats?.publishedTests ?? 0} live • ${stats?.draftTests ?? 0} draft`,
      icon: Layers,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      link: '/admin/tests',
    },
    {
      label: 'Question Bank',
      value: stats?.totalQuestions ?? 0,
      subValue: `${stats?.activeQuestions ?? 0} verified questions`,
      icon: FileQuestion,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      link: '/admin/questions',
    },
    {
      label: 'Registered Aspirants',
      value: stats?.totalStudents ?? 0,
      subValue: 'WB exam candidates',
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'Test Series',
      value: stats?.totalTestSeries ?? 0,
      subValue: 'Bundled series',
      icon: ListOrdered,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      link: '/admin/test-series',
    },
    {
      label: 'Student Attempts',
      value: stats?.totalAttempts ?? 0,
      subValue: `${stats?.completedAttempts ?? 0} completed`,
      icon: CheckCircle2,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      link: '/admin/tests',
    },
    {
      label: 'Subjects',
      value: stats?.totalSubjects ?? 0,
      subValue: 'Syllabus domains',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/subjects',
    },
    {
      label: 'Chapters',
      value: stats?.totalChapters ?? 0,
      subValue: 'Topic modules',
      icon: FolderTree,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      link: '/admin/chapters',
    },
  ];

  const publishedPercent = stats?.totalTests
    ? Math.round(((stats.publishedTests ?? 0) / stats.totalTests) * 100)
    : 0;

  const attemptCompletionPercent = stats?.totalAttempts
    ? Math.round(((stats.completedAttempts ?? 0) / stats.totalAttempts) * 100)
    : 0;

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Platform Overview & Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage competitive exams, question bank, test series, and track candidate mock test activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/questions">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              CSV Bulk Import
            </Button>
          </Link>
          <Link to="/admin/tests">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              to={s.link}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    {s.label}
                  </p>
                  <p className="text-2xl font-black text-white mt-1">
                    {isLoading ? '...' : s.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{s.subValue}</p>
                </div>
                <div
                  className={`p-3 rounded-xl border ${s.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Operations Hub & Platform Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Management Hub */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Quick Management Hub
            </h2>
            <span className="text-[11px] text-slate-400">Direct Actions & Operations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Exam & Syllabus */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {stats?.totalExams ?? 0} Exams
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Target Exams & Syllabus</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage WBCS, WBP Constable, KP, Food SI, and other exams, subject domains, and chapter modules.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <Link
                  to="/admin/exams"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Exams <ChevronRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-700">•</span>
                <Link
                  to="/admin/subjects"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Subjects
                </Link>
                <span className="text-slate-700">•</span>
                <Link
                  to="/admin/chapters"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Chapters
                </Link>
              </div>
            </div>

            {/* Card 2: Question Bank */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <FileQuestion className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {stats?.totalQuestions ?? 0} Questions
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Question Bank & Import</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Add bilingual questions, Bengali & English text, verified answer keys, and bulk upload via CSV.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <Link
                  to="/admin/questions"
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Questions Pool <ChevronRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-700">•</span>
                <Link
                  to="/admin/questions"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  CSV Import
                </Link>
              </div>
            </div>

            {/* Card 3: Mock Test Studio */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {stats?.publishedTests ?? 0} Live
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Mock Test Studio</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Assemble Full Mock Tests, Previous Year Questions (PYQ), and Topic Tests. Configure timer and negative marking.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <Link
                  to="/admin/tests"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Manage Tests <ChevronRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-700">•</span>
                <Link
                  to="/admin/test-series"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Test Series
                </Link>
              </div>
            </div>

            {/* Card 4: Subscriptions & Aspirants */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {stats?.totalStudents ?? 0} Students
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Candidates & Subscriptions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitor registered aspirants, pass renewals, test completions, and revenue transactions.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <Link
                  to="/admin/subscriptions"
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  Aspirants & Passes <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Readiness & Platform Health */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Content Readiness & Health
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Test Publishing Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Mock Tests Live Ratio</span>
                  <span className="font-bold text-emerald-400">{publishedPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(publishedPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{stats?.publishedTests ?? 0} Published</span>
                  <span>{stats?.draftTests ?? 0} in Draft</span>
                </div>
              </div>

              {/* Student Attempt Completion Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Attempt Completion Rate</span>
                  <span className="font-bold text-cyan-400">{attemptCompletionPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(attemptCompletionPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{stats?.completedAttempts ?? 0} Completed</span>
                  <span>{stats?.totalAttempts ?? 0} Total</span>
                </div>
              </div>

              {/* Quick Checklist Highlights */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Content Quality Standards
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Verified 4-option MCQs with Answer Key</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Timed tests with negative marking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Bilingual support (Bengali / English)</span>
                </div>
              </div>
            </div>

            {/* Quick action button */}
            <Link to="/admin/tests" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-700 text-xs text-slate-300 hover:bg-slate-900"
              >
                Go to Tests Manager
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Recently Created / Managed Mock Tests
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quick oversight of tests across all exams
            </p>
          </div>
          <Link
            to="/admin/tests"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Manage All Tests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTests.length === 0 ? (
          <div className="p-8 text-center">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No mock tests created yet</p>
            <p className="text-xs text-slate-500 mt-1">Get started by creating your first mock test or PYQ paper.</p>
            <Link to="/admin/tests" className="inline-block mt-4">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
                Create Mock Test
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Test Title</th>
                <th className="p-4">Exam / Domain</th>
                <th className="p-4">Duration & Marks</th>
                <th className="p-4">Questions</th>
                <th className="p-4">Access Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{t.title}</td>
                  <td className="p-4 text-slate-400">
                    <span className="text-indigo-400 font-semibold">{t.examTitle || t.examId}</span>
                    {t.chapterName && <span className="text-slate-500"> • {t.chapterName}</span>}
                  </td>
                  <td className="p-4 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-slate-500" /> {t.durationMinutes}m •{' '}
                      {t.totalMarks} Marks
                    </span>
                  </td>
                  <td className="p-4 font-bold text-indigo-400">{t.totalQuestions} Qs</td>
                  <td className="p-4">
                    {t.isPremium ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PRO PASS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {t.status === 'published' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Published
                      </span>
                    )}
                    {t.status === 'draft' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Draft
                      </span>
                    )}
                    {t.status === 'archived' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/40">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/tests/${t.id}/questions`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Questions
                      </Link>
                      <span className="text-slate-600">•</span>
                      <Link
                        to="/admin/tests"
                        className="text-xs text-slate-400 hover:text-white font-semibold"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
