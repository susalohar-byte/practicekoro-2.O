import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Lock,
  Play,
  Award,
  History,
  BookOpen,
  Crown,
  FileCheck2,
  Calendar,
} from 'lucide-react';
import type { MockTest, Subject, Chapter } from '@/types';

type ExamTab = 'full-mock' | 'pyq' | 'topic-tests';

export const ExamDetail: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, isPro } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();

  // Find active exam
  const currentExam = useMemo(() => {
    return exams.find((e) => e.id === examId || e.slug === examId) || selectedExam;
  }, [exams, examId, selectedExam]);

  // Keep ExamContext in sync
  useEffect(() => {
    if (currentExam && selectedExam?.id !== currentExam.id) {
      setSelectedExam(currentExam);
    }
  }, [currentExam, selectedExam, setSelectedExam]);

  // Active Tab: from URL pathname, search params, or default to full-mock
  const pathTab = location.pathname.endsWith('/pyq')
    ? 'pyq'
    : location.pathname.endsWith('/topic-tests')
      ? 'topic-tests'
      : location.pathname.endsWith('/full-mock')
        ? 'full-mock'
        : null;
  const tabParam = (searchParams.get('tab') as ExamTab) || pathTab;
  const [activeTab, setActiveTab] = useState<ExamTab>(
    tabParam === 'pyq' || tabParam === 'topic-tests' ? tabParam : 'full-mock'
  );

  const handleTabChange = (tab: ExamTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Tests & Content state
  const [loading, setLoading] = useState(true);
  const [fullMockTests, setFullMockTests] = useState<MockTest[]>([]);
  const [pyqTests, setPyqTests] = useState<MockTest[]>([]);
  const [topicTests, setTopicTests] = useState<MockTest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examSubjectsWithTopics, setExamSubjectsWithTopics] = useState<
    { subject: Subject; topics: Chapter[] }[]
  >([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Locked test modal state
  const [selectedLockedTest, setSelectedLockedTest] = useState<MockTest | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);

  // Load all tests and mapped topics for this exam
  useEffect(() => {
    async function loadExamData() {
      if (!currentExam) return;
      setLoading(true);
      try {
        const [fullMocks, pyqs, topics, subList, mappedSubjects] = await Promise.all([
          api.getTestsForExam(currentExam.id, 'full_mock'),
          api.getTestsForExam(currentExam.id, 'pyq'),
          api.getTestsForExam(currentExam.id, 'topic'),
          api.getSubjects(currentExam.id),
          api.getExamSubjectsWithTopics(currentExam.id),
        ]);

        setFullMockTests(fullMocks);
        setPyqTests(pyqs);
        setTopicTests(topics);
        setSubjects(mappedSubjects.length > 0 ? mappedSubjects.map((m) => m.subject) : subList);
        setExamSubjectsWithTopics(mappedSubjects);
      } catch (err) {
        console.error('Failed to load tests for exam:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExamData();
  }, [currentExam]);

  // Extract available years for PYQ tab
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    pyqTests.forEach((t) => {
      if (t.year) years.add(t.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [pyqTests]);

  // Filtered PYQ tests
  const filteredPyqTests = useMemo(() => {
    if (selectedYear === 'all') return pyqTests;
    return pyqTests.filter((t) => t.year?.toString() === selectedYear);
  }, [pyqTests, selectedYear]);

  // Filtered Topic tests by subject
  const filteredTopicTests = useMemo(() => {
    if (selectedSubjectId === 'all') return topicTests;
    return topicTests.filter((t) => t.subjectId === selectedSubjectId);
  }, [topicTests, selectedSubjectId]);

  const visibleSubjectGroups = useMemo(() => {
    if (selectedSubjectId === 'all') return examSubjectsWithTopics;
    return examSubjectsWithTopics.filter((item) => item.subject.id === selectedSubjectId);
  }, [examSubjectsWithTopics, selectedSubjectId]);

  const handleTestClick = (test: MockTest) => {
    const isLocked = test.isPremium && !isPro && user?.role !== 'admin';
    if (isLocked) {
      setSelectedLockedTest(test);
      setShowSubscriptionModal(true);
      return;
    }
    navigate(`/exams/${test.id}`);
  };

  const handleStartRunner = async (test: MockTest, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLocked = test.isPremium && !isPro && user?.role !== 'admin';
    if (isLocked) {
      setSelectedLockedTest(test);
      setShowSubscriptionModal(true);
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/exams/${test.id}` } } });
      return;
    }
    if (startingTestId) return;

    try {
      setStartingTestId(test.id);
      const attemptInfo = await api.startTestAttempt(test.id);
      navigate(`/exams/${test.id}/runner?attemptId=${attemptInfo.attemptId}`);
    } catch (err) {
      console.error('Failed to start test attempt:', err);
      alert('Failed to initialize test attempt. Please try again.');
    } finally {
      setStartingTestId(null);
    }
  };

  if (!currentExam && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <EmptyState
          title="Examination not found"
          description="The requested examination could not be found or is no longer active."
          actionLabel="Browse All Exams"
          onAction={() => navigate('/exams')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/exams" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            All Examinations
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{currentExam?.title}</span>
        </div>

        {/* Exam Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                  {currentExam?.category || 'Competitive Exam'}
                </span>
                {currentExam?.totalVacancies && (
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {currentExam.totalVacancies.toLocaleString()} Vacancies
                  </span>
                )}
                {isPro && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    Pro Pass Unlocked
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentExam?.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentExam?.description ||
                  'Structured preparation system: simulate the complete exam pattern with Full Mocks, analyze previous patterns with PYQs, and master individual chapters with reusable Topic Tests.'}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
              <div className="text-center">
                <div className="text-lg font-black text-brand-700">{fullMockTests.length}</div>
                <div className="text-[11px] font-semibold text-slate-500">Full Mocks</div>
              </div>
              <div className="text-center border-x border-slate-200 px-2">
                <div className="text-lg font-black text-amber-700">{pyqTests.length}</div>
                <div className="text-[11px] font-semibold text-slate-500">PYQ Papers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-blue-700">{topicTests.length}</div>
                <div className="text-[11px] font-semibold text-slate-500">Topic Tests</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleTabChange('full-mock')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'full-mock'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Full Mock Test</span>
              <span
                className={`text-[11px] py-0.5 px-2 rounded-full font-extrabold ml-1 hidden sm:inline-block ${
                  activeTab === 'full-mock'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {fullMockTests.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('pyq')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pyq'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>PYQ (Previous Years)</span>
              <span
                className={`text-[11px] py-0.5 px-2 rounded-full font-extrabold ml-1 hidden sm:inline-block ${
                  activeTab === 'pyq' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {pyqTests.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('topic-tests')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'topic-tests'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Topic Tests</span>
              <span
                className={`text-[11px] py-0.5 px-2 rounded-full font-extrabold ml-1 hidden sm:inline-block ${
                  activeTab === 'topic-tests'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {topicTests.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: FULL MOCK TESTS */}
        {activeTab === 'full-mock' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-600" />
                  Full Exam Simulations
                </h2>
                <p className="text-xs text-slate-500">
                  Full length tests matching the official syllabus, time duration, and negative
                  marking scheme.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {fullMockTests.length} Tests Available
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : fullMockTests.length === 0 ? (
              <EmptyState
                title="No Full Mock tests available yet"
                description="Our academic content team is formulating standard full-length simulation tests for this examination."
              />
            ) : (
              <div className="space-y-3">
                {fullMockTests.map((test) => {
                  const isLocked = test.isPremium && !isPro && user?.role !== 'admin';

                  return (
                    <Card
                      key={test.id}
                      hoverable
                      onClick={() => handleTestClick(test)}
                      className={`p-5 transition-all cursor-pointer border ${
                        isLocked
                          ? 'border-amber-200/80 hover:border-amber-300'
                          : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                              🎯 FULL MOCK
                            </span>
                            {test.isPremium ? (
                              <Badge variant="premium" className="text-[10px] py-0 px-2">
                                <Crown className="w-2.5 h-2.5 inline mr-1" />
                                Pro Pass
                              </Badge>
                            ) : (
                              <Badge variant="free" className="text-[10px] py-0 px-2">
                                Free Starter
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {test.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                            <span className="flex items-center gap-1">
                              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                              {test.totalQuestions} Questions
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {test.durationMinutes} Mins
                            </span>
                            <span>•</span>
                            <span>{test.totalMarks} Marks</span>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold">
                              -{test.negativeMarking} Neg.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isLocked ? (
                            <Button
                              variant="pro"
                              size="sm"
                              className="w-full sm:w-auto font-bold gap-1 text-xs"
                              onClick={(e) => handleStartRunner(test, e)}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Unlock with Pro
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full sm:w-auto font-bold gap-1 text-xs"
                              isLoading={startingTestId === test.id}
                              disabled={Boolean(startingTestId)}
                              onClick={(e) => handleStartRunner(test, e)}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Start Mock Test
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PYQ (PREVIOUS YEAR QUESTIONS) */}
        {activeTab === 'pyq' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  Official Previous Year Question Papers (PYQ)
                </h2>
                <p className="text-xs text-slate-500">
                  Solve real past examination papers with instant timer, negative marking, and
                  bilingual answer analysis.
                </p>
              </div>

              {/* Year Filter Chips */}
              {availableYears.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedYear === 'all'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All Years
                  </button>
                  {availableYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr.toString())}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        selectedYear === yr.toString()
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredPyqTests.length === 0 ? (
              <EmptyState
                title="No Previous Year Question papers available"
                description="Past examination papers are being digitized with detailed explanations for this exam."
              />
            ) : (
              <div className="space-y-3">
                {filteredPyqTests.map((test) => {
                  const isLocked = test.isPremium && !isPro && user?.role !== 'admin';

                  return (
                    <Card
                      key={test.id}
                      hoverable
                      onClick={() => handleTestClick(test)}
                      className={`p-5 transition-all cursor-pointer border ${
                        isLocked
                          ? 'border-amber-200/80 hover:border-amber-300'
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              📜 PYQ {test.year ? `• ${test.year}` : ''}
                            </span>
                            {test.isPremium ? (
                              <Badge variant="premium" className="text-[10px] py-0 px-2">
                                <Crown className="w-2.5 h-2.5 inline mr-1" />
                                Pro Pass
                              </Badge>
                            ) : (
                              <Badge variant="free" className="text-[10px] py-0 px-2">
                                Free Official Paper
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {test.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                            {test.year && (
                              <span className="flex items-center gap-1 text-slate-700 font-bold">
                                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                Year {test.year}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                              {test.totalQuestions} Questions
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {test.durationMinutes} Mins
                            </span>
                            <span>•</span>
                            <span>{test.totalMarks} Marks</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isLocked ? (
                            <Button
                              variant="pro"
                              size="sm"
                              className="w-full sm:w-auto font-bold gap-1 text-xs"
                              onClick={(e) => handleStartRunner(test, e)}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Unlock Paper
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full sm:w-auto font-bold gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                              isLoading={startingTestId === test.id}
                              disabled={Boolean(startingTestId)}
                              onClick={(e) => handleStartRunner(test, e)}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Solve Paper
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: REUSABLE TOPIC TESTS */}
        {activeTab === 'topic-tests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Canonical Topic Tests
                </h2>
                <p className="text-xs text-slate-500">
                  Targeted chapter-wise drills centralized across multiple exams to build concept
                  mastery.
                </p>
              </div>

              {/* Subject Filter Pills */}
              {subjects.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setSelectedSubjectId('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedSubjectId === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All Subjects
                  </button>
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        selectedSubjectId === s.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredTopicTests.length === 0 && visibleSubjectGroups.length === 0 ? (
              <EmptyState
                title="No topic tests available for this selection"
                description="No topic tests currently published for this selection."
              />
            ) : (
              <div className="space-y-6">
                {/* Configured Topic Tests */}
                {filteredTopicTests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Standardized Topic Mock Tests ({filteredTopicTests.length})
                    </h3>
                    {filteredTopicTests.map((test) => {
                      const isLocked = test.isPremium && !isPro && user?.role !== 'admin';

                      return (
                        <Card
                          key={test.id}
                          hoverable
                          onClick={() => handleTestClick(test)}
                          className={`p-5 transition-all cursor-pointer border ${
                            isLocked
                              ? 'border-amber-200/80 hover:border-amber-300'
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2 max-w-xl">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  📚 TOPIC TEST
                                </span>
                                {test.subjectName && (
                                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {test.subjectName}
                                  </span>
                                )}
                                {test.chapterName && (
                                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {test.chapterName}
                                  </span>
                                )}
                                {test.isPremium ? (
                                  <Badge variant="premium" className="text-[10px] py-0 px-2">
                                    <Crown className="w-2.5 h-2.5 inline mr-1" />
                                    Pro Pass
                                  </Badge>
                                ) : (
                                  <Badge variant="free" className="text-[10px] py-0 px-2">
                                    Free Topic Test
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {test.title}
                              </h3>

                              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                                <span className="flex items-center gap-1">
                                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                                  {test.totalQuestions} Questions
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {test.durationMinutes} Mins
                                </span>
                                <span>•</span>
                                <span>{test.totalMarks} Marks</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isLocked ? (
                                <Button
                                  variant="pro"
                                  size="sm"
                                  className="w-full sm:w-auto font-bold gap-1 text-xs"
                                  onClick={(e) => handleStartRunner(test, e)}
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  Unlock Topic
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-full sm:w-auto font-bold gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  isLoading={startingTestId === test.id}
                                  disabled={Boolean(startingTestId)}
                                  onClick={(e) => handleStartRunner(test, e)}
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  Practice Topic
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Mapped Curriculum Topics Grid */}
                {visibleSubjectGroups.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Syllabus & Practice Topics (
                        {visibleSubjectGroups.reduce((acc, g) => acc + g.topics.length, 0)} Topics)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Concept-level questions from question bank
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {visibleSubjectGroups.flatMap((group) =>
                        group.topics.map((topic) => {
                          const topicTest = topicTests.find(
                            (t) => t.chapterId === topic.id || t.topicId === topic.id
                          );

                          return (
                            <div
                              key={topic.id}
                              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all flex flex-col justify-between gap-3 shadow-xs"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                    {group.subject.name}
                                  </span>
                                  {topicTest && (
                                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                      {topicTest.totalQuestions} Qs
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                  {topic.name}
                                </h4>
                                {topic.description && (
                                  <p className="text-xs text-slate-500 line-clamp-1">
                                    {topic.description}
                                  </p>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {topicTest ? `${topicTest.durationMinutes}m test` : 'Topic Bank'}
                                </span>
                                {topicTest ? (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    className="text-xs py-1 px-3 bg-blue-600 hover:bg-blue-700"
                                    isLoading={startingTestId === topicTest.id}
                                    disabled={Boolean(startingTestId)}
                                    onClick={(e) => handleStartRunner(topicTest, e)}
                                  >
                                    <Play className="w-3 h-3 fill-current" /> Start Drill
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs py-1 px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                                    onClick={() => navigate(`/practice?chapterId=${topic.id}`)}
                                  >
                                    Practice Drill
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Subscription Lock Modal */}
        {showSubscriptionModal && selectedLockedTest && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-200">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Crown className="w-6 h-6 fill-amber-500" />
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Pro Pass Exclusive
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {selectedLockedTest.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  This test is part of the premium PracticeKoro test series.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-amber-950">PracticeKoro Pro Pass</span>
                  <span className="text-base font-black text-amber-700">₹299 / 365 Days</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-amber-200/60">
                  One Pro Pass unlocks all Full Mocks, PYQ papers, and Topic Tests across all exams.
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
    </div>
  );
};
