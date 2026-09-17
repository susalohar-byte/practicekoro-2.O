import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  Layers,
  Plus,
  Edit2,
  Search,
  Clock,
  X,
  FileQuestion,
  AlertCircle,
  FolderTree,
  Target,
  ScrollText,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Trash2,
  Crown,
  ChevronRight,
  Power,
  ArrowRight,
} from 'lucide-react';
import type { MockTest, Exam, Subject, Chapter, PublishValidationResult } from '@/types';
import { getErrorMessage } from '@/lib/errors';

type MockTab = 'topic' | 'full_mock' | 'pyq' | 'structure';

export const AdminTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MockTab>('topic');

  // Entities
  const [tests, setTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterTopicId, setFilterTopicId] = useState('');
  const [filterExamId, setFilterExamId] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>(
    'all'
  );

  // Structure Management State
  const [selectedStructureSubjectId, setSelectedStructureSubjectId] = useState<string>('');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [isSavingStructure, setIsSavingStructure] = useState(false);
  const [structureError, setStructureError] = useState('');

  // Test Modal State (Shared for Create/Edit across tabs)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);
  const [modalType, setModalType] = useState<'topic' | 'full_mock' | 'pyq'>('topic');
  const [newlyCreatedTest, setNewlyCreatedTest] = useState<MockTest | null>(null);

  // Test Form Fields
  const [formExamId, setFormExamId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState(15);
  const [formTotalMarks, setFormTotalMarks] = useState(25);
  const [formPassingMarks, setFormPassingMarks] = useState(10);
  const [formNegativeMarking, setFormNegativeMarking] = useState(0.25);
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formPaperName, setFormPaperName] = useState('Preliminary');
  const [formShift, setFormShift] = useState('');
  const [formError, setFormError] = useState('');
  const [isSavingTest, setIsSavingTest] = useState(false);

  // Publish Validation Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [testToPublish, setTestToPublish] = useState<MockTest | null>(null);
  const [validationResult, setValidationResult] = useState<PublishValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Archive Modal State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [testToArchive, setTestToArchive] = useState<MockTest | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<MockTest | null>(null);
  const [isDeletingTest, setIsDeletingTest] = useState(false);
  const [deleteTestError, setDeleteTestError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allExams, allSubjects, allChapters, allTests] = await Promise.all([
        api.getAllAdminExams(),
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAllAdminTests(),
      ]);
      setExams(allExams);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setTests(allTests);

      if (!selectedStructureSubjectId && allSubjects.length > 0) {
        setSelectedStructureSubjectId(allSubjects[0].id);
      }
    } catch (err) {
      console.error('Error loading tests data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStructureSubjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Test modal pre-configured for the active tab
  const handleOpenCreateTest = (type: 'topic' | 'full_mock' | 'pyq') => {
    setEditingTest(null);
    setModalType(type);
    setFormError('');

    const defaultExam = exams[0]?.id || '';
    const defaultSubject = subjects[0]?.id || '';
    const defaultTopic = chapters.find((c) => c.subjectId === defaultSubject)?.id || '';

    setFormExamId(defaultExam);
    setFormSubjectId(defaultSubject);
    setFormTopicId(defaultTopic);
    setFormTitle('');
    setFormDescription('');
    setFormDuration(type === 'topic' ? 15 : type === 'full_mock' ? 60 : 90);
    setFormTotalMarks(type === 'topic' ? 25 : type === 'full_mock' ? 100 : 100);
    setFormPassingMarks(type === 'topic' ? 10 : type === 'full_mock' ? 40 : 40);
    setFormNegativeMarking(0.25);
    setFormIsPremium(false);
    setFormYear(new Date().getFullYear());
    setFormPaperName('Preliminary');
    setFormShift('');
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (test: MockTest) => {
    setEditingTest(test);
    const inferredType =
      test.testType === 'pyq' ? 'pyq' : test.testType === 'full_mock' ? 'full_mock' : 'topic';
    setModalType(inferredType);
    setFormError('');

    setFormExamId(test.examId || exams[0]?.id || '');
    setFormSubjectId(test.subjectId || subjects[0]?.id || '');
    setFormTopicId(test.topicId || test.chapterId || '');
    setFormTitle(test.title);
    setFormDescription(test.description || '');
    setFormDuration(test.durationMinutes);
    setFormTotalMarks(test.totalMarks);
    setFormPassingMarks(test.passingMarks);
    setFormNegativeMarking(test.negativeMarking ?? 0.25);
    setFormIsPremium(test.isPremium);
    setFormYear(test.year || new Date().getFullYear());
    setFormPaperName(test.paperName || 'Preliminary');
    setFormShift(test.shift || '');
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Test name is required.');
      return;
    }

    if (modalType === 'topic') {
      if (!formSubjectId) {
        setFormError('Subject must be selected.');
        return;
      }
      if (!formTopicId) {
        setFormError('Topic must be selected.');
        return;
      }
    } else {
      if (!formExamId) {
        setFormError('Exam must be selected.');
        return;
      }
    }

    try {
      setIsSavingTest(true);
      setFormError('');

      const mappedTestType =
        modalType === 'pyq' ? 'pyq' : modalType === 'full_mock' ? 'full_mock' : 'topic';

      if (editingTest) {
        await api.updateTest(editingTest.id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          examId: modalType === 'topic' ? undefined : formExamId,
          subjectId: modalType === 'topic' ? formSubjectId : undefined,
          chapterId: modalType === 'topic' ? formTopicId : undefined,
          topicId: modalType === 'topic' ? formTopicId : undefined,
          durationMinutes: Number(formDuration),
          totalMarks: Number(formTotalMarks),
          passingMarks: Number(formPassingMarks),
          negativeMarking: Number(formNegativeMarking),
          isPremium: formIsPremium,
          testType: mappedTestType,
          year: modalType === 'pyq' ? Number(formYear) : undefined,
          paperName: modalType === 'pyq' ? formPaperName.trim() : undefined,
          shift: modalType === 'pyq' ? formShift.trim() : undefined,
        });
      } else {
        const created = await api.createTest({
          title: formTitle.trim(),
          slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: formDescription.trim() || undefined,
          examId: modalType === 'topic' ? undefined : formExamId,
          subjectId: modalType === 'topic' ? formSubjectId : undefined,
          chapterId: modalType === 'topic' ? formTopicId : undefined,
          topicId: modalType === 'topic' ? formTopicId : undefined,
          durationMinutes: Number(formDuration),
          totalQuestions: 0,
          totalMarks: Number(formTotalMarks),
          passingMarks: Number(formPassingMarks),
          negativeMarking: Number(formNegativeMarking),
          isPremium: formIsPremium,
          testType: mappedTestType,
          year: modalType === 'pyq' ? Number(formYear) : undefined,
          paperName: modalType === 'pyq' ? formPaperName.trim() : undefined,
          shift: modalType === 'pyq' ? formShift.trim() : undefined,
          orderIndex: tests.length + 1,
          isActive: true,
          status: 'draft',
        });
        setNewlyCreatedTest(created);
      }

      setIsTestModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save test'));
    } finally {
      setIsSavingTest(false);
    }
  };

  // Subject / Topic creation
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setStructureError('Subject name is required.');
      return;
    }
    try {
      setIsSavingStructure(true);
      setStructureError('');
      const slug = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const created = await api.createSubject({
        name: subjectName.trim(),
        slug,
        description: subjectDesc.trim() || undefined,
        iconName: 'BookOpen',
        orderIndex: subjects.length + 1,
        isActive: true,
      });
      setSubjects((prev) => [...prev, created]);
      setSelectedStructureSubjectId(created.id);
      setIsSubjectModalOpen(false);
      setSubjectName('');
      setSubjectDesc('');
    } catch (err) {
      setStructureError(getErrorMessage(err, 'Failed to create subject'));
    } finally {
      setIsSavingStructure(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      setStructureError('Topic name is required.');
      return;
    }
    if (!selectedStructureSubjectId) {
      setStructureError('Please select a subject first.');
      return;
    }
    try {
      setIsSavingStructure(true);
      setStructureError('');
      const slug = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const created = await api.createChapter({
        subjectId: selectedStructureSubjectId,
        name: topicName.trim(),
        slug,
        description: topicDesc.trim() || undefined,
        orderIndex: chapters.length + 1,
        isActive: true,
      });
      setChapters((prev) => [...prev, created]);
      setIsTopicModalOpen(false);
      setTopicName('');
      setTopicDesc('');
    } catch (err) {
      setStructureError(getErrorMessage(err, 'Failed to create topic'));
    } finally {
      setIsSavingStructure(false);
    }
  };

  // Publish Validation
  const handleOpenPublishModal = async (test: MockTest) => {
    setTestToPublish(test);
    setIsPublishModalOpen(true);
    setValidationResult(null);
    setPublishMessage(null);
    setIsValidating(true);
    try {
      const result = await api.validateTestForPublish(test.id);
      setValidationResult(result);
    } catch (err) {
      setPublishMessage({
        type: 'error',
        text: getErrorMessage(err, 'Failed to validate test'),
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!testToPublish) return;
    try {
      setIsValidating(true);
      await api.publishTest(testToPublish.id);
      setPublishMessage({
        type: 'success',
        text: `Test "${testToPublish.title}" published successfully!`,
      });
      await loadData();
      setTimeout(() => {
        setIsPublishModalOpen(false);
        setTestToPublish(null);
      }, 1200);
    } catch (err) {
      setPublishMessage({ type: 'error', text: getErrorMessage(err, 'Failed to publish test') });
    } finally {
      setIsValidating(false);
    }
  };

  // Archive
  const handleConfirmArchive = async () => {
    if (!testToArchive) return;
    try {
      await api.archiveTest(testToArchive.id);
      setIsArchiveModalOpen(false);
      setTestToArchive(null);
      await loadData();
    } catch (err) {
      console.error('Failed to archive test:', err);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (test: MockTest) => {
    // If activating a test that has 0 questions, prevent activation
    if (!test.isActive && (!test.totalQuestions || test.totalQuestions === 0)) {
      alert(`This test has no questions yet. Add questions before activating "${test.title}".`);
      return;
    }
    try {
      const nextActive = !test.isActive;
      await api.updateTest(test.id, { isActive: nextActive });
      setTests((prev) => prev.map((t) => (t.id === test.id ? { ...t, isActive: nextActive } : t)));
    } catch (err) {
      console.error('Failed to toggle test active status:', err);
    }
  };

  // Delete
  const handleOpenDeleteModal = (test: MockTest) => {
    setTestToDelete(test);
    setDeleteTestError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;
    try {
      setIsDeletingTest(true);
      setDeleteTestError('');
      await api.deleteTest(testToDelete.id);
      setIsDeleteModalOpen(false);
      setTestToDelete(null);
      await loadData();
    } catch (err) {
      setDeleteTestError(getErrorMessage(err, 'Failed to delete test'));
    } finally {
      setIsDeletingTest(false);
    }
  };

  // Filtered lists for each tab
  const topicTests = tests.filter((t) => {
    const isTopic = t.testType === 'topic' || t.testType === 'chapter_mock';
    if (!isTopic) return false;
    if (filterSubjectId && t.subjectId !== filterSubjectId) return false;
    if (filterTopicId && t.chapterId !== filterTopicId && t.topicId !== filterTopicId) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const fullMockTests = tests.filter((t) => {
    if (t.testType !== 'full_mock') return false;
    if (filterExamId && t.examId !== filterExamId) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pyqTests = tests.filter((t) => {
    if (t.testType !== 'pyq') return false;
    if (filterExamId && t.examId !== filterExamId) return false;
    if (filterYear && String(t.year) !== filterYear) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const structureTopics = chapters.filter((c) => c.subjectId === selectedStructureSubjectId);
  const selectedSubjectObj = subjects.find((s) => s.id === selectedStructureSubjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Mock Test Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage Topic Tests, Full Mocks, PYQs, and centralized Subject-Topic
            structures.
          </p>
        </div>

        {/* Tab-specific primary action */}
        {activeTab === 'topic' && (
          <Button
            onClick={() => handleOpenCreateTest('topic')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Topic Test
          </Button>
        )}
        {activeTab === 'full_mock' && (
          <Button
            onClick={() => handleOpenCreateTest('full_mock')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Full Mock Test
          </Button>
        )}
        {activeTab === 'pyq' && (
          <Button
            onClick={() => handleOpenCreateTest('pyq')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create PYQ Test
          </Button>
        )}
      </div>

      {/* Post Test-Creation Banner with Direct Manage Questions Action */}
      {newlyCreatedTest && (
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-blue-500/15 to-indigo-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                  ✓ Test Created Successfully
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {newlyCreatedTest.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready for questions! Click below to automatically load matching questions from the
                Question Bank.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setNewlyCreatedTest(null)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Dismiss
            </button>
            <Link
              to={`/admin/tests/${newlyCreatedTest.id}/questions`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0075FF] to-[#0052E0] hover:from-[#0066FF] hover:to-[#0047C7] text-white text-xs font-bold shadow-md shadow-[#0075FF]/30 flex items-center gap-1.5 transition-all"
            >
              <span>Manage Questions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4 Primary Tabs (Section 15) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('topic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'topic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Topic Tests
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 dark:bg-white/10">
            {tests.filter((t) => t.testType === 'topic' || t.testType === 'chapter_mock').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('full_mock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'full_mock'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          Full Mock Tests
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 dark:bg-white/10">
            {tests.filter((t) => t.testType === 'full_mock').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pyq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pyq'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          PYQ
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 dark:bg-white/10">
            {tests.filter((t) => t.testType === 'pyq').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'structure'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Topic Structure
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 dark:bg-white/10">
            {subjects.length} Subjects
          </span>
        </button>
      </div>

      {/* TAB 1: TOPIC TESTS */}
      {activeTab === 'topic' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search topic tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterSubjectId}
              onChange={(e) => {
                setFilterSubjectId(e.target.value);
                setFilterTopicId('');
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
              value={filterTopicId}
              onChange={(e) => setFilterTopicId(e.target.value)}
              disabled={!filterSubjectId}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
            >
              <option value="">All Topics</option>
              {chapters
                .filter((c) => !filterSubjectId || c.subjectId === filterSubjectId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Topic Tests Table */}
          <TestTable
            tests={topicTests}
            isLoading={isLoading}
            emptyMessage="No Topic Tests found. Create one using the button above."
            onEdit={handleOpenEditTest}
            onPublish={handleOpenPublishModal}
            onArchive={(t) => {
              setTestToArchive(t);
              setIsArchiveModalOpen(true);
            }}
            onDelete={handleOpenDeleteModal}
            onToggleActive={handleToggleActive}
          />
        </div>
      )}

      {/* TAB 2: FULL MOCK TESTS */}
      {activeTab === 'full_mock' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search full mock tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterExamId}
              onChange={(e) => setFilterExamId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">All Target Exams</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <TestTable
            tests={fullMockTests}
            isLoading={isLoading}
            emptyMessage="No Full Mock Tests found. Click '+ Create Full Mock Test' to add one."
            onEdit={handleOpenEditTest}
            onPublish={handleOpenPublishModal}
            onArchive={(t) => {
              setTestToArchive(t);
              setIsArchiveModalOpen(true);
            }}
            onDelete={handleOpenDeleteModal}
            onToggleActive={handleToggleActive}
          />
        </div>
      )}

      {/* TAB 3: PYQ */}
      {activeTab === 'pyq' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search PYQ papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterExamId}
              onChange={(e) => setFilterExamId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">All Exams</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Year (e.g. 2024)"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <TestTable
            tests={pyqTests}
            isLoading={isLoading}
            emptyMessage="No PYQ tests found. Click '+ Create PYQ Test' to add one."
            onEdit={handleOpenEditTest}
            onPublish={handleOpenPublishModal}
            onArchive={(t) => {
              setTestToArchive(t);
              setIsArchiveModalOpen(true);
            }}
            onDelete={handleOpenDeleteModal}
            onToggleActive={handleToggleActive}
          />
        </div>
      )}

      {/* TAB 4: TOPIC STRUCTURE (Section 3A, 15) */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Subjects Column */}
          <div className="md:col-span-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> Subjects
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Master repository of academic subjects
                </p>
              </div>
              <Button
                onClick={() => {
                  setStructureError('');
                  setSubjectName('');
                  setSubjectDesc('');
                  setIsSubjectModalOpen(true);
                }}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 h-auto flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </Button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {subjects.map((sub) => {
                const isSelected = sub.id === selectedStructureSubjectId;
                const count = chapters.filter((c) => c.subjectId === sub.id).length;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedStructureSubjectId(sub.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600/50 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {count} Topics defined
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 translate-x-1'
                          : 'text-slate-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topics Column */}
          <div className="md:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-cyan-500" />
                  Topics under: {selectedSubjectObj?.name || 'Select Subject'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Topics are selected in dropdowns when adding questions or topic tests
                </p>
              </div>
              <Button
                onClick={() => {
                  setStructureError('');
                  setTopicName('');
                  setTopicDesc('');
                  setIsTopicModalOpen(true);
                }}
                disabled={!selectedStructureSubjectId}
                className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1.5 h-auto flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add Topic
              </Button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {structureTopics.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <FolderTree className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">
                    No topics created under this subject yet.
                  </p>
                  <Button
                    onClick={() => setIsTopicModalOpen(true)}
                    className="mt-3 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 h-auto py-1 px-3"
                  >
                    + Add First Topic
                  </Button>
                </div>
              ) : (
                structureTopics.map((top) => {
                  const testsCount = tests.filter(
                    (t) => t.chapterId === top.id || t.topicId === top.id
                  ).length;
                  return (
                    <div
                      key={top.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {top.name}
                        </h4>
                        {top.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {top.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {testsCount} Tests
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TEST MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                {editingTest
                  ? 'Edit Test'
                  : modalType === 'topic'
                    ? 'Create Topic Test'
                    : modalType === 'full_mock'
                      ? 'Create Full Mock Test'
                      : 'Create PYQ Paper'}
              </h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTest} className="space-y-4">
              {/* TOPIC TEST FLOW: Subject -> Topic */}
              {modalType === 'topic' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject *
                    </label>
                    <select
                      value={formSubjectId}
                      onChange={(e) => {
                        setFormSubjectId(e.target.value);
                        const firstTop =
                          chapters.find((c) => c.subjectId === e.target.value)?.id || '';
                        setFormTopicId(firstTop);
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
                      value={formTopicId}
                      onChange={(e) => setFormTopicId(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">Select Topic</option>
                      {chapters
                        .filter((c) => c.subjectId === formSubjectId)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* FULL MOCK / PYQ FLOW: Target Exam */}
              {modalType !== 'topic' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Exam *
                  </label>
                  <select
                    value={formExamId}
                    onChange={(e) => setFormExamId(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select Exam</option>
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* PYQ SPECIFIC: Year & Paper / Shift */}
              {modalType === 'pyq' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Exam Year *
                    </label>
                    <input
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Paper Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Preliminary"
                      value={formPaperName}
                      onChange={(e) => setFormPaperName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shift / Session
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shift 1"
                      value={formShift}
                      onChange={(e) => setFormShift(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Test Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  placeholder={
                    modalType === 'topic'
                      ? 'e.g. Blood Practice Test 01'
                      : modalType === 'full_mock'
                        ? 'e.g. WBP Constable Full Mock Test 01'
                        : 'e.g. 2024 Preliminary Official Paper'
                  }
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief test description or guidelines..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Duration & Marks */}
              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    value={formPassingMarks}
                    onChange={(e) => setFormPassingMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Neg. Mark
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formNegativeMarking}
                    onChange={(e) => setFormNegativeMarking(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Premium toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsPremium"
                  checked={formIsPremium}
                  onChange={(e) => setFormIsPremium(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="formIsPremium"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Premium Test (Requires Active Pro Pass)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTestModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingTest}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  {isSavingTest ? 'Saving...' : editingTest ? 'Update Test' : 'Create Test'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Add Academic Subject
            </h3>

            {structureError && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {structureError}
              </p>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biology, History, Mathematics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional description..."
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingStructure}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  {isSavingStructure ? 'Creating...' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TOPIC MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-cyan-500" />
              Add Topic under {selectedSubjectObj?.name}
            </h3>

            {structureError && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {structureError}
              </p>
            )}

            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blood, Cell Structure, Ancient India"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional topic scope or chapter summary..."
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingStructure}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  {isSavingStructure ? 'Creating...' : 'Create Topic'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH VALIDATION MODAL */}
      {isPublishModalOpen && testToPublish && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Publish Test: {testToPublish.title}
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isValidating && (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                Validating questions and marks...
              </p>
            )}

            {publishMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  publishMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                }`}
              >
                {publishMessage.text}
              </div>
            )}

            {validationResult && (
              <div className="space-y-3">
                {validationResult.isValid ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> All checks passed!
                    </p>
                    <p className="text-[11px] opacity-90">
                      This test has valid questions, correct options, and marks matching
                      specifications. Ready to publish.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Validation Warnings (
                      {validationResult.errors.length})
                    </p>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPublish}
                disabled={isValidating || !validationResult?.isValid}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm & Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVE MODAL */}
      {isArchiveModalOpen && testToArchive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-500" /> Archive Test?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to archive <strong>"{testToArchive.title}"</strong>? It will no
              longer be visible to students, but existing student results and attempts remain
              completely preserved.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsArchiveModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmArchive}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && testToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/50 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" /> Delete Test?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete <strong>"{testToDelete.title}"</strong>?
              This action cannot be undone and will delete all associated test questions and
              records.
            </p>
            {deleteTestError && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {deleteTestError}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeletingTest}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {isDeletingTest ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Test Table Component
interface TestTableProps {
  tests: MockTest[];
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (test: MockTest) => void;
  onPublish: (test: MockTest) => void;
  onArchive: (test: MockTest) => void;
  onDelete: (test: MockTest) => void;
  onToggleActive: (test: MockTest) => void;
}

const TestTable: React.FC<TestTableProps> = ({
  tests,
  isLoading,
  emptyMessage,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
  onToggleActive,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
        Loading test records...
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <FileQuestion className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Test Title</th>
              <th className="px-4 py-3">Category / Assignment</th>
              <th className="px-4 py-3">Duration & Marks</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Status & State</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {tests.map((test) => {
              const status = test.status || 'draft';
              const isActive = test.isActive !== false;
              return (
                <tr
                  key={test.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white max-w-[280px]">
                    <div className="flex items-center gap-1.5">
                      {test.isPremium && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                      <span className="truncate">{test.title}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                    {test.testType === 'topic' || test.testType === 'chapter_mock' ? (
                      <span>
                        {test.subjectName || 'Subject'} • {test.chapterName || 'Topic'}
                      </span>
                    ) : test.testType === 'pyq' ? (
                      <span>
                        {test.examTitle || 'Exam'} • {test.year || 'PYQ'} (
                        {test.paperName || 'Shift 1'})
                      </span>
                    ) : (
                      <span>{test.examTitle || 'Universal Exam'}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.durationMinutes}m • {test.totalMarks}M
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/tests/${test.id}/questions`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <FileQuestion className="w-3 h-3" />
                      {test.totalQuestions || 0} Questions
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : status === 'draft'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {status}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/tests/${test.id}/questions`}
                        title="Manage Test Questions"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      >
                        <FileQuestion className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => onToggleActive(test)}
                        title={
                          isActive
                            ? 'Deactivate Test (Hide from students)'
                            : 'Activate Test (Make available to students)'
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEdit(test)}
                        title="Edit Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {status === 'draft' && (
                        <button
                          onClick={() => onPublish(test)}
                          title="Validate & Publish"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {status !== 'archived' && (
                        <button
                          onClick={() => onArchive(test)}
                          title="Archive Test"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onDelete(test)}
                        title="Delete Test"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors ml-1"
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
    </div>
  );
};
