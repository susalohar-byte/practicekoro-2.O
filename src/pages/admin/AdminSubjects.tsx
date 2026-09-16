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
} from 'lucide-react';
import type { Subject, Chapter, Question } from '@/types';
import { getErrorMessage } from '@/lib/errors';

export const AdminSubjects: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [subjectSearch, setSubjectSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [topicFilterStatus, setTopicFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subOrderIndex, setSubOrderIndex] = useState(1);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subError, setSubError] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Topic (Chapter) Modal State
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

  // Fetch all curriculum data (subjects, chapters, and questions for count aggregation)
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

      // Auto-select first subject if none selected or if previous selected is no longer present
      setSelectedSubjectId((prev) => {
        if (prev && allSubjects.some((s) => s.id === prev)) {
          return prev;
        }
        return allSubjects[0]?.id || '';
      });
    } catch (err) {
      console.error('Error loading curriculum data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute question counts per topic dynamically from questions in Question Bank
  const topicQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      const topicId = q.topicId || q.chapterId;
      if (topicId) {
        counts[topicId] = (counts[topicId] || 0) + 1;
      }
    });
    return counts;
  }, [questions]);

  // Compute question counts per subject
  const subjectQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      if (q.subjectId) {
        counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
      } else {
        const topicId = q.topicId || q.chapterId;
        if (topicId) {
          const parentChapter = chapters.find((c) => c.id === topicId);
          if (parentChapter?.subjectId) {
            counts[parentChapter.subjectId] = (counts[parentChapter.subjectId] || 0) + 1;
          }
        }
      }
    });
    return counts;
  }, [questions, chapters]);

  // Compute topic count per subject
  const subjectTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chapters.forEach((c) => {
      if (c.subjectId) {
        counts[c.subjectId] = (counts[c.subjectId] || 0) + 1;
      }
    });
    return counts;
  }, [chapters]);

  // Active selected subject entity
  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || null;
  }, [subjects, selectedSubjectId]);

  // Filtered subjects for left panel
  const filteredSubjects = useMemo(() => {
    const term = subjectSearch.toLowerCase().trim();
    if (!term) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.slug.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
    );
  }, [subjects, subjectSearch]);

  // Topics for selected subject, with filter & search
  const filteredTopics = useMemo(() => {
    if (!selectedSubject) return [];
    let list = chapters.filter((c) => c.subjectId === selectedSubject.id);

    if (topicFilterStatus === 'active') {
      list = list.filter((c) => c.isActive);
    } else if (topicFilterStatus === 'inactive') {
      list = list.filter((c) => !c.isActive);
    }

    const term = topicSearch.toLowerCase().trim();
    if (term) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term))
      );
    }

    return list.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [chapters, selectedSubject, topicFilterStatus, topicSearch]);

  // Total questions count in the active subject
  const activeSubjectTotalQuestions = useMemo(() => {
    if (!selectedSubject) return 0;
    return subjectQuestionCounts[selectedSubject.id] || 0;
  }, [selectedSubject, subjectQuestionCounts]);

  // ---------------------------------------------------------------------------
  // Subject CRUD Handlers
  // ---------------------------------------------------------------------------
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

  const handleSubNameChange = (val: string) => {
    setSubName(val);
    if (!editingSubject) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSubSlug(generated);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      setSubError('Subject name is required.');
      return;
    }
    if (!subSlug.trim()) {
      setSubError('Subject slug is required.');
      return;
    }

    try {
      setIsSavingSubject(true);
      setSubError('');
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, {
          name: subName.trim(),
          slug: subSlug.trim(),
          description: subDescription.trim() || undefined,
          iconName: 'BookOpen',
          orderIndex: Number(subOrderIndex),
          isActive: subIsActive,
        });
      } else {
        const created = await api.createSubject({
          name: subName.trim(),
          slug: subSlug.trim(),
          description: subDescription.trim() || undefined,
          iconName: 'BookOpen',
          orderIndex: Number(subOrderIndex),
          isActive: subIsActive,
        });
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
      `Are you sure you want to delete subject "${sub.name}"?\n\nWarning: Topics belonging to this subject will also be affected.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await api.deleteSubject(sub.id);
      if (selectedSubjectId === sub.id) {
        const remaining = subjects.filter((s) => s.id !== sub.id);
        setSelectedSubjectId(remaining[0]?.id || '');
      }
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete subject'));
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Topic (Chapter) CRUD Handlers
  // ---------------------------------------------------------------------------
  const openCreateTopicModal = () => {
    setEditingTopic(null);
    setTopicSubjectId(selectedSubject?.id || subjects[0]?.id || '');
    setTopicName('');
    setTopicSlug('');
    setTopicDescription('');
    setTopicOrderIndex(filteredTopics.length + 1);
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
    if (!editingTopic) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setTopicSlug(generated);
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      setTopicError('Topic name is required.');
      return;
    }
    if (!topicSubjectId) {
      setTopicError('Parent subject must be selected.');
      return;
    }

    try {
      setIsSavingTopic(true);
      setTopicError('');
      if (editingTopic) {
        await api.updateChapter(editingTopic.id, {
          name: topicName.trim(),
          slug: topicSlug.trim() || undefined,
          description: topicDescription.trim() || undefined,
          orderIndex: Number(topicOrderIndex),
          isActive: topicIsActive,
        });
      } else {
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
      `Are you sure you want to delete topic "${topic.name}"?\n\nWarning: Associated tests and question references may be affected.`
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Subjects & Topics Management
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage syllabus hierarchy: select a subject on the left to inspect its topics and
                live question counts from the Question Bank.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold shadow-lg shadow-indigo-600/25"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateSubjectModal}
          >
            Add Subject
          </Button>

          {selectedSubject && (
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 text-xs font-bold"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openCreateTopicModal}
            >
              Add Topic to {selectedSubject.name.split(' ')[0]}
            </Button>
          )}
        </div>
      </div>

      {/* Main Master-Detail 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Subjects Master List (lg:col-span-4)                   */}
        {/* =================================================================== */}
        <div className="lg:col-span-4 space-y-3">
          {/* Subjects Card Container */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Header with Search */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Subjects List
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {subjects.length}
                  </span>
                </div>
                <button
                  onClick={openCreateSubjectModal}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              </div>

              {/* Search Subjects */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Subjects List Items */}
            <div className="divide-y divide-slate-800/60 max-h-[calc(100vh-280px)] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading subjects...</p>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">No subjects found</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Try adjusting your search query.
                  </p>
                </div>
              ) : (
                filteredSubjects.map((sub) => {
                  const isSelected = selectedSubject?.id === sub.id;
                  const topicCount = subjectTopicCounts[sub.id] || 0;
                  const qCount = subjectQuestionCounts[sub.id] || 0;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`group p-3.5 cursor-pointer transition-all relative flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-900/60 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Top Row: Name and Selection Arrow */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-slate-900 text-slate-400 group-hover:text-white group-hover:bg-slate-800 border border-slate-800'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h3
                              className={`text-xs font-bold truncate leading-tight transition-colors ${
                                isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                              }`}
                            >
                              {sub.name}
                            </h3>
                            <p className="text-[10px] font-mono text-slate-500 truncate">
                              /{sub.slug}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected
                              ? 'text-indigo-400 translate-x-0.5'
                              : 'text-slate-600 group-hover:text-slate-400'
                          }`}
                        />
                      </div>

                      {/* Middle Row: Metrics Badges */}
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        {/* Topics Count */}
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                            isSelected
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <FolderTree className="w-3 h-3 text-blue-400" />
                          {topicCount} Topics
                        </span>

                        {/* Questions Count from Question Bank */}
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <HelpCircle className="w-3 h-3 text-indigo-400" />
                          {qCount} Questions
                        </span>

                        {/* Active Status */}
                        {sub.isActive ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-400 ml-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 ml-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Quick In-place Subject Actions */}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-800/40 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleToggleSubjectActive(sub, e)}
                          title={sub.isActive ? 'Deactivate subject' : 'Activate subject'}
                          className={`p-1 rounded-md text-[10px] transition-colors ${
                            sub.isActive
                              ? 'text-emerald-400 hover:text-amber-400 hover:bg-slate-800'
                              : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                          }`}
                        >
                          {sub.isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => openEditSubjectModal(sub, e)}
                          title="Edit subject"
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSubject(sub, e)}
                          title="Delete subject"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Topics & Questions Detail View (lg:col-span-8)         */}
        {/* =================================================================== */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSubject ? (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
              {/* Selected Subject Overview Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Selected Subject
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        #{selectedSubject.orderIndex}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      {selectedSubject.name}
                    </h2>
                    {selectedSubject.description && (
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        {selectedSubject.description}
                      </p>
                    )}
                  </div>

                  {/* Summary Metric Counters for this Subject */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[80px]">
                      <p className="text-xs font-black text-blue-400">
                        {filteredTopics.length} / {subjectTopicCounts[selectedSubject.id] || 0}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                        Topics
                      </p>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
                      <p className="text-xs font-black text-emerald-400">
                        {activeSubjectTotalQuestions}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                        Total Questions
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={openCreateTopicModal}
                    >
                      Add Topic
                    </Button>
                  </div>
                </div>
              </div>

              {/* Topics Filter & Search Bar */}
              <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={`Search topics in ${selectedSubject.name.split(' ')[0]}...`}
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      onClick={() => setTopicFilterStatus('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        topicFilterStatus === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Topics
                    </button>
                    <button
                      onClick={() => setTopicFilterStatus('active')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        topicFilterStatus === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setTopicFilterStatus('inactive')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        topicFilterStatus === 'inactive'
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              {/* Topics List with Dynamic Question Counts */}
              <div className="p-4 space-y-3">
                {filteredTopics.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <FolderTree className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">No topics found</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        There are no topics under &quot;{selectedSubject.name}&quot; matching your
                        filter. Click below to add the first topic module.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={openCreateTopicModal}
                    >
                      Create First Topic
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredTopics.map((topic) => {
                      const questionCount = topicQuestionCounts[topic.id] || 0;

                      return (
                        <div
                          key={topic.id}
                          className="group p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                        >
                          {/* Topic Details */}
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Order Index Pill */}
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              #{topic.orderIndex}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                  {topic.name}
                                </h4>

                                {topic.isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                    Inactive
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                                {topic.description || (
                                  <span className="text-slate-600 italic">
                                    No description provided for this topic module.
                                  </span>
                                )}
                              </p>

                              <p className="text-[10px] font-mono text-slate-500">
                                Slug: /{topic.slug}
                              </p>
                            </div>
                          </div>

                          {/* Stat Badge & Actions */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                            {/* DYNAMIC QUESTION COUNT STAT BADGE (Core user request) */}
                            <div
                              title={`${questionCount} questions uploaded in Question Bank for this topic`}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                questionCount > 0
                                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800'
                              }`}
                            >
                              <HelpCircle
                                className={`w-3.5 h-3.5 ${
                                  questionCount > 0 ? 'text-indigo-400' : 'text-slate-500'
                                }`}
                              />
                              <span>{questionCount} Questions</span>
                            </div>

                            {/* View in Question Bank Link Button */}
                            <button
                              onClick={() => navigateToTopicQuestions(selectedSubject.id, topic.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                              title="Inspect questions for this topic in Question Bank"
                            >
                              <span>Questions</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            {/* In-place Topic Action Buttons */}
                            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                              <button
                                onClick={() => handleToggleTopicActive(topic)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  topic.isActive
                                    ? 'text-emerald-400 hover:text-amber-400 hover:bg-slate-800'
                                    : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                                }`}
                                title={topic.isActive ? 'Deactivate Topic' : 'Activate Topic'}
                              >
                                {topic.isActive ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() => openEditTopicModal(topic)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Edit Topic"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteTopic(topic)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                title="Delete Topic"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-bold text-white">No subject selected</p>
              <p className="text-xs text-slate-500 mt-1">
                Select a subject on the left or create one to view topics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL: Add / Edit Subject                                           */}
      {/* =================================================================== */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              {subError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{subError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian History (ভারত ও বাংলার ইতিহাস)"
                  value={subName}
                  onChange={(e) => handleSubNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. indian-history"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of syllabus domain"
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
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
                    value={subOrderIndex}
                    onChange={(e) => setSubOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={subIsActive}
                      onChange={(e) => setSubIsActive(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Active Subject</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingSubject}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold disabled:opacity-50"
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
      )}

      {/* =================================================================== */}
      {/* MODAL: Add / Edit Topic (Chapter)                                   */}
      {/* =================================================================== */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </h3>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-4">
              {topicError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{topicError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Parent Subject *
                </label>
                <select
                  value={topicSubjectId}
                  onChange={(e) => setTopicSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indus Valley Civilization (সিন্ধু সভ্যতা)"
                  value={topicName}
                  onChange={(e) => handleTopicNameChange(e.target.value)}
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
                  value={topicSlug}
                  onChange={(e) => setTopicSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description / Key Topics
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of subtopics covered"
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
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
                    value={topicOrderIndex}
                    onChange={(e) => setTopicOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={topicIsActive}
                      onChange={(e) => setTopicIsActive(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Active Topic</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="border-slate-700 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingTopic}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold disabled:opacity-50"
                >
                  {isSavingTopic ? 'Saving...' : editingTopic ? 'Save Changes' : 'Create Topic'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
