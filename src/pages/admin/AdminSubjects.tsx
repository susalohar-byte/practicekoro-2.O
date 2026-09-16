import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import {
  BookOpen,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  AlertCircle,
  SlidersHorizontal,
  RefreshCw,
  Hash,
} from 'lucide-react';
import type { Subject, Chapter, Question } from '@/types';
import { getErrorMessage } from '@/lib/errors';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const AdminSubjects: React.FC = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [subjectSearch, setSubjectSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [topicFilterStatus, setTopicFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subOrderIndex, setSubOrderIndex] = useState(1);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subError, setSubError] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Chapter | null>(null);
  const [topicSubjectId, setTopicSubjectId] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicSlug, setTopicSlug] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicOrderIndex, setTopicOrderIndex] = useState(1);
  const [topicIsActive, setTopicIsActive] = useState(true);
  const [topicError, setTopicError] = useState('');
  const [isSavingTopic, setIsSavingTopic] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      const [allSubjects, allChapters, allQuestions] = await Promise.all([
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAllAdminQuestions(),
      ]);

      setSubjects(allSubjects);
      setChapters(allChapters);
      setQuestions(allQuestions);
      setSelectedSubjectId((prev) =>
        prev && allSubjects.some((s) => s.id === prev)
          ? prev
          : allSubjects[0]?.id || ''
      );
    } catch (err) {
      console.error('Error loading curriculum data:', err);
      setLoadError(getErrorMessage(err, 'Failed to load subjects and topics'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const topicQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      const topicId = q.topicId || q.chapterId;
      if (topicId) counts[topicId] = (counts[topicId] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const subjectQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      if (q.subjectId) {
        counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
        return;
      }
      const topicId = q.topicId || q.chapterId;
      if (!topicId) return;
      const parentChapter = chapters.find((c) => c.id === topicId);
      if (parentChapter?.subjectId) {
        counts[parentChapter.subjectId] =
          (counts[parentChapter.subjectId] || 0) + 1;
      }
    });
    return counts;
  }, [questions, chapters]);

  const subjectTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chapters.forEach((c) => {
      if (c.subjectId) counts[c.subjectId] = (counts[c.subjectId] || 0) + 1;
    });
    return counts;
  }, [chapters]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || null,
    [subjects, selectedSubjectId]
  );

  const filteredSubjects = useMemo(() => {
    const term = subjectSearch.toLowerCase().trim();
    const list = !term
      ? subjects
      : subjects.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.slug.toLowerCase().includes(term) ||
            Boolean(s.description?.toLowerCase().includes(term))
        );
    return [...list].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [subjects, subjectSearch]);

  const selectedSubjectTopics = useMemo(() => {
    if (!selectedSubject) return [];
    return chapters
      .filter((c) => c.subjectId === selectedSubject.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [chapters, selectedSubject]);

  const filteredTopics = useMemo(() => {
    const term = topicSearch.toLowerCase().trim();
    let list = selectedSubjectTopics;

    if (topicFilterStatus === 'active') list = list.filter((c) => c.isActive);
    if (topicFilterStatus === 'inactive') list = list.filter((c) => !c.isActive);

    if (term) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term) ||
          Boolean(c.description?.toLowerCase().includes(term))
      );
    }

    return list;
  }, [selectedSubjectTopics, topicFilterStatus, topicSearch]);

  const activeSubjectTotalQuestions = selectedSubject
    ? subjectQuestionCounts[selectedSubject.id] || 0
    : 0;

  const openCreateSubjectModal = () => {
    setEditingSubject(null);
    setSubName('');
    setSubSlug('');
    setSubDescription('');
    setSubOrderIndex(subjects.length + 1);
    setSubIsActive(true);
    setSubError('');
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (sub: Subject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSubject(sub);
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubDescription(sub.description || '');
    setSubOrderIndex(sub.orderIndex);
    setSubIsActive(sub.isActive);
    setSubError('');
    setIsSubjectModalOpen(true);
  };

  const handleSubNameChange = (value: string) => {
    setSubName(value);
    if (!editingSubject) setSubSlug(slugify(value));
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return setSubError('Subject name is required.');
    if (!subSlug.trim()) return setSubError('Subject slug is required.');

    try {
      setIsSavingSubject(true);
      setSubError('');
      const payload = {
        name: subName.trim(),
        slug: subSlug.trim(),
        description: subDescription.trim() || undefined,
        iconName: 'BookOpen',
        orderIndex: Number(subOrderIndex),
        isActive: subIsActive,
      };

      if (editingSubject) {
        await api.updateSubject(editingSubject.id, payload);
        setSelectedSubjectId(editingSubject.id);
      } else {
        const created = await api.createSubject(payload);
        setSelectedSubjectId(created.id);
      }

      setIsSubjectModalOpen(false);
      await loadData();
    } catch (err) {
      setSubError(getErrorMessage(err, 'Failed to save subject'));
    } finally {
      setIsSavingSubject(false);
    }
  };

  const handleToggleSubjectActive = async (sub: Subject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.updateSubject(sub.id, { isActive: !sub.isActive });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle subject status:', err);
    }
  };

  const handleDeleteSubject = async (sub: Subject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const confirmed = window.confirm(
      `Delete subject "${sub.name}"?\n\nTopics belonging to this subject may also be affected.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await api.deleteSubject(sub.id);
      setSelectedSubjectId((prev) => (prev === sub.id ? '' : prev));
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete subject'));
      setIsLoading(false);
    }
  };

  const openCreateTopicModal = () => {
    setEditingTopic(null);
    setTopicSubjectId(selectedSubject?.id || subjects[0]?.id || '');
    setTopicName('');
    setTopicSlug('');
    setTopicDescription('');
    setTopicOrderIndex(selectedSubjectTopics.length + 1);
    setTopicIsActive(true);
    setTopicError('');
    setIsTopicModalOpen(true);
  };

  const openEditTopicModal = (topic: Chapter) => {
    setEditingTopic(topic);
    setTopicSubjectId(topic.subjectId);
    setTopicName(topic.name);
    setTopicSlug(topic.slug);
    setTopicDescription(topic.description || '');
    setTopicOrderIndex(topic.orderIndex);
    setTopicIsActive(topic.isActive);
    setTopicError('');
    setIsTopicModalOpen(true);
  };

  const handleTopicNameChange = (value: string) => {
    setTopicName(value);
    if (!editingTopic) setTopicSlug(slugify(value));
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return setTopicError('Topic name is required.');
    if (!topicSubjectId) return setTopicError('Parent subject must be selected.');

    try {
      setIsSavingTopic(true);
      setTopicError('');
      if (editingTopic) {
        await api.updateChapter(editingTopic.id, {
          name: topicName.trim(),
          slug: topicSlug.trim() || slugify(topicName),
          description: topicDescription.trim() || undefined,
          orderIndex: Number(topicOrderIndex),
          isActive: topicIsActive,
        });
      } else {
        await api.createChapter({
          subjectId: topicSubjectId,
          name: topicName.trim(),
          slug: topicSlug.trim() || slugify(topicName),
          description: topicDescription.trim() || undefined,
          orderIndex: Number(topicOrderIndex),
          isActive: topicIsActive,
        });
      }
      setIsTopicModalOpen(false);
      await loadData();
    } catch (err) {
      setTopicError(getErrorMessage(err, 'Failed to save topic'));
    } finally {
      setIsSavingTopic(false);
    }
  };

  const handleToggleTopicActive = async (topic: Chapter) => {
    try {
      await api.updateChapter(topic.id, { isActive: !topic.isActive });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle topic status:', err);
    }
  };

  const handleDeleteTopic = async (topic: Chapter) => {
    const confirmed = window.confirm(
      `Delete topic "${topic.name}"?\n\nAssociated tests and question references may be affected.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await api.deleteChapter(topic.id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete topic'));
      setIsLoading(false);
    }
  };

  const navigateToTopicQuestions = (subjectId: string, topicId: string) => {
    navigate(`/admin/question-bank?source=topic&subjectId=${subjectId}&topicId=${topicId}`);
  };

  return (
    <div className="min-h-full space-y-5 bg-slate-950 text-white">
      <div className="sticky top-0 z-10 -mx-1 bg-slate-950/95 px-1 py-1 backdrop-blur">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 xl:flex-row xl:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">
                  Curriculum CMS
                </p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Subjects & Topics
                </h1>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-xs text-slate-400">
              Organize your syllabus, manage active modules, and jump straight into topic questions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={loadData}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={openCreateSubjectModal}
            >
              Add Subject
            </Button>
            {selectedSubject && (
              <Button
                size="sm"
                className="bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={openCreateTopicModal}
              >
                Add Topic
              </Button>
            )}
          </div>
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-rose-300">Unable to load curriculum</p>
            <p className="mt-0.5 text-xs text-rose-200/70">{loadError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subjects</span>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black">{subjects.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {subjects.filter((s) => s.isActive).length} active
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Topics</span>
            <FolderTree className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black">{chapters.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {chapters.filter((c) => c.isActive).length} active
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Questions</span>
            <HelpCircle className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black">{questions.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Across the question bank</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Selected</span>
            <Hash className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 truncate text-sm font-black">
            {selectedSubject?.name || 'None selected'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {activeSubjectTotalQuestions} questions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 lg:col-span-4 xl:col-span-3">
          <div className="space-y-3 border-b border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black">Subjects</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Select one to manage topics</p>
              </div>
              <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300">
                {filteredSubjects.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                placeholder="Search subjects..."
                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-9 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {subjectSearch && (
                <button
                  onClick={() => setSubjectSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[640px] space-y-1.5 overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading...</div>
            ) : filteredSubjects.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="mx-auto h-6 w-6 text-slate-700" />
                <p className="mt-2 text-xs font-bold text-slate-400">No subjects found</p>
                <button
                  onClick={openCreateSubjectModal}
                  className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Create a subject
                </button>
              </div>
            ) : (
              filteredSubjects.map((sub) => {
                const selected = selectedSubject?.id === sub.id;
                const topicCount = subjectTopicCounts[sub.id] || 0;
                const qCount = subjectQuestionCounts[sub.id] || 0;

                return (
                  <div
                    key={sub.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSubjectId(sub.id);
                      }
                    }}
                    className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? 'border-indigo-500/30 bg-indigo-500/10 ring-1 ring-indigo-500/10'
                        : 'border-transparent hover:border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white">{sub.name}</p>
                            <p className="mt-0.5 truncate font-mono text-[10px] text-slate-600">
                              /{sub.slug}
                            </p>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 shrink-0 ${
                              selected ? 'text-indigo-400' : 'text-slate-700'
                            }`}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[9px] text-slate-400">
                            {topicCount} topics
                          </span>
                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[9px] text-slate-400">
                            {qCount} questions
                          </span>
                          <span
                            className={`ml-auto inline-flex items-center gap-1 text-[9px] font-bold ${
                              sub.isActive ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                sub.isActive ? 'bg-emerald-400' : 'bg-slate-500'
                              }`}
                            />
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selected && (
                      <div className="mt-3 flex items-center justify-end gap-1 border-t border-indigo-500/10 pt-2">
                        <button
                          onClick={(e) => handleToggleSubjectActive(sub, e)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-amber-300"
                          title="Toggle status"
                        >
                          {sub.isActive ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => openEditSubjectModal(sub, e)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
                          title="Edit subject"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSubject(sub, e)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                          title="Delete subject"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 lg:col-span-8 xl:col-span-9">
          {!selectedSubject ? (
            <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-bold">Select a subject</p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Choose a subject from the left to view and manage its topics.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-800 bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                        Selected subject
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          selectedSubject.isActive ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {selectedSubject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h2 className="mt-2 truncate text-xl font-black sm:text-2xl">
                      {selectedSubject.name}
                    </h2>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      /{selectedSubject.slug}
                    </p>
                    {selectedSubject.description && (
                      <p className="mt-2 max-w-2xl text-xs text-slate-400">
                        {selectedSubject.description}
                      </p>
                    )}
                  </div>
                  <div className="grid shrink-0 grid-cols-3 gap-2">
                    <div className="min-w-[86px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-center">
                      <p className="text-sm font-black text-white">{selectedSubjectTopics.length}</p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Topics
                      </p>
                    </div>
                    <div className="min-w-[86px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-center">
                      <p className="text-sm font-black text-emerald-400">
                        {selectedSubjectTopics.filter((t) => t.isActive).length}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Active
                      </p>
                    </div>
                    <div className="min-w-[96px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-center">
                      <p className="text-sm font-black text-blue-400">
                        {activeSubjectTotalQuestions}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-800 bg-slate-950/40 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      placeholder={`Search topics in ${selectedSubject.name}...`}
                      className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-9 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    {topicSearch && (
                      <button
                        onClick={() => setTopicSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
                    {(['all', 'active', 'inactive'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setTopicFilterStatus(status)}
                        className={`h-8 rounded-lg px-3 text-[10px] font-bold capitalize ${
                          topicFilterStatus === status
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {status === 'all' ? 'All' : status}
                      </button>
                    ))}
                  </div>
                  <button
                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-[10px] font-bold text-slate-500"
                    title="Topic filters are applied instantly"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 p-3 sm:p-4">
                {filteredTopics.length === 0 ? (
                  <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-8 text-center">
                    <div>
                      <FolderTree className="mx-auto h-8 w-8 text-slate-700" />
                      <p className="mt-3 text-sm font-bold text-slate-300">No topics found</p>
                      <p className="mt-1 max-w-sm text-xs text-slate-500">
                        Try another search/filter or create a new topic for this subject.
                      </p>
                      <Button
                        size="sm"
                        className="mt-4 bg-indigo-600 hover:bg-indigo-500"
                        leftIcon={<Plus className="h-4 w-4" />}
                        onClick={openCreateTopicModal}
                      >
                        Create Topic
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredTopics.map((topic) => {
                    const questionCount = topicQuestionCounts[topic.id] || 0;
                    return (
                      <div
                        key={topic.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 transition-colors hover:border-slate-700 hover:bg-slate-950 sm:p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-black text-indigo-400">
                              #{topic.orderIndex}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-bold">{topic.name}</h3>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                                    topic.isActive
                                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                      : 'border-slate-700 bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {topic.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="mt-1 font-mono text-[10px] text-slate-600">/{topic.slug}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {topic.description || 'No description provided.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 self-start xl:flex-nowrap xl:self-center">
                            <div
                              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${
                                questionCount
                                  ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
                                  : 'border-slate-800 bg-slate-900 text-slate-600'
                              }`}
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                              {questionCount} Questions
                            </div>
                            <button
                              onClick={() => navigateToTopicQuestions(selectedSubject.id, topic.id)}
                              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 text-[10px] font-bold text-slate-300 transition-colors hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                            >
                              Open bank <ExternalLink className="h-3 w-3" />
                            </button>
                            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                              <button
                                onClick={() => handleToggleTopicActive(topic)}
                                title={topic.isActive ? 'Deactivate topic' : 'Activate topic'}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-emerald-300"
                              >
                                {topic.isActive ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => openEditTopicModal(topic)}
                                title="Edit topic"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic)}
                                title="Delete topic"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubjectSubmit}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Subject</p>
                <h2 className="mt-1 text-lg font-black">
                  {editingSubject ? 'Edit subject' : 'Create subject'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="text-[11px] font-bold text-slate-300">Name</label>
                <input
                  autoFocus
                  value={subName}
                  onChange={(e) => handleSubNameChange(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="e.g. History"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300">Slug</label>
                <input
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 font-mono text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="history"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Description <span className="font-normal text-slate-600">(optional)</span>
                </label>
                <textarea
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Order</label>
                  <input
                    type="number"
                    min={1}
                    value={subOrderIndex}
                    onChange={(e) => setSubOrderIndex(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Status</label>
                  <button
                    type="button"
                    onClick={() => setSubIsActive((v) => !v)}
                    className={`mt-1.5 h-10 w-full rounded-xl border text-xs font-bold ${
                      subIsActive
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    {subIsActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              {subError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                  {subError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-800 bg-slate-950/40 p-4">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 bg-slate-900"
                onClick={() => setIsSubjectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500"
                disabled={isSavingSubject}
              >
                {isSavingSubject
                  ? 'Saving...'
                  : editingSubject
                    ? 'Save changes'
                    : 'Create subject'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleTopicSubmit}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Topic</p>
                <h2 className="mt-1 text-lg font-black">
                  {editingTopic ? 'Edit topic' : 'Create topic'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {!editingTopic && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Parent subject</label>
                  <select
                    value={topicSubjectId}
                    onChange={(e) => setTopicSubjectId(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold text-slate-300">Name</label>
                <input
                  autoFocus
                  value={topicName}
                  onChange={(e) => handleTopicNameChange(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="e.g. Ancient India"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Slug <span className="font-normal text-slate-600">(optional)</span>
                </label>
                <input
                  value={topicSlug}
                  onChange={(e) => setTopicSlug(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 font-mono text-xs"
                  placeholder="ancient-india"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Description <span className="font-normal text-slate-600">(optional)</span>
                </label>
                <textarea
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs"
                  placeholder="Short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Order</label>
                  <input
                    type="number"
                    min={1}
                    value={topicOrderIndex}
                    onChange={(e) => setTopicOrderIndex(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Status</label>
                  <button
                    type="button"
                    onClick={() => setTopicIsActive((v) => !v)}
                    className={`mt-1.5 h-10 w-full rounded-xl border text-xs font-bold ${
                      topicIsActive
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    {topicIsActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              {topicError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
                  {topicError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-800 bg-slate-950/40 p-4">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 bg-slate-900"
                onClick={() => setIsTopicModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500"
                disabled={isSavingTopic}
              >
                {isSavingTopic
                  ? 'Saving...'
                  : editingTopic
                    ? 'Save changes'
                    : 'Create topic'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
