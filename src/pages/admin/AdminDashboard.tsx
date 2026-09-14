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
  Sparkles,
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
      subValue: `${stats?.activeExams ?? 0} active`,
      icon: Shield,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/exams',
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
    {
      label: 'Test Series',
      value: stats?.totalTestSeries ?? 0,
      subValue: 'Bundled series',
      icon: ListOrdered,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      link: '/admin/test-series',
    },
    {
      label: 'Total Mock Tests',
      value: stats?.totalTests ?? 0,
      subValue: `${stats?.publishedTests ?? 0} live • ${stats?.draftTests ?? 0} draft`,
      icon: Layers,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      link: '/admin/tests',
    },
    {
      label: 'Question Bank',
      value: stats?.totalQuestions ?? 0,
      subValue: `${stats?.activeQuestions ?? 0} verified`,
      icon: FileQuestion,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      link: '/admin/questions',
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
      label: 'Registered Aspirants',
      value: stats?.totalStudents ?? 0,
      subValue: 'WB exam candidates',
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      link: '/admin/subscriptions',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Admin Content Management System
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 3 Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Normalized Content Hierarchy:{' '}
            <span className="text-indigo-400 font-semibold">Exam</span> →{' '}
            <span className="text-emerald-400 font-semibold">Subject</span> →{' '}
            <span className="text-blue-400 font-semibold">Chapter</span> →{' '}
            <span className="text-cyan-400 font-semibold">Test Series</span> →{' '}
            <span className="text-amber-400 font-semibold">Mock Test</span> →{' '}
            <span className="text-purple-400 font-semibold">Questions</span>
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
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm hover:border-slate-700 transition-all group"
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

      {/* Content Hierarchy Blueprint & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchy Blueprint */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-indigo-400" />
              Content Architecture & Lifecycle Status
            </h2>
            <span className="text-[11px] text-slate-400">Strict Pre-Publish Enforced</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-indigo-400 font-bold">1. Target Exam: WBP Constable</p>
              <span className="text-[10px] text-slate-500 font-sans">Primary Entry Point</span>
            </div>
            <p className="pl-4 text-emerald-400 font-semibold">
              └── 2. Subject: Indian History (ভারত ও বাংলার ইতিহাস)
            </p>
            <p className="pl-8 text-blue-400 font-medium">
              └── 3. Chapter: Indus Valley Civilization
            </p>
            <p className="pl-12 text-cyan-400">└── 4. Test Series: WBP Constable 2025 Prelims</p>
            <div className="pl-16 space-y-1 pt-1 border-l border-slate-700 ml-12">
              <div className="flex items-center justify-between text-slate-200">
                <span>├── Part 01: Harappa & Mohenjodaro</span>
                <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                  PUBLISHED (Live)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>├── Part 02: High-Yield Indus Archaeological Drill</span>
                <span className="px-2 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                  DRAFT (Hidden from Students)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>└── Part 03: Historical PYQ Mastery Series</span>
                <span className="px-2 py-0.2 rounded text-[10px] bg-slate-700/50 text-slate-400 font-bold">
                  ARCHIVED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Lifecycle Rules */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pre-Publish Checklist
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tests cannot be published to students unless every condition passes:
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Target Exam & Subject assigned</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Test duration &gt; 0 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Total marks &gt; 0</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>At least 1 question linked</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>All 4 options (A-D) populated</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Valid correct answer key (A/B/C/D)</span>
              </li>
            </ul>
          </div>

          <Link to="/admin/tests" className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-700 text-xs text-slate-300"
            >
              View Tests Manager
            </Button>
          </Link>
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
      </div>
    </div>
  );
};
