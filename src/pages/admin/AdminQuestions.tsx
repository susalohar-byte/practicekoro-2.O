import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { FileQuestion, Plus, Edit2, Trash2, Search, Upload, X, Download } from 'lucide-react';
import type { Question, Subject, Chapter } from '@/types';
import { parseQuestionsCsv, CsvParseResult } from '@/utils/csvParser';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Question Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionBengaliText, setQuestionBengaliText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [explanationBengali, setExplanationBengali] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [defaultMarks, setDefaultMarks] = useState(1.0);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(0.25);
  const [formError, setFormError] = useState('');

  // Bulk CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [csvDefaultSubject, setCsvDefaultSubject] = useState('');
  const [csvDefaultChapter, setCsvDefaultChapter] = useState('');
  const [csvParseResult, setCsvParseResult] = useState<CsvParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allSubjects, allChapters, allQuestions] = await Promise.all([
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAllAdminQuestions({
          subjectId: selectedSubjectId || undefined,
          chapterId: selectedChapterId || undefined,
          difficulty: selectedDifficulty || undefined,
          status: selectedStatus || undefined,
          search: searchTerm || undefined,
        }),
      ]);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setQuestions(allQuestions);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectId, selectedChapterId, selectedDifficulty, selectedStatus, searchTerm]);

  // Modal cascaded chapters
  const modalChapters = subjectId ? chapters.filter((c) => c.subjectId === subjectId) : chapters;

  const openCreateModal = () => {
    setEditingQuestion(null);
    setSubjectId(selectedSubjectId || subjects[0]?.id || '');
    setChapterId(selectedChapterId || '');
    setQuestionText('');
    setQuestionBengaliText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('A');
    setExplanation('');
    setExplanationBengali('');
    setDifficulty('medium');
    setDefaultMarks(1.0);
    setDefaultNegativeMarks(0.25);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setSubjectId(q.subjectId || '');
    setChapterId(q.chapterId || '');
    setQuestionText(q.questionText);
    setQuestionBengaliText(q.questionBengaliText || '');
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectOption(q.correctOption);
    setExplanation(q.explanation || '');
    setExplanationBengali(q.explanationBengali || '');
    setDifficulty(q.difficulty);
    setDefaultMarks(q.defaultMarks);
    setDefaultNegativeMarks(q.defaultNegativeMarks);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setFormError('Question text is required.');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setFormError('All 4 options (A, B, C, D) are required.');
      return;
    }

    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, {
          subjectId: subjectId || undefined,
          chapterId: chapterId || undefined,
          questionText: questionText.trim(),
          questionBengaliText: questionBengaliText.trim() || undefined,
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionC: optionC.trim(),
          optionD: optionD.trim(),
          correctOption,
          explanation: explanation.trim() || undefined,
          explanationBengali: explanationBengali.trim() || undefined,
          difficulty,
          defaultMarks: Number(defaultMarks),
          defaultNegativeMarks: Number(defaultNegativeMarks),
        });
      } else {
        await api.createQuestion({
          subjectId: subjectId || undefined,
          chapterId: chapterId || undefined,
          questionText: questionText.trim(),
          questionBengaliText: questionBengaliText.trim() || undefined,
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionC: optionC.trim(),
          optionD: optionD.trim(),
          correctOption,
          explanation: explanation.trim() || undefined,
          explanationBengali: explanationBengali.trim() || undefined,
          difficulty,
          defaultMarks: Number(defaultMarks),
          defaultNegativeMarks: Number(defaultNegativeMarks),
          isActive: true,
          status: 'active',
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save question');
    }
  };

  const handleArchiveQuestion = async (q: Question) => {
    if (!confirm(`Archive question: "${q.questionText.slice(0, 40)}..."?`)) return;
    try {
      await api.archiveQuestion(q.id);
      await loadData();
    } catch (err) {
      console.error('Failed to archive question:', err);
    }
  };

  // CSV Import Handlers
  const openCsvModal = () => {
    setCsvContent('');
    setCsvDefaultSubject(selectedSubjectId || subjects[0]?.id || '');
    setCsvDefaultChapter(selectedChapterId || '');
    setCsvParseResult(null);
    setImportNotice(null);
    setIsCsvModalOpen(true);
  };

  const handleCsvChange = (text: string) => {
    setCsvContent(text);
    if (!text.trim()) {
      setCsvParseResult(null);
      return;
    }
    const result = parseQuestionsCsv(text, {
      defaultSubjectId: csvDefaultSubject,
      defaultChapterId: csvDefaultChapter,
    });
    setCsvParseResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleCsvChange(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteCsvImport = async () => {
    if (!csvContent.trim()) return;
    try {
      setIsImporting(true);
      setImportNotice(null);
      const res = await api.importQuestionsCSV(csvContent, csvDefaultSubject, csvDefaultChapter);
      setImportNotice({
        type: 'success',
        text: `Successfully imported ${res.successCount} questions into Question Bank!${
          res.errorCount > 0 ? ` (${res.errorCount} invalid rows were skipped)` : ''
        }`,
      });
      await loadData();
    } catch (err: any) {
      setImportNotice({ type: 'error', text: err.message || 'Import failed' });
    } finally {
      setIsImporting(false);
    }
  };

  const sampleCsvText = `question_text,question_bengali_text,option_a,option_b,option_c,option_d,correct_option,explanation,explanation_bengali,difficulty,marks,negative_marks
"Who founded the Maurya Empire in 322 BCE?","কে ৩২২ খ্রিস্টপূর্বাব্দে মৌর্য সাম্রাজ্য প্রতিষ্ঠা করেছিলেন?","Chandragupta Maurya","Bindusara","Ashoka the Great","Brihadratha","A","Chandragupta Maurya founded the Maurya Empire with Chanakya's guidance.","চাণক্যের সহায়তায় চন্দ্রগুপ্ত মৌর্য নন্দ বংশ ধ্বংস করে মৌর্য সাম্রাজ্য প্রতিষ্ঠা করেন।","easy",1.0,0.25
"Which Harappan site had an artificial tidal dockyard?","সিন্ধু সভ্যতার কোন স্থানে একটি কৃত্রিম পোতাশ্রয় ছিল?","Harappa","Lothal","Mohenjodaro","Kalibangan","B","Lothal in modern Gujarat had the world's earliest known tidal dockyard.","লোথাল গুজরাটের একটি প্রাচীন বন্দর নগরী ছিল।","medium",1.0,0.25`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'practicekoro_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileQuestion className="w-6 h-6 text-purple-400" />
              Centralized Question Bank
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {questions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized repository of bilingual questions, verified answer keys, and pedagogical
            explanations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-xs font-semibold text-slate-300"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={openCsvModal}
          >
            Bulk CSV Import
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add New Question
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search question text or explanations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
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
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Chapters</option>
              {(selectedSubjectId
                ? chapters.filter((c) => c.subjectId === selectedSubjectId)
                : chapters
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
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
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading questions bank...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No questions found matching filter.</p>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
              onClick={openCreateModal}
            >
              Add First Question
            </Button>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : q.difficulty === 'hard'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    +{q.defaultMarks} / -{q.defaultNegativeMarks} Marks
                  </span>
                  {q.subjectName && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {q.subjectName}
                    </span>
                  )}
                  {q.chapterName && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-400">
                      {q.chapterName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Correct: Option {q.correctOption}
                  </span>
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchiveQuestion(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                    title="Archive Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <p className="font-bold text-white text-sm leading-relaxed">{q.questionText}</p>
                {q.questionBengaliText && (
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    {q.questionBengaliText}
                  </p>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div
                  className={`p-2.5 rounded-xl border ${
                    q.correctOption === 'A'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono mr-1.5 opacity-60">A:</span> {q.optionA}
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    q.correctOption === 'B'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono mr-1.5 opacity-60">B:</span> {q.optionB}
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    q.correctOption === 'C'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono mr-1.5 opacity-60">C:</span> {q.optionC}
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    q.correctOption === 'D'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono mr-1.5 opacity-60">D:</span> {q.optionD}
                </div>
              </div>

              {/* Explanation */}
              {(q.explanation || q.explanationBengali) && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1 text-slate-400">
                  <span className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider block">
                    Verified Explanation:
                  </span>
                  {q.explanation && <p className="text-slate-300">{q.explanation}</p>}
                  {q.explanationBengali && (
                    <p className="text-slate-400 italic">{q.explanationBengali}</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-purple-400" />
                {editingQuestion ? 'Edit Question Details' : 'Add Question to Bank'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {formError}
                </div>
              )}

              {/* Subject & Chapter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="">None / General</option>
                    {subjects.map((s) => (
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
                    <option value="">None / General</option>
                    {modalChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Texts */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Question Text (English) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Who excavated the archaeological ruins of Harappa in 1921?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Question Text (Bengali)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. ১৯২১ সালে হরপ্পা প্রত্নক্ষেত্রটি কে আবিষ্কার করেছিলেন?"
                  value={questionBengaliText}
                  onChange={(e) => setQuestionBengaliText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Option A *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Option A content"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Option B *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Option B content"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Option C *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Option C content"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Option D *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Option D content"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Correct Option Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Correct Answer Key *
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCorrectOption(opt)}
                      className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                        correctOption === opt
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Option {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Explanation (English)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key rationale, context, or formula"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Explanation (Bengali)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="বাংলা ব্যাখ্যা"
                    value={explanationBengali}
                    onChange={(e) => setExplanationBengali(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Default Marks
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={defaultMarks}
                    onChange={(e) => setDefaultMarks(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Negative Mark
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={defaultNegativeMarks}
                    onChange={(e) => setDefaultNegativeMarks(parseFloat(e.target.value) || 0.25)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
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
                  {editingQuestion ? 'Save Changes' : 'Create Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  Bulk Questions CSV Import
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import multiple questions with instant syntax validation, live preview, and
                  duplicate safety.
                </p>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              {/* Defaults & Sample bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Fallback Subject
                  </label>
                  <select
                    value={csvDefaultSubject}
                    onChange={(e) => setCsvDefaultSubject(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Fallback Chapter
                  </label>
                  <select
                    value={csvDefaultChapter}
                    onChange={(e) => setCsvDefaultChapter(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleCsv}
                    className="w-full border-slate-700 text-xs text-slate-300 font-semibold"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Upload or Paste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Paste CSV Data or Choose File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                </div>

                <textarea
                  rows={5}
                  placeholder={`Paste CSV content with headers: question_text, option_a, option_b, option_c, option_d, correct_option...`}
                  value={csvContent}
                  onChange={(e) => handleCsvChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Live Validation Feedback */}
              {csvParseResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white">
                      Total Rows: {csvParseResult.totalRows}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Valid: {csvParseResult.validCount}
                    </span>
                    {csvParseResult.invalidCount > 0 && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Invalid: {csvParseResult.invalidCount}
                      </span>
                    )}
                  </div>

                  {/* Errors Summary */}
                  {csvParseResult.errors.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                      {csvParseResult.errors.map((e, idx) => (
                        <p key={idx}>{e}</p>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Row</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Question Text</th>
                          <th className="p-2.5">Key</th>
                          <th className="p-2.5">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {csvParseResult.parsedRows.slice(0, 8).map((r) => (
                          <tr
                            key={r.rowNumber}
                            className={r.isValid ? 'bg-slate-900/40' : 'bg-rose-950/20'}
                          >
                            <td className="p-2.5 font-bold">#{r.rowNumber}</td>
                            <td className="p-2.5">
                              {r.isValid ? (
                                <span className="text-emerald-400 font-bold">VALID</span>
                              ) : (
                                <span className="text-rose-400 font-bold">ERROR</span>
                              )}
                            </td>
                            <td className="p-2.5 font-sans font-medium line-clamp-1 max-w-xs">
                              {r.data.questionText || '<Missing>'}
                            </td>
                            <td className="p-2.5 text-indigo-400 font-bold">
                              {r.data.correctOption}
                            </td>
                            <td className="p-2.5 text-rose-400 font-sans text-[10px]">
                              {r.errors.join('; ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importNotice && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    importNotice.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {importNotice.text}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCsvModalOpen(false)}
                className="border-slate-700 text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleExecuteCsvImport}
                disabled={!csvParseResult || csvParseResult.validCount === 0 || isImporting}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
              >
                {isImporting
                  ? 'Importing Questions...'
                  : `Import ${csvParseResult?.validCount ?? 0} Valid Questions`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
