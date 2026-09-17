import { getErrorMessage } from '@/lib/errors';
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { FileQuestion, Plus, Edit2, Trash2, Search, Upload, X, Download } from 'lucide-react';
import type { Question, Subject, Chapter, Exam, MockTest } from '@/types';
import {
  parseQuestionsCsv,
  parseQuestionsText,
  validateExplanationBullets,
  normalizeExplanationBullets,
  CsvParseResult,
} from '@/utils/csvParser';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<'all' | 'topic' | 'pyq'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalQuestions / PAGE_SIZE));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [sourceType, setSourceType] = useState<'topic' | 'pyq'>('topic');
  const [ownerType, setOwnerType] = useState<'subject' | 'full_mock' | 'pyq'>('subject');
  const [ownerExams, setOwnerExams] = useState<Exam[]>([]);
  const [ownerTests, setOwnerTests] = useState<MockTest[]>([]);
  const [ownerExamId, setOwnerExamId] = useState('');
  const [ownerYear, setOwnerYear] = useState('');
  const [ownerTestId, setOwnerTestId] = useState('');
  const [sourceYear, setSourceYear] = useState('');
  const [sourceExam, setSourceExam] = useState('');
  const [sourcePaper, setSourcePaper] = useState('');
  const [sourceShift, setSourceShift] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionBengaliText, setQuestionBengaliText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [explanationBengali, setExplanationBengali] = useState('');
  const [defaultMarks, setDefaultMarks] = useState(1.0);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(0.25);
  const [formError, setFormError] = useState('');

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [csvDefaultSubject, setCsvDefaultSubject] = useState('');
  const [csvDefaultChapter, setCsvDefaultChapter] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'text'>('csv');
  const [csvParseResult, setCsvParseResult] = useState<CsvParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const normalizeAndValidateExplanation = (value: string, label: string) => {
    const normalized = normalizeExplanationBullets(value);
    const errors = validateExplanationBullets(normalized);
    if (errors.length > 0) {
      setFormError(`${label}: ${errors[0]}`);
      return null;
    }
    return normalized;
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allSubjects, allChapters, pageResult] = await Promise.all([
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAdminQuestionsPaged(
          {
            subjectId: selectedSubjectId || undefined,
            chapterId: selectedChapterId || undefined,
            sourceType: selectedSourceType !== 'all' ? selectedSourceType : undefined,
            search: searchTerm || undefined,
          },
          currentPage,
          PAGE_SIZE
        ),
      ]);
      setSubjects(allSubjects);
      setChapters(allChapters);
      setQuestions(pageResult.questions);
      setTotalQuestions(pageResult.total);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubjectId, selectedChapterId, selectedSourceType, searchTerm, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubjectId, selectedChapterId, selectedSourceType, searchTerm]);

  useEffect(() => {
    async function loadOwnerData() {
      try {
        const [examList, allTests] = await Promise.all([
          api.getAllAdminExams(),
          api.getAllAdminTests(),
        ]);
        setOwnerExams(examList);
        setOwnerTests(allTests);
      } catch (err) {
        console.error('Error loading upload destination data:', err);
      }
    }
    loadOwnerData();
  }, []);

  const modalChapters = subjectId ? chapters.filter((c) => c.subjectId === subjectId) : chapters;

  const ownerExamTests = ownerExamId
    ? ownerTests.filter(
        (t) =>
          t.examId === ownerExamId &&
          (ownerType === 'full_mock' ? t.testType === 'full_mock' : t.testType === 'pyq')
      )
    : [];
  const ownerYears = Array.from(
    new Set(ownerExamTests.map((t) => t.year).filter((y): y is number => !!y))
  ).sort((a, b) => b - a);
  const ownerPaperTests = ownerYear
    ? ownerExamTests.filter((t) => String(t.year) === ownerYear)
    : ownerExamTests;
  const selectedOwnerTest = ownerTests.find((t) => t.id === ownerTestId);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setOwnerType('subject');
    setOwnerExamId('');
    setOwnerYear('');
    setOwnerTestId('');
    setSubjectId(selectedSubjectId || subjects[0]?.id || '');
    setChapterId(selectedChapterId || '');
    setSourceType('topic');
    setSourceYear('');
    setSourceExam('');
    setSourcePaper('');
    setSourceShift('');
    setQuestionText('');
    setQuestionBengaliText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('A');
    setExplanation('');
    setExplanationBengali('');
    setDefaultMarks(1.0);
    setDefaultNegativeMarks(0.25);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setSubjectId(q.subjectId || '');
    setChapterId(q.chapterId || q.topicId || '');
    setSourceType(q.sourceType === 'pyq' ? 'pyq' : 'topic');
    setSourceYear(q.sourceYear ? String(q.sourceYear) : '');
    setSourceExam(q.sourceExam || '');
    setSourcePaper(q.sourcePaper || '');
    setSourceShift(q.sourceShift || '');
    setQuestionText(q.questionText);
    setQuestionBengaliText(q.questionBengaliText || '');
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectOption(q.correctOption);
    setExplanation(normalizeExplanationBullets(q.explanation));
    setExplanationBengali(normalizeExplanationBullets(q.explanationBengali));
    setDefaultMarks(q.defaultMarks);
    setDefaultNegativeMarks(q.defaultNegativeMarks);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!questionText.trim()) {
      setFormError('Question text is required.');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setFormError('All 4 options (A, B, C, D) are required.');
      return;
    }

    const normalizedExplanation = normalizeAndValidateExplanation(explanation, 'English explanation');
    if (!normalizedExplanation) return;
    const normalizedExplanationBengali = normalizeAndValidateExplanation(
      explanationBengali,
      'Bengali explanation'
    );
    if (!normalizedExplanationBengali) return;

    const sharedFields = {
      questionText: questionText.trim(),
      questionBengaliText: questionBengaliText.trim() || undefined,
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctOption,
      explanation: normalizedExplanation,
      explanationBengali: normalizedExplanationBengali,
      defaultMarks: Number(defaultMarks),
      defaultNegativeMarks: Number(defaultNegativeMarks),
    };

    try {
      if (!editingQuestion && ownerType !== 'subject') {
        if (!ownerTestId) {
          setFormError(
            ownerType === 'full_mock'
              ? 'Please select an Exam and a Full Mock Test.'
              : 'Please select an Exam, Year and Paper/Shift.'
          );
          return;
        }
        const res = await api.createQuestionForTest(ownerTestId, {
          ...sharedFields,
          difficulty: 'medium',
          isActive: true,
          status: 'active',
        });
        if (!res.success) {
          setFormError(res.error || 'Failed to upload question to the test.');
          return;
        }
        setIsModalOpen(false);
        await loadData();
        return;
      }

      const parsedYear =
        sourceType === 'pyq' && sourceYear.trim() ? parseInt(sourceYear.trim(), 10) : undefined;
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, {
          subjectId: subjectId || undefined,
          chapterId: chapterId || undefined,
          topicId: chapterId || undefined,
          difficulty: 'medium',
          sourceType,
          sourceYear: parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
          sourceExam: sourceType === 'pyq' && sourceExam.trim() ? sourceExam.trim() : undefined,
          sourcePaper: sourceType === 'pyq' && sourcePaper.trim() ? sourcePaper.trim() : undefined,
          sourceShift: sourceType === 'pyq' && sourceShift.trim() ? sourceShift.trim() : undefined,
          ...sharedFields,
        });
      } else {
        await api.createQuestion({
          subjectId: subjectId || undefined,
          chapterId: chapterId || undefined,
          topicId: chapterId || undefined,
          difficulty: 'medium',
          sourceType: 'topic',
          ...sharedFields,
          isActive: true,
          status: 'active',
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save question'));
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

  const openCsvModal = () => {
    setCsvContent('');
    setImportFormat('csv');
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
    const parserArgs = {
      defaultSubjectId: csvDefaultSubject,
      defaultChapterId: csvDefaultChapter,
    };
    const result =
      importFormat === 'text'
        ? parseQuestionsText(text, parserArgs)
        : parseQuestionsCsv(text, parserArgs);
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
      const importArgs = [csvDefaultSubject, csvDefaultChapter] as const;
      const res =
        importFormat === 'text'
          ? await api.importQuestionsText(csvContent, ...importArgs)
          : await api.importQuestionsCSV(csvContent, ...importArgs);
      setImportNotice({
        type: 'success',
        text: `Successfully imported ${res.successCount} questions into Question Bank!${
          res.errorCount > 0 ? ` (${res.errorCount} invalid rows were skipped)` : ''
        }`,
      });
      await loadData();
    } catch (err) {
      setImportNotice({ type: 'error', text: getErrorMessage(err, 'Import failed') });
    } finally {
      setIsImporting(false);
    }
  };

  const sampleCsvText = `question_text,question_bengali_text,option_a,option_b,option_c,option_d,correct_option,explanation,explanation_bengali,marks,negative_marks
"Who founded the Maurya Empire in 322 BCE?","কে ৩২২ খ্রিস্টপূর্বাব্দে মৌর্য সাম্রাজ্য প্রতিষ্ঠা করেছিলেন?","Chandragupta Maurya","Bindusara","Ashoka the Great","Brihadratha","A","• Chandragupta Maurya founded the Maurya Empire in 322 BCE.\\n• He overthrew the Nanda dynasty with Chanakya's guidance.\\n• Bindusara and Ashoka were later Mauryan rulers, not the founder.\\n• Remember the exam link: 322 BCE → Chandragupta Maurya → Maurya Empire.","• সঠিক উত্তর: চন্দ্রগুপ্ত মৌর্য।\\n• ৩২২ খ্রিস্টপূর্বাব্দে নন্দ বংশের পতনের পর মৌর্য সাম্রাজ্যের সূচনা হয়।\\n• চাণক্য বা কৌটিল্যের সহায়তার সঙ্গে চন্দ্রগুপ্তের উত্থান যুক্ত।\\n• বিন্দুসার ও অশোক পরবর্তী শাসক—তাঁরা প্রতিষ্ঠাতা নন।",1.0,0.25
"Which Harappan site had an artificial tidal dockyard?","সিন্ধু সভ্যতার কোন স্থানে একটি কৃত্রিম পোতাশ্রয় ছিল?","Harappa","Lothal","Mohenjodaro","Kalibangan","B","• Lothal was a major Harappan coastal trading centre in present-day Gujarat.\\n• Its dockyard-like structure is associated with maritime trade and tidal water management.\\n• Harappa and Mohenjo-daro were major urban centres, but the classic dockyard association is Lothal.\\n• Remember: Lothal → Gujarat → dockyard → maritime trade.","• সঠিক উত্তর: লোথাল।\\n• লোথাল বর্তমান গুজরাটে অবস্থিত গুরুত্বপূর্ণ হরপ্পা কেন্দ্র।\\n• ডকইয়ার্ড-সদৃশ কাঠামো থেকে সামুদ্রিক বাণিজ্য ও জোয়ারভাটা নিয়ন্ত্রণের ধারণা পাওয়া যায়।\\n• হরপ্পা ও মহেঞ্জোদারো বড় নগর হলেও ডকইয়ার্ডের সঙ্গে সবচেয়ে বেশি যুক্ত লোথাল।",1.0,0.25`;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileQuestion className="w-6 h-6 text-purple-400" />
              📚 Topic Questions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {questions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reusable Subject → Topic question library (no Exam required). Full Mock &amp; PYQ
            questions have their own upload pages:{' '}
            <span className="text-indigo-400 font-semibold">🎯 Full Mock Questions</span> and{' '}
            <span className="text-purple-400 font-semibold">📜 PYQ Questions</span> in the sidebar.
          </p>
          <p className="text-xs text-slate-500 mt-1">
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

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search question text or explanations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
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
          <div>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Topics / Chapters</option>
              {(selectedSubjectId ? chapters.filter((c) => c.subjectId === selectedSubjectId) : chapters).map(
                (c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Sources</option>
              <option value="topic">Topic Questions</option>
              <option value="pyq">PYQ (Previous Year)</option>
            </select>
          </div>
        </div>
      </div>

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
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    +{q.defaultMarks} / -{q.defaultNegativeMarks} Marks
                  </span>
                  {q.sourceType === 'pyq' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      📜 PYQ {q.sourceYear || ''} {q.sourceExam ? `• ${q.sourceExam}` : ''}{' '}
                      {q.sourceShift ? `(${q.sourceShift})` : ''}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      📚 Topic
                    </span>
                  )}
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

              <div className="space-y-1">
                <p className="font-bold text-white text-sm leading-relaxed">{q.questionText}</p>
                {q.questionBengaliText && (
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    {q.questionBengaliText}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const value = q[`option${opt}` as const];
                  return (
                    <div
                      key={opt}
                      className={`p-2.5 rounded-xl border ${
                        q.correctOption === opt
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-mono mr-1.5 opacity-60">{opt}:</span> {value}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">English Explanation</p>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {normalizeExplanationBullets(q.explanation) || 'No explanation'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">বাংলা ব্যাখ্যা</p>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {normalizeExplanationBullets(q.explanationBengali) || 'কোনও ব্যাখ্যা নেই'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <span className="text-[11px] text-slate-500">
          Page {currentPage} of {totalPages} · {totalQuestions} total questions
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-xs"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-xs"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-indigo-400" />
                  {editingQuestion ? 'Edit Question' : 'Add Question'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Explanation must contain 2-5 separate bullet points using important question and option-related facts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="py-4 space-y-4 overflow-y-auto flex-1">
              {/* Keep the existing destination/source/question/options controls here unchanged. */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                    <select
                      value={subjectId}
                      onChange={(e) => {
                        setSubjectId(e.target.value);
                        setChapterId('');
                      }}
                      disabled={!!editingQuestion && ownerType !== 'subject'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    >
                      <option value="">None / General</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Topic / Chapter</label>
                    <select
                      value={chapterId}
                      onChange={(e) => setChapterId(e.target.value)}
                      disabled={!subjectId}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    >
                      <option value="">None / General</option>
                      {modalChapters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {!editingQuestion && ownerType !== 'subject' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs font-bold text-slate-300">Upload destination</p>
                  <p className="text-[11px] text-slate-500 mt-1">Select the target mock/PYQ test from the existing destination controls.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Question Text (English) *</label>
                <textarea required rows={2} value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Question Text (Bengali)</label>
                <textarea rows={2} value={questionBengaliText} onChange={(e) => setQuestionBengaliText(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  ['A', optionA, setOptionA],
                  ['B', optionB, setOptionB],
                  ['C', optionC, setOptionC],
                  ['D', optionD, setOptionD],
                ] as const).map(([key, value, setter]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Option {key} *</label>
                    <input required value={value} onChange={(e) => setter(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Correct Answer Key *</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button key={opt} type="button" onClick={() => setCorrectOption(opt)} className={`py-2 rounded-xl font-bold text-xs border ${correctOption === opt ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                      Option {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-4">
                <div>
                  <p className="text-xs font-black text-white">Explanation / Notes format</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Write 2-5 separate bullet points. Every point should add an important fact connected to the question, correct answer, or confusing option/distractor. Avoid generic filler.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Explanation (English) *</label>
                    <span className="text-[10px] text-slate-500">2-5 bullets</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder={'• State the correct answer and why it is correct.\n• Add one important fact directly related to the question.\n• Clarify the key difference with a confusing option/distractor.\n• Add a memory hook or exam-relevant fact.'}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 whitespace-pre-line"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Explanation (Bengali) *</label>
                    <span className="text-[10px] text-slate-500">2-5 bullets</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder={'• সঠিক উত্তর এবং কেন সঠিক তা লিখুন।\n• প্রশ্নের সঙ্গে সরাসরি সম্পর্কিত একটি গুরুত্বপূর্ণ তথ্য দিন।\n• বিভ্রান্তিকর option/distractor-এর সঙ্গে পার্থক্য পরিষ্কার করুন।\n• পরীক্ষার জন্য মনে রাখার মতো গুরুত্বপূর্ণ তথ্য যোগ করুন।'}
                    value={explanationBengali}
                    onChange={(e) => setExplanationBengali(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 whitespace-pre-line"
                  />
                </div>
              </div>

              {formError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">{formError}</div>}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="border-slate-700 text-xs">Cancel</Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">{editingQuestion ? 'Save Changes' : 'Create Question'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2"><Upload className="w-4 h-4 text-indigo-400" />Bulk Questions Import</h3>
                <p className="text-xs text-slate-400 mt-0.5">Each imported question must contain 2-5 explanation bullets in English and Bengali.</p>
              </div>
              <button type="button" onClick={() => setIsCsvModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fallback Subject</label>
                  <select value={csvDefaultSubject} onChange={(e) => setCsvDefaultSubject(e.target.value)} className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <option value="">None</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fallback Chapter</label>
                  <select value={csvDefaultChapter} onChange={(e) => setCsvDefaultChapter(e.target.value)} className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <option value="">None</option>
                    {chapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end"><Button type="button" variant="outline" size="sm" onClick={downloadSampleCsv} className="w-full border-slate-700 text-xs text-slate-300 font-semibold" leftIcon={<Download className="w-3.5 h-3.5" />}>Download Template</Button></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Import Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setImportFormat('csv'); setCsvParseResult(null); }} className={`py-2 rounded-xl font-bold text-xs border ${importFormat === 'csv' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>📄 CSV (headers)</button>
                  <button type="button" onClick={() => { setImportFormat('text'); setCsvParseResult(null); }} className={`py-2 rounded-xl font-bold text-xs border ${importFormat === 'text' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>📝 Formatted Text</button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Explanation and Bengali explanation must each have 2-5 bullet points. Bullet markers may be written as -, •, * or numbered lines; they are normalized on import.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">{importFormat === 'text' ? 'Paste Formatted Questions' : 'Paste CSV Data or Choose File'}</label>
                  {importFormat === 'csv' && <input type="file" accept=".csv" onChange={handleFileUpload} className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white" />}
                </div>
                <textarea
                  rows={importFormat === 'text' ? 12 : 7}
                  placeholder={importFormat === 'text' ? `1. Question text?\n(a) Option A\n(b) Option B\n(c) Option C\n(d) Option D\nসঠিক উত্তর: (b)\n\nExplanation:\n- Correct-answer reason\n- Important question fact\n- Difference from confusing option\n- Exam-relevant memory point` : 'Paste CSV content with explanation and explanation_bengali columns containing 2-5 bullet points each.'}
                  value={csvContent}
                  onChange={(e) => handleCsvChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600"
                />
              </div>

              {csvParseResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white">Total Rows: {csvParseResult.totalRows}</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Valid: {csvParseResult.validCount}</span>
                    {csvParseResult.invalidCount > 0 && <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Invalid: {csvParseResult.invalidCount}</span>}
                  </div>
                  {csvParseResult.errors.length > 0 && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">{csvParseResult.errors.map((e, idx) => <p key={idx}>{e}</p>)}</div>}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800"><tr><th className="p-2.5">Row</th><th className="p-2.5">Status</th><th className="p-2.5">Question</th><th className="p-2.5">Key</th><th className="p-2.5">Explanation bullets</th><th className="p-2.5">Errors</th></tr></thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {csvParseResult.parsedRows.slice(0, 8).map((r) => {
                          const bullets = normalizeExplanationBullets(r.data.explanation).split('\n').filter(Boolean).length;
                          return (
                            <tr key={r.rowNumber} className={r.isValid ? 'bg-slate-900/40' : 'bg-rose-950/20'}>
                              <td className="p-2.5 font-bold">#{r.rowNumber}</td>
                              <td className="p-2.5">{r.isValid ? <span className="text-emerald-400 font-bold">VALID</span> : <span className="text-rose-400 font-bold">ERROR</span>}</td>
                              <td className="p-2.5 max-w-[320px] truncate">{r.data.questionText}</td>
                              <td className="p-2.5">{r.data.correctOption}</td>
                              <td className="p-2.5">{bullets}/5</td>
                              <td className="p-2.5 text-rose-300">{r.errors.join(' · ') || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold" disabled={isImporting || csvParseResult.validCount === 0} onClick={handleExecuteCsvImport}>{isImporting ? 'Importing...' : 'Import Valid Questions'}</Button>
                  </div>
                  {importNotice && <div className={`p-3 rounded-xl border text-xs ${importNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>{importNotice.text}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
