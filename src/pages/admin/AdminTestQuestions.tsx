import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  ArrowLeft,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  CheckCircle2,
  Search,
  FileQuestion,
  Layers,
  X
} from 'lucide-react';
import type { MockTest, Question, TestQuestionAssignment } from '@/types';

export const AdminTestQuestions: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<MockTest | null>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<TestQuestionAssignment[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Add Questions Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState('');
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  const loadData = async () => {
    if (!testId) return;
    try {
      setIsLoading(true);
      const [testData, assigned, bank] = await Promise.all([
        api.getTestById(testId),
        api.getTestAssignedQuestions(testId),
        api.getAllAdminQuestions(),
      ]);
      setTest(testData);
      setAssignedQuestions(assigned);
      setBankQuestions(bank);
    } catch (err) {
      console.error('Error loading test questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [testId]);

  // Reordering functions
  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= assignedQuestions.length) return;
    const updated = [...assignedQuestions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    // Update order numbers
    const reordered = updated.map((q, idx) => ({ ...q, questionOrder: idx + 1 }));
    setAssignedQuestions(reordered);
    setSaveSuccess(false);
  };

  const removeQuestion = (index: number) => {
    const updated = assignedQuestions.filter((_, idx) => idx !== index);
    const reordered = updated.map((q, idx) => ({ ...q, questionOrder: idx + 1 }));
    setAssignedQuestions(reordered);
    setSaveSuccess(false);
  };

  const updateQuestionMarks = (index: number, marks: number, negativeMarks: number) => {
    const updated = [...assignedQuestions];
    updated[index] = { ...updated[index], marks, negativeMarks };
    setAssignedQuestions(updated);
    setSaveSuccess(false);
  };

  // Save changes
  const handleSave = async () => {
    if (!testId) return;
    try {
      setIsSaving(true);
      setSaveError('');
      const payload = assignedQuestions.map((q, idx) => ({
        questionId: q.questionId,
        orderIndex: idx + 1,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
      }));

      const res = await api.saveTestQuestions(testId, payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        // Reload test data to reflect updated totalQuestions and totalMarks
        const updatedTest = await api.getTestById(testId);
        if (updatedTest) setTest(updatedTest);
      } else {
        setSaveError(res.error || 'Failed to save test questions');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error saving questions');
    } finally {
      setIsSaving(false);
    }
  };

  // Add from Bank
  const openBankModal = () => {
    setSelectedBankIds([]);
    setBankSearch('');
    setBankDifficulty('');
    setIsBankModalOpen(true);
  };

  const handleToggleBankSelect = (id: string) => {
    setSelectedBankIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddSelectedFromBank = () => {
    const questionsToAdd = bankQuestions.filter(q => selectedBankIds.includes(q.id));
    const newAssignments: TestQuestionAssignment[] = questionsToAdd.map((q, idx) => ({
      questionId: q.id,
      questionOrder: assignedQuestions.length + idx + 1,
      marks: q.defaultMarks || 1.0,
      negativeMarks: q.defaultNegativeMarks || 0.25,
      questionText: q.questionText,
      questionBengaliText: q.questionBengaliText,
      difficulty: q.difficulty,
      correctOption: q.correctOption,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      explanation: q.explanation,
    }));

    setAssignedQuestions(prev => [...prev, ...newAssignments]);
    setIsBankModalOpen(false);
    setSaveSuccess(false);
  };

  const assignedIds = new Set(assignedQuestions.map(q => q.questionId));
  const availableBankQuestions = bankQuestions.filter(q => {
    const isAlreadyAssigned = assignedIds.has(q.id);
    const matchesSearch =
      !bankSearch ||
      q.questionText.toLowerCase().includes(bankSearch.toLowerCase()) ||
      (q.questionBengaliText && q.questionBengaliText.toLowerCase().includes(bankSearch.toLowerCase()));
    const matchesDifficulty = !bankDifficulty || q.difficulty === bankDifficulty;
    return !isAlreadyAssigned && matchesSearch && matchesDifficulty;
  });

  const totalAssignedMarks = assignedQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading test questions...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-white">Mock test not found.</p>
        <Link to="/admin/tests" className="text-xs text-indigo-400 hover:underline">
          Return to Tests List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Tests
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-indigo-400" />
              {test.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {assignedQuestions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exam: <span className="text-indigo-400 font-semibold">{test.examTitle || test.examId}</span> • Duration:{' '}
            <span className="text-white font-mono">{test.durationMinutes}m</span> • Configured Total Marks:{' '}
            <span className="text-white font-mono">{test.totalMarks}</span> (Sum: {totalAssignedMarks})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-xs font-bold text-slate-200"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openBankModal}
          >
            Add Questions from Bank
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Ordering & Scoring'}
          </Button>
        </div>
      </div>

      {/* Save Alerts */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Test questions order and scoring saved successfully to database!
        </div>
      )}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold">
          {saveError}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {assignedQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No questions assigned to this test yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Add Questions from Bank&quot; above to select questions and specify their deterministic test order.
            </p>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
              onClick={openBankModal}
            >
              Open Question Bank
            </Button>
          </div>
        ) : (
          assignedQuestions.map((q, idx) => (
            <div
              key={q.questionId}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-slate-700"
            >
              {/* Order & Reorder Controls */}
              <div className="flex items-center md:flex-col gap-1 shrink-0">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div className="flex md:flex-col gap-1 ml-2 md:ml-0 md:mt-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveQuestion(idx, idx - 1)}
                    className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move Question Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === assignedQuestions.length - 1}
                    onClick={() => moveQuestion(idx, idx + 1)}
                    className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move Question Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text & Options */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                    {q.difficulty || 'MEDIUM'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">ID: {q.questionId}</span>
                </div>

                <p className="font-bold text-white text-xs sm:text-sm">{q.questionText}</p>
                {q.questionBengaliText && (
                  <p className="text-slate-300 text-xs font-medium">{q.questionBengaliText}</p>
                )}

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <div
                    className={`p-2 rounded-lg border ${
                      q.correctOption === 'A'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    A: {q.optionA || 'Option A missing'}
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      q.correctOption === 'B'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    B: {q.optionB || 'Option B missing'}
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      q.correctOption === 'C'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    C: {q.optionC || 'Option C missing'}
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      q.correctOption === 'D'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    D: {q.optionD || 'Option D missing'}
                  </div>
                </div>
              </div>

              {/* Scoring & Remove */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="flex items-center gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500">Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      value={q.marks}
                      onChange={(e) =>
                        updateQuestionMarks(idx, parseFloat(e.target.value) || 1, q.negativeMarks)
                      }
                      className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500">Neg Mark</label>
                    <input
                      type="number"
                      step="0.05"
                      value={q.negativeMarks}
                      onChange={(e) =>
                        updateQuestionMarks(idx, q.marks, parseFloat(e.target.value) || 0.25)
                      }
                      className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeQuestion(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  title="Remove from Test"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Questions from Bank Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-purple-400" />
                  Select Questions from Bank
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedBankIds.length} questions selected to add
                </p>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter */}
            <div className="py-3 border-b border-slate-800 flex gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search question bank text..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={bankDifficulty}
                onChange={(e) => setBankDifficulty(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Scrollable Questions List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {availableBankQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No additional questions found in bank matching filter.
                </div>
              ) : (
                availableBankQuestions.map((q) => {
                  const isChecked = selectedBankIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleToggleBankSelect(q.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                          : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-purple-400">
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{q.defaultMarks} / -{q.defaultNegativeMarks}
                            </span>
                          </div>
                          <p className="font-semibold text-white">{q.questionText}</p>
                          {q.questionBengaliText && (
                            <p className="text-slate-400 text-[11px]">{q.questionBengaliText}</p>
                          )}
                          <p className="text-[10px] text-emerald-400 font-mono pt-1">
                            Correct: Option {q.correctOption}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400">
                {selectedBankIds.length} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBankModalOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSelectedFromBank}
                  disabled={selectedBankIds.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                >
                  Add Selected ({selectedBankIds.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
