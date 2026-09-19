import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ShortNotesBox } from '@/components/common/ShortNotesBox';
import { isMathematicsQuestion } from '@/utils/shortNotes';
import { TopicTests } from '@/pages/student/TopicTests';
import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Play,
  Languages,
  RefreshCw,
  Trash2,
  Award,
} from 'lucide-react';
import type { MistakeItem, BookmarkItem, Question } from '@/types';

type PracticeTab = 'topics' | 'mistakes' | 'bookmarks';

interface PracticeAnswerRecord {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

export const Practice: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [activeTab, setActiveTab] = useState<PracticeTab>('topics');
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // List view state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Interactive Practice Session state
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [practiceSource, setPracticeSource] = useState<'mistakes' | 'bookmarks'>('mistakes');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [sessionAnswers, setSessionAnswers] = useState<PracticeAnswerRecord[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [languageMode, setLanguageMode] = useState<'bilingual' | 'english' | 'bengali'>(
    'bilingual'
  );
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Fetch mistakes and bookmarks
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [mList, bList] = await Promise.all([
        api.getMistakes(user.id),
        api.getBookmarks(user.id),
      ]);
      setMistakes(mList || []);
      setBookmarks(bList || []);
    } catch (err) {
      console.error('Failed to load practice data:', err);
      setError('Unable to load revision items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync active tab with URL (?tab=mistakes|bookmarks|topics) and
  // legacy/dedicated paths (/practice/mistakes, /practice/bookmarks).
  // This makes sidebar links like `/practice?tab=mistakes` open the
  // dedicated view instead of always falling back to Topic Tests.
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const pathSuffix = location.pathname.split('/').pop() || '';

    let nextTab: PracticeTab | null = null;
    if (tabParam === 'mistakes' || tabParam === 'bookmarks' || tabParam === 'topics') {
      nextTab = tabParam;
    } else if (pathSuffix === 'mistakes' || pathSuffix === 'bookmarks') {
      nextTab = pathSuffix;
    } else if (!tabParam && location.pathname.replace(/\/$/, '') === '/practice') {
      nextTab = 'topics';
    }

    if (nextTab) {
      setActiveTab((prev) => {
        if (prev !== nextTab) {
          setSelectedSubjectFilter('all');
          setExpandedId(null);
          setIsPracticing(false);
          setIsSessionComplete(false);
        }
        return nextTab as PracticeTab;
      });
    }
  }, [location.pathname, searchParams]);

  // Tab switcher that keeps the URL in sync so direct links,
  // refresh, and back/forward navigation preserve the dedicated view.
  const handleTabChange = useCallback(
    (tab: PracticeTab) => {
      setActiveTab(tab);
      setSelectedSubjectFilter('all');
      setExpandedId(null);
      setIsPracticing(false);
      setIsSessionComplete(false);
      if (tab === 'topics') {
        setSearchParams({}, { replace: false });
      } else {
        setSearchParams({ tab }, { replace: false });
      }
    },
    [setSearchParams]
  );

  // Derived metrics (strictly real data)
  const pendingMistakes = mistakes.filter((m) => !m.isResolved);
  const resolvedMistakes = mistakes.filter((m) => m.isResolved);

  // Available subjects for filtering
  const availableSubjects = useMemo(() => {
    const activeList =
      activeTab === 'mistakes' ? mistakes : activeTab === 'bookmarks' ? bookmarks : [];
    const set = new Set<string>();
    activeList.forEach((item) => {
      if (item.subjectName) set.add(item.subjectName);
    });
    return Array.from(set);
  }, [activeTab, mistakes, bookmarks]);

  // Filtered lists
  const filteredMistakes = useMemo(() => {
    if (selectedSubjectFilter === 'all') return mistakes;
    return mistakes.filter((m) => m.subjectName === selectedSubjectFilter);
  }, [mistakes, selectedSubjectFilter]);

  const filteredBookmarks = useMemo(() => {
    if (selectedSubjectFilter === 'all') return bookmarks;
    return bookmarks.filter((b) => b.subjectName === selectedSubjectFilter);
  }, [bookmarks, selectedSubjectFilter]);

