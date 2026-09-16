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
  Lock,
  LayoutGrid,
  List,
  Check,
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

export const AdminQuestionBank: React.FC = () => {
  const [searchParams] = useSearchParams();
  const querySource = searchParams.get('source');
  const querySubjectId = searchParams.get('subjectId');
  const queryTopicId = searchParams.get('topicId');

  // Master Entities
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'archived'>('all');

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
  const [singleQuestionText, setSingleQuestionText] = useState('');
  const [singleOptA, setSingleOptA] = useState('');
  const [singleOptB, setSingleOptB] = useState('');
  const [singleOptC, setSingleOptC] = useState('');
  const [singleOptD, setSingleOptD] = useState('');
  const [singleCorrect, setSingleCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
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
  const [editQOptA, setEditQOptA] = useState('');
  const [editQOptB, setEditQOptB] = useState('');
  const [editQOptC, setEditQOptC] = useState('');
  const [editQOptD, setEditQOptD] = useState('');
  const [editQCorrect, setEditQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [editQExplanation, setEditQExplanation] = useState('');
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
      const [allExams, allSubjects, allChapters, allTests, allQuestions] = await Promise.all([
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
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchTerm.trim() || undefined,
        }),
      ]);

      setExams(allExams);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setTests(allTests);
      setQuestions(allQuestions);
    } catch (err) {
      console.error('Failed to load Question Bank data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedSource,
    selectedSubjectId,
    selectedTopicId,
    selectedTopicTestId,
    selectedExamId,
    selectedExamType,
    selectedExamTestId,
    selectedStatus,
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
    selectedStatus,
    searchTerm,
  ]);

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

  // Filtered dropdown options for cascading - Exam Full Mock & PYQ Tests (Section 7, 8)
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

    // Inherit active filter context if user is actively in Exam view
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
    setSingleQuestionText('');
    setSingleOptA('');
    setSingleOptB('');
    setSingleOptC('');
    setSingleOptD('');
    setSingleCorrect('A');
    setSingleExplanation('');
    setSingleMarks(1.0);
    setSingleNegativeMarks(0.25);
    setSingleError('');
    setIsAddModalOpen(true);
  };

  // Submit Single Question (Section 6A)
  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleQuestionText.trim()) {
      setSingleError('Question statement is required.');
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

      if (singleSource === 'exam' && singleExamTestId) {
        // Create and link directly to selected Full Mock Test or PYQ (Section 12, 15)
        await api.createQuestionForTest(singleExamTestId, {
          questionText: singleQuestionText.trim(),
          optionA: singleOptA.trim(),
          optionB: singleOptB.trim(),
          optionC: singleOptC.trim(),
          optionD: singleOptD.trim(),
          correctOption: singleCorrect,
          explanation: singleExplanation.trim() || undefined,
          sourceExam: singleExamId,
          sourceType: singleExamType === 'pyq' ? 'pyq' : 'other',
          defaultMarks: singleMarks,
          defaultNegativeMarks: singleNegativeMarks,
          isActive: true,
          status: 'active',
        });
      } else if (singleSource === 'topic' && singleTopicTestId) {
        // Create and assign directly to the selected Topic Test
        await api.createQuestionForTest(singleTopicTestId, {
          questionText: singleQuestionText.trim(),
          optionA: singleOptA.trim(),
          optionB: singleOptB.trim(),
          optionC: singleOptC.trim(),
          optionD: singleOptD.trim(),
          correctOption: singleCorrect,
          explanation: singleExplanation.trim() || undefined,
          subjectId: singleSubjectId,
          topicId: singleTopicId,
          chapterId: singleTopicId,
          sourceType: 'topic',
          defaultMarks: singleMarks,
          defaultNegativeMarks: singleNegativeMarks,
          isActive: true,
          status: 'active',
        });
      } else {
        // Save to question repository with metadata
        await api.createQuestion({
          questionText: singleQuestionText.trim(),
          optionA: singleOptA.trim(),
          optionB: singleOptB.trim(),
          optionC: singleOptC.trim(),
          optionD: singleOptD.trim(),
          correctOption: singleCorrect,
          explanation: singleExplanation.trim() || undefined,
          subjectId: singleSource === 'topic' ? singleSubjectId : undefined,
          topicId: singleSource === 'topic' ? singleTopicId : undefined,
          chapterId: singleSource === 'topic' ? singleTopicId : undefined,
          sourceType: singleSource === 'topic' ? 'topic' : 'other',
          sourceExam: singleSource === 'exam' ? singleExamId : undefined,
          defaultMarks: singleMarks,
          defaultNegativeMarks: singleNegativeMarks,
          isActive: true,
          status: 'active',
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

  // Open Bulk Modal (Section 7)
  const handleOpenBulkModal = () => {
    const defaultSub = subjects[0]?.id || '';
    const defaultTopic = chapters.find((c) => c.subjectId === defaultSub)?.id || '';
    const defaultTopicTest =
      tests.find((t) => t.chapterId === defaultTopic || t.topicId === defaultTopic)?.id || '';

    // Inherit active filter context if user is actively in Exam view
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

  // Parse TXT to Preview (Section 8, 9, 10)
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

  // Import Valid Questions from Preview (Section 9, 10, 11)
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
    setEditQText(q.questionText);
    setEditQOptA(q.optionA);
    setEditQOptB(q.optionB);
    setEditQOptC(q.optionC);
    setEditQOptD(q.optionD);
    setEditQCorrect((q.correctOption as any) || 'A');
    setEditQExplanation(q.explanation || '');
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
        questionText: editQText.trim(),
        optionA: editQOptA.trim(),
        optionB: editQOptB.trim(),
        optionC: editQOptC.trim(),
        optionD: editQOptD.trim(),
        correctOption: editQCorrect,
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

  // Archive Question
  const handleArchiveQuestion = async (q: Question) => {
    const isCurrentlyArchived = q.status === 'archived';
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
        setBulkActionSuccess('Question deleted successfully.');
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

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  // Pagination calculation
  const totalCount = questions.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Question Bank
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Central repository of exam and practice questions. Real question records loaded
            directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsFormatGuideOpen(true)}
            variant="outline"
            className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> TXT Format
          </Button>

          <Button
            onClick={handleOpenBulkModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" /> + Bulk Add Questions
          </Button>

          <Button
            onClick={handleOpenAddSingle}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Question
          </Button>
        </div>
      </div>

      {/* Dynamic Filters Bar (Section 14) */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions by text or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Source Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Source:
            </span>
            <select
              value={selectedSource}
              onChange={(e) => {
                const val = e.target.value as any;
                setSelectedSource(val);
                if (val !== 'topic') {
                  setSelectedSubjectId('');
                  setSelectedTopicId('');
                  setSelectedTopicTestId('');
                }
                if (val !== 'exam') {
                  setSelectedExamId('');
                  setSelectedExamType('');
                  setSelectedExamTestId('');
                }
              }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="all">All Sources</option>
              <option value="topic">Topic Test</option>
              <option value="exam">Exam</option>
            </select>
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
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
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
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
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

          {/* IF SOURCE = EXAM: Cascading Exam -> Type (Full Mock Test | PYQ) -> specific Full Mock Test / PYQ (Section 6, 7, 8, 13) */}
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
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
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
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
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
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          {/* Reset Filters */}
          {(selectedSource !== 'all' ||
            selectedSubjectId ||
            selectedTopicId ||
            selectedTopicTestId ||
            selectedExamId ||
            selectedExamType ||
            selectedExamTestId ||
            selectedStatus !== 'all' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedSource('all');
                setSelectedSubjectId('');
                setSelectedTopicId('');
                setSelectedTopicTestId('');
                setSelectedExamId('');
                setSelectedExamType('');
                setSelectedExamTestId('');
                setSelectedStatus('all');
                setSearchTerm('');
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Exam Context Banner */}
      {selectedSource === 'exam' && currentExamObj && currentExamTest && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/20 dark:via-slate-950 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedExamType === 'full_mock'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {selectedExamType === 'full_mock'
                    ? 'Full Mock Test'
                    : 'Previous Year Question (PYQ)'}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentExamObj.title}
                </span>
                {currentExamTest.year && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                    Year {currentExamTest.year}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentExamTest.title || currentExamTest.paperName}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                onClick={handleOpenBulkModal}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" /> + Bulk Add via TXT
              </Button>
              <Button
                onClick={handleOpenAddSingle}
                size="sm"
                variant="outline"
                className="text-xs font-bold border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5"
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
            <div className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                <strong className="text-slate-900 dark:text-white">{questions.length}</strong>{' '}
                Questions in Test
              </span>
            </div>

            {currentExamTest.totalMarks && (
              <div className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
              <div className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
              <div className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                Negative Marks:{' '}
                <strong className="text-rose-600 dark:text-rose-400">
                  -{currentExamTest.negativeMarking}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REAL QUESTION LIST TABLE (Section 5, 9, 16) */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading Question Bank records...
          </div>
        ) : selectedSource === 'exam' && !selectedExamId ? (
          <div className="p-16 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-indigo-400 mx-auto opacity-50" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Select Exam Context</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please select an Exam from the filter bar above, choose Type (Full Mock Test or PYQ),
              and select a specific Test to view its questions.
            </p>
          </div>
        ) : selectedSource === 'exam' && !selectedExamType ? (
          <div className="p-16 text-center space-y-4">
            <BookOpen className="w-10 h-10 text-indigo-500 mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Select Question Type
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Questions in <strong>{currentExamObj?.title || 'this Exam'}</strong> belong to
                either a <strong>Full Mock Test</strong> or <strong>PYQ Paper</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedExamType('full_mock')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                Full Mock Tests ({examFullMockTests.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedExamType('pyq')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              >
                PYQ Papers ({examPyqTests.length})
              </button>
            </div>
          </div>
        ) : selectedSource === 'exam' && !selectedExamTestId ? (
          <div className="p-16 text-center space-y-4">
            <FileQuestion className="w-10 h-10 text-indigo-500 mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Select a {selectedExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ Paper'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Exam questions belong to a specific test or paper. Select one below or from the
                dropdown above:
              </p>
            </div>
            {(selectedExamType === 'full_mock' ? examFullMockTests : examPyqTests).length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto pt-1">
                {(selectedExamType === 'full_mock' ? examFullMockTests : examPyqTests).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedExamTestId(t.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
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
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                No questions found in {currentExamTest?.title || 'this test'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This {selectedExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ Paper'} does not
                have any questions yet. Add questions now using bulk TXT upload or the single
                question editor.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={handleOpenBulkModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" /> + Bulk Add via TXT
              </Button>
              <Button
                onClick={handleOpenAddSingle}
                variant="outline"
                className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Question Manually
              </Button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-indigo-400 mx-auto opacity-50" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No questions found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No questions matched the active filters. Upload new questions via "+ Add Question" or
              "+ Bulk Add Questions".
            </p>
          </div>
        ) : (
          <div>
            {/* Top List Controls Bar: Selection, Bulk Actions & View Mode Toggle */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAllVisible}
                  className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      paginatedQuestions.length > 0 &&
                      paginatedQuestions.every((q) => selectedQuestionIds.has(q.id))
                        ? 'bg-sky-500 border-sky-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                    }`}
                  >
                    {paginatedQuestions.length > 0 &&
                      paginatedQuestions.every((q) => selectedQuestionIds.has(q.id)) && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                  </div>
                  <span>Select All Visible</span>
                </button>

                {selectedQuestionIds.size > 0 && (
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {selectedQuestionIds.size} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Selected ({selectedQuestionIds.size})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIds(new Set())}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  title="Card View (as requested)"
                  className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                    viewMode === 'card'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Card View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                    viewMode === 'table'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>
              </div>
            </div>

            {/* CARD VIEW (Matching user reference layout exactly) */}
            {viewMode === 'card' ? (
              <div className="p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-900/30">
                {paginatedQuestions.map((q, idx) => {
                  const questionNumber = (currentPage - 1) * pageSize + idx + 1;
                  const isSelected = selectedQuestionIds.has(q.id);
                  const subjectTitle =
                    q.topicName || q.chapterName || q.subjectName || 'bengali Literature';

                  return (
                    <div
                      key={q.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all shadow-xs ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Selection circle, Question text, Action Icons */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
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

                          {/* Question Number & Text */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                              {questionNumber}. {q.questionBengaliText || q.questionText}
                            </h3>
                            {q.questionBengaliText &&
                              q.questionText &&
                              q.questionBengaliText !== q.questionText && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                  {q.questionText}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Top-Right Actions: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(q)}
                            title="Edit Question"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuestionToDelete(q)}
                            title="Delete Question"
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle: 2-Column Options Grid (Column 1 = A & C, Column 2 = B & D) */}
                      <div className="ml-8 mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-sm text-slate-800 dark:text-slate-200">
                        {/* Column 1: A and C */}
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">A.</span>
                            <span
                              className={
                                q.correctOption === 'A'
                                  ? 'font-semibold text-slate-950 dark:text-white'
                                  : ''
                              }
                            >
                              {q.optionA}
                            </span>
                            {q.correctOption === 'A' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 text-sm select-none">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">C.</span>
                            <span
                              className={
                                q.correctOption === 'C'
                                  ? 'font-semibold text-slate-950 dark:text-white'
                                  : ''
                              }
                            >
                              {q.optionC}
                            </span>
                            {q.correctOption === 'C' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 text-sm select-none">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Column 2: B and D */}
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">B.</span>
                            <span
                              className={
                                q.correctOption === 'B'
                                  ? 'font-semibold text-slate-950 dark:text-white'
                                  : ''
                              }
                            >
                              {q.optionB}
                            </span>
                            {q.correctOption === 'B' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 text-sm select-none">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">D.</span>
                            <span
                              className={
                                q.correctOption === 'D'
                                  ? 'font-semibold text-slate-950 dark:text-white'
                                  : ''
                              }
                            >
                              {q.optionD}
                            </span>
                            {q.correctOption === 'D' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 text-sm select-none">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Book icon, subject name, bn, Lock icon */}
                      <div className="ml-8 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3.5">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{subjectTitle}</span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            bn
                          </span>
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{q.defaultMarks || 1} Mark</span>
                          <span>•</span>
                          <span>{q.defaultNegativeMarks || 0.25} Neg</span>
                          {q.explanation && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewingQuestion(q);
                                setIsPreviewModalOpen(true);
                              }}
                              className="ml-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
                            >
                              View Solution
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW (Alternative compact mode) */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3 max-w-md">Question</th>
                      <th className="px-4 py-3">Source & Assignment</th>
                      <th className="px-4 py-3">Options Overview</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {paginatedQuestions.map((q, idx) => {
                      const isTopic = q.sourceType === 'topic';
                      const isExam = q.sourceType === 'other' || Boolean(q.sourceExam);
                      const isPyq = q.sourceType === 'pyq';
                      const examObj = exams.find((e) => e.id === q.sourceExam);
                      const questionNumber = (currentPage - 1) * pageSize + idx + 1;

                      return (
                        <tr
                          key={q.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          {/* Question Index */}
                          <td className="px-3 py-3.5 text-center font-bold text-slate-400 dark:text-slate-500 text-[11px]">
                            {questionNumber}
                          </td>

                          {/* Question Text */}
                          <td className="px-4 py-3.5 max-w-md">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                                {q.questionBengaliText || q.questionText}
                              </p>
                              {q.questionBengaliText &&
                                q.questionText &&
                                q.questionBengaliText !== q.questionText && (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 italic">
                                    {q.questionText}
                                  </p>
                                )}
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500">
                                  {q.defaultMarks} Mark • {q.defaultNegativeMarks} Neg
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500">
                                  {q.difficulty || 'medium'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Source & Hierarchy */}
                          <td className="px-4 py-3 text-[11px]">
                            {isTopic && (
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                                  Topic Test
                                </span>
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                  {q.subjectName || 'Subject'}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {q.topicName || q.chapterName || 'General Topic'}
                                </p>
                              </div>
                            )}

                            {isExam && (
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
                                  Full Mock Test
                                </span>
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                  {examObj?.title || q.sourceExam || 'Standard Exam'}
                                </p>
                                {(q.testTitle ||
                                  (selectedExamTestId
                                    ? tests.find((t) => t.id === selectedExamTestId)?.title
                                    : undefined)) && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    {q.testTitle ||
                                      tests.find((t) => t.id === selectedExamTestId)?.title}
                                  </p>
                                )}
                              </div>
                            )}

                            {isPyq && (
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                  PYQ Paper
                                </span>
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                  {q.sourceExam || 'WBP Exam'}{' '}
                                  {q.sourceYear ? `(${q.sourceYear})` : ''}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {q.sourcePaper || 'Official Paper'}
                                </p>
                              </div>
                            )}
                          </td>

                          {/* Options Overview */}
                          <td className="px-4 py-3 text-[11px] max-w-xs">
                            <div className="grid grid-cols-2 gap-1.5">
                              <div
                                className={`p-1 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'A'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (a) {q.optionA}
                              </div>
                              <div
                                className={`p-1 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'B'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (b) {q.optionB}
                              </div>
                              <div
                                className={`p-1 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'C'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (c) {q.optionC}
                              </div>
                              <div
                                className={`p-1 rounded text-[10px] line-clamp-1 ${
                                  q.correctOption === 'D'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                (d) {q.optionD}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                q.status === 'active' || (!q.status && q.isActive)
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {q.status || (q.isActive ? 'active' : 'archived')}
                            </span>
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
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(q)}
                                title="Edit Question"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleArchiveQuestion(q)}
                                title={q.status === 'archived' ? 'Unarchive' : 'Archive'}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setQuestionToDelete(q)}
                                title="Delete Question"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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

        {/* Pagination Controls */}
        {questions.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
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
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-slate-900 dark:text-white px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SINGLE QUESTION MODAL (Section 6A) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" /> Add Single Question
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              {/* Question Source Selection (Section 6A) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Question Source *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSingleSource('topic')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      singleSource === 'topic'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Topic Test (Subject → Topic → Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleSource('exam')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      singleSource === 'exam'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Exam (Target Exam)
                  </button>
                </div>
              </div>

              {/* IF SOURCE = TOPIC TEST: Subject -> Topic -> Topic Test */}
              {singleSource === 'topic' && (
                <div className="grid grid-cols-3 gap-3">
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                      Topic Test
                    </label>
                    <select
                      value={singleTopicTestId}
                      onChange={(e) => setSingleTopicTestId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">(Optional) Link to Test</option>
                      {singleTopicTests.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* IF SOURCE = EXAM: Exam -> Type (Full Mock Test | PYQ) -> specific Full Mock Test / PYQ (Section 12, 13) */}
              {singleSource === 'exam' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam *
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-50"
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
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

              {/* Exam Target Destination Confirmation Pill */}
              {singleSource === 'exam' && singleExamId && singleExamTestId && (
                <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Target Destination:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {exams.find((e) => e.id === singleExamId)?.title}
                    </strong>{' '}
                    →{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {singleExamType === 'full_mock' ? 'Full Mock Test' : 'PYQ'}
                    </strong>{' '}
                    →{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {tests.find((t) => t.id === singleExamTestId)?.title ||
                        tests.find((t) => t.id === singleExamTestId)?.paperName}
                    </strong>
                  </span>
                </div>
              )}

              {/* Question Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Text (English or Bengali) *
                </label>
                <textarea
                  rows={3}
                  placeholder="Type or paste the complete question text..."
                  value={singleQuestionText}
                  onChange={(e) => setSingleQuestionText(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Correct Answer Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correct Answer *
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
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      Option ({opt.toLowerCase()})
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation / Solution (English or Bengali)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed solution or points explaining the answer..."
                  value={singleExplanation}
                  onChange={(e) => setSingleExplanation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {isSavingSingle ? 'Saving...' : 'Save Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK TXT QUESTION UPLOAD MODAL (Section 7, 8, 9) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                Bulk Add Questions via TXT (Section 7)
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        bulkSource === 'topic'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Topic Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkSource('exam')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        bulkSource === 'exam'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Exam
                    </button>
                  </div>
                </div>

                {/* Assignment Dropdowns */}
                {bulkSource === 'topic' ? (
                  <div className="grid grid-cols-3 gap-3">
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                        Exam *
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-50"
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
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

                {/* Exam Import Destination Confirmation Pill */}
                {bulkSource === 'exam' && bulkExamId && bulkExamTestId && (
                  <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Import Destination:{' '}
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

                {/* Upload & Sample buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Upload TXT File (UTF-8)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormatGuideOpen(true)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      View TXT Format
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => downloadSampleTxt()}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download Sample TXT
                    </button>
                  </div>
                </div>

                {/* File picker */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2 hover:border-indigo-500 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {bulkFileName ? (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        Selected: {bulkFileName}
                      </span>
                    ) : (
                      'Choose a .txt file or drag it here'
                    )}
                  </p>
                  <label className="inline-block">
                    <span className="cursor-pointer text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Parse TXT & Preview Questions
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: BULK UPLOAD PREVIEW (Section 9) */}
            {bulkStep === 'preview' && bulkParseResult && (
              <div className="space-y-4">
                {/* Target Destination Banner */}
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl flex items-center justify-between text-xs">
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
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Change
                  </button>
                </div>
                {/* Validation Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
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
                      Errors
                    </span>
                    <span className="text-xl font-black text-rose-700 dark:text-rose-400">
                      {bulkParseResult.errors.length}
                    </span>
                  </div>
                </div>

                {/* Show Problematic Blocks (Section 9) */}
                {bulkParseResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Problematic Question Blocks (Fix before
                      importing)
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
                            {err.rawText.slice(0, 150)}...
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid Questions Sample Preview */}
                {bulkParseResult.valid.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Valid Questions Preview (First 3 of {bulkParseResult.valid.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {bulkParseResult.valid.slice(0, 3).map((q) => (
                        <div
                          key={q.questionNumber}
                          className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1"
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
                          <p className="text-[10px] text-emerald-600 font-bold pt-0.5">
                            Correct: ({q.correctOption.toLowerCase()})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons (Section 9) */}
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
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
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

      {/* VIEW TXT FORMAT GUIDE MODAL (Section 8) */}
      {isFormatGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Standard TXT Question Format
                (Section 8)
              </h3>
              <button
                onClick={() => setIsFormatGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every question must follow this exact conceptual layout. The parser accommodates
              standard whitespace and English or Bengali numerals.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <pre className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {SAMPLE_TXT_CONTENT}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsFormatGuideOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => downloadSampleTxt()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download Template (.txt)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION PREVIEW MODAL */}
      {isPreviewModalOpen && previewingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" /> Question Details
              </h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                {previewingQuestion.questionBengaliText || previewingQuestion.questionText}
              </p>

              <div className="space-y-1.5 pt-1">
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
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>
                        ({opt.key.toLowerCase()}) {opt.text}
                      </span>
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
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
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

      {/* QUESTION EDIT MODAL */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" /> Edit Question
              </h3>
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

            <form onSubmit={handleUpdateQuestion} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  value={editQText}
                  onChange={(e) => setEditQText(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correct Answer *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setEditQCorrect(opt)}
                      className={`py-1.5 text-xs font-black rounded-xl border ${
                        editQCorrect === opt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      ({opt.toLowerCase()})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation Notes
                </label>
                <textarea
                  rows={2}
                  value={editQExplanation}
                  onChange={(e) => setEditQExplanation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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

      {/* Single Question Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                {isDeletingQuestion ? 'মুছে ফেলা হচ্ছে...' : 'ডিলিট করুন (Delete)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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

            <p className="text-xs text-slate-600 dark:text-slate-300">
              নির্বাচিত {selectedQuestionIds.size}টি প্রশ্ন স্থায়ীভাবে ডাটাবেস ও সংশ্লিষ্ট টেস্ট
              থেকে ডিলিট করা হবে। এই পদক্ষেপটি আনডু করা যাবে না।
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
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
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
