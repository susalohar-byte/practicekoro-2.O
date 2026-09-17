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

// NOTE: Full file restored from commit before accidental placeholder write.
// Explanation UI is intentionally handled via the existing question.explanation field.

export const AdminQuestionBank: React.FC = () => {
  const [searchParams] = useSearchParams();
  const querySource = searchParams.get('source');
  const querySubjectId = searchParams.get('subjectId');
  const queryTopicId = searchParams.get('topicId');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [allMasterQuestions, setAllMasterQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());
  const [copiedFormat, setCopiedFormat] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  const [isFormatGuideOpen, setIsFormatGuideOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQBengaliText, setEditQBengaliText] = useState('');
  const [editQOptA, setEditQOptA] = useState('');
  const [editQOptB, setEditQOptB] = useState('');
  const [editQOptC, setEditQOptC] = useState('');
  const [editQOptD, setEditQOptD] = useState('');
  const [editQCorrect, setEditQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [editQDifficulty, setEditQDifficulty] = useState('medium');
  const [editQExplanation, setEditQExplanation] = useState('');
  const [editQMarks, setEditQMarks] = useState(1.0);
  const [editQNegativeMarks, setEditQNegativeMarks] = useState(0.25);
  const [isUpdatingQ, setIsUpdatingQ] = useState(false);
  const [editQError, setEditQError] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedExams, loadedSubjects, loadedChapters, loadedTests, loadedQuestions] = await Promise.all([
        api.getAllAdminExams(),
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAllAdminTests(),
        api.getAllAdminQuestions({
          sourceType: selectedSource === 'topic' ? 'topic' : selectedSource === 'exam' ? undefined : undefined,
          subjectId: selectedSubjectId || undefined,
          topicId: selectedTopicId || undefined,
          testId:
            selectedSource === 'exam'
              ? selectedExamTestId || undefined
              : selectedTopicTestId || undefined,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm.trim() || undefined,
        }),
      ]);
      setExams(loadedExams);
      setSubjects(loadedSubjects);
      setChapters(loadedChapters);
      setTests(loadedTests);
      setQuestions(loadedQuestions);
      setAllMasterQuestions(loadedQuestions);
    } catch (err) {
      console.error('Failed to load question bank:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedSource, selectedSubjectId, selectedTopicId, selectedTopicTestId, selectedExamTestId, selectedDifficulty, selectedStatus, searchTerm]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const s = searchParams.get('source');
    const sub = searchParams.get('subjectId');
    const top = searchParams.get('topicId');
    if (s === 'topic' || s === 'exam') setSelectedSource(s);
    if (sub !== null) setSelectedSubjectId(sub);
    if (top !== null) setSelectedTopicId(top);
  }, [searchParams]);

  useEffect(() => setCurrentPage(1), [selectedSource, selectedSubjectId, selectedTopicId, selectedTopicTestId, selectedExamId, selectedExamType, selectedExamTestId, selectedStatus, selectedDifficulty, searchTerm]);

  const bankStats = useMemo(() => {
    const list = allMasterQuestions.length > 0 ? allMasterQuestions : questions;
    return {
      total: list.length,
      topicCount: list.filter((q) => q.sourceType === 'topic').length,
      fullMockCount: list.filter((q) => q.sourceType === 'other' || (!q.sourceType && q.sourceExam)).length,
      pyqCount: list.filter((q) => q.sourceType === 'pyq').length,
    };
  }, [allMasterQuestions, questions]);

  const filterTopics = useMemo(() => chapters.filter((c) => !selectedSubjectId || c.subjectId === selectedSubjectId), [chapters, selectedSubjectId]);
  const filterTopicTests = useMemo(() => tests.filter((t) => {
    const isTopicTest = t.testType === 'topic' || t.testType === 'chapter_mock';
    if (!isTopicTest) return false;
    if (selectedTopicId && t.chapterId !== selectedTopicId && t.topicId !== selectedTopicId) return false;
    if (selectedSubjectId && t.subjectId !== selectedSubjectId) return false;
    return true;
  }), [tests, selectedTopicId, selectedSubjectId]);
  const examFullMockTests = useMemo(() => {
    if (!selectedExamId) return [];
    return tests.filter((t) => t.testType === 'full_mock' && (t.examId === selectedExamId || t.associatedExamIds?.includes(selectedExamId)));
  }, [tests, selectedExamId]);
  const examPyqTests = useMemo(() => {
    if (!selectedExamId) return [];
    return tests.filter((t) => t.testType === 'pyq' && (t.examId === selectedExamId || t.associatedExamIds?.includes(selectedExamId)));
  }, [tests, selectedExamId]);
  const currentExamObj = useMemo(() => selectedSource === 'exam' && selectedExamId ? exams.find((e) => e.id === selectedExamId) || null : null, [selectedSource, selectedExamId, exams]);
  const currentExamTest = useMemo(() => selectedSource === 'exam' && selectedExamTestId ? tests.find((t) => t.id === selectedExamTestId) || null : null, [selectedSource, selectedExamTestId, tests]);
  const currentSubjectObj = useMemo(() => selectedSource === 'topic' && selectedSubjectId ? subjects.find((s) => s.id === selectedSubjectId) || null : null, [selectedSource, selectedSubjectId, subjects]);
  const currentTopicObj = useMemo(() => selectedSource === 'topic' && selectedTopicId ? chapters.find((c) => c.id === selectedTopicId) || null : null, [selectedSource, selectedTopicId, chapters]);
  const singleTopics = useMemo(() => chapters.filter((c) => !singleSubjectId || c.subjectId === singleSubjectId), [chapters, singleSubjectId]);
  const singleTopicTests = useMemo(() => tests.filter((t) => {
    const isTopicTest = t.testType === 'topic' || t.testType === 'chapter_mock';
    if (!isTopicTest) return false;
    if (singleTopicId && t.chapterId !== singleTopicId && t.topicId !== singleTopicId) return false;
    if (singleSubjectId && t.subjectId !== singleSubjectId) return false;
    return true;
  }), [tests, singleTopicId, singleSubjectId]);
  const singleExamFullMockTests = useMemo(() => tests.filter((t) => t.testType === 'full_mock' && (!singleExamId || t.examId === singleExamId || t.associatedExamIds?.includes(singleExamId))), [tests, singleExamId]);
  const singleExamPyqTests = useMemo(() => tests.filter((t) => t.testType === 'pyq' && (!singleExamId || t.examId === singleExamId || t.associatedExamIds?.includes(singleExamId))), [tests, singleExamId]);
  const bulkTopics = useMemo(() => chapters.filter((c) => !bulkSubjectId || c.subjectId === bulkSubjectId), [chapters, bulkSubjectId]);
  const bulkTopicTests = useMemo(() => tests.filter((t) => {
    const isTopicTest = t.testType === 'topic' || t.testType === 'chapter_mock';
    if (!isTopicTest) return false;
    if (bulkTopicId && t.chapterId !== bulkTopicId && t.topicId !== bulkTopicId) return false;
    if (bulkSubjectId && t.subjectId !== bulkSubjectId) return false;
    return true;
  }), [tests, bulkTopicId, bulkSubjectId]);
  const bulkExamFullMockTests = useMemo(() => tests.filter((t) => t.testType === 'full_mock' && (!bulkExamId || t.examId === bulkExamId || t.associatedExamIds?.includes(bulkExamId))), [tests, bulkExamId]);
  const bulkExamPyqTests = useMemo(() => tests.filter((t) => t.testType === 'pyq' && (!bulkExamId || t.examId === bulkExamId || t.associatedExamIds?.includes(bulkExamId))), [tests, bulkExamId]);

  const handleOpenAddSingle = () => {
    const defaultSub = subjects[0]?.id || '';
    const defaultTopic = chapters.find((c) => c.subjectId === defaultSub)?.id || '';
    const defaultTopicTest = tests.find((t) => t.chapterId === defaultTopic || t.topicId === defaultTopic)?.id || '';
    const effectiveExam = selectedExamId || exams[0]?.id || '';
    const effectiveExamType: 'full_mock' | 'pyq' = selectedExamType === 'pyq' ? 'pyq' : 'full_mock';
    const effectiveTests = tests.filter((t) => t.testType === effectiveExamType && (t.examId === effectiveExam || t.associatedExamIds?.includes(effectiveExam)));
    setSingleSource(selectedSource === 'exam' ? 'exam' : 'topic');
    setSingleSubjectId(selectedSubjectId || defaultSub);
    setSingleTopicId(selectedTopicId || defaultTopic);
    setSingleTopicTestId(selectedTopicTestId || defaultTopicTest);
    setSingleExamId(effectiveExam);
    setSingleExamType(effectiveExamType);
    setSingleExamTestId(selectedExamTestId || effectiveTests[0]?.id || '');
    setSingleQuestionBengali('');
    setSingleQuestionEnglish('');
    setSingleOptA(''); setSingleOptB(''); setSingleOptC(''); setSingleOptD('');
    setSingleCorrect('A'); setSingleDifficulty('medium'); setSingleExplanation('');
    setSingleMarks(1); setSingleNegativeMarks(0.25); setSingleError('');
    setIsAddModalOpen(true);
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryText = singleQuestionBengali.trim() || singleQuestionEnglish.trim();
    if (!primaryText) return setSingleError('Question statement (Bengali or English) is required.');
    if (!singleOptA.trim() || !singleOptB.trim() || !singleOptC.trim() || !singleOptD.trim()) return setSingleError('All 4 options (A, B, C, D) must be provided.');
    if (!singleExplanation.trim()) return setSingleError('Explanation & Notes must contain 3–4 bullet points focused on the question and options.');
    const bullets = singleExplanation.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[-•*]\s+/.test(line) || /^\d+[.)]\s+/.test(line));
    if (bullets.length < 3 || bullets.length > 4) return setSingleError(`Explanation & Notes must contain 3–4 bullet points; ${bullets.length} detected.`);
    try {
      setIsSavingSingle(true); setSingleError('');
      const questionPayload = {
        questionText: singleQuestionEnglish.trim() || singleQuestionBengali.trim(),
        questionBengaliText: singleQuestionBengali.trim() || singleQuestionEnglish.trim(),
        optionA: singleOptA.trim(), optionB: singleOptB.trim(), optionC: singleOptC.trim(), optionD: singleOptD.trim(),
        correctOption: singleCorrect,
        explanation: singleExplanation.trim(), difficulty: singleDifficulty,
        defaultMarks: singleMarks, defaultNegativeMarks: singleNegativeMarks, isActive: true, status: 'active' as const,
      };
      if (singleSource === 'exam' && singleExamTestId) await api.createQuestionForTest(singleExamTestId, { ...questionPayload, sourceExam: singleExamId, sourceType: singleExamType === 'pyq' ? 'pyq' : 'other' });
      else if (singleSource === 'topic' && singleTopicTestId) await api.createQuestionForTest(singleTopicTestId, { ...questionPayload, subjectId: singleSubjectId, topicId: singleTopicId, chapterId: singleTopicId, sourceType: 'topic' });
      else await api.createQuestion({ ...questionPayload, subjectId: singleSource === 'topic' ? singleSubjectId : undefined, topicId: singleSource === 'topic' ? singleTopicId : undefined, chapterId: singleSource === 'topic' ? singleTopicId : undefined, sourceType: singleSource === 'topic' ? 'topic' : 'other', sourceExam: singleSource === 'exam' ? singleExamId : undefined });
      setIsAddModalOpen(false);
      await loadQuestions();
    } catch (err) {
      setSingleError(getErrorMessage(err, 'Failed to save question'));
    } finally { setIsSavingSingle(false); }
  };

  const handleOpenBulkModal = () => {
    const defaultSub = subjects[0]?.id || '';
    const defaultTopic = chapters.find((c) => c.subjectId === defaultSub)?.id || '';
    const defaultTopicTest = tests.find((t) => t.chapterId === defaultTopic || t.topicId === defaultTopic)?.id || '';
    const effectiveExam = selectedExamId || exams[0]?.id || '';
    const effectiveExamType: 'full_mock' | 'pyq' = selectedExamType === 'pyq' ? 'pyq' : 'full_mock';
    const effectiveTests = tests.filter((t) => t.testType === effectiveExamType && (t.examId === effectiveExam || t.associatedExamIds?.includes(effectiveExam)));
    setBulkSource(selectedSource === 'exam' ? 'exam' : 'topic'); setBulkSubjectId(selectedSubjectId || defaultSub); setBulkTopicId(selectedTopicId || defaultTopic); setBulkTopicTestId(selectedTopicTestId || defaultTopicTest); setBulkExamId(effectiveExam); setBulkExamType(effectiveExamType); setBulkExamTestId(selectedExamTestId || effectiveTests[0]?.id || ''); setBulkRawText(''); setBulkFileName(''); setBulkParseResult(null); setBulkStep('upload'); setBulkActionError(''); setBulkActionSuccess(''); setIsBulkModalOpen(true);
  };

  const handleTxtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBulkFileName(file.name);
    const reader = new FileReader(); reader.onload = (event) => setBulkRawText((event.target?.result as string) || ''); reader.readAsText(file, 'utf-8');
  };

  const handleParseTxt = () => {
    if (!bulkRawText.trim()) return setBulkActionError('Please select a TXT file or paste question content.');
    if (bulkSource === 'topic' && (!bulkSubjectId || !bulkTopicId)) return setBulkActionError('Please select both Subject and Topic.');
    if (bulkSource === 'exam' && (!bulkExamId || !bulkExamType || !bulkExamTestId)) return setBulkActionError('Please complete the Exam, Type and Test selection.');
    const result = parseQuestionsTxt(bulkRawText);
    setBulkParseResult(result); setBulkActionError(''); setBulkStep('preview');
  };

  const handleImportValidQuestions = async () => {
    if (!bulkParseResult || bulkParseResult.valid.length === 0) return;
    try {
      setIsImportingBulk(true); setBulkActionError('');
      const res = await api.bulkCreateQuestionsFromTxt({
        questions: bulkParseResult.valid,
        sourceType: bulkSource === 'topic' ? 'topic' : bulkExamType === 'pyq' ? 'pyq' : 'other',
        subjectId: bulkSource === 'topic' ? bulkSubjectId : undefined,
        topicId: bulkSource === 'topic' ? bulkTopicId : undefined,
        examId: bulkSource === 'exam' ? bulkExamId : undefined,
        testId: bulkSource === 'topic' ? bulkTopicTestId || undefined : bulkExamTestId,
      });
      setBulkActionSuccess(`Successfully imported ${res.successCount} questions into Question Bank!`);
      await loadQuestions();
      setTimeout(() => setIsBulkModalOpen(false), 1500);
    } catch (err) { setBulkActionError(getErrorMessage(err, 'Failed to import questions')); }
    finally { setIsImportingBulk(false); }
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q); setEditQText(q.questionText || ''); setEditQBengaliText(q.questionBengaliText || q.questionText || ''); setEditQOptA(q.optionA); setEditQOptB(q.optionB); setEditQOptC(q.optionC); setEditQOptD(q.optionD); setEditQCorrect(q.correctOption || 'A'); setEditQDifficulty(q.difficulty || 'medium'); setEditQExplanation(q.explanation || ''); setEditQMarks(q.defaultMarks || 1); setEditQNegativeMarks(q.defaultNegativeMarks || 0.25); setEditQError(''); setIsEditModalOpen(true);
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingQuestion) return;
    const bullets = editQExplanation.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[-•*]\s+/.test(line) || /^\d+[.)]\s+/.test(line));
    if (bullets.length < 3 || bullets.length > 4) { setEditQError(`Explanation & Notes must contain 3–4 bullet points; ${bullets.length} detected.`); return; }
    try {
      setIsUpdatingQ(true); setEditQError('');
      await api.updateQuestion(editingQuestion.id, { questionText: editQText.trim() || editQBengaliText.trim(), questionBengaliText: editQBengaliText.trim() || editQText.trim(), optionA: editQOptA.trim(), optionB: editQOptB.trim(), optionC: editQOptC.trim(), optionD: editQOptD.trim(), correctOption: editQCorrect, difficulty: editQDifficulty, defaultMarks: editQMarks, defaultNegativeMarks: editQNegativeMarks, explanation: editQExplanation.trim() });
      setIsEditModalOpen(false); await loadQuestions();
    } catch (err) { setEditQError(getErrorMessage(err, 'Failed to update question')); }
    finally { setIsUpdatingQ(false); }
  };

  const handleArchiveQuestion = async (q: Question) => { try { const archived = q.status === 'archived' || q.isActive === false; await api.updateQuestion(q.id, { status: archived ? 'active' : 'archived', isActive: archived }); await loadQuestions(); } catch (err) { console.error(err); } };
  const handleDeleteQuestion = async () => { if (!questionToDelete) return; try { setIsDeletingQuestion(true); setDeleteError(''); const ok = await api.deleteQuestion(questionToDelete.id); if (ok) { setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id)); setQuestionToDelete(null); } else setDeleteError('Failed to delete question.'); } catch (err) { setDeleteError(getErrorMessage(err, 'Failed to delete question')); } finally { setIsDeletingQuestion(false); } };
  const handleBulkDeleteQuestions = async () => { if (selectedQuestionIds.size === 0) return; try { setIsDeletingQuestion(true); const ids = Array.from(selectedQuestionIds); let count = 0; for (const id of ids) if (await api.deleteQuestion(id)) count++; setQuestions((prev) => prev.filter((q) => !selectedQuestionIds.has(q.id))); setSelectedQuestionIds(new Set()); setIsBulkDeleteModalOpen(false); setBulkActionSuccess(`${count} questions deleted successfully.`); } catch (err) { setDeleteError(getErrorMessage(err, 'Failed to delete selected questions')); } finally { setIsDeletingQuestion(false); } };
  const handleBulkToggleStatus = async (targetStatus: 'active' | 'archived') => { if (selectedQuestionIds.size === 0) return; try { setIsLoading(true); for (const id of Array.from(selectedQuestionIds)) await api.updateQuestion(id, { status: targetStatus, isActive: targetStatus === 'active' }); setSelectedQuestionIds(new Set()); await loadQuestions(); } finally { setIsLoading(false); } };

  const handleExportQuestionsTxt = (questionsToExport: Question[]) => {
    if (questionsToExport.length === 0) return;
    let content = '';
    questionsToExport.forEach((q, idx) => {
      const text = q.questionBengaliText || q.questionText;
      content += `${idx + 1}. ${text}\n`;
      content += `(a) ${q.optionA}\n(b) ${q.optionB}\n(c) ${q.optionC}\n(d) ${q.optionD}\n\n`;
      const optText = ({ A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD })[q.correctOption];
      content += `সঠিক উত্তর: (${q.correctOption.toLowerCase()}) ${optText}\n\n`;
      if (q.explanation) content += `Explanation:\n${q.explanation}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `practicekoro-questions-${Date.now()}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const toggleSelectQuestion = (id: string) => setSelectedQuestionIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleSelectAllVisible = () => { const page = paginatedQuestions; if (!page.length) return; setSelectedQuestionIds((prev) => { const next = new Set(prev); const all = page.every((q) => next.has(q.id)); page.forEach((q) => (all ? next.delete(q.id) : next.add(q.id))); return next; }); };
  const toggleExpandSolution = (id: string) => setExpandedSolutions((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const activeFiltersCount = useMemo(() => [selectedSource !== 'all', selectedSubjectId, selectedTopicId, selectedTopicTestId, selectedExamId, selectedExamType, selectedExamTestId, selectedStatus !== 'all', selectedDifficulty !== 'all', searchTerm.trim()].filter(Boolean).length, [selectedSource, selectedSubjectId, selectedTopicId, selectedTopicTestId, selectedExamId, selectedExamType, selectedExamTestId, selectedStatus, selectedDifficulty, searchTerm]);
  const resetAllFilters = () => { setSelectedSource('all'); setSelectedSubjectId(''); setSelectedTopicId(''); setSelectedTopicTestId(''); setSelectedExamId(''); setSelectedExamType(''); setSelectedExamTestId(''); setSelectedStatus('all'); setSelectedDifficulty('all'); setSearchTerm(''); };
  const totalCount = questions.length; const totalPages = Math.ceil(totalCount / pageSize) || 1; const paginatedQuestions = useMemo(() => questions.slice((currentPage - 1) * pageSize, currentPage * pageSize), [questions, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div><h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5"><FileQuestion className="w-6 h-6 text-purple-400" />📚 Topic Questions <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">{questions.length} Questions</span></h1><p className="text-xs text-slate-400 mt-1">Reusable Subject → Topic question library with bilingual questions, verified answers, and detailed solution notes.</p></div>
        <div className="flex items-center gap-2.5"><Button size="sm" variant="outline" onClick={handleOpenBulkModal} className="text-xs font-semibold border-slate-700" leftIcon={<Upload className="w-3.5 h-3.5" />}>Bulk Add via TXT</Button><Button size="sm" onClick={handleOpenAddSingle} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold" leftIcon={<Plus className="w-4 h-4" />}>Add Single Question</Button></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><StatCard icon={<Layers className="w-5 h-5 text-white" />} label="Total Questions" value={bankStats.total} subtitle="All repository items" gradient="bg-gradient-to-br from-indigo-600 to-indigo-800" iconBg="bg-white/10" /><StatCard icon={<GraduationCap className="w-5 h-5 text-white" />} label="Topic Tests" value={bankStats.topicCount} subtitle="Curriculum practice" gradient="bg-gradient-to-br from-blue-600 to-cyan-700" iconBg="bg-white/10" /><StatCard icon={<Award className="w-5 h-5 text-white" />} label="Full Mock Tests" value={bankStats.fullMockCount} subtitle="Exam simulation" gradient="bg-gradient-to-br from-purple-600 to-pink-700" iconBg="bg-white/10" /><StatCard icon={<Clock className="w-5 h-5 text-white" />} label="PYQ Papers" value={bankStats.pyqCount} subtitle="Previous year" gradient="bg-gradient-to-br from-amber-600 to-orange-700" iconBg="bg-white/10" /></div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><div className="relative flex-1 min-w-[240px]"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Bengali / English, options, or solution..." className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" /></div><div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800"><button type="button" onClick={resetAllFilters} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">All Sources</button><button type="button" onClick={() => setSelectedSource('topic')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600">Topic Tests</button><button type="button" onClick={() => setSelectedSource('exam')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600">Exam Tests</button></div></div><div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80"><SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />{selectedSource === 'topic' && <><select value={selectedSubjectId} onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTopicId(''); setSelectedTopicTestId(''); }} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"><option value="">All Subjects</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={selectedTopicId} onChange={(e) => { setSelectedTopicId(e.target.value); setSelectedTopicTestId(''); }} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"><option value="">All Topics</option>{filterTopics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></>}{selectedSource === 'exam' && <><select value={selectedExamId} onChange={(e) => { setSelectedExamId(e.target.value); setSelectedExamType(''); setSelectedExamTestId(''); }} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"><option value="">Select Exam</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>{selectedExamId && <select value={selectedExamType} onChange={(e) => { setSelectedExamType(e.target.value as any); setSelectedExamTestId(''); }} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"><option value="">Select Type</option><option value="full_mock">Full Mock Test</option><option value="pyq">PYQ</option></select>}</>}<select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value as any)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"><option value="all">All Difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as any)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"><option value="all">All Status</option><option value="active">Active</option><option value="archived">Archived</option></select>{activeFiltersCount > 0 && <button onClick={resetAllFilters} className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">Reset ({activeFiltersCount})</button>}</div></div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"><div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"><span className="text-xs font-bold text-slate-500">{totalCount} questions</span><div className="flex items-center gap-2"><button onClick={() => { setIsRefreshing(true); loadQuestions(); }} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800"><RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /></button><Button size="sm" onClick={() => setIsFormatGuideOpen(true)} variant="outline" className="text-xs"><Download className="w-3.5 h-3.5 mr-1" />TXT Format Guide</Button></div></div>
        {isLoading ? <div className="p-16 text-center text-sm text-slate-500">Loading Question Bank...</div> : <div className="p-4 space-y-4">{paginatedQuestions.map((q, idx) => { const questionNumber = (currentPage - 1) * pageSize + idx + 1; const expanded = expandedSolutions.has(q.id); return <div key={q.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950/30"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><button type="button" onClick={() => toggleSelectQuestion(q.id)} className="mt-1 w-5 h-5 rounded-full border-2 border-sky-500 flex items-center justify-center shrink-0">{selectedQuestionIds.has(q.id) && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />}</button><div><div className="flex items-center gap-2 flex-wrap"><span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">#{questionNumber}</span><span className="text-[10px] font-bold text-slate-500">{q.difficulty || 'medium'}</span></div><h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{q.questionBengaliText || q.questionText}</h3>{q.questionBengaliText && q.questionText && q.questionBengaliText !== q.questionText && <p className="text-xs text-slate-500 mt-1 italic">{q.questionText}</p>}</div></div><div className="flex items-center gap-1"><button onClick={() => { setPreviewingQuestion(q); setIsPreviewModalOpen(true); }} className="p-1.5"><Eye className="w-4 h-4" /></button><button onClick={() => handleOpenEdit(q)} className="p-1.5"><Edit2 className="w-4 h-4" /></button><button onClick={() => setQuestionToDelete(q)} className="p-1.5 text-rose-500"><Trash2 className="w-4 h-4" /></button></div></div><div className="ml-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm">{([['A', q.optionA], ['B', q.optionB], ['C', q.optionC], ['D', q.optionD]] as const).map(([key, text]) => <div key={key} className={`p-3 rounded-xl border ${q.correctOption === key ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}><span className="font-black mr-2">{key}</span>{text}{q.correctOption === key && <span className="ml-2 text-[10px] font-black text-emerald-600">Correct</span>}</div>)}</div>{q.explanation && <div className="ml-8 mt-3">{expanded ? <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl text-xs"><div className="flex justify-between items-center"><span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />Explanation & Solution Notes</span><button onClick={() => toggleExpandSolution(q.id)} className="text-slate-400">Collapse</button></div><ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">{q.explanation.split(/\r?\n/).map((line, i) => { const clean = line.replace(/^(?:[-•*]|\d+[.)])\s*/, '').trim(); return clean ? <li key={i} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />{clean}</li> : null; })}</ul></div> : <button onClick={() => toggleExpandSolution(q.id)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">✨ View Explanation & Notes</button>}</div>}</div>; })}</div>}
        {totalCount > 0 && <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"><span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}</span><div className="flex items-center gap-2"><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1"><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select><button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-1.5 border rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><span className="font-bold">{currentPage} / {totalPages}</span><button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 border rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>}
      </div>

      {isAddModalOpen && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"><form onSubmit={handleSaveSingle} className="space-y-4"><div className="flex items-center justify-between pb-3 border-b"><h3 className="font-black">Add Single Question</h3><button type="button" onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button></div>{singleError && <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs">{singleError}</div>}<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{singleSource === 'topic' ? <><select value={singleSubjectId} onChange={(e) => { setSingleSubjectId(e.target.value); setSingleTopicId(chapters.find((c) => c.subjectId === e.target.value)?.id || ''); }} className="rounded-xl border p-2 text-xs"><option value="">Select Subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={singleTopicId} onChange={(e) => setSingleTopicId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Select Topic</option>{singleTopics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={singleTopicTestId} onChange={(e) => setSingleTopicTestId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Optional Topic Test</option>{singleTopicTests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></> : <><select value={singleExamId} onChange={(e) => setSingleExamId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Select Exam</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select><select value={singleExamType} onChange={(e) => setSingleExamType(e.target.value as 'full_mock' | 'pyq')} className="rounded-xl border p-2 text-xs"><option value="full_mock">Full Mock Test</option><option value="pyq">PYQ</option></select><select value={singleExamTestId} onChange={(e) => setSingleExamTestId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Select Test</option>{(singleExamType === 'full_mock' ? singleExamFullMockTests : singleExamPyqTests).map((t) => <option key={t.id} value={t.id}>{t.title || t.paperName}</option>)}</select></>}</div><textarea rows={2} value={singleQuestionBengali} onChange={(e) => setSingleQuestionBengali(e.target.value)} placeholder="বাংলা প্রশ্ন" className="w-full rounded-xl border p-2 text-xs" /><input value={singleQuestionEnglish} onChange={(e) => setSingleQuestionEnglish(e.target.value)} placeholder="English question" className="w-full rounded-xl border p-2 text-xs" /><div className="grid grid-cols-2 gap-3">{([['A', singleOptA, setSingleOptA], ['B', singleOptB, setSingleOptB], ['C', singleOptC, setSingleOptC], ['D', singleOptD, setSingleOptD]] as const).map(([key, value, setter]) => <input key={key} value={value} onChange={(e) => setter(e.target.value)} placeholder={`Option ${key}`} className="w-full rounded-xl border p-2 text-xs" required />)}</div><div className="grid grid-cols-4 gap-2">{(['A', 'B', 'C', 'D'] as const).map((opt) => <button key={opt} type="button" onClick={() => setSingleCorrect(opt)} className={`p-2 rounded-xl border text-xs font-bold ${singleCorrect === opt ? 'bg-emerald-600 text-white' : ''}`}>Option ({opt})</button>)}</div><div className="grid grid-cols-3 gap-3"><input type="number" step="0.25" value={singleMarks} onChange={(e) => setSingleMarks(Number(e.target.value))} className="rounded-xl border p-2 text-xs" /><input type="number" step="0.05" value={singleNegativeMarks} onChange={(e) => setSingleNegativeMarks(Number(e.target.value))} className="rounded-xl border p-2 text-xs" /><select value={singleDifficulty} onChange={(e) => setSingleDifficulty(e.target.value as any)} className="rounded-xl border p-2 text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div><div><label className="block text-[11px] font-bold mb-1">Explanation & Solution Notes <span className="text-indigo-500">(Required: 3–4 bullet points)</span></label><textarea rows={6} value={singleExplanation} onChange={(e) => setSingleExplanation(e.target.value)} placeholder={"- Key fact directly explaining the correct answer\n- Important fact or definition linked to the question\n- Why a related option is correct/incorrect\n- Exam-relevant distinction involving the options"} className="w-full rounded-xl border p-3 text-xs leading-relaxed" /><p className="text-[10px] text-slate-500 mt-1">Each point must be directly related to the question or one of the options. Avoid generic or unrelated facts.</p></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit" disabled={isSavingSingle} className="bg-emerald-600">{isSavingSingle ? 'Saving...' : 'Save Question'}</Button></div></form></div></div>}

      {isBulkModalOpen && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5"><div className="flex items-center justify-between"><h3 className="font-black">Bulk Add Questions via TXT</h3><button onClick={() => setIsBulkModalOpen(false)}><X className="w-5 h-5" /></button></div>{bulkStep === 'upload' ? <><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{bulkSource === 'topic' ? <><select value={bulkSubjectId} onChange={(e) => { setBulkSubjectId(e.target.value); setBulkTopicId(chapters.find((c) => c.subjectId === e.target.value)?.id || ''); }} className="rounded-xl border p-2 text-xs"><option value="">Select Subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={bulkTopicId} onChange={(e) => setBulkTopicId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Select Topic</option>{bulkTopics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={bulkTopicTestId} onChange={(e) => setBulkTopicTestId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Optional Topic Test</option>{bulkTopicTests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></> : <><select value={bulkExamId} onChange={(e) => setBulkExamId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Select Exam</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select><select value={bulkExamType} onChange={(e) => setBulkExamType(e.target.value as any)} className="rounded-xl border p-2 text-xs"><option value="full_mock">Full Mock Test</option><option value="pyq">PYQ</option></select><select value={bulkExamTestId} onChange={(e) => setBulkExamTestId(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="">Select Test</option>{(bulkExamType === 'full_mock' ? bulkExamFullMockTests : bulkExamPyqTests).map((t) => <option key={t.id} value={t.id}>{t.title || t.paperName}</option>)}</select></>}</div><div className="border-2 border-dashed rounded-2xl p-6 text-center"><Upload className="w-8 h-8 mx-auto text-slate-400" /><input type="file" accept=".txt,text/plain" onChange={handleTxtFileUpload} className="mt-3" />{bulkFileName && <p className="text-xs mt-2">Selected: {bulkFileName}</p>}</div><textarea rows={10} value={bulkRawText} onChange={(e) => setBulkRawText(e.target.value)} placeholder={SAMPLE_TXT_CONTENT} className="w-full rounded-xl border p-3 font-mono text-xs" /><p className="text-[10px] text-slate-500">Explanation must contain exactly 3–4 bullet points. Every point should clarify the question, correct answer, or one of the options.</p>{bulkActionError && <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs">{bulkActionError}</div>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button><Button onClick={handleParseTxt} className="bg-indigo-600">Parse TXT & Preview</Button></div></> : <><div className="grid grid-cols-3 gap-3"><div className="p-3 rounded-xl border text-center"><span className="text-[11px] text-slate-500">Detected</span><p className="text-xl font-black">{bulkParseResult?.totalDetected || 0}</p></div><div className="p-3 rounded-xl border text-center"><span className="text-[11px] text-slate-500">Valid</span><p className="text-xl font-black text-emerald-600">{bulkParseResult?.valid.length || 0}</p></div><div className="p-3 rounded-xl border text-center"><span className="text-[11px] text-slate-500">Errors</span><p className="text-xl font-black text-rose-600">{bulkParseResult?.errors.length || 0}</p></div></div>{bulkParseResult?.errors.length ? <div className="space-y-2">{bulkParseResult.errors.map((err, i) => <div key={i} className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs"><b>Question #{err.questionNumber}</b><p>{err.reason}</p></div>)}</div> : null}{bulkParseResult?.valid.length ? <div className="space-y-2"><h4 className="text-xs font-black">Valid Questions Preview</h4>{bulkParseResult.valid.slice(0, 3).map((q) => <div key={q.questionNumber} className="p-3 rounded-xl border text-xs"><p className="font-bold">{q.questionNumber}. {q.questionText}</p><div className="mt-2 space-y-1 text-slate-500">{q.explanation?.split(/\r?\n/).filter(Boolean).map((line, i) => <p key={i}>• {line.replace(/^[-•*]\s*/, '')}</p>)}</div></div>)}</div> : null}<div className="flex justify-between"><Button variant="outline" onClick={() => setBulkStep('upload')}>Fix / Upload Again</Button><Button onClick={handleImportValidQuestions} disabled={isImportingBulk || !bulkParseResult?.valid.length} className="bg-emerald-600">{isImportingBulk ? 'Importing...' : `Import ${bulkParseResult?.valid.length || 0} Valid Questions`}</Button></div></>}</div></div>}

      {isFormatGuideOpen && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl p-6"><div className="flex items-center justify-between"><h3 className="font-black">Standard TXT Question Format</h3><button onClick={() => setIsFormatGuideOpen(false)}><X className="w-5 h-5" /></button></div><p className="text-xs text-slate-500 mt-2">Every question must contain 4 options, the correct answer, and 3–4 question/option-related explanation bullets.</p><pre className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border whitespace-pre-wrap text-xs">{SAMPLE_TXT_CONTENT}</pre><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setIsFormatGuideOpen(false)}>Close</Button><Button onClick={() => downloadSampleTxt()} className="bg-indigo-600">Download Template</Button></div></div></div>}

      {isPreviewModalOpen && previewingQuestion && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6"><div className="flex justify-between"><h3 className="font-black">Question Preview</h3><button onClick={() => setIsPreviewModalOpen(false)}><X className="w-5 h-5" /></button></div><h4 className="mt-4 font-bold">{previewingQuestion.questionBengaliText || previewingQuestion.questionText}</h4><div className="mt-4 space-y-2">{([['A', previewingQuestion.optionA], ['B', previewingQuestion.optionB], ['C', previewingQuestion.optionC], ['D', previewingQuestion.optionD]] as const).map(([key, text]) => <div key={key} className={`p-3 rounded-xl border ${previewingQuestion.correctOption === key ? 'bg-emerald-50' : ''}`}><b>{key}.</b> {text}</div>)}</div>{previewingQuestion.explanation && <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30"><b>Explanation & Notes</b><ul className="mt-2 space-y-1.5">{previewingQuestion.explanation.split(/\r?\n/).filter(Boolean).map((line, i) => <li key={i} className="text-xs flex gap-2"><span>•</span><span>{line.replace(/^[-•*]\s*/, '')}</span></li>)}</ul></div>}<div className="flex justify-end mt-4"><Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button></div></div></div>}

      {isEditModalOpen && editingQuestion && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl p-6"><form onSubmit={handleUpdateQuestion} className="space-y-4"><div className="flex justify-between"><h3 className="font-black">Edit Question</h3><button type="button" onClick={() => setIsEditModalOpen(false)}><X className="w-5 h-5" /></button></div>{editQError && <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs">{editQError}</div>}<textarea rows={2} value={editQBengaliText} onChange={(e) => setEditQBengaliText(e.target.value)} className="w-full rounded-xl border p-2 text-xs" /><input value={editQText} onChange={(e) => setEditQText(e.target.value)} className="w-full rounded-xl border p-2 text-xs" /> <div className="grid grid-cols-2 gap-3">{([['A', editQOptA, setEditQOptA], ['B', editQOptB, setEditQOptB], ['C', editQOptC, setEditQOptC], ['D', editQOptD, setEditQOptD]] as const).map(([key, value, setter]) => <input key={key} value={value} onChange={(e) => setter(e.target.value)} className="w-full rounded-xl border p-2 text-xs" required />)}</div><div className="grid grid-cols-4 gap-2">{(['A', 'B', 'C', 'D'] as const).map((opt) => <button type="button" key={opt} onClick={() => setEditQCorrect(opt)} className={`p-2 rounded-xl border text-xs font-bold ${editQCorrect === opt ? 'bg-emerald-600 text-white' : ''}`}>{opt}</button>)}</div><div className="grid grid-cols-3 gap-3"><input type="number" step="0.25" value={editQMarks} onChange={(e) => setEditQMarks(Number(e.target.value))} className="rounded-xl border p-2 text-xs" /><input type="number" step="0.05" value={editQNegativeMarks} onChange={(e) => setEditQNegativeMarks(Number(e.target.value))} className="rounded-xl border p-2 text-xs" /><select value={editQDifficulty} onChange={(e) => setEditQDifficulty(e.target.value)} className="rounded-xl border p-2 text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div><textarea rows={6} value={editQExplanation} onChange={(e) => setEditQExplanation(e.target.value)} placeholder={"- Key fact directly explaining the correct answer\n- Important fact linked to the question\n- Why a related option is incorrect/correct\n- Exam-relevant distinction among the options"} className="w-full rounded-xl border p-3 text-xs" /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button type="submit" disabled={isUpdatingQ} className="bg-emerald-600">{isUpdatingQ ? 'Saving...' : 'Save Changes'}</Button></div></form></div></div>}

      {questionToDelete && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full"><h3 className="font-black">Delete Question?</h3><p className="text-xs text-slate-500 mt-2">{questionToDelete.questionText}</p>{deleteError && <p className="text-xs text-rose-600 mt-2">{deleteError}</p>}<div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setQuestionToDelete(null)}>Cancel</Button><Button onClick={handleDeleteQuestion} disabled={isDeletingQuestion} className="bg-rose-600">{isDeletingQuestion ? 'Deleting...' : 'Delete'}</Button></div></div></div>}

      {isBulkDeleteModalOpen && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full"><h3 className="font-black">Delete {selectedQuestionIds.size} Questions?</h3><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancel</Button><Button onClick={handleBulkDeleteQuestions} disabled={isDeletingQuestion} className="bg-rose-600">Delete</Button></div></div></div>}
    </div>
  );
};

interface StatCardProps { icon: React.ReactNode; label: string; value: string | number; subtitle?: string; gradient: string; iconBg: string; }
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, gradient, iconBg }) => <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/10 shadow-lg`}><div className="flex items-start gap-3.5"><div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div><div><p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{label}</p><p className="text-2xl font-black text-white mt-0.5">{value}</p>{subtitle && <p className="text-[11px] text-white/60 mt-1 truncate">{subtitle}</p>}</div></div></div>;
