import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  BookOpen,
  Plus,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  Archive,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  Clock,
  LayoutGrid,
  List,
  Check,
  Sparkles,
  Layers,
  GraduationCap,
  RefreshCw,
  SlidersHorizontal,
  Copy,
} from 'lucide-react';
import type { Question, Exam, Subject, Chapter, MockTest } from '@/types';
import {
  parseQuestionsTxt,
  TxtParseResult,
  SAMPLE_TXT_CONTENT,
  downloadSampleTxt,
} from '@/utils/txtQuestionParser';
import { getErrorMessage } from '@/lib/errors';
import { useSearchParams } from 'react-router-dom';

// ─── Stat Card Component ─────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, gradient, iconBg }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/10 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20`}
  >
    <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mr-10 -mt-10 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 -ml-8 -mb-8 pointer-events-none" />
    <div className="relative flex items-start gap-3.5">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5 leading-none">{value}</p>
        {subtitle && <p className="text-[11px] text-white/60 mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// ─── Status Badge Component ──────────────────────────────────────
const StatusBadge: React.FC<{ status?: string; isActive?: boolean }> = ({ status, isActive }) => {
  const isArchived = status === 'archived' || isActive === false;
  return isArchived ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Archived
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  );
};

// ─── Difficulty Badge Component ──────────────────────────────────
const DifficultyBadge: React.FC<{ difficulty?: string }> = ({ difficulty = 'medium' }) => {
  const d = difficulty.toLowerCase();
  if (d === 'easy') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        Easy (সহজ)
      </span>
    );
  }
  if (d === 'hard') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        Hard (কঠিন)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      Medium (মাঝারি)
    </span>
  );
};

