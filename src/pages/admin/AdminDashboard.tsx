import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  Shield,
  BookOpen,
  FolderTree,
  Layers,
  FileQuestion,
  CreditCard,
  Plus
} from 'lucide-react';
import type { Exam, MockTest } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [examList, testList] = await Promise.all([
          api.getExams(),
          api.getTests(),
        ]);
        setExams(examList);
        setTests(testList);
      } catch (err) {
        console.error('Admin overview error:', err);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Exams Configured', value: exams.length, icon: Shield, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Subjects', value: '4', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Chapters', value: '4', icon: FolderTree, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Mock Tests', value: tests.length, icon: Layers, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Question Bank', value: '5+', icon: FileQuestion, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Active Subscriptions', value: '184', icon: CreditCard, color: 'text-rose-400 bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Academic & Platform Administration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized Content Hierarchy: Exam → Subject → Chapter → Mock Test → Questions
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">{s.label}</p>
                <p className="text-2xl font-black text-white mt-1">{s.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Hierarchy Map */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-indigo-400" />
          Content Hierarchy Architecture
        </h2>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <p className="text-indigo-400 font-bold">1. Exam: WBP Constable (wbp-constable)</p>
          <p className="pl-4 text-emerald-400 font-semibold">└── 2. Subject: Indian History (wbp-history)</p>
          <p className="pl-8 text-blue-400">└── 3. Chapter: Indus Valley Civilization (wbp-hist-indus)</p>
          <p className="pl-12 text-amber-300">├── 4. Mock Test Part 01 (Free) • 5 Questions</p>
          <p className="pl-12 text-amber-300">├── 4. Mock Test Part 02 (Premium) • 20 Questions</p>
          <p className="pl-12 text-amber-300">└── 4. Mock Test Part 03 (Premium) • 25 Questions</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/exams" className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors block">
          <Shield className="w-5 h-5 text-indigo-400 mb-2" />
          <h3 className="text-xs font-bold text-white">Manage Exams</h3>
          <p className="text-[11px] text-slate-400 mt-1">Configure WBP, KP SI, WBCS, WBPSC exams</p>
        </Link>

        <Link to="/admin/subjects" className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors block">
          <BookOpen className="w-5 h-5 text-emerald-400 mb-2" />
          <h3 className="text-xs font-bold text-white">Manage Subjects</h3>
          <p className="text-[11px] text-slate-400 mt-1">Link syllabus subjects to target exams</p>
        </Link>

        <Link to="/admin/chapters" className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors block">
          <FolderTree className="w-5 h-5 text-blue-400 mb-2" />
          <h3 className="text-xs font-bold text-white">Manage Chapters</h3>
          <p className="text-[11px] text-slate-400 mt-1">Organize chapter topics and question banks</p>
        </Link>

        <Link to="/admin/questions" className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors block">
          <FileQuestion className="w-5 h-5 text-purple-400 mb-2" />
          <h3 className="text-xs font-bold text-white">Question Bank</h3>
          <p className="text-[11px] text-slate-400 mt-1">Bilingual questions, answers & explanations</p>
        </Link>
      </div>
    </div>
  );
};