  // Toggle question card expand in list view
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Toggle mistake resolution (persists to Supabase)
  const handleToggleResolve = async (mistakeId: string, currentResolvedState: boolean) => {
    setResolvingId(mistakeId);
    const nextState = !currentResolvedState;

    // Optimistic local update
    setMistakes((prev) =>
      prev.map((m) =>
        m.id === mistakeId
          ? { ...m, isResolved: nextState, lastReviewedAt: new Date().toISOString() }
          : m
      )
    );

    try {
      await api.resolveMistake(mistakeId, nextState);
    } catch (err) {
      console.error('Failed to update mistake resolution:', err);
      // Revert on error
      setMistakes((prev) =>
        prev.map((m) => (m.id === mistakeId ? { ...m, isResolved: currentResolvedState } : m))
      );
    } finally {
      setResolvingId(null);
    }
  };

  // Remove bookmark (persists to Supabase)
  const handleRemoveBookmark = async (bookmarkId: string, questionId: string) => {
    if (!user) return;
    // Optimistic remove
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    try {
      await api.toggleBookmark(user.id, questionId);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      loadData();
    }
  };

  // Start interactive practice flow
  const startPracticeSession = (source: 'mistakes' | 'bookmarks') => {
    const list =
      source === 'mistakes'
        ? filteredMistakes.filter((m) => !m.isResolved).map((m) => m.question)
        : filteredBookmarks.map((b) => b.question);

    if (list.length === 0) return;

    setPracticeSource(source);
    setPracticeQuestions(list);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionAnswers([]);
    setIsSessionComplete(false);
    setIsPracticing(true);
  };

  // Current practice question
  const currentQuestion = practiceQuestions[currentIndex];

  // Submit answer in practice session
  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOption;
    setIsAnswerSubmitted(true);

    setSessionAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption,
        isCorrect,
      },
    ]);

    // If practicing mistakes and answered correctly, find mistake and mark resolved
    if (practiceSource === 'mistakes' && isCorrect) {
      const foundMistake = mistakes.find((m) => m.questionId === currentQuestion.id);
      if (foundMistake && !foundMistake.isResolved) {
        handleToggleResolve(foundMistake.id, false);
      }
    }
  };

  // Next question or finish
  const handleNextQuestion = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsSessionComplete(true);
    }
  };

  // Exit practice session
  const handleExitPractice = () => {
    setIsPracticing(false);
    setIsSessionComplete(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionAnswers([]);
  };

  // Session summary calculations
  const sessionTotal = sessionAnswers.length;
  const sessionCorrect = sessionAnswers.filter((a) => a.isCorrect).length;
  const sessionWrong = sessionTotal - sessionCorrect;
  const sessionAccuracy =
    sessionTotal > 0 ? ((sessionCorrect / sessionTotal) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* =========================================================================
          PRACTICE MODE: INTERACTIVE WORKSPACE (Part C)
          ========================================================================= */}
      {isPracticing && !isSessionComplete && currentQuestion && (
        <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
          {/* Practice Header & Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pk-blue-light text-pk-navy">
                  {practiceSource === 'mistakes' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-blue-600" />
                  )}
                </span>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {practiceSource === 'mistakes' ? 'Mistakes Revision' : 'Bookmark Practice'}
                  </h2>
                  <span className="text-sm font-black text-slate-900">
                    Question {currentIndex + 1} of {practiceQuestions.length}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Language Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setLanguageMode((prev) =>
                      prev === 'bilingual'
                        ? 'english'
                        : prev === 'english'
                          ? 'bengali'
                          : 'bilingual'
                    );
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Switch question language mode"
                >
                  <Languages className="w-3.5 h-3.5 text-pk-primary" />
                  <span className="capitalize">{languageMode}</span>
                </button>

                {/* Exit Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExitPractice}
                  className="text-xs font-bold text-slate-600 border-slate-200"
                >
                  Exit
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-pk-primary h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-5 sm:p-7 border-slate-200 shadow-sm space-y-6">
            {/* Metadata tags */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
              {currentQuestion.subjectName && (
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold text-slate-700">
                  {currentQuestion.subjectName}
                </span>
              )}
              {currentQuestion.chapterName && (
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-600">
                  {currentQuestion.chapterName}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              {(languageMode === 'bilingual' || languageMode === 'english') && (
                <p className="text-base sm:text-lg font-bold text-pk-dark leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              )}
              {(languageMode === 'bilingual' || languageMode === 'bengali') &&
                currentQuestion.questionBengaliText && (
                  <p className="text-base sm:text-lg font-medium text-slate-800 font-sans leading-relaxed pt-1">
                    {currentQuestion.questionBengaliText}
                  </p>
                )}
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5 pt-2">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                const optKey = `option${opt}` as keyof Question;
                const optText = String(currentQuestion[optKey] || '');
                const isSelected = selectedOption === opt;
                const isCorrectOption = currentQuestion.correctOption === opt;

                let stateStyles = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';

                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    stateStyles =
                      'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrectOption) {
                    stateStyles = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
                  } else {
                    stateStyles = 'border-slate-200 opacity-60 bg-slate-50';
                  }
                } else if (isSelected) {
                  stateStyles =
                    'border-pk-primary bg-pk-blue-light text-pk-dark ring-1 ring-pk-primary';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${stateStyles}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                        isAnswerSubmitted && isCorrectOption
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isAnswerSubmitted && isSelected && !isCorrectOption
                            ? 'bg-rose-600 text-white border-rose-600'
                            : isSelected
                              ? 'bg-pk-primary text-white border-pk-primary'
                              : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {opt}
                    </span>
                    <span className="text-sm font-medium pt-0.5 flex-1">{optText}</span>

                    {/* Feedback Icons */}
                    {isAnswerSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Explanation (Rendered ONLY after student submits) */}
            {isAnswerSubmitted && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
                {/* Result Pill */}
                <div
                  className={`p-3 rounded-xl flex items-center gap-2.5 font-bold text-xs ${
                    selectedOption === currentQuestion.correctOption
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {selectedOption === currentQuestion.correctOption ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Correct! You identified the right answer.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-700" />
                      <span>
                        Incorrect. The correct answer is{' '}
                        <strong>Option {currentQuestion.correctOption}</strong>.
                      </span>
                    </>
                  )}
                </div>

                {/* Detailed Explanation / Short Notes (rendered ONLY after submit) */}
                <ShortNotesBox
                  explanation={currentQuestion.explanationBengali || currentQuestion.explanation}
                  isMathematics={isMathematicsQuestion(currentQuestion)}
                  defaultExpanded={true}
                  collapsible={false}
                />
              </div>
            )}

            {/* Footer Action Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {isAnswerSubmitted
                  ? currentIndex < practiceQuestions.length - 1
                    ? 'Review explanation and proceed'
                    : 'Last question in session'
                  : 'Select an option to check your answer'}
              </span>

              {!isAnswerSubmitted ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="font-bold text-xs sm:text-sm px-5"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="font-bold text-xs sm:text-sm px-5"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {currentIndex < practiceQuestions.length - 1
                    ? 'Next Question'
                    : 'Finish Practice'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          PRACTICE SESSION RESULTS SUMMARY (Part B7)
          ========================================================================= */}
      {isPracticing && isSessionComplete && (
        <div className="max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <Card className="p-6 sm:p-8 text-center border-slate-200 shadow-md space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-200">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Practice Session Complete!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Here are your verified analytics for this revision drill:
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Practiced</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{sessionTotal}</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] uppercase font-bold text-emerald-600">Correct</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">{sessionCorrect}</p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[10px] uppercase font-bold text-rose-600">Wrong</p>
                <p className="text-xl font-black text-rose-600 mt-0.5">{sessionWrong}</p>
              </div>

              <div className="p-3 bg-pk-blue-light rounded-xl border border-pk-blue-soft">
                <p className="text-[10px] uppercase font-bold text-pk-primary">Accuracy</p>
                <p className="text-xl font-black text-pk-navy mt-0.5">{sessionAccuracy}%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-4">
              <Button
                variant="outline"
                onClick={() => startPracticeSession(practiceSource)}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold text-xs"
              >
                Practice Again
              </Button>
              <Button onClick={handleExitPractice} className="w-full sm:w-auto font-bold text-xs">
                Back to Revision Hub
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          REVISION HUB OVERVIEW (When not in interactive practice mode)
          ========================================================================= */}
      {!isPracticing && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-pk-navy tracking-tight">
                Practice & Revision
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Turn mistakes into marks. Targeted question drills for maximum exam retention.
              </p>
            </div>
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-3 text-rose-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadData}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-rose-700 border-rose-300 hover:bg-rose-100 font-bold"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Overview Metrics Cards (Part B2) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Metric 1: Pending Mistakes */}
            <Card className="p-4 sm:p-5 border-amber-200/80 bg-gradient-to-br from-white to-amber-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Mistakes
                </span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">{pendingMistakes.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {pendingMistakes.length > 0
                  ? 'Questions needing revision'
                  : 'Clean notebook • No errors'}
              </p>
            </Card>

            {/* Metric 2: Bookmarked Questions */}
            <Card className="p-4 sm:p-5 border-blue-200/80 bg-gradient-to-br from-white to-blue-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bookmarked
                </span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-700 mt-2">{bookmarks.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {bookmarks.length > 0 ? 'Saved for quick review' : 'No bookmarks saved yet'}
              </p>
            </Card>

            {/* Metric 3: Resolved Questions */}
            <Card className="p-4 sm:p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Resolved Mistakes
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">{resolvedMistakes.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Mistakes mastered & resolved
              </p>
            </Card>
          </div>

          {/* Primary Navigation Tabs */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-1">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => handleTabChange('topics')}
                className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'topics'
                    ? 'border-pk-primary text-pk-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4 text-pk-primary" />
                <span>Topic Tests</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('mistakes')}
                className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'mistakes'
                    ? 'border-pk-primary text-pk-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Mistakes Notebook (ভুল সংশোধন খাতা)</span>
                <span className="ml-1 text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {pendingMistakes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('bookmarks')}
                className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'border-pk-primary text-pk-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4 text-blue-500" />
                <span>Saved Bookmarks (সংরক্ষিত প্রশ্ন)</span>
                <span className="ml-1 text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  {bookmarks.length}
                </span>
              </button>
            </div>

            {/* Quick Practice Trigger Button */}
            {activeTab === 'mistakes' && pendingMistakes.length > 0 && (
              <Button
                size="sm"
                onClick={() => startPracticeSession('mistakes')}
                className="font-bold text-xs shadow-xs hidden sm:inline-flex"
                leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
              >
                Practice Mistakes ({pendingMistakes.length})
              </Button>
            )}

            {activeTab === 'bookmarks' && bookmarks.length > 0 && (
              <Button
                size="sm"
                onClick={() => startPracticeSession('bookmarks')}
                className="font-bold text-xs shadow-xs hidden sm:inline-flex"
                leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
              >
                Practice Bookmarks ({bookmarks.length})
              </Button>
            )}
          </div>

          {/* Subject Filter Chips (Part B6) */}
          {activeTab !== 'topics' && availableSubjects.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-slate-400 text-[11px] font-medium shrink-0">Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors border ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-pk-primary text-white border-pk-primary'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Subjects
              </button>
              {availableSubjects.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(subj)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors border ${
                    selectedSubjectFilter === subj
                      ? 'bg-pk-primary text-white border-pk-primary'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          )}

          {/* TAB 1: TOPIC TEST DISCOVERY */}
          {activeTab === 'topics' && <TopicTests />}

          {/* TAB 2: MISTAKES NOTEBOOK LIST */}
          {activeTab === 'mistakes' && (
            <div className="space-y-4">
              {/* Informational Banner with Mobile Practice CTA */}
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <strong className="font-bold">Automated Mistakes Tracking:</strong> Questions
                    answered incorrectly during any mock test are auto-collected here. Practice each
                    one to reinforce your concepts.
                  </div>
                </div>

                {pendingMistakes.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => startPracticeSession('mistakes')}
                    className="font-bold text-xs shrink-0 self-stretch sm:self-auto shadow-xs"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                  >
                    Practice Mistakes
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredMistakes.length === 0 ? (
                // Empty State (Part B8)
                <Card className="p-10 text-center border-dashed border-slate-200 bg-slate-50/50">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    You don't have any mistakes to revise yet.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    Every question you answer incorrectly in mock tests is automatically collected
                    here so you can practice and master them.
                  </p>
                  <Button
                    onClick={() => navigate('/exams')}
                    className="mt-4 font-bold text-xs sm:text-sm shadow-xs"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Take a Mock Test
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredMistakes.map((item, idx) => {
                    const q = item.question;
                    const isExpanded = expandedId === item.id;

                    return (
                      <Card
                        key={item.id}
                        className={`p-5 transition-all border ${
                          item.isResolved
                            ? 'opacity-70 bg-slate-50/50 border-slate-200'
                            : 'border-slate-200 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">
                                Question #{idx + 1}
                              </span>
                              <Badge variant="warning" size="sm" className="text-[10px]">
                                Wrong {item.wrongCount}x
                              </Badge>
                              {item.isResolved ? (
                                <Badge variant="success" size="sm" className="text-[10px]">
                                  Resolved
                                </Badge>
                              ) : (
                                <Badge variant="outline" size="sm" className="text-[10px]">
                                  Pending
                                </Badge>
                              )}
                              {item.subjectName && (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                                  {item.subjectName}
                                </span>
                              )}
                              {item.chapterName && (
                                <span className="text-[10px] text-slate-400">
                                  {item.chapterName}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 pt-0.5">
                              {q.questionText}
                            </h3>
                            {q.questionBengaliText && (
                              <p className="text-xs text-slate-600 font-medium font-sans">
                                {q.questionBengaliText}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Expandable Options & Explanation */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                const optKey = `option${opt}` as keyof Question;
                                const isCorrect = q.correctOption === opt;
                                return (
                                  <div
                                    key={opt}
                                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center font-bold text-[10px]">
                                      {opt}
                                    </span>
                                    <span>{String(q[optKey])}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <ShortNotesBox
                              explanation={q.explanationBengali || q.explanation}
                              isMathematics={isMathematicsQuestion(q)}
                              defaultExpanded={true}
                              collapsible={false}
                            />

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant={item.isResolved ? 'outline' : 'primary'}
                                disabled={resolvingId === item.id}
                                onClick={() => handleToggleResolve(item.id, item.isResolved)}
                                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                                className="text-xs font-bold"
                              >
                                {item.isResolved
                                  ? 'Mark as Unresolved'
                                  : 'Mark as Understood & Resolved'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOKMARKED QUESTIONS LIST */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {/* Informational Banner with Mobile Practice CTA */}
              <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Bookmark className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 leading-relaxed">
                    <strong className="font-bold">Bookmarked Questions:</strong> High-yield
                    questions saved during tests. Practice them to keep key concepts sharp before
                    exam day.
                  </div>
                </div>

                {bookmarks.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => startPracticeSession('bookmarks')}
                    className="font-bold text-xs shrink-0 self-stretch sm:self-auto shadow-xs"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                  >
                    Practice Bookmarks
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredBookmarks.length === 0 ? (
                // Empty State (Part B8)
                <Card className="p-10 text-center border-dashed border-slate-200 bg-slate-50/50">
                  <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    No bookmarked questions yet.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    While taking mock tests, click the bookmark icon to save important questions for
                    quick revision here.
                  </p>
                  <Button
                    onClick={() => navigate('/exams')}
                    className="mt-4 font-bold text-xs sm:text-sm shadow-xs"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Browse Mock Tests
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBookmarks.map((bm, idx) => {
                    const q = bm.question;
                    const isExpanded = expandedId === bm.id;

                    return (
                      <Card
                        key={bm.id}
                        className="p-5 border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="info" size="sm" className="text-[10px]">
                                Bookmark #{idx + 1}
                              </Badge>
                              {bm.subjectName && (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                                  {bm.subjectName}
                                </span>
                              )}
                              {bm.chapterName && (
                                <span className="text-[10px] text-slate-400">{bm.chapterName}</span>
                              )}
                              <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline">
                                {new Date(bm.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 pt-0.5">
                              {q.questionText}
                            </h3>
                            {q.questionBengaliText && (
                              <p className="text-xs text-slate-600 font-medium font-sans">
                                {q.questionBengaliText}
                              </p>
                            )}

                            {bm.note && (
                              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 mt-2">
                                <span className="font-bold">Student Note:</span> {bm.note}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveBookmark(bm.id, bm.questionId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove Bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExpand(bm.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Options & Explanation */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                const optKey = `option${opt}` as keyof Question;
                                const isCorrect = q.correctOption === opt;
                                return (
                                  <div
                                    key={opt}
                                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center font-bold text-[10px]">
                                      {opt}
                                    </span>
                                    <span>{String(q[optKey])}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <ShortNotesBox
                              explanation={q.explanationBengali || q.explanation}
                              isMathematics={isMathematicsQuestion(q)}
                              defaultExpanded={true}
                              collapsible={false}
                            />
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
