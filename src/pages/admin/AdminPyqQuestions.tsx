import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Layers, ScrollText, ArrowRight, FileQuestion } from 'lucide-react';
import type { Exam, MockTest } from '@/types';

/**
 * Question Bank → 📜 PYQ Questions
 * Structure: Exam → Year → Paper/Shift → Questions
 * Each Paper/Shift is a PYQ test; questions are uploaded directly into it.
 */
export const AdminPyqQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [examId, setExamId] = useState('');
  const [year, setYear] = useState('');
  const [testId, setTestId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [examList, allTests] = await Promise.all([
          api.getAllAdminExams(),
          api.getAllAdminTests(),
        ]);
        setExams(examList);
        setTests(allTests.filter((t) => t.testType === 'pyq'));
      } catch (err) {
        console.error('Error loading PYQ questions data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const examTests = useMemo(
    () => (examId ? tests.filter((t) => t.examId === examId) : []),
    [tests, examId]
  );

  const years = useMemo(
    () =>
      Array.from(new Set(examTests.map((t) => t.year).filter((y): y is number => !!y))).sort(
        (a, b) => b - a
      ),
    [examTests]
  );

  const paperTests = useMemo(
    () => (year ? examTests.filter((t) => t.year?.toString() === year) : []),
    [examTests, year]
  );

  const selectedTest = tests.find((t) => t.id === testId);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ScrollText className="w-6 h-6 text-purple-400" />
            📜 PYQ Questions
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload structure: <span className="text-purple-400 font-semibold">Exam</span> →{' '}
          <span className="text-purple-400 font-semibold">Year</span> →{' '}
          <span className="text-purple-400 font-semibold">Paper / Shift</span> →{' '}
          <span className="text-purple-400 font-semibold">Questions</span>. Subject/Topic metadata
          is optional — PYQ questions belong to their paper.
        </p>
      </div>

      {/* Selector */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              1. Select Exam
            </label>
            <select
              value={examId}
              onChange={(e) => {
                setExamId(e.target.value);
                setYear('');
                setTestId('');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">— Choose Exam —</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Select Year
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setTestId('');
              }}
              disabled={!examId || years.length === 0}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              <option value="">— Choose Year —</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Select Paper / Shift
            </label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              disabled={!year}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              <option value="">— Choose Paper / Shift —</option>
              {paperTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.paperName || t.title}
                  {t.shift ? ` • ${t.shift}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {examId && examTests.length === 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            No PYQ papers exist for this exam yet. Create one (with year/paper/shift) under “Full
            Mocks &amp; PYQ”.
          </div>
        )}

        {selectedTest && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">{selectedTest.title}</span>
              <span className="text-slate-500">
                {' '}
                • {selectedTest.year || ''}
                {selectedTest.shift ? ` • ${selectedTest.shift}` : ''}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
              leftIcon={<FileQuestion className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(`/admin/tests/${selectedTest.id}/questions`)}
            >
              Open Question Manager
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
