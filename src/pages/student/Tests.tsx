import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  BookOpen,
  FolderTree,
  Layers,
  Clock,
  ChevronRight,
  Lock,
  Play,
  CheckCircle,
} from 'lucide-react';
import type { Subject, Chapter, MockTest } from '@/types';

export const Tests: React.FC = () => {
  const { user, isPro } = useAuth();
  const { selectedExam } = useExam();
  const { hasAccessToTest } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const [tests, setTests] = useState<MockTest[]>([]);
  const [selectedLockedTest, setSelectedLockedTest] = useState<MockTest | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Load Subjects when exam changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedExam) return;
      try {
        const data = await api.getSubjects(selectedExam.id);
        setSubjects(data);

        // Check URL params
        const subParam = searchParams.get('subject');
        const match = data.find((s) => s.id === subParam) || data[0] || null;
        setSelectedSubject(match);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadSubjects();
  }, [selectedExam, searchParams]);

  // Load Chapters when selectedSubject changes
  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubject) {
        setChapters([]);
        setSelectedChapter(null);
        return;
      }
      try {
        const data = await api.getChapters(selectedSubject.id);
        setChapters(data);
        const chapParam = searchParams.get('chapter');
        const match = data.find((c) => c.id === chapParam) || data[0] || null;
        setSelectedChapter(match);
      } catch (err) {
        console.error('Failed to load chapters:', err);
      }
    }
    loadChapters();
  }, [selectedSubject, searchParams]);

  // Load Tests when selectedChapter changes
  useEffect(() => {
    async function loadTests() {
      if (!selectedChapter) {
        setTests([]);
        return;
      }
      try {
        const data = await api.getTests(selectedChapter.id, selectedExam?.id);
        setTests(data);
      } catch (err) {
        console.error('Failed to load tests:', err);
      }
    }
    loadTests();
  }, [selectedChapter, selectedExam]);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSearchParams({ subject: subject.id });
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    if (selectedSubject) {
      setSearchParams({ subject: selectedSubject.id, chapter: chapter.id });
    }
  };

  const handleTestClick = (test: MockTest) => {
    const accessible = hasAccessToTest(test.isPremium);
    if (!accessible) {
      setSelectedLockedTest(test);
      setShowSubscriptionModal(true);
    } else {
      navigate(`/exams/${test.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pk-student-page">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <span className="text-slate-800">{selectedExam?.title}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={selectedSubject ? 'text-slate-800' : 'text-brand-600'}>
            {selectedSubject ? selectedSubject.name.split(' (')[0] : 'Subjects'}
          </span>
          {selectedChapter && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-brand-600 font-bold">
                {selectedChapter.name.split(' (')[0]}
              </span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Exam Tests & Chapter Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Structured hierarchy: Exam → Subject → Chapter → Mock Tests
        </p>
      </div>

      {/* STEP 1: SUBJECT SELECTOR HORIZONTAL BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-2.5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
          Step 1: Choose Subject
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {subjects.map((subj) => {
            const isSelected = selectedSubject?.id === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => handleSelectSubject(subj)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{subj.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN CONTENT AREA: CHAPTERS LIST (LEFT) & TESTS LIST (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHAPTERS NAVIGATION (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-brand-600" />
              Chapters ({chapters.length})
            </h2>
          </div>

          <div className="space-y-2">
            {chapters.map((chap) => {
              const isSelected = selectedChapter?.id === chap.id;
              return (
                <div
                  key={chap.id}
                  onClick={() => handleSelectChapter(chap)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/60 border-brand-300 ring-1 ring-brand-400/40 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}
                    >
                      {chap.name}
                    </h3>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-brand-600 translate-x-0.5' : 'text-slate-400'}`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{chap.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      {isSelected
                        ? `${tests.length} ${tests.length === 1 ? 'Mock Test' : 'Mock Tests'} Available`
                        : 'Chapter Tests'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TESTS LIST (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Tests in {selectedChapter?.name.split(' (')[0] || 'Chapter'}
              </h2>
              <p className="text-xs text-slate-500">
                Practice chapter-specific mock tests with real exam timers and negative marking
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{tests.length} Tests</span>
          </div>

          {tests.length === 0 ? (
            <EmptyState
              title="No tests configured for this chapter"
              description="Our academic content team is adding new high-yield mock tests for this chapter."
            />
          ) : (
            <div className="space-y-3">
              {tests.map((test) => {
                const isLocked = test.isPremium && !isPro && user?.role !== 'admin';

                return (
                  <Card
                    key={test.id}
                    hoverable
                    onClick={() => handleTestClick(test)}
                    className={`p-5 transition-all ${
                      isLocked
                        ? 'border-amber-200/80 hover:border-amber-300'
                        : 'border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={test.isPremium ? 'premium' : 'free'}>
                            {test.isPremium ? 'PRO PASS' : 'FREE'}
                          </Badge>
                          <span className="text-[11px] font-semibold text-slate-400 capitalize">
                            {test.testType.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {test.title}
                          {isLocked && <Lock className="w-4 h-4 text-amber-600 shrink-0" />}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-1">{test.description}</p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {test.durationMinutes} mins
                          </span>
                          <span>•</span>
                          <span>{test.totalQuestions} Questions</span>
                          <span>•</span>
                          <span>{test.totalMarks} Marks</span>
                          <span>•</span>
                          <span className="text-rose-600 font-medium">
                            -{test.negativeMarking} Mark Neg
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <Button
                          size="sm"
                          variant={isLocked ? 'pro' : 'primary'}
                          rightIcon={
                            isLocked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestClick(test);
                          }}
                        >
                          {isLocked ? 'Unlock Test' : 'Start Mock'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PREMIUM TEST LOCK MODAL (PART A: NON-PUNITIVE LOCK UX) */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              🔒 Premium Mock Test
            </span>

            <h3 className="text-lg font-black text-slate-900 mt-2">
              {selectedLockedTest?.title || 'Unlock Full Mock Test'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedExam?.title} {selectedChapter ? `• ${selectedChapter.name}` : ''}
            </p>

            <div className="my-5 p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-xl border border-amber-200 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    PracticeKoro Pro Pass
                  </span>
                  <span className="text-[11px] text-slate-500">Universal All-Access Pass</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-700 block">₹299</span>
                  <span className="text-[10px] font-semibold text-slate-500">/ 365 Days</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-amber-200/60">
                Unlock this and every other premium mock test with Pro Pass. No individual test
                purchases required.
              </p>

              <ul className="text-[11px] text-slate-700 space-y-1 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Access all premium mock tests & test series
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Mistakes Notebook & detailed bilingual solutions
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Unlimited re-attempts across all exams
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                variant="pro"
                className="w-full font-bold"
                onClick={() => {
                  setShowSubscriptionModal(false);
                  navigate('/subscription');
                }}
              >
                Get Pro Pass — ₹299
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Continue with Free Tests
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
