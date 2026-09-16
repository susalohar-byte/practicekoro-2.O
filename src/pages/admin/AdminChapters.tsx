import { getErrorMessage } from '@/lib/errors';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  FolderTree,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  Search,
  Layers,
  Filter,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { Chapter, Subject, Exam } from '@/types';

export const AdminChapters: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allExams, allSubjects, allChapters] = await Promise.all([
        api.getAllAdminExams(),
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(selectedSubjectId || undefined),
      ]);
      setExams(allExams);
      setSubjects(allSubjects);
      setChapters(allChapters);
    } catch (err) {
      console.error('Error loading chapters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When exam filter changes, auto-filter subjects
  const availableSubjects = selectedExamId
    ? subjects.filter((s) => !s.examId || s.examId === selectedExamId)
    : subjects;

  const openCreateModal = () => {
    setEditingChapter(null);
    const initialSubjectId = selectedSubjectId || availableSubjects[0]?.id || '';
    setSubjectId(initialSubjectId);
    setName('');
    setSlug('');
    setDescription('');
    setOrderIndex(chapters.length + 1);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setSubjectId(chapter.subjectId);
    setName(chapter.name);
    setSlug(chapter.slug);
    setDescription(chapter.description || '');
    setOrderIndex(chapter.orderIndex);
    setIsActive(chapter.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingChapter) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Chapter name is required.');
      return;
    }
    if (!subjectId) {
      setFormError('Parent Subject must be selected.');
      return;
    }

    try {
      if (editingChapter) {
        await api.updateChapter(editingChapter.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          orderIndex: Number(orderIndex),
          isActive,
        });
      } else {
        await api.createChapter({
          subjectId,
          name: name.trim(),
          slug:
            slug.trim() ||
            name
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          description: description.trim() || undefined,
          orderIndex: Number(orderIndex),
          isActive,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save chapter'));
    }
  };

  const handleToggleActive = async (chapter: Chapter) => {
    try {
      await api.updateChapter(chapter.id, { isActive: !chapter.isActive });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!chapterToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await api.deleteChapter(chapterToDelete.id);
      setChapterToDelete(null);
      await loadData();
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete chapter'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredChapters = chapters.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const parentSubject = subjects.find((s) => s.id === c.subjectId);
    const matchesExam =
      !selectedExamId ||
      (parentSubject && (!parentSubject.examId || parentSubject.examId === selectedExamId));
    const matchesSubject = !selectedSubjectId || c.subjectId === selectedSubjectId;

    return matchesSearch && matchesExam && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs: Subjects & Topics */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <Link
          to="/admin/subjects"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Subjects ({subjects.length})
        </Link>
        <Link
          to="/admin/topics"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
        >
          <FolderTree className="w-3.5 h-3.5" />
          Topics & Chapters ({chapters.length})
        </Link>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FolderTree className="w-6 h-6 text-blue-400" />
              Chapters Management (Topic Modules)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {chapters.length} Chapters
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chapters break subjects into study topics (e.g. Indus Valley Civilization, Vedic Age,
            Mughal Empire).
          </p>
        </div>

        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add New Chapter
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setSelectedSubjectId('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Subjects</option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Chapter Title</th>
                <th className="p-4">Parent Subject & Exam</th>
                <th className="p-4">Tests</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading chapters...
                  </td>
                </tr>
              ) : filteredChapters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No chapters found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredChapters.map((chap) => {
                  const parentSubject = subjects.find((s) => s.id === chap.subjectId);
                  const parentExam = parentSubject
                    ? exams.find((e) => e.id === parentSubject.examId)
                    : null;
                  return (
                    <tr key={chap.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            <FolderTree className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{chap.name}</p>
                            <p className="text-[11px] font-mono text-slate-500">{chap.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-emerald-400">
                            {parentSubject?.name || chap.subjectId}
                          </p>
                          <p className="text-[10px] text-indigo-400 font-medium">
                            {parentExam ? parentExam.title : 'All Exams'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-slate-300 font-semibold">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          {chap.testsCount ?? 0} Tests
                        </span>
                      </td>
                      <td className="p-4 font-bold text-indigo-400">#{chap.orderIndex}</td>
                      <td className="p-4">
                        {chap.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(chap)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Chapter"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(chap)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              chap.isActive
                                ? 'text-emerald-400 hover:text-amber-400 hover:bg-amber-500/10'
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={chap.isActive ? 'Deactivate Chapter' : 'Activate Chapter'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError('');
                              setChapterToDelete(chap);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Chapter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
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

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Parent Subject *
                </label>
                <select
                  disabled={Boolean(editingChapter)}
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.examId ? `(${s.examId})` : '(All Exams)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indus Valley Civilization (সিন্ধু সভ্যতা)"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. indus-valley-civilization"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Topic summary and key exam focus points"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Active Chapter</span>
                  </label>
                </div>
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
                  {editingChapter ? 'Save Changes' : 'Create Chapter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {chapterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Chapter</h3>
                <p className="text-xs text-slate-400">
                  This action will remove the chapter permanently.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 mb-4">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-300 mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{chapterToDelete.name}"</strong>?
              {chapterToDelete.testsCount && chapterToDelete.testsCount > 0 ? (
                <span className="block mt-1 text-amber-400">
                  ⚠️ This chapter has {chapterToDelete.testsCount} test(s) that may be affected.
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  setChapterToDelete(null);
                  setDeleteError('');
                }}
                className="border-slate-700 text-xs text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Delete Chapter'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
