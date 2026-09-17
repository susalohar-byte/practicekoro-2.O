import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Layers, Target, ArrowRight, ListPlus } from 'lucide-react';
import type { Exam, MockTest } from '@/types';

/**
 * Question Bank → 🎯 Full Mock Questions
 * Structure: Exam → Full Mock Test → Questions
 * Select an exam, then a full mock test, then manage/upload questions
 * directly into that test (Subject/Topic optional).
 */
export const AdminFullMockQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [examId, setExamId] = useState('');
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
        setTests(allTests.filter((t) => t.testType === 'full_mock'));
      } catch (err) {
        console.error('Error loading full mock questions data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredTests = useMemo(
    () => (examId ? tests.filter((t) => t.examId === examId) : []),
    [tests, examId]
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
            <Target className="w-6 h-6 text-indigo-400" />
            🎯 Full Mock Questions
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload structure: <span className="text-indigo-400 font-semibold">Exam</span> →{' '}
          <span className="text-indigo-400 font-semibold">Full Mock Test</span> →{' '}
          <span className="text-indigo-400 font-semibold">Questions</span>. Subject/Topic metadata
          is optional — these questions belong to their mock test.
        </p>
      </div>

      {/* Selector */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              1. Select Exam
            </label>
            <select
              value={examId}
              onChange={(e) => {
                setExamId(e.target.value);
                setTestId('');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              2. Select Full Mock Test
            </label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              disabled={!examId}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">— Choose Full Mock —</option>
              {filteredTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.totalQuestions} Q • {t.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {examId && filteredTests.length === 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            No Full Mock tests exist for this exam yet. Create one under “Full Mocks &amp; PYQ”.
          </div>
        )}

        {selectedTest && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">{selectedTest.title}</span>
              <span className="text-slate-500">
                {' '}
                • {selectedTest.examTitle || selectedTest.examId}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-sm"
              leftIcon={<ListPlus className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(`/admin/tests/${selectedTest.id}/questions`)}
            >
              Manage Test Questions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
