import { getErrorMessage } from '@/lib/errors';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  X,
  BarChart2,
  Wand2,
} from 'lucide-react';
import type { MockTest, Question, TestQuestionAssignment, Subject, Chapter } from '@/types';

export const AdminTestQuestions: React.FC = () => {
  const { testId: routeTestId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState<MockTest[]>([]);
  const [currentTestId, setCurrentTestId] = useState<string>(routeTestId || '');
  const [test, setTest] = useState<MockTest | null>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<TestQuestionAssignment[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync route param with state
  useEffect(() => {
    if (routeTestId && routeTestId !== currentTestId) {
      setCurrentTestId(routeTestId);
    }
  }, [routeTestId]);

  // Load available tests list
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const tests = await api.getAllAdminTests();
        setAllTests(tests);
        if (!routeTestId && tests.length > 0) {
          setCurrentTestId(tests[0].id);
        }
      } catch (err) {
        console.error('Error loading tests list:', err);
      }
    };
    fetchTests();
  }, [routeTestId]);

  // Add Questions Modal State & Advanced Filters
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankSubjectId, setBankSubjectId] = useState('');
  const [bankChapterId, setBankChapterId] = useState('');
  const [bankSourceType, setBankSourceType] = useState<'all' | 'topic' | 'pyq'>('all');
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  // Create New Question (direct upload) Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionBengali, setNewQuestionBengali] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectOption, setNewCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newExplanation, setNewExplanation] = useState('');
  const [newExplanationBengali, setNewExplanationBengali] = useState('');
  const [newMarks, setNewMarks] = useState(1.0);
  const [newNegativeMarks, setNewNegativeMarks] = useState(0.25);
  const [newSubjectId, setNewSubjectId] = useState(''); // OPTIONAL metadata
  const [newChapterId, setNewChapterId] = useState(''); // OPTIONAL metadata

  const loadData = useCallback(async () => {
    if (!currentTestId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const [testData, assigned, bank, allSubjects, allChapters] = await Promise.all([
        api.getTestById(currentTestId),
        api.getTestAssignedQuestions(currentTestId),
        api.getAllAdminQuestions(),
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
      ]);
      setTest(testData);
      setAssignedQuestions(assigned);
      setBankQuestions(bank);
      setSubjects(allSubjects);
      setChapters(allChapters);
    } catch (err) {
      console.error('Error loading test questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectTest = (id: string) => {
    setCurrentTestId(id);
    navigate(`/admin/tests/${id}/questions`);
  };

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

  const handleApplyDefaultsToAll = () => {
    const defMarks =
      test?.totalMarks && test?.totalQuestions
        ? Number((test.totalMarks / test.totalQuestions).toFixed(2))
        : 1.0;
    const defNeg = test?.negativeMarking ?? 0.25;
    setAssignedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        marks: defMarks,
        negativeMarks: defNeg,
      }))
    );
    setSaveSuccess(false);
  };

  // Save changes
  const handleSave = async () => {
    if (!currentTestId) return;
    try {
      setIsSaving(true);
      setSaveError('');
      const payload = assignedQuestions.map((q, idx) => ({
        questionId: q.questionId,
        orderIndex: idx + 1,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
      }));

      const res = await api.saveTestQuestions(currentTestId, payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        // Reload test data to reflect updated totalQuestions and totalMarks
        const updatedTest = await api.getTestById(currentTestId);
        if (updatedTest) setTest(updatedTest);
      } else {
        setSaveError(res.error || 'Failed to save test questions');
      }
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Error saving questions'));
    } finally {
      setIsSaving(false);
    }
  };

  // Add from Bank
  const openBankModal = () => {
    setSelectedBankIds([]);
    setBankSearch('');
    setBankSubjectId(test?.subjectId || '');
    setBankChapterId(test?.chapterId || '');
    setBankSourceType('all');
    setIsBankModalOpen(true);
  };

  const handleToggleBankSelect = (id: string) => {
    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddSelectedFromBank = () => {
    const questionsToAdd = bankQuestions.filter((q) => selectedBankIds.includes(q.id));
    const newAssignments: TestQuestionAssignment[] = questionsToAdd.map((q, idx) => ({
      questionId: q.id,
      questionOrder: assignedQuestions.length + idx + 1,
      marks: q.defaultMarks || 1.0,
      negativeMarks: q.defaultNegativeMarks || 0.25,
      questionText: q.questionText,
      questionBengaliText: q.questionBengaliText,
      correctOption: q.correctOption,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      explanation: q.explanation,
    }));

    setAssignedQuestions((prev) => [...prev, ...newAssignments]);
    setIsBankModalOpen(false);
    setSaveSuccess(false);
  };

  const assignedIds = new Set(assignedQuestions.map((q) => q.questionId));
  const availableBankQuestions = bankQuestions.filter((q) => {
    if (assignedIds.has(q.id)) return false;
    if (bankSubjectId && q.subjectId !== bankSubjectId) return false;
    if (bankChapterId && q.chapterId !== bankChapterId && q.topicId !== bankChapterId) return false;
    if (bankSourceType !== 'all' && q.sourceType !== bankSourceType) return false;
    if (bankSearch) {
      const term = bankSearch.toLowerCase();
      const matchEng = q.questionText.toLowerCase().includes(term);
      const matchBen = q.questionBengaliText && q.questionBengaliText.toLowerCase().includes(term);
      if (!matchEng && !matchBen) return false;
    }
    return true;
  });

  const handleSelectAllFiltered = () => {
    const filteredIds = availableBankQuestions.map((q) => q.id);
    setSelectedBankIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleDeselectAll = () => {
    setSelectedBankIds([]);
  };

  // Direct upload: Exam -> (Full Mock | PYQ Paper) -> Question
  const openCreateModal = () => {
    setNewQuestionText('');
    setNewQuestionBengali('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewCorrectOption('A');
    setNewExplanation('');
    setNewExplanationBengali('');
    setNewMarks(1.0);
    setNewNegativeMarks(0.25);
    setNewSubjectId('');
    setNewChapterId('');
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateQuestion = async () => {
    if (!currentTestId || !test) return;
    if (!newQuestionText.trim()) {
      setCreateError('Question text is required.');
      return;
    }
    if (!newOptionA.trim() || !newOptionB.trim() || !newOptionC.trim() || !newOptionD.trim()) {
      setCreateError('All four options (A, B, C, D) are required.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');
      const res = await api.createQuestionForTest(currentTestId, {
        subjectId: newSubjectId || undefined, // optional metadata
        chapterId: newChapterId || undefined, // optional metadata
        topicId: newChapterId || undefined,
        questionText: newQuestionText.trim(),
        questionBengaliText: newQuestionBengali.trim() || undefined,
        optionA: newOptionA.trim(),
        optionB: newOptionB.trim(),
        optionC: newOptionC.trim(),
        optionD: newOptionD.trim(),
        correctOption: newCorrectOption,
        explanation: newExplanation.trim() || undefined,
        explanationBengali: newExplanationBengali.trim() || undefined,
        difficulty: 'medium',
        defaultMarks: newMarks,
        defaultNegativeMarks: newNegativeMarks,
        isActive: true,
        status: 'active',
      });

      if (!res.success) {
        setCreateError(res.error || 'Failed to create question.');
        return;
      }

      setIsCreateModalOpen(false);
      await loadData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Unexpected error while creating question.'));
    } finally {
      setIsCreating(false);
    }
  };

  const newChapterOptions = newSubjectId
    ? chapters.filter((c) => c.subjectId === newSubjectId)
    : chapters;

  const totalAssignedMarks = assignedQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading test questions...</div>;
  }

  if (!test) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 bg-slate-950 border border-slate-800 rounded-2xl my-12">
        <Layers className="w-10 h-10 text-indigo-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Select a Mock Test</h3>
        <p className="text-xs text-slate-400">
          Choose a test from the database to manage, reorder, and score questions.
        </p>
        <select
          value={currentTestId}
          onChange={(e) => handleSelectTest(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-medium"
        >
          <option value="">-- Choose a Mock Test --</option>
          {allTests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.totalQuestions || 0} Qs)
            </option>
          ))}
        </select>
        <div className="pt-2">
          <Link to="/admin/tests" className="text-xs text-indigo-400 hover:underline">
            ← Return to Mock Tests List
          </Link>
        </div>
      </div>
    );
  }

  const targetCount = test?.totalQuestions || 0;
  const progressPct =
    targetCount > 0
      ? Math.min(100, Math.round((assignedQuestions.length / targetCount) * 100))
      : 100;

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Link
              to="/admin/tests"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Tests
            </Link>
            {allTests.length > 0 && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Switch Test:
                </span>
                <select
                  value={currentTestId}
                  onChange={(e) => handleSelectTest(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 max-w-[220px] truncate"
                >
                  {allTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
            Exam:{' '}
            <span className="text-indigo-400 font-semibold">{test.examTitle || test.examId}</span> •
            Duration: <span className="text-white font-mono">{test.durationMinutes}m</span> •
            Configured Total Marks: <span className="text-white font-mono">{test.totalMarks}</span>{' '}
            (Sum: {totalAssignedMarks})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
            leftIcon={<Wand2 className="w-3.5 h-3.5 text-amber-400" />}
            onClick={handleApplyDefaultsToAll}
            title="Auto-fill uniform standard scoring across all questions in this test"
          >
            Auto Standard Marks
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Create &amp; Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-xs font-bold text-slate-200"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openBankModal}
          >
            Add from Bank
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

      {/* Test Composition & Progress Dashboard */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Builder Progress & Composition
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">
                Questions:{' '}
                <strong
                  className={
                    targetCount > 0 && assignedQuestions.length === targetCount
                      ? 'text-emerald-400 font-mono'
                      : 'text-white font-mono'
                  }
                >
                  {assignedQuestions.length}
                </strong>
                {targetCount > 0 && <span> / {targetCount} Target</span>}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                Marks:{' '}
                <strong
                  className={
                    totalAssignedMarks === test.totalMarks
                      ? 'text-emerald-400 font-mono'
                      : 'text-amber-400 font-mono'
                  }
                >
                  {totalAssignedMarks}
                </strong>{' '}
                / <span className="font-mono text-slate-300">{test.totalMarks} Total</span>
              </span>
            </div>
          </div>
        </div>

        {targetCount > 0 && (
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                assignedQuestions.length === targetCount
                  ? 'bg-emerald-500'
                  : assignedQuestions.length > targetCount
                    ? 'bg-rose-500'
                    : 'bg-indigo-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {assignedQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No questions assigned to this test yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Use &quot;Create &amp; Add Question&quot; to upload questions directly into this test
              (Subject/Topic optional), or &quot;Add Questions from Bank&quot; to reference existing
              Topic Questions.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                onClick={openCreateModal}
              >
                Create &amp; Add Question
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                onClick={openBankModal}
              >
                Open Question Bank
              </Button>
            </div>
          </div>
        ) : (
          assignedQuestions.map((q, idx) => (
            <div
              key={q.questionId}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-slate-700"
            >
              {/* Order & Reorder Controls */}
              <div className="flex items-center md:flex-col gap-1.5 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={assignedQuestions.length}
                  value={idx + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= assignedQuestions.length) {
                      moveQuestion(idx, val - 1);
                    }
                  }}
                  className="w-10 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs text-center focus:outline-none focus:border-indigo-400"
                  title="Change number to jump order position"
                />
                <div className="flex md:flex-col gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveQuestion(idx, idx - 1)}
                    className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    title="Move Question Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === assignedQuestions.length - 1}
                    onClick={() => moveQuestion(idx, idx + 1)}
                    className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    title="Move Question Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text & Options */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
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
                    <label className="block text-[9px] uppercase font-bold text-slate-500">
                      Marks
                    </label>
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
                    <label className="block text-[9px] uppercase font-bold text-slate-500">
                      Neg Mark
                    </label>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-purple-400" />
                  Select Questions from Bank
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter by subject, topic, or source to compose your mock test
                </p>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="py-3 border-b border-slate-800 space-y-2.5 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search questions or explanations..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Subject Filter */}
                <div>
                  <select
                    value={bankSubjectId}
                    onChange={(e) => {
                      setBankSubjectId(e.target.value);
                      setBankChapterId('');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Filter */}
                <div>
                  <select
                    value={bankChapterId}
                    onChange={(e) => setBankChapterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Topics</option>
                    {(bankSubjectId
                      ? chapters.filter((c) => c.subjectId === bankSubjectId)
                      : chapters
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <select
                    value={bankSourceType}
                    onChange={(e) => setBankSourceType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="topic">Topic Tests</option>
                    <option value="pyq">PYQ</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Header */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">
                  Showing <strong className="text-white">{availableBankQuestions.length}</strong>{' '}
                  available questions
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    disabled={availableBankQuestions.length === 0}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-40"
                  >
                    Select All Filtered ({availableBankQuestions.length})
                  </button>
                  {selectedBankIds.length > 0 && (
                    <>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        Clear Selection ({selectedBankIds.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Questions List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {availableBankQuestions.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-400">
                    No questions found matching filter.
                  </p>
                  <p>Try broadening your search or selecting different topics.</p>
                </div>
              ) : (
                availableBankQuestions.map((q) => {
                  const isChecked = selectedBankIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleToggleBankSelect(q.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm'
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
                        <div className="space-y-1.5 flex-1">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{q.defaultMarks} / -{q.defaultNegativeMarks}
                            </span>

                            {/* Source */}
                            {q.sourceType === 'pyq' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                📜 PYQ {q.sourceYear || ''}{' '}
                                {q.sourceExam ? `• ${q.sourceExam}` : ''}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                📚 Topic
                              </span>
                            )}

                            {q.subjectName && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-slate-300">
                                {q.subjectName}
                              </span>
                            )}
                            {q.chapterName && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-900 border border-slate-800 text-slate-400">
                                {q.chapterName}
                              </span>
                            )}
                          </div>

                          {/* Texts */}
                          <p className="font-semibold text-white leading-snug">{q.questionText}</p>
                          {q.questionBengaliText && (
                            <p className="text-slate-400 text-[11px] leading-snug">
                              {q.questionBengaliText}
                            </p>
                          )}
                          <p className="text-[10px] text-emerald-400 font-mono pt-0.5">
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
              <span className="text-xs text-slate-400 font-semibold">
                <strong className="text-indigo-400 font-mono">{selectedBankIds.length}</strong>{' '}
                questions selected
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

      {/* Create & Add Question Modal (direct upload into this test) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-emerald-400" />
                  Create New Question
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded directly into{' '}
                  <span className="text-indigo-400 font-semibold">{test?.title}</span>
                  {test?.testType === 'pyq' ? ' (PYQ source)' : ' (Full Mock source)'} — Subject /
                  Topic metadata is optional.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold">
                {createError}
              </div>
            )}

            {/* Question Texts */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question (English) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Enter the question statement"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question (Bengali)
              </label>
              <textarea
                rows={2}
                placeholder="বাংলা প্রশ্ন"
                value={newQuestionBengali}
                onChange={(e) => setNewQuestionBengali(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  ['A', newOptionA, setNewOptionA],
                  ['B', newOptionB, setNewOptionB],
                  ['C', newOptionC, setNewOptionC],
                  ['D', newOptionD, setNewOptionD],
                ] as const
              ).map(([opt, value, setter]) => (
                <input
                  key={opt}
                  placeholder={`Option ${opt} *`}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              ))}
            </div>

            {/* Correct Answer */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Correct Answer <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setNewCorrectOption(opt)}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      newCorrectOption === opt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Option {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <textarea
                rows={2}
                placeholder="Explanation (English)"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <textarea
                rows={2}
                placeholder="বাংলা ব্যাখ্যা"
                value={newExplanationBengali}
                onChange={(e) => setNewExplanationBengali(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Scoring */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newMarks}
                  onChange={(e) => setNewMarks(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Negative
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={newNegativeMarks}
                  onChange={(e) => setNewNegativeMarks(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* OPTIONAL Subject / Topic metadata */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Optional Metadata — Subject / Topic (for analytics &amp; practice tagging)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={newSubjectId}
                  onChange={(e) => {
                    setNewSubjectId(e.target.value);
                    setNewChapterId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">— No Subject —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newChapterId}
                  onChange={(e) => setNewChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">— No Topic —</option>
                  {newChapterOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="border-slate-700 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateQuestion}
                disabled={isCreating}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
              >
                {isCreating ? 'Saving...' : 'Save Question to Test'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
