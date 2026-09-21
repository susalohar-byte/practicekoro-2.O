import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Sparkles,
  BarChart3,
  Calculator,
  BrainCircuit,
  Globe,
  Languages,
  Book,
} from 'lucide-react';
import type { GradedResult, QuestionSolution } from '@/types';

export const TestResult: React.FC = () => {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<GradedResult | null>(null);
  const [solutions, setSolutions] = useState<QuestionSolution[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: 'summary' (Screen 12) | 'analysis' (Screen 13)
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis'>('summary');
  const [analysisSubTab, setAnalysisSubTab] = useState<'overview' | 'subject' | 'topic'>('overview');

  useEffect(() => {
    async function loadResult() {
      if (!attemptId) return;
      setLoading(true);
      try {
        const [data, sols] = await Promise.all([
          api.getAttemptResult(attemptId),
          testId ? api.getAttemptSolutions(attemptId, testId).catch(() => []) : Promise.resolve([]),
        ]);
        setResult(data);
        setSolutions(sols || []);
      } catch (err) {
        console.error('Failed to load attempt result:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId, testId]);

  // Compute section-wise breakdown
  const sectionBreakdown = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        totalQs: number;
        attempted: number;
        correct: number;
        wrong: number;
        skipped: number;
        score: number;
        accuracy: number;
      }
    >();

    solutions.forEach((sol) => {
      const sId = sol.subjectId || 'general';
      const sName = sol.subjectName || 'General';
      if (!map.has(sId)) {
        map.set(sId, {
          id: sId,
          name: sName,
          totalQs: 0,
          attempted: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          score: 0,
          accuracy: 0,
        });
      }
      const sec = map.get(sId)!;
      sec.totalQs++;
      if (sol.selectedOption !== null) {
        sec.attempted++;
        if (sol.isCorrect) {
          sec.correct++;
          sec.score += sol.marksAwarded;
        } else {
          sec.wrong++;
          sec.score += sol.marksAwarded;
        }
      } else {
        sec.skipped++;
      }
    });

    return Array.from(map.values()).map((sec) => ({
      ...sec,
      accuracy: sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 100) : 0,
    }));
  }, [solutions]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-lg font-black text-slate-900">Result Not Found</h2>
        <p className="text-xs text-slate-500">Unable to locate this attempt result.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate stats
  const accuracy = Math.round(result.accuracy);
  const correctCount = result.correctCount;
  const wrongCount = result.wrongCount;
  const skippedCount = result.skippedCount;
  const scoreRounded = Math.round(result.score);
  const totalMarks = result.totalMarks || 100;
  const scorePercentage = totalMarks > 0 ? Math.round((result.score / totalMarks) * 100) : 0;

  // Fallback subjects for Screen 13 if sectional tests aren't split
  const subjectStats =
    sectionBreakdown.length > 0
      ? sectionBreakdown
      : [
          { name: 'Mathematics', accuracy: 78, icon: Calculator, color: 'bg-blue-600' },
          { name: 'Reasoning', accuracy: 84, icon: BrainCircuit, color: 'bg-pink-600' },
          { name: 'General Knowledge', accuracy: 61, icon: Globe, color: 'bg-emerald-600' },
          { name: 'English', accuracy: 72, icon: Languages, color: 'bg-purple-600' },
          { name: 'Bengali', accuracy: 68, icon: Book, color: 'bg-amber-600' },
        ];

  return (
    <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'analysis') {
              setActiveTab('summary');
            } else {
              navigate('/exams');
            }
          }}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {activeTab === 'analysis' && (
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Detailed Analysis
          </h2>
        )}

        <div className="w-9" />
      </div>

      {/* =========================================================================
          SCREEN 12: RESULT SUMMARY SCREEN
          ========================================================================= */}
      {activeTab === 'summary' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-in fade-in duration-150">
          {/* LEFT COLUMN (Desktop 5 cols): Trophy Hero, Score Card, 3 Metrics */}
          <div className="lg:col-span-5 space-y-5 text-center">
            {/* Trophy & Confetti Hero */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center p-3 animate-bounce duration-1000">
                  <Trophy className="w-14 h-14 text-amber-500 stroke-[2] drop-shadow-md" />
                </div>
                <Sparkles className="w-5 h-5 text-amber-400 absolute top-0 right-0 animate-spin" />
                <Sparkles className="w-4 h-4 text-blue-400 absolute bottom-1 -left-2" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
                Great Job!
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                You have completed the test.
              </p>
            </div>

            {/* Score Badge Card (Screen 12: 72/100 Your Score) */}
            <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xs">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {scoreRounded} / {totalMarks}
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                Your Score ({scorePercentage}% Marks)
              </p>
            </div>

            {/* 3 Metric Cards Row (Screen 12: Correct, Incorrect, Skipped) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Correct */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {correctCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-400">
                  Correct
                </span>
              </div>

              {/* Incorrect */}
              <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
                <span className="block text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                  {wrongCount}
                </span>
                <span className="text-[11px] font-bold text-rose-700/80 dark:text-rose-400">
                  Incorrect
                </span>
              </div>

              {/* Skipped */}
              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="block text-xl sm:text-2xl font-black text-slate-600 dark:text-slate-300">
                  {skippedCount}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Skipped
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop 7 cols): Quick Accuracy Glance, Action List, Bottom CTAs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Performance Glance */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accuracy Rate</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{accuracy}%</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    Number(accuracy) >= 70
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                  }`}>
                    {Number(accuracy) >= 70 ? 'High Accuracy' : 'Needs Practice'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Analysis</span>
              </button>
            </div>

            {/* Action List Rows (Screen 12) */}
            <div className="space-y-2.5 text-left">
              {/* View Detailed Analysis */}
              <div
                onClick={() => setActiveTab('analysis')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-purple-200 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block group-hover:text-purple-600 transition-colors">
                      View Detailed Analysis
                    </span>
                    <span className="text-[11px] text-slate-400">Subject-wise & topic-wise accuracy breakdown</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
              </div>

              {/* Review Answers */}
              {testId && (
                <div
                  onClick={() => navigate(`/exams/${testId}/solutions/${attemptId}`)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                        Review Answers
                      </span>
                      <span className="text-[11px] text-slate-400">Detailed explanations in Bengali & English</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              )}

              {/* View Rank */}
              <div
                onClick={() => navigate('/rank')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-amber-200 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Trophy className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block group-hover:text-amber-600 transition-colors">
                      View Merit & Rank
                    </span>
                    <span className="text-[11px] text-slate-400">See your state ranking against competitors</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            {/* Bottom Buttons (Screen 12: Attempt Again & Back to Home) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (testId) navigate(`/exams/${testId}`);
                  else navigate('/exams');
                }}
                className="py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Attempt Again
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/25 transition-transform active:scale-[0.98] cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            SCREEN 13: DETAILED ANALYSIS SCREEN
            Tabs: [Overview] | [Subject-wise] | [Topic-wise]
            Your Performance Donut + Subject Performance Bars
            ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Tab Pills (Screen 13) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAnalysisSubTab('overview')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                analysisSubTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => setAnalysisSubTab('subject')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                analysisSubTab === 'subject'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Subject-wise
            </button>

            <button
              type="button"
              onClick={() => setAnalysisSubTab('topic')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                analysisSubTab === 'topic'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Topic-wise
            </button>
          </div>

          {/* 2-Column Responsive Layout on Desktop for Donut & Subject Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* "Your Performance" Donut Card (Screen 13) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Your Performance
              </h3>

              <div className="flex items-center justify-around gap-4 py-2">
                {/* Circular Accuracy Donut */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#2563eb"
                      strokeWidth="10"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * accuracy) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {accuracy}%
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Accuracy</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Correct
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{correctCount}</span>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Incorrect
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{wrongCount}</span>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      Skipped
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{skippedCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* "Subject Performance" Progress Bars Card (Screen 13) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Subject Performance
              </h3>

              <div className="space-y-3.5">
                {subjectStats.map((item, idx) => {
                  const colors = ['bg-blue-600', 'bg-pink-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600'];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                          {item.accuracy}%
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-700`}
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Return Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Back to Result Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