export const AdminQuestionBank: React.FC = () => {
  const [searchParams] = useSearchParams();
  const querySource = searchParams.get('source');
  const querySubjectId = searchParams.get('subjectId');
  const queryTopicId = searchParams.get('topicId');

  // Master Entities
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allMasterQuestions, setAllMasterQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters (Section 14)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'topic' | 'exam'>(
    querySource === 'topic' ? 'topic' : querySource === 'exam' ? 'exam' : 'all'
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(querySubjectId || '');
  const [selectedTopicId, setSelectedTopicId] = useState(queryTopicId || '');
  const [selectedTopicTestId, setSelectedTopicTestId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState<'' | 'full_mock' | 'pyq'>('');
  const [selectedExamTestId, setSelectedExamTestId] = useState('');

  // Inline solution expansion state (in Card View)
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());

  // Copy success notification
  const [copiedFormat, setCopiedFormat] = useState(false);

  // Sync with searchParams if they change
  useEffect(() => {
    const s = searchParams.get('source');
    const sub = searchParams.get('subjectId');
    const top = searchParams.get('topicId');
    if (s === 'topic' || s === 'exam') setSelectedSource(s);
    if (sub !== null && sub !== undefined) setSelectedSubjectId(sub);
    if (top !== null && top !== undefined) setSelectedTopicId(top);
  }, [searchParams]);

  // Pagination (Section 5)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Single Question Modal (Section 6A)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [singleSource, setSingleSource] = useState<'topic' | 'exam'>('topic');
  const [singleSubjectId, setSingleSubjectId] = useState('');
  const [singleTopicId, setSingleTopicId] = useState('');
  const [singleTopicTestId, setSingleTopicTestId] = useState('');
  const [singleExamId, setSingleExamId] = useState('');
  const [singleExamType, setSingleExamType] = useState<'full_mock' | 'pyq'>('full_mock');
  const [singleExamTestId, setSingleExamTestId] = useState('');
  const [singleQuestionBengali, setSingleQuestionBengali] = useState('');
  const [singleQuestionEnglish, setSingleQuestionEnglish] = useState('');
  const [singleOptA, setSingleOptA] = useState('');
  const [singleOptB, setSingleOptB] = useState('');
  const [singleOptC, setSingleOptC] = useState('');
  const [singleOptD, setSingleOptD] = useState('');
  const [singleCorrect, setSingleCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [singleDifficulty, setSingleDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [singleExplanation, setSingleExplanation] = useState('');
  const [singleMarks, setSingleMarks] = useState(1.0);
  const [singleNegativeMarks, setSingleNegativeMarks] = useState(0.25);
  const [isSavingSingle, setIsSavingSingle] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Bulk TXT Upload Modal (Section 7, 8, 9)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState<'upload' | 'preview'>('upload');
  const [bulkSource, setBulkSource] = useState<'topic' | 'exam'>('topic');
  const [bulkSubjectId, setBulkSubjectId] = useState('');
  const [bulkTopicId, setBulkTopicId] = useState('');
  const [bulkTopicTestId, setBulkTopicTestId] = useState('');
  const [bulkExamId, setBulkExamId] = useState('');
  const [bulkExamType, setBulkExamType] = useState<'full_mock' | 'pyq'>('full_mock');
  const [bulkExamTestId, setBulkExamTestId] = useState('');
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkParseResult, setBulkParseResult] = useState<TxtParseResult | null>(null);
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkActionError, setBulkActionError] = useState('');
  const [bulkActionSuccess, setBulkActionSuccess] = useState('');

  // View TXT Format Guide Modal
  const [isFormatGuideOpen, setIsFormatGuideOpen] = useState(false);

  // Preview Question Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState<Question | null>(null);

  // Edit Question Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQBengaliText, setEditQBengaliText] = useState('');
  const [editQOptA, setEditQOptA] = useState('');
  const [editQOptB, setEditQOptB] = useState('');
  const [editQOptC, setEditQOptC] = useState('');
  const [editQOptD, setEditQOptD] = useState('');
  const [editQCorrect, setEditQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [editQDifficulty, setEditQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [editQExplanation, setEditQExplanation] = useState('');
  const [editQMarks, setEditQMarks] = useState(1.0);
  const [editQNegativeMarks, setEditQNegativeMarks] = useState(0.25);
  const [isUpdatingQ, setIsUpdatingQ] = useState(false);
  const [editQError, setEditQError] = useState('');

  // Card / Table View Mode & Selection
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Delete Question Modal
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Load Data
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allExams, allSubjects, allChapters, allTests, filteredQuestions, masterQuestions] =
        await Promise.all([
          api.getAllAdminExams(),
          api.getAllAdminSubjects(),
          api.getAllAdminChapters(),
          api.getAllAdminTests(),
          api.getAllAdminQuestions({
            sourceType:
              selectedSource === 'all'
                ? undefined
                : selectedSource === 'topic'
                  ? 'topic'
                  : selectedExamType === 'pyq'
                    ? 'pyq'
                    : selectedExamType === 'full_mock'
                      ? 'other'
                      : undefined,
            subjectId:
              selectedSource === 'topic' && selectedSubjectId ? selectedSubjectId : undefined,
            topicId: selectedSource === 'topic' && selectedTopicId ? selectedTopicId : undefined,
            testId:
              selectedSource === 'topic' && selectedTopicTestId
                ? selectedTopicTestId
                : selectedSource === 'exam' && selectedExamTestId
                  ? selectedExamTestId
                  : undefined,
            sourceExam: selectedSource === 'exam' && selectedExamId ? selectedExamId : undefined,
            search: searchTerm.trim() || undefined,
          }),
          api.getAllAdminQuestions(), // for master stats
        ]);

      setExams(allExams);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setTests(allTests);
      setQuestions(filteredQuestions);
      setAllMasterQuestions(masterQuestions);
    } catch (err) {
      console.error('Failed to load Question Bank data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    selectedSource,
    selectedSubjectId,
    selectedTopicId,
    selectedTopicTestId,
    selectedExamId,
    selectedExamType,
    selectedExamTestId,
    searchTerm,
  ]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSource,
    selectedSubjectId,
    selectedTopicId,
    selectedTopicTestId,
    selectedExamId,
    selectedExamType,
    selectedExamTestId,
    searchTerm,
  ]);

  // High-level statistics calculation
  const bankStats = useMemo(() => {
    const list = allMasterQuestions.length > 0 ? allMasterQuestions : questions;
    const total = list.length;
    const topicCount = list.filter((q) => q.sourceType === 'topic').length;
    const fullMockCount = list.filter(
      (q) => q.sourceType === 'other' || (!q.sourceType && q.sourceExam)
    ).length;
    const pyqCount = list.filter((q) => q.sourceType === 'pyq').length;
    return { total, topicCount, fullMockCount, pyqCount };
  }, [allMasterQuestions, questions]);

  // Filtered dropdown options for cascading - Topic Tests
  const filterTopics = useMemo(() => {
    return chapters.filter((c) => !selectedSubjectId || c.subjectId === selectedSubjectId);
  }, [chapters, selectedSubjectId]);

  const filterTopicTests = useMemo(() => {
    return tests.filter((t) => {
      const isTopicTest = t.testType === 'topic' || t.testType === 'chapter_mock';
      if (!isTopicTest) return false;
      if (selectedTopicId && t.chapterId !== selectedTopicId && t.topicId !== selectedTopicId)
        return false;
      if (selectedSubjectId && t.subjectId !== selectedSubjectId) return false;
      return true;
    });
  }, [tests, selectedTopicId, selectedSubjectId]);

  // Filtered dropdown options for cascading - Exam Full Mock & PYQ Tests
  const examFullMockTests = useMemo(() => {
    if (!selectedExamId) return [];
    return tests.filter(
      (t) =>
        t.testType === 'full_mock' &&
        (t.examId === selectedExamId || t.associatedExamIds?.includes(selectedExamId))
    );
  }, [tests, selectedExamId]);

  const examPyqTests = useMemo(() => {
    if (!selectedExamId) return [];
    return tests.filter(
      (t) =>
        t.testType === 'pyq' &&
        (t.examId === selectedExamId || t.associatedExamIds?.includes(selectedExamId))
    );
  }, [tests, selectedExamId]);

  // Active selected Exam and Test details for Context Banner & Breadcrumbs
  const currentExamObj = useMemo(() => {
    if (selectedSource !== 'exam' || !selectedExamId) return null;
    return exams.find((e) => e.id === selectedExamId) || null;
  }, [selectedSource, selectedExamId, exams]);

  const currentExamTest = useMemo(() => {
    if (selectedSource !== 'exam' || !selectedExamTestId) return null;
    return tests.find((t) => t.id === selectedExamTestId) || null;
  }, [selectedSource, selectedExamTestId, tests]);

  const currentSubjectObj = useMemo(() => {
    if (selectedSource !== 'topic' || !selectedSubjectId) return null;
    return subjects.find((s) => s.id === selectedSubjectId) || null;
  }, [selectedSource, selectedSubjectId, subjects]);

  const currentTopicObj = useMemo(() => {
    if (selectedSource !== 'topic' || !selectedTopicId) return null;
    return chapters.find((c) => c.id === selectedTopicId) || null;
  }, [selectedSource, selectedTopicId, chapters]);

  // Single Question Modal Cascading
  const singleTopics = useMemo(() => {
    return chapters.filter((c) => !singleSubjectId || c.subjectId === singleSubjectId);
  }, [chapters, singleSubjectId]);

  const singleTopicTests = useMemo(() => {
    return tests.filter((t) => {
      const isTopicTest = t.testType === 'topic' || t.testType === 'chapter_mock';
      if (!isTopicTest) return false;
      if (singleTopicId && t.chapterId !== singleTopicId && t.topicId !== singleTopicId)
        return false;
      if (singleSubjectId && t.subjectId !== singleSubjectId) return false;
      return true;
    });
  }, [tests, singleTopicId, singleSubjectId]);

  const singleExamFullMockTests = useMemo(() => {
    if (!singleExamId) return [];
    return tests.filter(
      (t) =>
        t.testType === 'full_mock' &&
        (t.examId === singleExamId || t.associatedExamIds?.includes(singleExamId))
    );
  }, [tests, singleExamId]);

  const singleExamPyqTests = useMemo(() => {
    if (!singleExamId) return [];
    return tests.filter(
      (t) =>
        t.testType === 'pyq' &&
        (t.examId === singleExamId || t.associatedExamIds?.includes(singleExamId))
    );
  }, [tests, singleExamId]);

  // Bulk Modal Cascading
  const bulkTopics = useMemo(() => {
    return chapters.filter((c) => !bulkSubjectId || c.subjectId === bulkSubjectId);
  }, [chapters, bulkSubjectId]);

  const bulkTopicTests = useMemo(() => {
    return tests.filter((t) => {
      const isTopicTest = t.testType === 'topic' || t.testType === 'chapter_mock';
      if (!isTopicTest) return false;
      if (bulkTopicId && t.chapterId !== bulkTopicId && t.topicId !== bulkTopicId) return false;
      if (bulkSubjectId && t.subjectId !== bulkSubjectId) return false;
      return true;
    });
  }, [tests, bulkTopicId, bulkSubjectId]);

  const bulkExamFullMockTests = useMemo(() => {
    if (!bulkExamId) return [];
    return tests.filter(
      (t) =>
        t.testType === 'full_mock' &&
        (t.examId === bulkExamId || t.associatedExamIds?.includes(bulkExamId))
    );
  }, [tests, bulkExamId]);

  const bulkExamPyqTests = useMemo(() => {
    if (!bulkExamId) return [];
    return tests.filter(
      (t) =>
        t.testType === 'pyq' &&
        (t.examId === bulkExamId || t.associatedExamIds?.includes(bulkExamId))
    );
  }, [tests, bulkExamId]);

  // Open Single Question Modal
  const handleOpenAddSingle = () => {
    const defaultSub = subjects[0]?.id || '';
    const defaultTopic = chapters.find((c) => c.subjectId === defaultSub)?.id || '';
    const defaultTopicTest =
      tests.find((t) => t.chapterId === defaultTopic || t.topicId === defaultTopic)?.id || '';

    const effectiveExam = selectedExamId || exams[0]?.id || '';
    const effectiveExamType: 'full_mock' | 'pyq' = selectedExamType === 'pyq' ? 'pyq' : 'full_mock';
    const effectiveTests = tests.filter(
      (t) =>
        t.testType === effectiveExamType &&
        (t.examId === effectiveExam || t.associatedExamIds?.includes(effectiveExam))
    );
    const defaultExamTest = selectedExamTestId || effectiveTests[0]?.id || '';

    setSingleSource(selectedSource === 'exam' ? 'exam' : 'topic');
    setSingleSubjectId(selectedSubjectId || defaultSub);
    setSingleTopicId(selectedTopicId || defaultTopic);
    setSingleTopicTestId(selectedTopicTestId || defaultTopicTest);
    setSingleExamId(effectiveExam);
    setSingleExamType(effectiveExamType);
    setSingleExamTestId(defaultExamTest);
    setSingleQuestionBengali('');
    setSingleQuestionEnglish('');
    setSingleOptA('');
    setSingleOptB('');
    setSingleOptC('');
    setSingleOptD('');
    setSingleCorrect('A');
    setSingleDifficulty('medium');
    setSingleExplanation('');
    setSingleMarks(1.0);
    setSingleNegativeMarks(0.25);
    setSingleError('');
    setIsAddModalOpen(true);
  };

  // Submit Single Question
  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryText = singleQuestionBengali.trim() || singleQuestionEnglish.trim();
    if (!primaryText) {
      setSingleError('Question statement (Bengali or English) is required.');
      return;
    }
    if (!singleOptA.trim() || !singleOptB.trim() || !singleOptC.trim() || !singleOptD.trim()) {
      setSingleError('All 4 options (A, B, C, D) must be provided.');
      return;
    }

    if (singleSource === 'topic') {
      if (!singleSubjectId) {
        setSingleError('Subject is required for Topic Test questions.');
        return;
      }
      if (!singleTopicId) {
        setSingleError('Topic is required for Topic Test questions.');
        return;
      }
    } else {
      if (!singleExamId) {
        setSingleError('Exam is required.');
        return;
      }
      if (!singleExamType) {
        setSingleError('Please select Type (Full Mock Test or PYQ).');
        return;
      }
      if (!singleExamTestId) {
        setSingleError(
          singleExamType === 'full_mock'
            ? 'Please select a Full Mock Test.'
            : 'Please select a PYQ Paper.'
        );
        return;
      }
    }

    try {
      setIsSavingSingle(true);
      setSingleError('');

      const questionPayload = {
        questionText: singleQuestionEnglish.trim() || singleQuestionBengali.trim(),
        questionBengaliText: singleQuestionBengali.trim() || singleQuestionEnglish.trim(),
        optionA: singleOptA.trim(),
        optionB: singleOptB.trim(),
        optionC: singleOptC.trim(),
        optionD: singleOptD.trim(),
        correctOption: singleCorrect,
        explanation: singleExplanation.trim() || undefined,
        difficulty: singleDifficulty,
        defaultMarks: singleMarks,
        defaultNegativeMarks: singleNegativeMarks,
        isActive: true,
        status: 'active' as const,
      };

      if (singleSource === 'exam' && singleExamTestId) {
        await api.createQuestionForTest(singleExamTestId, {
          ...questionPayload,
          sourceExam: singleExamId,
          sourceType: singleExamType === 'pyq' ? 'pyq' : 'other',
        });
      } else if (singleSource === 'topic' && singleTopicTestId) {
        await api.createQuestionForTest(singleTopicTestId, {
          ...questionPayload,
          subjectId: singleSubjectId,
          topicId: singleTopicId,
          chapterId: singleTopicId,
          sourceType: 'topic',
        });
      } else {
        await api.createQuestion({
          ...questionPayload,
          subjectId: singleSource === 'topic' ? singleSubjectId : undefined,
          topicId: singleSource === 'topic' ? singleTopicId : undefined,
          chapterId: singleSource === 'topic' ? singleTopicId : undefined,
          sourceType: singleSource === 'topic' ? 'topic' : 'other',
          sourceExam: singleSource === 'exam' ? singleExamId : undefined,
        });
      }

      setIsAddModalOpen(false);
      await loadQuestions();
    } catch (err) {
      setSingleError(getErrorMessage(err, 'Failed to save question'));
    } finally {
      setIsSavingSingle(false);
    }
  };

  // Open Bulk Modal
  const handleOpenBulkModal = () => {
    const defaultSub = subjects[0]?.id || '';
    const defaultTopic = chapters.find((c) => c.subjectId === defaultSub)?.id || '';
    const defaultTopicTest =
      tests.find((t) => t.chapterId === defaultTopic || t.topicId === defaultTopic)?.id || '';

    const effectiveExam = selectedExamId || exams[0]?.id || '';
    const effectiveExamType: 'full_mock' | 'pyq' = selectedExamType === 'pyq' ? 'pyq' : 'full_mock';
    const effectiveTests = tests.filter(
      (t) =>
        t.testType === effectiveExamType &&
        (t.examId === effectiveExam || t.associatedExamIds?.includes(effectiveExam))
    );
    const defaultExamTest = selectedExamTestId || effectiveTests[0]?.id || '';

    setBulkSource(selectedSource === 'exam' ? 'exam' : 'topic');
    setBulkSubjectId(selectedSubjectId || defaultSub);
    setBulkTopicId(selectedTopicId || defaultTopic);
    setBulkTopicTestId(selectedTopicTestId || defaultTopicTest);
    setBulkExamId(effectiveExam);
    setBulkExamType(effectiveExamType);
    setBulkExamTestId(defaultExamTest);
    setBulkRawText('');
    setBulkFileName('');
    setBulkParseResult(null);
    setBulkStep('upload');
    setBulkActionError('');
    setBulkActionSuccess('');
    setIsBulkModalOpen(true);
  };

  // Handle TXT File Input
  const handleTxtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkRawText(content || '');
    };
    reader.readAsText(file, 'utf-8');
  };

  // Parse TXT to Preview
  const handleParseTxt = () => {
    if (!bulkRawText.trim()) {
      setBulkActionError('Please select a TXT file or paste question content.');
      return;
    }
    if (bulkSource === 'topic') {
      if (!bulkSubjectId) {
        setBulkActionError('Please select a Subject.');
        return;
      }
      if (!bulkTopicId) {
        setBulkActionError('Please select a Topic.');
        return;
      }
    } else {
      if (!bulkExamId) {
        setBulkActionError('Please select a Target Exam.');
        return;
      }
      if (!bulkExamType) {
        setBulkActionError('Please select Type (Full Mock Test or PYQ).');
        return;
      }
      if (!bulkExamTestId) {
        setBulkActionError(
          bulkExamType === 'full_mock'
            ? 'Please select a Full Mock Test.'
            : 'Please select a PYQ Paper.'
        );
        return;
      }
    }

    setBulkActionError('');
    const result = parseQuestionsTxt(bulkRawText);
    setBulkParseResult(result);
    setBulkStep('preview');
  };

  // Import Valid Questions from Preview
  const handleImportValidQuestions = async () => {
    if (!bulkParseResult || bulkParseResult.valid.length === 0) return;

    try {
      setIsImportingBulk(true);
      setBulkActionError('');

      const res = await api.bulkCreateQuestionsFromTxt({
        questions: bulkParseResult.valid,
        sourceType: bulkSource === 'topic' ? 'topic' : bulkExamType === 'pyq' ? 'pyq' : 'other',
        subjectId: bulkSource === 'topic' ? bulkSubjectId : undefined,
        topicId: bulkSource === 'topic' ? bulkTopicId : undefined,
        examId: bulkSource === 'exam' ? bulkExamId : undefined,
        testId: bulkSource === 'topic' ? bulkTopicTestId || undefined : bulkExamTestId,
      });

      setBulkActionSuccess(
        `Successfully imported ${res.successCount} questions into Question Bank!`
      );
      await loadQuestions();

      setTimeout(() => {
        setIsBulkModalOpen(false);
      }, 1500);
    } catch (err) {
      setBulkActionError(getErrorMessage(err, 'Failed to import questions'));
    } finally {
      setIsImportingBulk(false);
    }
  };

  // Edit Question
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditQText(q.questionText || '');
    setEditQBengaliText(q.questionBengaliText || q.questionText || '');
    setEditQOptA(q.optionA);
    setEditQOptB(q.optionB);
    setEditQOptC(q.optionC);
    setEditQOptD(q.optionD);
    setEditQCorrect((q.correctOption as any) || 'A');
    setEditQDifficulty((q.difficulty as any) || 'medium');
    setEditQExplanation(q.explanation || '');
    setEditQMarks(q.defaultMarks || 1.0);
    setEditQNegativeMarks(q.defaultNegativeMarks || 0.25);
    setEditQError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      setIsUpdatingQ(true);
      setEditQError('');
      await api.updateQuestion(editingQuestion.id, {
        questionText: editQText.trim() || editQBengaliText.trim(),
        questionBengaliText: editQBengaliText.trim() || editQText.trim(),
        optionA: editQOptA.trim(),
        optionB: editQOptB.trim(),
        optionC: editQOptC.trim(),
        optionD: editQOptD.trim(),
        correctOption: editQCorrect,
        difficulty: editQDifficulty,
        defaultMarks: editQMarks,
        defaultNegativeMarks: editQNegativeMarks,
        explanation: editQExplanation.trim() || undefined,
      });
      setIsEditModalOpen(false);
      await loadQuestions();
    } catch (err) {
      setEditQError(getErrorMessage(err, 'Failed to update question'));
    } finally {
      setIsUpdatingQ(false);
    }
  };

  // Archive / Toggle Question
  const handleArchiveQuestion = async (q: Question) => {
    const isCurrentlyArchived = q.status === 'archived' || q.isActive === false;
    try {
      await api.updateQuestion(q.id, {
        status: isCurrentlyArchived ? 'active' : 'archived',
        isActive: isCurrentlyArchived,
      });
      await loadQuestions();
    } catch (err) {
      console.error('Failed to toggle question archive status:', err);
    }
  };

  // Delete Question Handlers
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      setIsDeletingQuestion(true);
      setDeleteError('');
      const success = await api.deleteQuestion(questionToDelete.id);
      if (success) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
        setSelectedQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(questionToDelete.id);
          return next;
        });
        setQuestionToDelete(null);
      } else {
        setDeleteError('Failed to delete question. Please try again.');
      }
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete question'));
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const handleBulkDeleteQuestions = async () => {
    if (selectedQuestionIds.size === 0) return;
    try {
      setIsDeletingQuestion(true);
      setDeleteError('');
      const ids = Array.from(selectedQuestionIds);
      let count = 0;
      for (const id of ids) {
        const ok = await api.deleteQuestion(id);
        if (ok) count++;
      }
      setQuestions((prev) => prev.filter((q) => !selectedQuestionIds.has(q.id)));
      setSelectedQuestionIds(new Set());
      setIsBulkDeleteModalOpen(false);
      setBulkActionSuccess(`${count} questions deleted successfully.`);
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete selected questions'));
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  // Bulk Status Update (Active / Archived)
  const handleBulkToggleStatus = async (targetStatus: 'active' | 'archived') => {
    if (selectedQuestionIds.size === 0) return;
    try {
      setIsLoading(true);
      const ids = Array.from(selectedQuestionIds);
      for (const id of ids) {
        await api.updateQuestion(id, {
          status: targetStatus,
          isActive: targetStatus === 'active',
        });
      }
      setSelectedQuestionIds(new Set());
      await loadQuestions();
    } catch (err) {
      console.error('Failed to update questions status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export Questions as standard TXT format
  const handleExportQuestionsTxt = (questionsToExport: Question[]) => {
    if (questionsToExport.length === 0) return;
    let content = '';
    questionsToExport.forEach((q, idx) => {
      const qNum = idx + 1;
      const text = q.questionBengaliText || q.questionText;
      content += `${qNum}. ${text}\n`;
      content += `(a) ${q.optionA}\n`;
      content += `(b) ${q.optionB}\n`;
      content += `(c) ${q.optionC}\n`;
      content += `(d) ${q.optionD}\n\n`;
      const optLetter = q.correctOption.toLowerCase();
      const optText =
        optLetter === 'a'
          ? q.optionA
          : optLetter === 'b'
            ? q.optionB
            : optLetter === 'c'
              ? q.optionC
              : q.optionD;
      content += `সঠিক উত্তর: (${optLetter}) ${optText}\n\n`;
      if (q.explanation) {
        content += `Explanation:\n${q.explanation}\n\n`;
      }
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practicekoro-questions-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Selection helpers
  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (paginatedQuestions.length === 0) return;
    if (paginatedQuestions.every((q) => selectedQuestionIds.has(q.id))) {
      setSelectedQuestionIds((prev) => {
        const next = new Set(prev);
        paginatedQuestions.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedQuestionIds((prev) => {
        const next = new Set(prev);
        paginatedQuestions.forEach((q) => next.add(q.id));
        return next;
      });
    }
  };

  const toggleExpandSolution = (id: string) => {
    setExpandedSolutions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSource !== 'all') count++;
    if (selectedSubjectId) count++;
    if (selectedTopicId) count++;
    if (selectedTopicTestId) count++;
    if (selectedExamId) count++;
    if (selectedExamType) count++;
    if (selectedExamTestId) count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [
    selectedSource,
    selectedSubjectId,
    selectedTopicId,
    selectedTopicTestId,
    selectedExamId,
    selectedExamType,
    selectedExamTestId,
    searchTerm,
  ]);

  const resetAllFilters = () => {
    setSelectedSource('all');
    setSelectedSubjectId('');
    setSelectedTopicId('');
    setSelectedTopicTestId('');
    setSelectedExamId('');
    setSelectedExamType('');
    setSelectedExamTestId('');
    setSearchTerm('');
  };

  // Pagination calculation
  const totalCount = questions.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* ─── Top Header with Breadcrumb & Primary Actions ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Question Bank
              </h1>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                Live Repository
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Centralized repository for Bengali & English MCQs across Topic Tests, Full Mock Tests,
              and Previous Year Papers (PYQ).
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              loadQuestions();
            }}
            title="Refresh Question Records"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <Button
            onClick={() => setIsFormatGuideOpen(true)}
            variant="outline"
            className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" /> TXT Format Guide
          </Button>

          <Button
            onClick={handleOpenBulkModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Upload className="w-3.5 h-3.5" /> + Bulk Add via TXT
          </Button>

          <Button
            onClick={handleOpenAddSingle}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Single Question
          </Button>
        </div>
      </div>

      {/* ─── 4 Gradient Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Layers className="w-5 h-5 text-white" />}
          label="Total Questions"
          value={bankStats.total}
          subtitle="All repository items"
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
          iconBg="bg-white/10"
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-white" />}
          label="Topic Tests"
          value={bankStats.topicCount}
          subtitle="Curriculum & syllabus practice"
          gradient="bg-gradient-to-br from-blue-600 to-cyan-700"
          iconBg="bg-white/10"
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-white" />}
          label="Full Mock Tests"
          value={bankStats.fullMockCount}
          subtitle="Exam simulation sets"
          gradient="bg-gradient-to-br from-purple-600 to-pink-700"
          iconBg="bg-white/10"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-white" />}
          label="PYQ Papers"
          value={bankStats.pyqCount}
          subtitle="Official previous year questions"
          gradient="bg-gradient-to-br from-amber-600 to-orange-700"
          iconBg="bg-white/10"
        />
      </div>

      {/* ─── Dynamic Filters & Command Bar ─── */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
        {/* Row 1: Search, Source Segmented Selector, Status & View Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by Bengali / English text, options, or solution keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Source Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedSource('all');
                setSelectedSubjectId('');
                setSelectedTopicId('');
                setSelectedTopicTestId('');
                setSelectedExamId('');
                setSelectedExamType('');
                setSelectedExamTestId('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSource === 'all'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Sources
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedSource('topic');
                setSelectedExamId('');
                setSelectedExamType('');
                setSelectedExamTestId('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedSource === 'topic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Topic Tests
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedSource('exam');
                setSelectedSubjectId('');
                setSelectedTopicId('');
                setSelectedTopicTestId('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedSource === 'exam'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Exam Tests
            </button>
          </div>

          {/* View Mode Toggle & Export */}
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <button
                type="button"
                onClick={() => handleExportQuestionsTxt(questions)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Export all currently filtered questions as TXT"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export (.txt)</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Card View (Bengali Question Paper Layout)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Card View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Table View (Compact Summary)"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Cascading Filters Bar (only when Topic Tests or Exam Tests is selected) */}
        {selectedSource !== 'all' && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Filters:</span>
            </div>

            {/* IF SOURCE = TOPIC TEST: Subject -> Topic -> Topic Test */}
            {selectedSource === 'topic' && (
              <>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTopicId('');
                    setSelectedTopicTestId('');
                  }}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTopicId}
                  onChange={(e) => {
                    setSelectedTopicId(e.target.value);
                    setSelectedTopicTestId('');
                  }}
                  disabled={!selectedSubjectId}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Topics</option>
                  {filterTopics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTopicTestId}
                  onChange={(e) => setSelectedTopicTestId(e.target.value)}
                  disabled={!selectedTopicId}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Topic Tests</option>
                  {filterTopicTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* IF SOURCE = EXAM: Cascading Exam -> Type (Full Mock Test | PYQ) -> specific Full Mock Test / PYQ */}
            {selectedSource === 'exam' && (
              <>
                {/* Exam Dropdown */}
                <select
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    setSelectedExamType('');
                    setSelectedExamTestId('');
                  }}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">Select Exam</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>

                {/* Type Dropdown (Appears once Exam is selected) */}
                {selectedExamId && (
                  <select
                    value={selectedExamType}
                    onChange={(e) => {
                      setSelectedExamType(e.target.value as any);
                      setSelectedExamTestId('');
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="">Select Type</option>
                    <option value="full_mock">Full Mock Test</option>
                    <option value="pyq">PYQ</option>
                  </select>
                )}

                {/* Specific Full Mock Test Dropdown */}
                {selectedExamId && selectedExamType === 'full_mock' && (
                  <select
                    value={selectedExamTestId}
                    onChange={(e) => setSelectedExamTestId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">
                      {examFullMockTests.length === 0
                        ? 'No Full Mock Tests Available'
                        : 'Select Full Mock Test'}
                    </option>
                    {examFullMockTests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}{' '}
                        {typeof t.totalQuestions === 'number' ? `(${t.totalQuestions} Qs)` : ''}
                      </option>
                    ))}
                  </select>
                )}

                {/* Specific PYQ Paper Dropdown */}
                {selectedExamId && selectedExamType === 'pyq' && (
                  <select
                    value={selectedExamTestId}
                    onChange={(e) => setSelectedExamTestId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">
                      {examPyqTests.length === 0 ? 'No PYQs Available' : 'Select PYQ Paper'}
                    </option>
                    {examPyqTests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title || t.paperName}{' '}
                        {typeof t.totalQuestions === 'number' ? `(${t.totalQuestions} Qs)` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}

            {/* Reset Filters CTA with count */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Active Context Banner (Exam or Topic) ─── */}
      {selectedSource === 'exam' && currentExamObj && currentExamTest && (
        <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-950 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedExamType === 'full_mock'
                      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {selectedExamType === 'full_mock'
                    ? 'Full Mock Test'
                    : 'Previous Year Question (PYQ)'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {currentExamObj.title}
                </span>
                {currentExamTest.year && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                    Year {currentExamTest.year}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {currentExamTest.title || currentExamTest.paperName}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                onClick={handleOpenBulkModal}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" /> + Bulk Add to Test
              </Button>
              <Button
                onClick={handleOpenAddSingle}
                size="sm"
                variant="outline"
                className="text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Question
              </Button>
              <button
                onClick={() => setSelectedExamTestId('')}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                title="Switch to another Test / Paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                <strong className="text-slate-900 dark:text-white">{questions.length}</strong>{' '}
                Questions in Test
              </span>
            </div>

            {currentExamTest.totalMarks && (
              <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    {currentExamTest.totalMarks}
                  </strong>{' '}
                  Total Marks
                </span>
              </div>
            )}

            {currentExamTest.durationMinutes && (
              <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    {currentExamTest.durationMinutes}
                  </strong>{' '}
                  Mins
                </span>
              </div>
            )}

            {typeof currentExamTest.negativeMarking === 'number' && (
              <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                Negative Marks:{' '}
                <strong className="text-rose-600 dark:text-rose-400">
                  -{currentExamTest.negativeMarking}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Active Context Banner for Topic Test ─── */}
      {selectedSource === 'topic' && currentSubjectObj && currentTopicObj && (
        <div className="bg-gradient-to-r from-blue-50/90 via-cyan-50/60 to-white dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-slate-950 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Topic Test Practice
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentSubjectObj.name}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {currentTopicObj.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenBulkModal}
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> + Bulk Add to Topic
              </Button>
              <Button
                onClick={handleOpenAddSingle}
                size="sm"
                variant="outline"
                className="text-xs font-bold border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Question
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Question Records Container ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Loading Question Bank records...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronizing with database and tests hierarchy.
            </p>
          </div>
        ) : selectedSource === 'exam' && !selectedExamId ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-slate-900 dark:text-white">
                Select Exam Context
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Choose an Exam from the filter bar above, choose Type (Full Mock Test or PYQ), and
                select a specific Test to view its questions.
              </p>
            </div>
            {exams.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto pt-2">
                {exams.slice(0, 6).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedExamId(e.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 transition-all"
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : selectedSource === 'exam' && !selectedExamType ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-sm">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-slate-900 dark:text-white">
                Select Question Type for {currentExamObj?.title || 'this Exam'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Questions in this exam belong to either a <strong>Full Mock Test</strong> or{' '}
                <strong>Previous Year Paper (PYQ)</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExamType('full_mock')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all shadow-xs"
              >
                Full Mock Tests ({examFullMockTests.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedExamType('pyq')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all shadow-xs"
              >
                PYQ Papers ({examPyqTests.length})
              </button>
            </div>
          </div>
        ) : selectedSource === 'exam' && !selectedExamTestId ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-slate-900 dark:text-white">
                Select a {selectedExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ Paper'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Select a specific paper below to inspect its questions or add new ones:
              </p>
            </div>
            {(selectedExamType === 'full_mock' ? examFullMockTests : examPyqTests).length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mx-auto pt-2">
                {(selectedExamType === 'full_mock' ? examFullMockTests : examPyqTests).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedExamTestId(t.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 transition-all shadow-xs"
                  >
                    {t.title || t.paperName}{' '}
                    {typeof t.totalQuestions === 'number' ? `(${t.totalQuestions} Qs)` : ''}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No {selectedExamType === 'full_mock' ? 'Full Mock Tests' : 'PYQ Papers'} found for
                this Exam.
              </p>
            )}
          </div>
        ) : selectedSource === 'exam' && selectedExamTestId && questions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-slate-900 dark:text-white">
                No questions found in {currentExamTest?.title || 'this test'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                This {selectedExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ Paper'} does not
                have any questions yet. Add questions now using bulk TXT upload or the single
                question editor.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={handleOpenBulkModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Upload className="w-3.5 h-3.5" /> + Bulk Add via TXT
              </Button>
              <Button
                onClick={handleOpenAddSingle}
                variant="outline"
                className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Question Manually
              </Button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-slate-900 dark:text-white">
                No questions found
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No questions matched the active filters. Clear your filters or add questions using
                the buttons above.
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                onClick={resetAllFilters}
                variant="outline"
                className="text-xs font-bold border-slate-200 dark:border-slate-800"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Top Action Bar: Selection Count, Bulk Actions, Select All Visible */}
            <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAllVisible}
                  className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      paginatedQuestions.length > 0 &&
                      paginatedQuestions.every((q) => selectedQuestionIds.has(q.id))
                        ? 'bg-sky-500 border-sky-500 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {paginatedQuestions.length > 0 &&
                      paginatedQuestions.every((q) => selectedQuestionIds.has(q.id)) && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                  </div>
                  <span>Select All Visible ({paginatedQuestions.length})</span>
                </button>

                {selectedQuestionIds.size > 0 && (
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 flex-wrap">
                    <span className="font-black text-sky-600 dark:text-sky-400">
                      {selectedQuestionIds.size} selected
                    </span>

                    <button
                      type="button"
                      onClick={() => handleBulkToggleStatus('archived')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition-colors"
                      title="Archive selected questions"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkToggleStatus('active')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1 transition-colors"
                      title="Activate selected questions"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Activate
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const selectedList = questions.filter((q) => selectedQuestionIds.has(q.id));
                        handleExportQuestionsTxt(selectedList);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold flex items-center gap-1 transition-colors"
                      title="Export selected questions as TXT"
                    >
                      <Download className="w-3 h-3" />
                      Export TXT
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete ({selectedQuestionIds.size})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIds(new Set())}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline text-[11px] ml-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {(currentPage - 1) * pageSize + 1}
                </strong>{' '}
                –{' '}
                <strong className="text-slate-900 dark:text-white">
                  {Math.min(currentPage * pageSize, totalCount)}
                </strong>{' '}
                of <strong className="text-slate-900 dark:text-white">{totalCount}</strong>{' '}
                questions
              </div>
            </div>

            {/* ─── CARD VIEW (Bengali Question Paper Layout) ─── */}
            {viewMode === 'card' ? (
              <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
                {paginatedQuestions.map((q, idx) => {
                  const questionNumber = (currentPage - 1) * pageSize + idx + 1;
                  const isSelected = selectedQuestionIds.has(q.id);
                  const isSolutionExpanded = expandedSolutions.has(q.id);
                  const subjectTitle =
                    q.topicName || q.chapterName || q.subjectName || 'General Knowledge';

                  return (
                    <div
                      key={q.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/15 dark:bg-sky-950/15'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Select circle, Number Badge, Question Text, Action Icons */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Selection Circle */}
                          <button
                            type="button"
                            onClick={() => toggleSelectQuestion(q.id)}
                            title={isSelected ? 'Deselect question' : 'Select question'}
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-sky-500 bg-sky-500 text-white shadow-xs'
                                : 'border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-950 hover:border-sky-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </button>

                          {/* Question Content */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                #{questionNumber}
                              </span>
                              <DifficultyBadge difficulty={q.difficulty} />
                              <StatusBadge status={q.status} isActive={q.isActive} />
                            </div>

                            {/* Bengali Question Text (Primary) */}
                            <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                              {q.questionBengaliText || q.questionText}
                            </h3>

                            {/* English Question Text (Secondary) */}
                            {q.questionBengaliText &&
                              q.questionText &&
                              q.questionBengaliText !== q.questionText && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                  {q.questionText}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Top-Right Quick Action Icons */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewingQuestion(q);
                              setIsPreviewModalOpen(true);
                            }}
                            title="Full Question Preview"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(q)}
                            title="Edit Question"
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchiveQuestion(q)}
                            title={
                              q.status === 'archived' || q.isActive === false
                                ? 'Unarchive Question'
                                : 'Archive Question'
                            }
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuestionToDelete(q)}
                            title="Delete Question"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Options Grid: Column 1 = A & C, Column 2 = B & D */}
                      <div className="ml-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm">
                        {/* Option A */}
                        <div
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                            q.correctOption === 'A'
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/70 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                q.correctOption === 'A'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              A
                            </span>
                            <span
                              className={`text-xs sm:text-[13px] leading-relaxed ${
                                q.correctOption === 'A'
                                  ? 'font-bold text-emerald-950 dark:text-emerald-200'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {q.optionA}
                            </span>
                          </div>
                          {q.correctOption === 'A' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" /> Correct
                            </span>
                          )}
                        </div>

                        {/* Option B */}
                        <div
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                            q.correctOption === 'B'
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/70 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                q.correctOption === 'B'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              B
                            </span>
                            <span
                              className={`text-xs sm:text-[13px] leading-relaxed ${
                                q.correctOption === 'B'
                                  ? 'font-bold text-emerald-950 dark:text-emerald-200'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {q.optionB}
                            </span>
                          </div>
                          {q.correctOption === 'B' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" /> Correct
                            </span>
                          )}
                        </div>

                        {/* Option C */}
                        <div
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                            q.correctOption === 'C'
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/70 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                q.correctOption === 'C'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              C
                            </span>
                            <span
                              className={`text-xs sm:text-[13px] leading-relaxed ${
                                q.correctOption === 'C'
                                  ? 'font-bold text-emerald-950 dark:text-emerald-200'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {q.optionC}
                            </span>
                          </div>
                          {q.correctOption === 'C' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" /> Correct
                            </span>
                          )}
                        </div>

                        {/* Option D */}
                        <div
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                            q.correctOption === 'D'
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/70 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                q.correctOption === 'D'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              D
                            </span>
                            <span
                              className={`text-xs sm:text-[13px] leading-relaxed ${
                                q.correctOption === 'D'
                                  ? 'font-bold text-emerald-950 dark:text-emerald-200'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {q.optionD}
                            </span>
                          </div>
                          {q.correctOption === 'D' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" /> Correct
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Inline Solution Accordion */}
                      {q.explanation && (
                        <div className="ml-8 mt-3">
                          {isSolutionExpanded ? (
                            <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 rounded-xl text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                  ব্যাখ্যা ও সমাধান (Explanation & Notes):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleExpandSolution(q.id)}
                                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                  Hide
                                </button>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleExpandSolution(q.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>View Explanation & Notes</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Bottom Meta Row */}
                      <div className="ml-8 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{subjectTitle}</span>
                          </div>

                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            BN
                          </span>

                          {q.sourceExam && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              Exam:{' '}
                              {exams.find((e) => e.id === q.sourceExam)?.title || q.sourceExam}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            +{q.defaultMarks || 1} / -{q.defaultNegativeMarks || 0.25}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ─── TABLE VIEW (Compact Data Grid) ─── */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3.5 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3 max-w-md">Question Statement</th>
                      <th className="px-4 py-3">Source & Hierarchy</th>
                      <th className="px-4 py-3">Options & Key</th>
                      <th className="px-4 py-3">Difficulty</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedQuestions.map((q, idx) => {
                      const questionNumber = (currentPage - 1) * pageSize + idx + 1;
                      const isSelected = selectedQuestionIds.has(q.id);
                      const isTopic = q.sourceType === 'topic';
                      const isPyq = q.sourceType === 'pyq';
                      const isExam = q.sourceType === 'other' || Boolean(q.sourceExam);
                      const examObj = exams.find((e) => e.id === q.sourceExam);

                      return (
                        <tr
                          key={q.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                            isSelected ? 'bg-sky-50/20 dark:bg-sky-950/20' : ''
                          }`}
                        >
                          {/* Selection & Index */}
                          <td className="px-3.5 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelectQuestion(q.id)}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-sky-500 border-sky-500 text-white'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                          </td>

                          {/* Question Text */}
                          <td className="px-4 py-3.5 max-w-md">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                                {questionNumber}. {q.questionBengaliText || q.questionText}
                              </p>
                              {q.questionBengaliText &&
                                q.questionText &&
                                q.questionBengaliText !== q.questionText && (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 italic">
                                    {q.questionText}
                                  </p>
                                )}
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  +{q.defaultMarks || 1} / -{q.defaultNegativeMarks || 0.25}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Source & Hierarchy */}
                          <td className="px-4 py-3 text-[11px]">
                            {isTopic && (
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                                  Topic Test
                                </span>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {q.subjectName || 'Subject'}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {q.topicName || q.chapterName || 'General Topic'}
                                </p>
                              </div>
                            )}

                            {isExam && (
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
                                  Full Mock Test
                                </span>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {examObj?.title || q.sourceExam || 'Standard Exam'}
                                </p>
                              </div>
                            )}

                            {isPyq && (
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                  PYQ Paper
                                </span>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {q.sourceExam || 'WBP Exam'}{' '}
                                  {q.sourceYear ? `(${q.sourceYear})` : ''}
                                </p>
                              </div>
                            )}
                          </td>

                          {/* Options Overview */}
                          <td className="px-4 py-3 text-[11px] max-w-xs">
                            <div className="grid grid-cols-2 gap-1.5">
                              <div
                                className={`p-1.5 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'A'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (a) {q.optionA}
                              </div>
                              <div
                                className={`p-1.5 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'B'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (b) {q.optionB}
                              </div>
                              <div
                                className={`p-1.5 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'C'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (c) {q.optionC}
                              </div>
                              <div
                                className={`p-1.5 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'D'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (d) {q.optionD}
                              </div>
                            </div>
                          </td>

                          {/* Difficulty */}
                          <td className="px-4 py-3">
                            <DifficultyBadge difficulty={q.difficulty} />
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={q.status} isActive={q.isActive} />
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setPreviewingQuestion(q);
                                  setIsPreviewModalOpen(true);
                                }}
                                title="Preview Question"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(q)}
                                title="Edit Question"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleArchiveQuestion(q)}
                                title={
                                  q.status === 'archived' || q.isActive === false
                                    ? 'Unarchive'
                                    : 'Archive'
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setQuestionToDelete(q)}
                                title="Delete Question"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Pagination Controls ─── */}
        {questions.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span>{' '}
              questions
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:border-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-slate-900 dark:text-white px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:border-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Floating Bulk Action Bar (When Items Selected) ─── */}
      {selectedQuestionIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700/80 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3.5 animate-fadeIn">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
              {selectedQuestionIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkToggleStatus('archived')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-slate-400" />
              <span>Archive</span>
            </button>

            <button
              onClick={() => handleBulkToggleStatus('active')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Activate</span>
            </button>

            <button
              onClick={() => {
                const selectedList = questions.filter((q) => selectedQuestionIds.has(q.id));
                handleExportQuestionsTxt(selectedList);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sky-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export TXT</span>
            </button>

            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedQuestionIds.size})</span>
            </button>

            <button
              onClick={() => setSelectedQuestionIds(new Set())}
              className="text-xs text-slate-400 hover:text-white underline ml-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ─── SINGLE QUESTION MODAL (Add Single) ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Add Single Question
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create an MCQ with statement, options, correct answer, and explanation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {singleError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSingle} className="space-y-4">
              {/* Question Source Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Question Source *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSingleSource('topic')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      singleSource === 'topic'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Topic Test (Subject → Topic → Test)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSingleSource('exam')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      singleSource === 'exam'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Exam (Full Mock Test / PYQ)</span>
                  </button>
                </div>
              </div>

              {/* Source Cascading Selection */}
              {singleSource === 'topic' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject *
                    </label>
                    <select
                      value={singleSubjectId}
                      onChange={(e) => {
                        setSingleSubjectId(e.target.value);
                        const firstTopic =
                          chapters.find((c) => c.subjectId === e.target.value)?.id || '';
                        setSingleTopicId(firstTopic);
                      }}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Topic *
                    </label>
                    <select
                      value={singleTopicId}
                      onChange={(e) => setSingleTopicId(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">Select Topic</option>
                      {singleTopics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Topic Test (Optional)
                    </label>
                    <select
                      value={singleTopicTestId}
                      onChange={(e) => setSingleTopicTestId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">(Optional) Auto-link to Test</option>
                      {singleTopicTests.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Exam *
                    </label>
                    <select
                      value={singleExamId}
                      onChange={(e) => {
                        const newExamId = e.target.value;
                        setSingleExamId(newExamId);
                        const testsForNewExam = tests.filter(
                          (t) =>
                            t.testType === singleExamType &&
                            (t.examId === newExamId || t.associatedExamIds?.includes(newExamId))
                        );
                        setSingleExamTestId(testsForNewExam[0]?.id || '');
                      }}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="">Select Exam</option>
                      {exams.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={singleExamType}
                      onChange={(e) => {
                        const newType = e.target.value as 'full_mock' | 'pyq';
                        setSingleExamType(newType);
                        const testsForType = tests.filter(
                          (t) =>
                            t.testType === newType &&
                            (t.examId === singleExamId ||
                              t.associatedExamIds?.includes(singleExamId))
                        );
                        setSingleExamTestId(testsForType[0]?.id || '');
                      }}
                      required
                      disabled={!singleExamId}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="full_mock">Full Mock Test</option>
                      <option value="pyq">PYQ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {singleExamType === 'full_mock' ? 'Full Mock Test *' : 'PYQ Paper *'}
                    </label>
                    <select
                      value={singleExamTestId}
                      onChange={(e) => setSingleExamTestId(e.target.value)}
                      required
                      disabled={!singleExamId}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="">
                        {(singleExamType === 'full_mock'
                          ? singleExamFullMockTests
                          : singleExamPyqTests
                        ).length === 0
                          ? `No ${singleExamType === 'full_mock' ? 'Full Mock Tests' : 'PYQs'} Available`
                          : `Select ${singleExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ Paper'}`}
                      </option>
                      {(singleExamType === 'full_mock'
                        ? singleExamFullMockTests
                        : singleExamPyqTests
                      ).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title || t.paperName}{' '}
                          {typeof t.totalQuestions === 'number' ? `(${t.totalQuestions} Qs)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Question Statement in Bengali & English */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Statement in Bengali (বাংলা প্রশ্ন) *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="যেমন: ভারতের প্রথম রাষ্ট্রপতি কে ছিলেন?"
                    value={singleQuestionBengali}
                    onChange={(e) => setSingleQuestionBengali(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Statement in English (ঐচ্ছিক / Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Who was the first President of India?"
                    value={singleQuestionEnglish}
                    onChange={(e) => setSingleQuestionEnglish(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Option A *
                  </label>
                  <input
                    type="text"
                    placeholder="Option A text..."
                    value={singleOptA}
                    onChange={(e) => setSingleOptA(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Option B *
                  </label>
                  <input
                    type="text"
                    placeholder="Option B text..."
                    value={singleOptB}
                    onChange={(e) => setSingleOptB(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Option C *
                  </label>
                  <input
                    type="text"
                    placeholder="Option C text..."
                    value={singleOptC}
                    onChange={(e) => setSingleOptC(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Option D *
                  </label>
                  <input
                    type="text"
                    placeholder="Option D text..."
                    value={singleOptD}
                    onChange={(e) => setSingleOptD(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Correct Answer Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correct Answer Key *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setSingleCorrect(opt)}
                      className={`py-2 text-xs font-black rounded-xl border transition-all ${
                        singleCorrect === opt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      Option ({opt})
                    </button>
                  ))}
                </div>
              </div>

              {/* Marks, Negative Marks & Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Marks (+ve)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={singleMarks}
                    onChange={(e) => setSingleMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={singleNegativeMarks}
                    onChange={(e) => setSingleNegativeMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={singleDifficulty}
                    onChange={(e) => setSingleDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="easy">Easy (সহজ)</option>
                    <option value="medium">Medium (মাঝারি)</option>
                    <option value="hard">Hard (কঠিন)</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation & Solution Notes (English or Bengali)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed solution or points explaining the correct answer..."
                  value={singleExplanation}
                  onChange={(e) => setSingleExplanation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingSingle}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSavingSingle ? 'Saving...' : 'Save Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── BULK TXT QUESTION UPLOAD MODAL ─── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Bulk Add Questions via TXT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Import questions in batches using standard PracticeKoro UTF-8 format.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkActionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bulkActionError}</span>
              </div>
            )}

            {bulkActionSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bulkActionSuccess}</span>
              </div>
            )}

            {/* STEP 1: UPLOAD & CONFIGURATION */}
            {bulkStep === 'upload' && (
              <div className="space-y-4">
                {/* Source Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Question Source *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBulkSource('topic')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        bulkSource === 'topic'
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Topic Test</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkSource('exam')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        bulkSource === 'exam'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>Exam (Mock / PYQ)</span>
                    </button>
                  </div>
                </div>

                {/* Assignment Dropdowns */}
                {bulkSource === 'topic' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Subject *
                      </label>
                      <select
                        value={bulkSubjectId}
                        onChange={(e) => {
                          setBulkSubjectId(e.target.value);
                          const firstTopic =
                            chapters.find((c) => c.subjectId === e.target.value)?.id || '';
                          setBulkTopicId(firstTopic);
                        }}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Topic *
                      </label>
                      <select
                        value={bulkTopicId}
                        onChange={(e) => setBulkTopicId(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="">Select Topic</option>
                        {bulkTopics.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Topic Test
                      </label>
                      <select
                        value={bulkTopicTestId}
                        onChange={(e) => setBulkTopicTestId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="">(Optional) Auto-link to Test</option>
                        {bulkTopicTests.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Exam *
                      </label>
                      <select
                        value={bulkExamId}
                        onChange={(e) => {
                          const newExamId = e.target.value;
                          setBulkExamId(newExamId);
                          const testsForNewExam = tests.filter(
                            (t) =>
                              t.testType === bulkExamType &&
                              (t.examId === newExamId || t.associatedExamIds?.includes(newExamId))
                          );
                          setBulkExamTestId(testsForNewExam[0]?.id || '');
                        }}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="">Select Target Exam</option>
                        {exams.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Type *
                      </label>
                      <select
                        value={bulkExamType}
                        onChange={(e) => {
                          const newType = e.target.value as 'full_mock' | 'pyq';
                          setBulkExamType(newType);
                          const testsForType = tests.filter(
                            (t) =>
                              t.testType === newType &&
                              (t.examId === bulkExamId || t.associatedExamIds?.includes(bulkExamId))
                          );
                          setBulkExamTestId(testsForType[0]?.id || '');
                        }}
                        required
                        disabled={!bulkExamId}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="full_mock">Full Mock Test</option>
                        <option value="pyq">PYQ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {bulkExamType === 'full_mock' ? 'Full Mock Test *' : 'PYQ Paper *'}
                      </label>
                      <select
                        value={bulkExamTestId}
                        onChange={(e) => setBulkExamTestId(e.target.value)}
                        required
                        disabled={!bulkExamId}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="">
                          {(bulkExamType === 'full_mock' ? bulkExamFullMockTests : bulkExamPyqTests)
                            .length === 0
                            ? `No ${bulkExamType === 'full_mock' ? 'Full Mock Tests' : 'PYQs'} Available`
                            : `Select ${bulkExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ Paper'}`}
                        </option>
                        {(bulkExamType === 'full_mock'
                          ? bulkExamFullMockTests
                          : bulkExamPyqTests
                        ).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title || t.paperName}{' '}
                            {typeof t.totalQuestions === 'number' ? `(${t.totalQuestions} Qs)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Exam Destination Confirmation */}
                {bulkSource === 'exam' && bulkExamId && bulkExamTestId && (
                  <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Destination:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {exams.find((e) => e.id === bulkExamId)?.title}
                      </strong>{' '}
                      →{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {bulkExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ'}
                      </strong>{' '}
                      →{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {tests.find((t) => t.id === bulkExamTestId)?.title ||
                          tests.find((t) => t.id === bulkExamTestId)?.paperName}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Upload & Format Guide buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload TXT File (UTF-8)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormatGuideOpen(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      View Format
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => downloadSampleTxt()}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download Sample TXT
                    </button>
                  </div>
                </div>

                {/* File picker */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2 hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-950/40">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {bulkFileName ? (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        Selected File: {bulkFileName}
                      </span>
                    ) : (
                      'Choose a .txt file (UTF-8 encoded) or drag & drop it here'
                    )}
                  </p>
                  <label className="inline-block">
                    <span className="cursor-pointer text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs">
                      Browse File
                    </span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      onChange={handleTxtFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Paste Area */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Or Paste TXT Content Directly:
                  </label>
                  <textarea
                    rows={6}
                    placeholder="1. ভারতের প্রথম রাষ্ট্রপতি কে ছিলেন?&#10;(a) ড. রাজেন্দ্র প্রসাদ&#10;(b) জওহরলাল নেহরু&#10;(c) সর্বপল্লী রাধাকৃষ্ণন&#10;(d) ড. বি. আর. আম্বেদকর&#10;&#10;সঠিক উত্তর: (a) ড. রাজেন্দ্র প্রসাদ&#10;&#10;Explanation:&#10;- ড. রাজেন্দ্র প্রসাদ ছিলেন স্বাধীন ভারতের প্রথম রাষ্ট্রপতি।"
                    value={bulkRawText}
                    onChange={(e) => setBulkRawText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleParseTxt}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                  >
                    Parse TXT & Preview Questions
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: BULK UPLOAD PREVIEW */}
            {bulkStep === 'preview' && bulkParseResult && (
              <div className="space-y-4">
                {/* Destination Banner */}
                <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider">
                      Target Destination
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {bulkSource === 'topic'
                        ? `${subjects.find((s) => s.id === bulkSubjectId)?.name || 'Subject'} → ${chapters.find((c) => c.id === bulkTopicId)?.name || 'Topic'}${bulkTopicTestId ? ` → ${tests.find((t) => t.id === bulkTopicTestId)?.title}` : ''}`
                        : `${exams.find((e) => e.id === bulkExamId)?.title || 'Exam'} → ${bulkExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ'} → ${tests.find((t) => t.id === bulkExamTestId)?.title || tests.find((t) => t.id === bulkExamTestId)?.paperName || 'Selected Test'}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkStep('upload')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Validation Stat Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                    <span className="block text-[11px] font-medium text-slate-500">
                      Detected Questions
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {bulkParseResult.totalDetected}
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-center">
                    <span className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Valid Questions
                    </span>
                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                      {bulkParseResult.valid.length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-center">
                    <span className="block text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      Formatting Errors
                    </span>
                    <span className="text-xl font-black text-rose-700 dark:text-rose-400">
                      {bulkParseResult.errors.length}
                    </span>
                  </div>
                </div>

                {/* Errors List */}
                {bulkParseResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Problematic Question Blocks (Review before importing)
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {bulkParseResult.errors.map((err, i) => (
                        <div
                          key={i}
                          className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-bold">
                            <span>Question #{err.questionNumber}</span>
                            <span className="text-[10px] uppercase tracking-wider">Error</span>
                          </div>
                          <p className="text-rose-600 dark:text-rose-300 text-[11px]">
                            {err.reason}
                          </p>
                          <pre className="text-[10px] p-2 bg-black/10 dark:bg-black/40 rounded text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono">
                            {err.rawText.slice(0, 160)}...
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid Questions Preview */}
                {bulkParseResult.valid.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Valid Questions Preview (Showing first 3 of {bulkParseResult.valid.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {bulkParseResult.valid.slice(0, 3).map((q) => (
                        <div
                          key={q.questionNumber}
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1"
                        >
                          <p className="font-bold text-slate-900 dark:text-white">
                            {q.questionNumber}. {q.questionText}
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                            <span
                              className={
                                q.correctOption === 'A' ? 'text-emerald-500 font-bold' : ''
                              }
                            >
                              (a) {q.optionA}
                            </span>
                            <span
                              className={
                                q.correctOption === 'B' ? 'text-emerald-500 font-bold' : ''
                              }
                            >
                              (b) {q.optionB}
                            </span>
                            <span
                              className={
                                q.correctOption === 'C' ? 'text-emerald-500 font-bold' : ''
                              }
                            >
                              (c) {q.optionC}
                            </span>
                            <span
                              className={
                                q.correctOption === 'D' ? 'text-emerald-500 font-bold' : ''
                              }
                            >
                              (d) {q.optionD}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBulkStep('upload')}
                      className="text-xs"
                    >
                      Fix / Upload Again
                    </Button>

                    <Button
                      type="button"
                      onClick={handleImportValidQuestions}
                      disabled={isImportingBulk || bulkParseResult.valid.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      {isImportingBulk
                        ? 'Importing...'
                        : `Import ${bulkParseResult.valid.length} Valid Questions`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── VIEW TXT FORMAT GUIDE MODAL ─── */}
      {isFormatGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Standard TXT Question Format
                </h3>
              </div>
              <button
                onClick={() => setIsFormatGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every question block must include the statement numbered, 4 options labeled (a) to
              (d), the correct answer line (`সঠিক উত্তর: (a)`), and optional `Explanation:`.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative">
              <pre className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {SAMPLE_TXT_CONTENT}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SAMPLE_TXT_CONTENT);
                  setCopiedFormat(true);
                  setTimeout(() => setCopiedFormat(false), 2000);
                }}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1 hover:bg-slate-50"
              >
                {copiedFormat ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" /> Copy Sample
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsFormatGuideOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => downloadSampleTxt()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download Template (.txt)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUESTION PREVIEW MODAL (Student-style view) ─── */}
      {isPreviewModalOpen && previewingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Question Preview
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={previewingQuestion.difficulty} />
                  <StatusBadge
                    status={previewingQuestion.status}
                    isActive={previewingQuestion.isActive}
                  />
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    +{previewingQuestion.defaultMarks || 1} / -
                    {previewingQuestion.defaultNegativeMarks || 0.25}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed pt-1">
                  {previewingQuestion.questionBengaliText || previewingQuestion.questionText}
                </h4>
                {previewingQuestion.questionBengaliText &&
                  previewingQuestion.questionText &&
                  previewingQuestion.questionBengaliText !== previewingQuestion.questionText && (
                    <p className="text-xs text-slate-500 italic">
                      {previewingQuestion.questionText}
                    </p>
                  )}
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { key: 'A', text: previewingQuestion.optionA },
                  { key: 'B', text: previewingQuestion.optionB },
                  { key: 'C', text: previewingQuestion.optionC },
                  { key: 'D', text: previewingQuestion.optionD },
                ].map((opt) => {
                  const isCorrect = previewingQuestion.correctOption === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {previewingQuestion.explanation && (
                <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Explanation & Solution Notes:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {previewingQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUESTION EDIT MODAL ─── */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Edit Question #{editingQuestion.id.slice(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editQError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {editQError}
              </p>
            )}

            <form onSubmit={handleUpdateQuestion} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Statement in Bengali (বাংলা প্রশ্ন) *
                </label>
                <textarea
                  rows={2}
                  value={editQBengaliText}
                  onChange={(e) => setEditQBengaliText(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Statement in English (English Statement)
                </label>
                <input
                  type="text"
                  value={editQText}
                  onChange={(e) => setEditQText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    value={editQOptA}
                    onChange={(e) => setEditQOptA(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    value={editQOptB}
                    onChange={(e) => setEditQOptB(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Option C
                  </label>
                  <input
                    type="text"
                    value={editQOptC}
                    onChange={(e) => setEditQOptC(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Option D
                  </label>
                  <input
                    type="text"
                    value={editQOptD}
                    onChange={(e) => setEditQOptD(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correct Answer Key *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setEditQCorrect(opt)}
                      className={`py-2 text-xs font-black rounded-xl border transition-all ${
                        editQCorrect === opt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Option ({opt})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={editQMarks}
                    onChange={(e) => setEditQMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={editQNegativeMarks}
                    onChange={(e) => setEditQNegativeMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editQDifficulty}
                    onChange={(e) => setEditQDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="easy">Easy (সহজ)</option>
                    <option value="medium">Medium (মাঝারি)</option>
                    <option value="hard">Hard (কঠিন)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation & Solution Notes
                </label>
                <textarea
                  rows={2}
                  value={editQExplanation}
                  onChange={(e) => setEditQExplanation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingQ}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {isUpdatingQ ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SINGLE QUESTION DELETE MODAL ─── */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  প্রশ্নটি ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Delete Question Confirmation
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
                {deleteError}
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold line-clamp-2">
                {questionToDelete.questionBengaliText || questionToDelete.questionText}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>
                  Subject:{' '}
                  {subjects.find((s) => s.id === questionToDelete.subjectId)?.name ||
                    questionToDelete.subjectName ||
                    'General'}
                </span>
                <span>•</span>
                <span>Language: BN</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              এই প্রশ্নটি স্থায়ীভাবে ডাটাবেস থেকে মুছে ফেলা হবে। আপনি কি নিশ্চিত?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuestionToDelete(null);
                  setDeleteError('');
                }}
                disabled={isDeletingQuestion}
                className="text-xs"
              >
                বাতিল করুন (Cancel)
              </Button>
              <Button
                type="button"
                onClick={handleDeleteQuestion}
                disabled={isDeletingQuestion}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                {isDeletingQuestion ? 'মুছে ফেলা হচ্ছে...' : 'ডিলিট করুন (Delete)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK DELETE MODAL ─── */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  একসাথে {selectedQuestionIds.size}টি প্রশ্ন ডিলিট করবেন?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bulk Delete Confirmation
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              নির্বাচিত <strong>{selectedQuestionIds.size}টি</strong> প্রশ্ন স্থায়ীভাবে ডাটাবেস ও
              সংশ্লিষ্ট টেস্ট থেকে ডিলিট করা হবে। এই পদক্ষেপটি আনডু করা যাবে না।
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBulkDeleteModalOpen(false);
                  setDeleteError('');
                }}
                disabled={isDeletingQuestion}
                className="text-xs"
              >
                বাতিল করুন (Cancel)
              </Button>
              <Button
                type="button"
                onClick={handleBulkDeleteQuestions}
                disabled={isDeletingQuestion}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                {isDeletingQuestion
                  ? 'ডিলিট হচ্ছে...'
                  : `হ্যাঁ, সবকটি ডিলিট করুন (${selectedQuestionIds.size})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
