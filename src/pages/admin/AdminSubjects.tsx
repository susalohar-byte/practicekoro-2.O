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
  Search,
  X,
  ChevronDown,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  Power,
} from 'lucide-react';
import type { Subject, Chapter, Question } from '@/types';
import { getErrorMessage } from '@/lib/errors';

/* ─── Helpers ─────────────────────────────────────────────── */

const GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-indigo-600',
];

function pickGradient(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function initial(name: string) {
  return name.trim() ? name.trim().charAt(0).toUpperCase() : '?';
}

/* ─── Component ───────────────────────────────────────────── */

export const AdminSubjects: React.FC = () => {
  const navigate = useNavigate();

  /* ── Data ─────────── */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ── UI ───────────── */
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /* ── Subject Modal ── */
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subOrderIndex, setSubOrderIndex] = useState(1);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subError, setSubError] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  /* ── Topic Modal ──── */
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

  /* ── Fetch ───────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allSubjects, allChapters, allQuestions] = await Promise.all([
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAllAdminQuestions(),
      ]);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setQuestions(allQuestions);
    } catch (err) {
      console.error('Error loading curriculum data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Derived ─────────────────────────────────────── */
  const topicQuestionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    questions.forEach((q) => {
      const id = q.topicId || q.chapterId;
      if (id) c[id] = (c[id] || 0) + 1;
    });
    return c;
  }, [questions]);

  const subjectQuestionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    questions.forEach((q) => {
      if (q.subjectId) c[q.subjectId] = (c[q.subjectId] || 0) + 1;
      else {
        const id = q.topicId || q.chapterId;
        const parent = chapters.find((ch) => ch.id === id);
        if (parent?.subjectId) c[parent.subjectId] = (c[parent.subjectId] || 0) + 1;
      }
    });
    return c;
  }, [questions, chapters]);

  const subjectTopicCounts = useMemo(() => {
    const c: Record<string, number> = {};
    chapters.forEach((ch) => {
      if (ch.subjectId) c[ch.subjectId] = (c[ch.subjectId] || 0) + 1;
    });
    return c;
  }, [chapters]);

  const filteredSubjects = useMemo(() => {
    const t = search.toLowerCase().trim();
    if (!t) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(t) ||
        s.slug.toLowerCase().includes(t) ||
        (s.description || '').toLowerCase().includes(t)
    );
  }, [subjects, search]);

  /* ── Toggle expand ───────────────────────────────── */
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  /* ── Subject CRUD ────────────────────────────────── */
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

  const openEditSubjectModal = (sub: Subject, e?: React.SyntheticEvent) => {
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

  const handleSubNameChange = (val: string) => {
    setSubName(val);
    if (!editingSubject)
      setSubSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return setSubError('Subject name is required.');
    if (!subSlug.trim()) return setSubError('Subject slug is required.');
    try {
      setIsSavingSubject(true);
      setSubError('');
      if (editingSubject)
        await api.updateSubject(editingSubject.id, {
          name: subName.trim(),
          slug: subSlug.trim(),
          description: subDescription.trim() || undefined,
          iconName: 'BookOpen',
          orderIndex: Number(subOrderIndex),
          isActive: subIsActive,
        });
      else
        await api.createSubject({
          name: subName.trim(),
          slug: subSlug.trim(),
          description: subDescription.trim() || undefined,
          iconName: 'BookOpen',
          orderIndex: Number(subOrderIndex),
          isActive: subIsActive,
        });
      setIsSubjectModalOpen(false);
      await loadData();
    } catch (err) {
      setSubError(getErrorMessage(err, 'Failed to save subject'));
    } finally {
      setIsSavingSubject(false);
    }
  };

  const handleToggleSubjectActive = async (sub: Subject, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    try {
      await api.updateSubject(sub.id, { isActive: !sub.isActive });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (sub: Subject, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (
      !window.confirm(
        `Delete subject "${sub.name}"?\n\nTopics belonging to this subject may also be affected.`
      )
    )
      return;
    try {
      setIsLoading(true);
      await api.deleteSubject(sub.id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete subject'));
      setIsLoading(false);
    }
  };

  /* ── Topic CRUD ──────────────────────────────────── */
  const openCreateTopicModal = (parentSubjectId: string) => {
    setEditingTopic(null);
    setTopicSubjectId(parentSubjectId);
    setTopicName('');
    setTopicSlug('');
    setTopicDescription('');
    const existingTopics = chapters.filter((c) => c.subjectId === parentSubjectId);
    setTopicOrderIndex(existingTopics.length + 1);
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

  const handleTopicNameChange = (val: string) => {
    setTopicName(val);
    if (!editingTopic)
      setTopicSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return setTopicError('Topic name is required.');
    if (!topicSubjectId) return setTopicError('Parent subject must be selected.');
    try {
      setIsSavingTopic(true);
      setTopicError('');
      if (editingTopic)
        await api.updateChapter(editingTopic.id, {
          name: topicName.trim(),
          slug: topicSlug.trim() || undefined,
          description: topicDescription.trim() || undefined,
          orderIndex: Number(topicOrderIndex),
          isActive: topicIsActive,
        });
      else
        await api.createChapter({
          subjectId: topicSubjectId,
          name: topicName.trim(),
          slug:
            topicSlug.trim() ||
            topicName
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          description: topicDescription.trim() || undefined,
          orderIndex: Number(topicOrderIndex),
          isActive: topicIsActive,
        });
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
      console.error(err);
    }
  };

  const handleDeleteTopic = async (topic: Chapter) => {
    if (
      !window.confirm(
        `Delete topic "${topic.name}"?\n\nAssociated question references may be affected.`
      )
    )
      return;
    try {
      setIsLoading(true);
      await api.deleteChapter(topic.id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete topic'));
      setIsLoading(false);
    }
  };

  const navigateToTopicQuestions = (subjectId: string, topicId: string) =>
    navigate(`/admin/question-bank?source=topic&subjectId=${subjectId}&topicId=${topicId}`);

  /* ── Shared classes ──────────────────────────────── */
  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-colors font-medium';

  /* ══════════════════════════════════════════════════
     R E N D E R
     ══════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">
      {/* ── Page Header ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Subjects & Topics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subjects.length} subjects · {chapters.length} topics · {questions.length} questions
          </p>
        </div>

        <Button
          onClick={openCreateSubjectModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {/* ── Search ────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects…"
          className={`${inputCls} pl-10 text-xs`}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Subject List ──────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 animate-pulse bg-white dark:bg-[#0a1226]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-[#0a1226]">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">
            {search ? 'No matching subjects' : 'No subjects yet'}
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {search ? 'Try a different search term.' : 'Create your first subject to get started.'}
          </p>
          {!search && (
            <Button
              size="sm"
              onClick={openCreateSubjectModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubjects.map((sub) => {
            const isExpanded = expandedIds.has(sub.id);
            const topicCount = subjectTopicCounts[sub.id] || 0;
            const qCount = subjectQuestionCounts[sub.id] || 0;
            const subTopics = chapters
              .filter((c) => c.subjectId === sub.id)
              .sort((a, b) => a.orderIndex - b.orderIndex);

            return (
              <div
                key={sub.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0a1226] shadow-xs overflow-hidden transition-all"
              >
                {/* Subject Row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(sub.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpand(sub.id)}
                  className="flex items-center gap-3.5 p-4 cursor-pointer select-none hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${pickGradient(sub.id)} text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs`}
                  >
                    {initial(sub.name)}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0a1226] ${
                        sub.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {sub.name}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          sub.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {sub.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FolderTree className="w-3 h-3" /> {topicCount} topics
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> {qCount} questions
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleSubjectActive(sub, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title={sub.isActive ? 'Pause' : 'Activate'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => openEditSubjectModal(sub, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSubject(sub, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Expanded Topics */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                    {/* Topics Header */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-indigo-500" />
                        Topics ({subTopics.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => openCreateTopicModal(sub.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Add Topic
                      </button>
                    </div>

                    {/* Topic Rows */}
                    {subTopics.length === 0 ? (
                      <div className="px-4 pb-4">
                        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
                          <FolderTree className="w-5 h-5 mx-auto text-slate-400" />
                          <p className="text-xs text-slate-500 mt-2">
                            No topics yet. Add the first topic for {sub.name}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 pb-3 space-y-1.5">
                        {subTopics.map((topic, idx) => {
                          const tqCount = topicQuestionCounts[topic.id] || 0;
                          return (
                            <div
                              key={topic.id}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                topic.isActive
                                  ? 'bg-white dark:bg-[#0a1226] border border-slate-200/80 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                                  : 'bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 opacity-70'
                              }`}
                            >
                              {/* Index */}
                              <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {topic.name}
                                  </span>
                                  <span
                                    className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                                      topic.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <HelpCircle className="w-2.5 h-2.5" /> {tqCount} questions
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => navigateToTopicQuestions(sub.id, topic.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                  title="View Questions"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTopicActive(topic)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                  title={topic.isActive ? 'Pause' : 'Activate'}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditTopicModal(topic)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTopic(topic)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          S U B J E C T   M O D A L
         ══════════════════════════════════════════ */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0a1226] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="h-1 bg-indigo-600" />
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingSubject ? 'Edit Subject' : 'New Subject'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  aria-label="Close"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubjectSubmit} className="mt-5 space-y-4">
                {subError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {subError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject Name *
                  </label>
                  <input
                    required
                    value={subName}
                    onChange={(e) => handleSubNameChange(e.target.value)}
                    placeholder="e.g. Indian History"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    required
                    value={subSlug}
                    onChange={(e) => setSubSlug(e.target.value)}
                    placeholder="indian-history"
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                    placeholder="What does this subject cover?"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={subOrderIndex}
                      onChange={(e) => setSubOrderIndex(parseInt(e.target.value) || 1)}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Status
                    </span>
                    <button
                      type="button"
                      onClick={() => setSubIsActive((v) => !v)}
                      aria-pressed={subIsActive}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                        subIsActive
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500'
                      }`}
                    >
                      <span className="text-xs font-bold">{subIsActive ? 'Active' : 'Paused'}</span>
                      <span
                        className={`w-8 h-5 rounded-full p-0.5 transition-colors ${
                          subIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            subIsActive ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubjectModalOpen(false)}
                    className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingSubject}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    {isSavingSubject
                      ? 'Saving...'
                      : editingSubject
                        ? 'Save Changes'
                        : 'Create Subject'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          T O P I C   M O D A L
         ══════════════════════════════════════════ */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0a1226] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="h-1 bg-emerald-600" />
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingTopic ? 'Edit Topic' : 'New Topic'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  aria-label="Close"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTopicSubmit} className="mt-5 space-y-4">
                {topicError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {topicError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Parent Subject
                  </label>
                  <select
                    value={topicSubjectId}
                    onChange={(e) => setTopicSubjectId(e.target.value)}
                    className={inputCls}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Topic Name *
                  </label>
                  <input
                    required
                    value={topicName}
                    onChange={(e) => handleTopicNameChange(e.target.value)}
                    placeholder="e.g. Indus Valley Civilization"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    value={topicSlug}
                    onChange={(e) => setTopicSlug(e.target.value)}
                    placeholder="indus-valley-civilization"
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    placeholder="What does this topic cover?"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={topicOrderIndex}
                      onChange={(e) => setTopicOrderIndex(parseInt(e.target.value) || 1)}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Status
                    </span>
                    <button
                      type="button"
                      onClick={() => setTopicIsActive((v) => !v)}
                      aria-pressed={topicIsActive}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                        topicIsActive
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500'
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {topicIsActive ? 'Active' : 'Paused'}
                      </span>
                      <span
                        className={`w-8 h-5 rounded-full p-0.5 transition-colors ${
                          topicIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            topicIsActive ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTopicModalOpen(false)}
                    className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingTopic}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    {isSavingTopic ? 'Saving...' : editingTopic ? 'Save Changes' : 'Create Topic'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
