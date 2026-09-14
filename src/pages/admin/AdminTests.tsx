import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  Layers,
  Plus,
  Edit2,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Clock,
  X,
  FileQuestion,
  AlertCircle,
} from 'lucide-react';
import type {
  MockTest,
  Exam,
  Subject,
  Chapter,
  TestSeries,
  PublishValidationResult,
} from '@/types';

export const AdminTests: React.FC = () => {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [testSeriesList, setTestSeriesList] = useState<TestSeries[]>([]);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);

  // Form State
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [testSeriesId, setTestSeriesId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState<
    'chapter_mock' | 'full_mock' | 'subject_mock' | 'pyq' | 'topic'
  >('chapter_mock');
  const [year, setYear] = useState<number | ''>('');
  const [associatedExamIds, setAssociatedExamIds] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(25);
  const [passingMarks, setPassingMarks] = useState(10);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  const [isPremium, setIsPremium] = useState(false);
  const [orderIndex, setOrderIndex] = useState(1);
  const [formError, setFormError] = useState('');

  // Publish Validation Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [testToPublish, setTestToPublish] = useState<MockTest | null>(null);
  const [validationResult, setValidationResult] = useState<PublishValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Archive Confirmation Modal State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [testToArchive, setTestToArchive] = useState<MockTest | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allExams, allSubjects, allChapters, allSeries, allTests] = await Promise.all([
        api.getAllAdminExams(),
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getTestSeries(),
        api.getAllAdminTests({
          examId: selectedExamId || undefined,
          subjectId: selectedSubjectId || undefined,
          chapterId: selectedChapterId || undefined,
          testSeriesId: selectedSeriesId || undefined,
          status: selectedStatus || undefined,
        }),
      ]);
      setExams(allExams);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setTestSeriesList(allSeries);
      setTests(allTests);
    } catch (err) {
      console.error('Error loading tests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExamId, selectedSubjectId, selectedChapterId, selectedSeriesId, selectedStatus]);

  // Hierarchical cascading for modal
  const modalAvailableSubjects = examId ? subjects.filter((s) => s.examId === examId) : subjects;
  const modalAvailableChapters = subjectId
    ? chapters.filter((c) => c.subjectId === subjectId)
    : chapters;
  const modalAvailableSeries = examId
    ? testSeriesList.filter((s) => s.examId === examId)
    : testSeriesList;

  const openCreateModal = () => {
    setEditingTest(null);
    const initialExam = selectedExamId || exams[0]?.id || '';
    setExamId(initialExam);
    const firstSub = subjects.find((s) => s.examId === initialExam);
    setSubjectId(firstSub?.id || '');
    const firstChap = chapters.find((c) => c.subjectId === firstSub?.id);
    setChapterId(firstChap?.id || '');
    setTestSeriesId('');
    setTitle('');
    setSlug('');
    setDescription('');
    setTestType('full_mock');
    setYear('');
    setAssociatedExamIds(initialExam ? [initialExam] : []);
    setDurationMinutes(15);
    setTotalMarks(25);
    setPassingMarks(10);
    setNegativeMarking(0.25);
    setIsPremium(false);
    setOrderIndex(tests.length + 1);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: MockTest) => {
    setEditingTest(t);
    setExamId(t.examId);
    setSubjectId(t.subjectId || '');
    setChapterId(t.chapterId || '');
    setTestSeriesId(t.testSeriesId || '');
    setTitle(t.title);
    setSlug(t.slug);
    setDescription(t.description || '');
    setTestType(t.testType);
    setYear(t.year || '');
    setAssociatedExamIds([t.examId]);
    api.getTestExamAssociations(t.id).then((assocs) => {
      if (assocs && assocs.length > 0) {
        setAssociatedExamIds(assocs);
      }
    });
    setDurationMinutes(t.durationMinutes);
    setTotalMarks(t.totalMarks);
    setPassingMarks(t.passingMarks);
    setNegativeMarking(t.negativeMarking);
    setIsPremium(t.isPremium);
    setOrderIndex(t.orderIndex);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingTest) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Test title is required.');
      return;
    }
    if (!examId) {
      setFormError('Target Exam must be selected.');
      return;
    }
    if (testType === 'pyq' && !year) {
      setFormError('Exam Year is required for PYQ tests.');
      return;
    }

    try {
      if (editingTest) {
        await api.updateTest(editingTest.id, {
          examId,
          subjectId: subjectId || undefined,
          chapterId: chapterId || undefined,
          testSeriesId: testSeriesId || undefined,
          title: title.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          testType,
          year: testType === 'pyq' && year ? Number(year) : undefined,
          associatedExamIds,
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          passingMarks: Number(passingMarks),
          negativeMarking: Number(negativeMarking),
          isPremium,
          orderIndex: Number(orderIndex),
        });
      } else {
        await api.createTest({
          examId,
          subjectId: subjectId || undefined,
          chapterId: chapterId || undefined,
          testSeriesId: testSeriesId || undefined,
          title: title.trim(),
          slug:
            slug.trim() ||
            title
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          description: description.trim() || undefined,
          testType,
          year: testType === 'pyq' && year ? Number(year) : undefined,
          associatedExamIds,
          durationMinutes: Number(durationMinutes),
          totalQuestions: 0,
          totalMarks: Number(totalMarks),
          passingMarks: Number(passingMarks),
          negativeMarking: Number(negativeMarking),
          isPremium,
          orderIndex: Number(orderIndex),
          isActive: true,
          status: 'draft',
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save test');
    }
  };

  // Pre-Publish Validation Flow
  const openPublishModal = async (test: MockTest) => {
    setTestToPublish(test);
    setPublishMessage(null);
    setIsPublishModalOpen(true);
    setIsValidating(true);

    try {
      const result = await api.validateTestForPublish(test.id);
      setValidationResult(result);
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        errors: [err.message || 'Error validating test'],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!testToPublish) return;
    try {
      const res = await api.publishTest(testToPublish.id);
      if (res.success) {
        setPublishMessage({
          type: 'success',
          text: `Test "${testToPublish.title}" is now PUBLISHED and live for students.`,
        });
        await loadData();
      } else {
        setPublishMessage({ type: 'error', text: res.error || 'Failed to publish test.' });
      }
    } catch (err: any) {
      setPublishMessage({ type: 'error', text: err.message || 'Unexpected publish error' });
    }
  };

  // Archive Flow
  const openArchiveModal = (test: MockTest) => {
    setTestToArchive(test);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!testToArchive) return;
    try {
      await api.archiveTest(testToArchive.id);
      setIsArchiveModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to archive test:', err);
    }
  };

  const filteredTests = tests.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-amber-400" />
              Mock Tests Management & Publishing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {tests.length} Tests
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure test duration, marks, negative marking, assign questions, and publish with
            pre-flight validation.
          </p>
        </div>

        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Create Mock Test
        </Button>
      </div>

      {/* Filters Grid */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter Tests
          </span>
          {(selectedExamId ||
            selectedSubjectId ||
            selectedChapterId ||
            selectedSeriesId ||
            selectedStatus ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedExamId('');
                setSelectedSubjectId('');
                setSelectedChapterId('');
                setSelectedSeriesId('');
                setSelectedStatus('');
                setSearchTerm('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search tests by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Exam Filter */}
          <div>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedSubjectId('');
                setSelectedChapterId('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Exams</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedChapterId('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Subjects</option>
              {(selectedExamId
                ? subjects.filter((s) => s.examId === selectedExamId)
                : subjects
              ).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Series Filter */}
          <div>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Test Series</option>
              {testSeriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published (Live)</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Test Title & Exam</th>
                <th className="p-4">Type</th>
                <th className="p-4">Duration & Scoring</th>
                <th className="p-4">Questions</th>
                <th className="p-4">Access Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading tests...
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No mock tests match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white text-sm">{test.title}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span className="text-indigo-400 font-semibold">
                            {test.examTitle || test.examId}
                          </span>
                          {test.subjectName && <span>• {test.subjectName}</span>}
                          {test.chapterName && <span>• {test.chapterName}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-medium">
                        {test.testType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      <div className="space-y-0.5 text-slate-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {test.durationMinutes} mins
                        </span>
                        <span className="text-slate-400">
                          {test.totalMarks} Marks (+
                          {test.totalMarks > 0 && test.totalQuestions > 0
                            ? (test.totalMarks / test.totalQuestions).toFixed(1)
                            : '1'}{' '}
                          / -{test.negativeMarking})
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-indigo-400">{test.totalQuestions} Qs</td>
                    <td className="p-4">
                      {test.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Lock className="w-3 h-3" /> PRO PASS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {test.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      )}
                      {test.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> Draft
                        </span>
                      )}
                      {test.status === 'archived' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <Archive className="w-3 h-3" /> Archived
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/tests/${test.id}/questions`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 font-bold text-[11px] flex items-center gap-1"
                          title="Manage Questions"
                        >
                          <FileQuestion className="w-3.5 h-3.5" /> Questions
                        </Link>

                        <button
                          onClick={() => openEditModal(test)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit Configuration"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {test.status === 'draft' && (
                          <button
                            onClick={() => openPublishModal(test)}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-[11px] font-bold"
                            title="Publish Test"
                          >
                            Publish
                          </button>
                        )}

                        {test.status === 'published' && (
                          <button
                            onClick={() => openArchiveModal(test)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Archive Test"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                {editingTest ? 'Edit Mock Test Configuration' : 'Create New Mock Test'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {formError}
                </div>
              )}

              {/* Hierarchy Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Target Exam *
                  </label>
                  <select
                    value={examId}
                    onChange={(e) => {
                      setExamId(e.target.value);
                      setSubjectId('');
                      setChapterId('');
                      setTestSeriesId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Subject (Optional)
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setChapterId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None / Full Mock</option>
                    {modalAvailableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Chapter (Optional)
                  </label>
                  <select
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None / Full Mock</option>
                    {modalAvailableChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Test Series Bundle (Optional)
                  </label>
                  <select
                    value={testSeriesId}
                    onChange={(e) => setTestSeriesId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None</option>
                    {modalAvailableSeries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mock Test Part 01: Indus Valley (Free)"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. indus-valley-mock-01"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Test Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="full_mock">
                      🎯 Full Mock Test (Multi-Subject Exam Simulation)
                    </option>
                    <option value="pyq">📜 Previous Year Paper (PYQ)</option>
                    <option value="topic">📚 Canonical Topic Test (Reusable)</option>
                    <option value="chapter_mock">Chapter Mock (Legacy)</option>
                    <option value="subject_mock">Subject Drill Mock (Legacy)</option>
                  </select>
                </div>
              </div>

              {/* PYQ Year Field */}
              {testType === 'pyq' && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/60">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    PYQ Exam Year *
                  </label>
                  <input
                    type="number"
                    min={1990}
                    max={2030}
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || '')}
                    placeholder="e.g. 2024"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    Enter the official year when this past paper was conducted.
                  </p>
                </div>
              )}

              {/* Multi-Exam Association for Topic Tests & Cross-Exam Sharing */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Associated Examinations (Multi-Exam Reusability)
                </label>
                <p className="text-[11px] text-slate-400">
                  Select all examinations where this test should appear. A single test can be reused
                  across exams without duplicating content.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {exams.map((ex) => {
                    const isSelected = associatedExamIds.includes(ex.id) || ex.id === examId;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          if (ex.id === examId) return;
                          setAssociatedExamIds((prev) =>
                            prev.includes(ex.id)
                              ? prev.filter((id) => id !== ex.id)
                              : [...prev, ex.id]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {ex.title} {ex.id === examId && '(Primary)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scoring & Duration Config */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Exam Timing & Scoring Parameters
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Duration (mins)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Negative Mark
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min={0}
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-amber-400">Requires Pro Pass (Paid)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                >
                  {editingTest ? 'Save Configuration' : 'Create Draft Test'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-Publish Validation Checklist Modal */}
      {isPublishModalOpen && testToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Pre-Publish Validation Checklist
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">{testToPublish.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exam: {testToPublish.examTitle || testToPublish.examId} • Duration:{' '}
                  {testToPublish.durationMinutes}m
                </p>
              </div>

              {isValidating ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Running strict exam engine integrity checks...</p>
                </div>
              ) : validationResult ? (
                <div className="space-y-3">
                  {validationResult.isValid ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        All Integrity Checks Passed!
                      </div>
                      <p className="text-[11px] text-emerald-300">
                        This test meets all requirements: valid exam assignment, valid duration,
                        total marks &gt; 0, and all assigned questions have complete options and
                        verified answer keys.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <AlertCircle className="w-4 h-4" />
                        Cannot Publish: Blocking Errors Found
                      </div>
                      <ul className="list-disc list-inside text-xs text-rose-300 space-y-1">
                        {validationResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                      <div className="pt-2">
                        <Link
                          to={`/admin/tests/${testToPublish.id}/questions`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline"
                          onClick={() => setIsPublishModalOpen(false)}
                        >
                          → Open Question Manager to fix questions
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {publishMessage && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    publishMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {publishMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Close
                </Button>
                {validationResult?.isValid && !publishMessage && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirmPublish}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                  >
                    Confirm & Publish to Students
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {isArchiveModalOpen && testToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-400" />
              Archive Mock Test?
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Are you sure you want to archive{' '}
              <span className="font-bold text-white">{testToArchive.title}</span>?
            </p>
            <p className="text-[11px] text-slate-400 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Archived tests are removed from the student catalog and new attempts cannot be
              started. However, all existing student attempts, scores, and analytics are permanently
              preserved.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsArchiveModalOpen(false)}
                className="border-slate-700 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmArchive}
                className="bg-amber-600 hover:bg-amber-700 text-xs font-bold"
              >
                Archive Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
