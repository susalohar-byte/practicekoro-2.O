import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calculator,
  BrainCircuit,
  Globe,
  Languages,
  Book,
  Monitor,
  ChevronRight,
  Sparkles,
  Zap,
  Info,
  Layers,
  Play,
} from 'lucide-react';
import { api } from '@/services/api';
import { useExam } from '@/context/ExamContext';
import type { Chapter, MockTest, Subject } from '@/types';

interface TopicTestsProps {
  onBackToDashboard?: () => void;
  onOpenInfo?: () => void;
}

export const TopicTests: React.FC<TopicTestsProps> = ({ onBackToDashboard, onOpenInfo }) => {
  const navigate = useNavigate();
  const { selectedExam } = useExam();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Chapter | null>(null);

  const [, setLoadingSubjects] = useState(false);
  const [, setLoadingTopics] = useState(false);
  const [, setLoadingTests] = useState(false);

  // Screen 8 vs Screen 9 view
  // viewMode: 'subjects' (Screen 8) | 'topics' (Screen 9)
  const [viewMode, setViewMode] = useState<'subjects' | 'topics'>('subjects');
  const [topicFilter, setTopicFilter] = useState<'all' | 'weak' | 'attempted'>('all');

  // Subject theme mapping (icons and colors matching Screen 8)
  const getSubjectTheme = (name: string, _index: number) => {
    const lower = name.toLowerCase();
    if (lower.includes('math') || lower.includes('arithmetic') || lower.includes('quant')) {
      return {
        icon: Calculator,
        container: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        border: 'hover:border-blue-300',
        defaultQuestions: '1,240 Questions',
      };
    }
    if (lower.includes('reason') || lower.includes('gi') || lower.includes('logic')) {
      return {
        icon: BrainCircuit,
        container: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
        badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
        border: 'hover:border-pink-300',
        defaultQuestions: '960 Questions',
      };
    }
    if (lower.includes('gk') || lower.includes('general') || lower.includes('knowledge') || lower.includes('science')) {
      return {
        icon: Globe,
        container: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        border: 'hover:border-emerald-300',
        defaultQuestions: '1,520 Questions',
      };
    }
    if (lower.includes('english')) {
      return {
        icon: Languages,
        container: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        border: 'hover:border-purple-300',
        defaultQuestions: '1,010 Questions',
      };
    }
    if (lower.includes('bengali') || lower.includes('bangla')) {
      return {
        icon: Book,
        container: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        border: 'hover:border-amber-300',
        defaultQuestions: '820 Questions',
      };
    }
    // Computer / Default
    return {
      icon: Monitor,
      container: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
      badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
      border: 'hover:border-sky-300',
      defaultQuestions: '640 Questions',
    };
  };

  // 1. Fetch Subjects for Selected Exam
  useEffect(() => {
    let isMounted = true;
    const loadSubjects = async () => {
      if (!selectedExam) return;
      setLoadingSubjects(true);
      try {
        const res = await api.getSubjects(selectedExam.id);
        if (isMounted) {
          setSubjects(res || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };
    loadSubjects();
    return () => {
      isMounted = false;
    };
  }, [selectedExam]);

  // 2. Fetch Topics when Subject is picked
  useEffect(() => {
    let isMounted = true;
    if (!selectedSubject) {
      setTopics([]);
      return;
    }
    setLoadingTopics(true);
    api
      .getChapters(selectedSubject.id)
      .then((res) => {
        if (isMounted) {
          setTopics(res || []);
          if (res && res.length > 0) {
            setSelectedTopic(res[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load topics:', err))
      .finally(() => {
        if (isMounted) setLoadingTopics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSubject]);

  // 3. Fetch Tests when Topic is picked
  useEffect(() => {
    let isMounted = true;
    if (!selectedTopic || !selectedExam) {
      setTests([]);
      return;
    }
    setLoadingTests(true);
    api
      .getTests(selectedTopic.id, selectedExam.id)
      .then((res) => {
        if (isMounted) setTests(res || []);
      })
      .catch((err) => console.error('Failed to load tests:', err))
      .finally(() => {
        if (isMounted) setLoadingTests(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTopic, selectedExam]);

  // Fallback subjects if database is empty yet
  const displaySubjects =
    subjects.length > 0
      ? subjects
      : [
          { id: 'sub-1', name: 'Mathematics', examId: selectedExam?.id || '', chaptersCount: 12, slug: 'mathematics', iconName: 'calculator', orderIndex: 0, isActive: true },
          { id: 'sub-2', name: 'Reasoning', examId: selectedExam?.id || '', chaptersCount: 10, slug: 'reasoning', iconName: 'brain', orderIndex: 1, isActive: true },
          { id: 'sub-3', name: 'General Knowledge', examId: selectedExam?.id || '', chaptersCount: 15, slug: 'general-knowledge', iconName: 'globe', orderIndex: 2, isActive: true },
          { id: 'sub-4', name: 'English', examId: selectedExam?.id || '', chaptersCount: 8, slug: 'english', iconName: 'book', orderIndex: 3, isActive: true },
          { id: 'sub-5', name: 'Bengali', examId: selectedExam?.id || '', chaptersCount: 7, slug: 'bengali', iconName: 'pen', orderIndex: 4, isActive: true },
          { id: 'sub-6', name: 'Computer', examId: selectedExam?.id || '', chaptersCount: 6, slug: 'computer', iconName: 'monitor', orderIndex: 5, isActive: true },
        ];

  // Fallback topics for Screen 9 if database chapters are empty
  const displayTopics =
    topics.length > 0
      ? topics
      : [
          { id: 'top-1', name: 'Number System', subjectId: selectedSubject?.id || '', testsCount: 4, slug: 'number-system', orderIndex: 0, isActive: true },
          { id: 'top-2', name: 'Simplification', subjectId: selectedSubject?.id || '', testsCount: 3, slug: 'simplification', orderIndex: 1, isActive: true },
          { id: 'top-3', name: 'Percentage', subjectId: selectedSubject?.id || '', testsCount: 5, slug: 'percentage', orderIndex: 2, isActive: true },
          { id: 'top-4', name: 'Profit & Loss', subjectId: selectedSubject?.id || '', testsCount: 4, slug: 'profit-loss', orderIndex: 3, isActive: true },
          { id: 'top-5', name: 'Ratio & Proportion', subjectId: selectedSubject?.id || '', testsCount: 3, slug: 'ratio-proportion', orderIndex: 4, isActive: true },
          { id: 'top-6', name: 'Average', subjectId: selectedSubject?.id || '', testsCount: 2, slug: 'average', orderIndex: 5, isActive: true },
          { id: 'top-7', name: 'Time & Work', subjectId: selectedSubject?.id || '', testsCount: 3, slug: 'time-work', orderIndex: 6, isActive: true },
        ];

  // Handle clicking a subject -> transition to Screen 9 (Topics)
  const handleSelectSubject = (subj: Subject) => {
    setSelectedSubject(subj);
    setViewMode('topics');
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SCREEN 8: SUBJECTS SELECTION
          ========================================================================= */}
      {viewMode === 'subjects' ? (
        <>
          {/* Header (Screen 8) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onBackToDashboard) onBackToDashboard();
                  else navigate('/dashboard');
                }}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Practice
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose a subject to start practicing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenInfo}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
              aria-label="Information"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented Control / Pills (Screen 8): [ Subjects ] | [ Topics ] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('subjects')}
              className="px-5 py-2 rounded-full text-xs font-black bg-blue-600 text-white shadow-sm transition-all"
            >
              Subjects
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedSubject && displaySubjects.length > 0) {
                  setSelectedSubject(displaySubjects[0]);
                }
                setViewMode('topics');
              }}
              className="px-5 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
            >
              Topics
            </button>
          </div>

          {/* 2-Column Grid of Subjects (Screen 8) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {displaySubjects.map((subject, idx) => {
              const theme = getSubjectTheme(subject.name, idx);
              const Icon = theme.icon;

              return (
                <div
                  key={subject.id}
                  onClick={() => handleSelectSubject(subject)}
                  className={`group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md ${theme.border} cursor-pointer transition-all flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${theme.container} shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {subject.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {subject.chaptersCount !== undefined
                        ? `${subject.chaptersCount * 80 || 120} Questions`
                        : theme.defaultQuestions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Practice Section (Screen 8) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Quick Practice
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Daily Practice */}
              <div
                onClick={() => {
                  if (displaySubjects.length > 0) {
                    handleSelectSubject(displaySubjects[0]);
                  }
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-emerald-600 text-emerald-600 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    Daily Practice
                  </h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    10 Q • 5 Min
                  </p>
                </div>
              </div>

              {/* Weak Topics */}
              <div
                onClick={() => {
                  if (displaySubjects.length > 0) {
                    handleSelectSubject(displaySubjects[0]);
                    setTopicFilter('weak');
                  }
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-rose-200 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    Weak Topics
                  </h4>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Focus Now</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
           SCREEN 9: TOPIC SCREEN (Subject Drilldown)
           Mathematics - 1,240 Questions with "Change" button and topic cards
           ========================================================================= */
        <>
          {/* Header (Screen 9) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setViewMode('subjects')}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shrink-0"
                aria-label="Back to Subjects"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {selectedSubject?.name || 'Mathematics'}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {displayTopics.length * 110 || 1240} Questions
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('subjects')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 transition-colors shrink-0"
            >
              Change
            </button>
          </div>

          {/* Filter Pills (Screen 9): [All Topics] | [Weak] | [Attempted] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTopicFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                topicFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Topics
            </button>
            <button
              type="button"
              onClick={() => setTopicFilter('weak')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                topicFilter === 'weak'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Weak
            </button>
            <button
              type="button"
              onClick={() => setTopicFilter('attempted')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                topicFilter === 'attempted'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Attempted
            </button>
          </div>

          {/* List of Topic Cards (Screen 9) */}
          <div className="space-y-2.5">
            {displayTopics.map((topic, index) => {
              const isSelected = selectedTopic?.id === topic.id;
              const icons = [Calculator, BrainCircuit, Globe, Languages, Book, Zap, Layers];
              const TopicIcon = icons[index % icons.length];
              const qCounts = [120, 95, 110, 100, 85, 75, 90];
              const displayCount = qCounts[index % qCounts.length];

              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <TopicIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {topic.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {displayCount} Questions
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Available Tests for Selected Topic */}
          {selectedTopic && (
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-blue-50/60 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    Tests for {selectedTopic.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {tests.length > 0
                      ? `${tests.length} Practice Tests ready`
                      : 'Focused tests available for this topic'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <div
                      key={test.id}
                      onClick={() => navigate(`/exams/${test.id}`)}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors shadow-xs"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {test.title}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {test.durationMinutes} mins • {test.totalMarks} marks
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] shadow-xs"
                      >
                        Start Test
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedTopic.name} - Quick Practice Test
                      </h5>
                      <p className="text-[10px] text-slate-400">10 Questions • 10 Minutes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/exams')}
                      className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Explore Tests
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
