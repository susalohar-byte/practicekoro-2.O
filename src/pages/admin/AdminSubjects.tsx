import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { BookOpen, FolderTree, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, X, ChevronRight, HelpCircle, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import type { Subject, Chapter, Question } from '@/types';
import { getErrorMessage } from '@/lib/errors';

export const AdminSubjects: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [topicFilterStatus, setTopicFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

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
      const [allSubjects, allChapters, allQuestions] = await Promise.all([api.getAllAdminSubjects(), api.getAllAdminChapters(), api.getAllAdminQuestions()]);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setQuestions(allQuestions);
      setSelectedSubjectId(prev => prev && allSubjects.some(s => s.id === prev) ? prev : allSubjects[0]?.id || '');
    } catch (err) {
      console.error('Error loading curriculum data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const topicQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => { const id = q.topicId || q.chapterId; if (id) counts[id] = (counts[id] || 0) + 1; });
    return counts;
  }, [questions]);

  const subjectQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      if (q.subjectId) counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
      else {
        const id = q.topicId || q.chapterId;
        const parent = chapters.find(c => c.id === id);
        if (parent?.subjectId) counts[parent.subjectId] = (counts[parent.subjectId] || 0) + 1;
      }
    });
    return counts;
  }, [questions, chapters]);

  const subjectTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chapters.forEach(c => { if (c.subjectId) counts[c.subjectId] = (counts[c.subjectId] || 0) + 1; });
    return counts;
  }, [chapters]);

  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId) || subjects[0] || null, [subjects, selectedSubjectId]);
  const filteredSubjects = useMemo(() => {
    const term = subjectSearch.toLowerCase().trim();
    return term ? subjects.filter(s => s.name.toLowerCase().includes(term) || s.slug.toLowerCase().includes(term) || (s.description || '').toLowerCase().includes(term)) : subjects;
  }, [subjects, subjectSearch]);
  const filteredTopics = useMemo(() => {
    if (!selectedSubject) return [];
    let list = chapters.filter(c => c.subjectId === selectedSubject.id);
    if (topicFilterStatus === 'active') list = list.filter(c => c.isActive);
    if (topicFilterStatus === 'inactive') list = list.filter(c => !c.isActive);
    const term = topicSearch.toLowerCase().trim();
    if (term) list = list.filter(c => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term) || (c.description || '').toLowerCase().includes(term));
    return [...list].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [chapters, selectedSubject, topicFilterStatus, topicSearch]);
  const activeSubjectTotalQuestions = selectedSubject ? subjectQuestionCounts[selectedSubject.id] || 0 : 0;
  const activeSubjectActiveTopics = selectedSubject ? chapters.filter(c => c.subjectId === selectedSubject.id && c.isActive).length : 0;

  const openCreateSubjectModal = () => { setEditingSubject(null); setSubName(''); setSubSlug(''); setSubDescription(''); setSubOrderIndex(subjects.length + 1); setSubIsActive(true); setSubError(''); setIsSubjectModalOpen(true); };
  const openEditSubjectModal = (sub: Subject, e?: React.MouseEvent) => { e?.stopPropagation(); setEditingSubject(sub); setSubName(sub.name); setSubSlug(sub.slug); setSubDescription(sub.description || ''); setSubOrderIndex(sub.orderIndex); setSubIsActive(sub.isActive); setSubError(''); setIsSubjectModalOpen(true); };
  const handleSubNameChange = (val: string) => { setSubName(val); if (!editingSubject) setSubSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); };
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return setSubError('Subject name is required.');
    if (!subSlug.trim()) return setSubError('Subject slug is required.');
    try {
      setIsSavingSubject(true); setSubError('');
      if (editingSubject) await api.updateSubject(editingSubject.id, { name: subName.trim(), slug: subSlug.trim(), description: subDescription.trim() || undefined, iconName: 'BookOpen', orderIndex: Number(subOrderIndex), isActive: subIsActive });
      else { const created = await api.createSubject({ name: subName.trim(), slug: subSlug.trim(), description: subDescription.trim() || undefined, iconName: 'BookOpen', orderIndex: Number(subOrderIndex), isActive: subIsActive }); setSelectedSubjectId(created.id); }
      setIsSubjectModalOpen(false); await loadData();
    } catch (err) { setSubError(getErrorMessage(err, 'Failed to save subject')); } finally { setIsSavingSubject(false); }
  };
  const handleToggleSubjectActive = async (sub: Subject, e?: React.MouseEvent) => { e?.stopPropagation(); try { await api.updateSubject(sub.id, { isActive: !sub.isActive }); await loadData(); } catch (err) { console.error(err); } };
  const handleDeleteSubject = async (sub: Subject, e?: React.MouseEvent) => { e?.stopPropagation(); if (!window.confirm(`Delete subject "${sub.name}"?\n\nTopics belonging to this subject may also be affected.`)) return; try { setIsLoading(true); await api.deleteSubject(sub.id); await loadData(); } catch (err) { alert(getErrorMessage(err, 'Failed to delete subject')); setIsLoading(false); } };

  const openCreateTopicModal = () => { setEditingTopic(null); setTopicSubjectId(selectedSubject?.id || subjects[0]?.id || ''); setTopicName(''); setTopicSlug(''); setTopicDescription(''); setTopicOrderIndex(filteredTopics.length + 1); setTopicIsActive(true); setTopicError(''); setIsTopicModalOpen(true); };
  const openEditTopicModal = (topic: Chapter) => { setEditingTopic(topic); setTopicSubjectId(topic.subjectId); setTopicName(topic.name); setTopicSlug(topic.slug); setTopicDescription(topic.description || ''); setTopicOrderIndex(topic.orderIndex); setTopicIsActive(topic.isActive); setTopicError(''); setIsTopicModalOpen(true); };
  const handleTopicNameChange = (val: string) => { setTopicName(val); if (!editingTopic) setTopicSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); };
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return setTopicError('Topic name is required.');
    if (!topicSubjectId) return setTopicError('Parent subject must be selected.');
    try {
      setIsSavingTopic(true); setTopicError('');
      if (editingTopic) await api.updateChapter(editingTopic.id, { name: topicName.trim(), slug: topicSlug.trim() || undefined, description: topicDescription.trim() || undefined, orderIndex: Number(topicOrderIndex), isActive: topicIsActive });
      else await api.createChapter({ subjectId: topicSubjectId, name: topicName.trim(), slug: topicSlug.trim() || topicName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), description: topicDescription.trim() || undefined, orderIndex: Number(topicOrderIndex), isActive: topicIsActive });
      setIsTopicModalOpen(false); await loadData();
    } catch (err) { setTopicError(getErrorMessage(err, 'Failed to save topic')); } finally { setIsSavingTopic(false); }
  };
  const handleToggleTopicActive = async (topic: Chapter) => { try { await api.updateChapter(topic.id, { isActive: !topic.isActive }); await loadData(); } catch (err) { console.error(err); } };
  const handleDeleteTopic = async (topic: Chapter) => { if (!window.confirm(`Delete topic "${topic.name}"?\n\nAssociated question references may be affected.`)) return; try { setIsLoading(true); await api.deleteChapter(topic.id); await loadData(); } catch (err) { alert(getErrorMessage(err, 'Failed to delete topic')); setIsLoading(false); } };
  const navigateToTopicQuestions = (subjectId: string, topicId: string) => navigate(`/admin/question-bank?source=topic&subjectId=${subjectId}&topicId=${topicId}`);

  const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition';
  const cardClass = 'rounded-2xl border border-slate-800 bg-slate-950/95 shadow-sm';

  return <div className="space-y-6">
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-5 sm:p-7 shadow-xl shadow-black/10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25"><Sparkles className="w-6 h-6" /></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap"><h1 className="text-xl sm:text-2xl font-black text-white">Subjects & Topics</h1><span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">CURRICULUM</span></div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">এক জায়গা থেকে subject, topic এবং question count সহজে manage করুন।</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-600/20" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateSubjectModal}>Add Subject</Button>{selectedSubject && <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 font-bold" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateTopicModal}>Add Topic</Button>}</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[11px] text-slate-500 font-semibold">Subjects</p><p className="text-2xl font-black text-white mt-1">{subjects.length}</p></div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[11px] text-slate-500 font-semibold">Topics</p><p className="text-2xl font-black text-white mt-1">{chapters.length}</p></div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[11px] text-slate-500 font-semibold">Questions</p><p className="text-2xl font-black text-white mt-1">{questions.length}</p></div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[11px] text-slate-500 font-semibold">Active Subjects</p><p className="text-2xl font-black text-emerald-400 mt-1">{subjects.filter(s => s.isActive).length}</p></div>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      <section className="xl:col-span-4 space-y-4">
        <div className={`${cardClass} overflow-hidden`}>
          <div className="p-4 border-b border-slate-800 bg-slate-900/60"><div className="flex items-center justify-between mb-3"><div><h2 className="text-sm font-black text-white">Subjects</h2><p className="text-[11px] text-slate-500 mt-0.5">Choose a subject to view topics</p></div><span className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold">{subjects.length}</span></div><div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)} placeholder="Search subjects..." className={`${inputClass} pl-9`} /></div></div>
          <div className="p-2 max-h-[560px] overflow-y-auto">
            {isLoading ? <div className="p-8 text-center text-slate-400 text-sm">Loading...</div> : filteredSubjects.length === 0 ? <div className="p-8 text-center"><BookOpen className="w-8 h-8 mx-auto text-slate-600" /><p className="text-sm font-bold text-slate-300 mt-2">No subjects found</p></div> : filteredSubjects.map(sub => {
              const selected = selectedSubject?.id === sub.id; const topics = subjectTopicCounts[sub.id] || 0; const qCount = subjectQuestionCounts[sub.id] || 0;
              return <button key={sub.id} type="button" onClick={() => setSelectedSubjectId(sub.id)} className={`w-full text-left rounded-2xl p-3.5 mb-2 border transition-all ${selected ? 'bg-indigo-600/10 border-indigo-500/40 shadow-md shadow-indigo-950/20' : 'border-transparent hover:bg-slate-900 hover:border-slate-800'}`}>
                <div className="flex items-start gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}><BookOpen className="w-4 h-4" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className={`text-sm font-bold truncate ${selected ? 'text-white' : 'text-slate-200'}`}>{sub.name}</p><p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub.description || 'No description'}</p></div><ChevronRight className={`w-4 h-4 shrink-0 ${selected ? 'text-indigo-300' : 'text-slate-600'}`} /></div><div className="flex items-center gap-2 flex-wrap mt-2"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300"><FolderTree className="w-3 h-3 text-blue-400" />{topics} topics</span><span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300"><HelpCircle className="w-3 h-3 text-indigo-400" />{qCount} questions</span><span className={`ml-auto inline-flex items-center gap-1 text-[10px] font-semibold ${sub.isActive ? 'text-emerald-400' : 'text-slate-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />{sub.isActive ? 'Active' : 'Inactive'}</span></div></div></div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-white/5"><span onClick={e => handleToggleSubjectActive(sub, e)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer" title={sub.isActive ? 'Deactivate' : 'Activate'}>{sub.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</span><span onClick={e => openEditSubjectModal(sub, e)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></span><span onClick={e => handleDeleteSubject(sub, e)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></span></div>
              </button>;
            })}
          </div>
        </div>
      </section>

      <section className="xl:col-span-8">
        {selectedSubject ? <div className={`${cardClass} overflow-hidden`}>
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Active Subject</span></div><h2 className="text-2xl font-black text-white mt-1">{selectedSubject.name}</h2><p className="text-sm text-slate-400 mt-1 max-w-2xl">{selectedSubject.description || 'No description added yet.'}</p></div><div className="grid grid-cols-3 gap-2 shrink-0"><div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 min-w-[78px] text-center"><p className="text-lg font-black text-indigo-300">{subjectTopicCounts[selectedSubject.id] || 0}</p><p className="text-[9px] text-slate-500 font-bold uppercase">Topics</p></div><div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 min-w-[86px] text-center"><p className="text-lg font-black text-blue-300">{activeSubjectActiveTopics}</p><p className="text-[9px] text-slate-500 font-bold uppercase">Active</p></div><div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 min-w-[90px] text-center"><p className="text-lg font-black text-emerald-300">{activeSubjectTotalQuestions}</p><p className="text-[9px] text-slate-500 font-bold uppercase">Questions</p></div></div></div>
          </div>
          <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex flex-col md:flex-row gap-3 md:items-center md:justify-between"><div className="relative flex-1 max-w-xl"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={topicSearch} onChange={e => setTopicSearch(e.target.value)} placeholder={`Search topics in ${selectedSubject.name}...`} className={`${inputClass} pl-9`} /></div><div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 w-fit"><button type="button" onClick={() => setTopicFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${topicFilterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>All</button><button type="button" onClick={() => setTopicFilterStatus('active')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${topicFilterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Active</button><button type="button" onClick={() => setTopicFilterStatus('inactive')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${topicFilterStatus === 'inactive' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Inactive</button></div></div>
          <div className="p-4 space-y-2.5">
            {filteredTopics.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center"><FolderTree className="w-10 h-10 mx-auto text-slate-600" /><p className="text-sm font-bold text-white mt-2">No topics found</p><p className="text-xs text-slate-500 mt-1 mb-4">Add a topic to organise this subject.</p><Button size="sm" className="bg-indigo-600" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateTopicModal}>Add Topic</Button></div> : filteredTopics.map((topic, index) => {
              const qCount = topicQuestionCounts[topic.id] || 0;
              return <div key={topic.id} className="rounded-2xl border border-slate-800/90 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 transition-all p-4"><div className="flex flex-col md:flex-row md:items-center gap-4"><div className="flex items-start gap-3 min-w-0 flex-1"><div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">{index + 1}</div><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-bold text-white">{topic.name}</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${topic.isActive ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>{topic.isActive ? 'Active' : 'Inactive'}</span></div><p className="text-xs text-slate-500 mt-1 line-clamp-2">{topic.description || 'No description available.'}</p><div className="flex items-center gap-2 mt-2"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${qCount ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-slate-950 text-slate-500 border-slate-800'}`}><HelpCircle className="inline w-3 h-3 mr-1" />{qCount} questions</span><span className="text-[10px] text-slate-600">/{topic.slug}</span></div></div></div><div className="flex items-center gap-1.5 self-end md:self-center"><button type="button" onClick={() => navigateToTopicQuestions(selectedSubject.id, topic.id)} className="px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" />Questions</button><button type="button" onClick={() => handleToggleTopicActive(topic)} className="p-2 rounded-xl text-slate-500 hover:text-emerald-400 hover:bg-slate-800" title={topic.isActive ? 'Deactivate' : 'Activate'}>{topic.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</button><button type="button" onClick={() => openEditTopicModal(topic)} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800" title="Edit"><Edit2 className="w-4 h-4" /></button><button type="button" onClick={() => handleDeleteTopic(topic)} className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800" title="Delete"><Trash2 className="w-4 h-4" /></button></div></div></div>;
            })}
          </div>
        </div> : <div className={`${cardClass} p-10 text-center`}><BookOpen className="w-10 h-10 mx-auto text-slate-600" /><p className="text-sm font-bold text-white mt-2">Select a subject</p></div>}
      </section>
    </div>

    {isSubjectModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"><div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl"><div className="flex items-center justify-between pb-4 border-b border-slate-800"><div><h3 className="text-base font-black text-white">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3><p className="text-xs text-slate-500 mt-1">Keep the curriculum clean and easy to navigate.</p></div><button type="button" onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div><form onSubmit={handleSubjectSubmit} className="mt-5 space-y-4">{subError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{subError}</div>}<div><label className="block text-xs font-bold text-slate-300 mb-1.5">Subject Name *</label><input required value={subName} onChange={e => handleSubNameChange(e.target.value)} placeholder="e.g. Indian History" className={inputClass} /></div><div><label className="block text-xs font-bold text-slate-300 mb-1.5">URL Slug *</label><input required value={subSlug} onChange={e => setSubSlug(e.target.value)} placeholder="indian-history" className={inputClass} /></div><div><label className="block text-xs font-bold text-slate-300 mb-1.5">Description</label><textarea rows={3} value={subDescription} onChange={e => setSubDescription(e.target.value)} className={inputClass} /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-slate-300 mb-1.5">Display Order</label><input type="number" min={1} value={subOrderIndex} onChange={e => setSubOrderIndex(parseInt(e.target.value) || 1)} className={inputClass} /></div><label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 cursor-pointer"><input type="checkbox" checked={subIsActive} onChange={e => setSubIsActive(e.target.checked)} className="rounded border-slate-700 text-indigo-600" /><span className="text-xs font-bold text-slate-300">Active</span></label></div><div className="flex justify-end gap-2 pt-3 border-t border-slate-800"><Button type="button" variant="outline" size="sm" onClick={() => setIsSubjectModalOpen(false)} className="border-slate-700">Cancel</Button><Button type="submit" size="sm" disabled={isSavingSubject} className="bg-indigo-600">{isSavingSubject ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}</Button></div></form></div></div>}

    {isTopicModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"><div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl"><div className="flex items-center justify-between pb-4 border-b border-slate-800"><div><h3 className="text-base font-black text-white">{editingTopic ? 'Edit Topic' : 'Add Topic'}</h3><p className="text-xs text-slate-500 mt-1">Add a clear topic under the selected subject.</p></div><button type="button" onClick={() => setIsTopicModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div><form onSubmit={handleTopicSubmit} className="mt-5 space-y-4">{topicError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{topicError}</div>}<div><label className="block text-xs font-bold text-slate-300 mb-1.5">Parent Subject *</label><select value={topicSubjectId} onChange={e => setTopicSubjectId(e.target.value)} className={inputClass}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="block text-xs font-bold text-slate-300 mb-1.5">Topic Name *</label><input required value={topicName} onChange={e => handleTopicNameChange(e.target.value)} placeholder="e.g. Indus Valley Civilization" className={inputClass} /></div><div><label className="block text-xs font-bold text-slate-300 mb-1.5">URL Slug</label><input value={topicSlug} onChange={e => setTopicSlug(e.target.value)} placeholder="indus-valley-civilization" className={inputClass} /></div><div><label className="block text-xs font-bold text-slate-300 mb-1.5">Description</label><textarea rows={3} value={topicDescription} onChange={e => setTopicDescription(e.target.value)} className={inputClass} /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-slate-300 mb-1.5">Display Order</label><input type="number" min={1} value={topicOrderIndex} onChange={e => setTopicOrderIndex(parseInt(e.target.value) || 1)} className={inputClass} /></div><label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 cursor-pointer"><input type="checkbox" checked={topicIsActive} onChange={e => setTopicIsActive(e.target.checked)} className="rounded border-slate-700 text-indigo-600" /><span className="text-xs font-bold text-slate-300">Active</span></label></div><div className="flex justify-end gap-2 pt-3 border-t border-slate-800"><Button type="button" variant="outline" size="sm" onClick={() => setIsTopicModalOpen(false)} className="border-slate-700">Cancel</Button><Button type="submit" size="sm" disabled={isSavingTopic} className="bg-indigo-600">{isSavingTopic ? 'Saving...' : editingTopic ? 'Save Changes' : 'Create Topic'}</Button></div></form></div></div>}
  </div>;
};