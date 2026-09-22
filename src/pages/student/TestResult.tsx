import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Award,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { formatSeconds } from '@/lib/utils';
import type { GradedResult, QuestionSolution } from '@/types';

export const TestResult: React.FC = () => {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<GradedResult | null>(null);
  const [solutions, setSolutions] = useState<QuestionSolution[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    >();

    solutions.forEach((sol) => {
      const sId = sol.subjectId || 'general';
      const sName = sol.subjectName || 'General Section';
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
          sec.score += sol.marksAwarded; // negative deduction
        }
      } else {
        sec.skipped++;
      }
    });

    return Array.from(map.values());
  }, [solutions]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center pk-student-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Result Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unable to locate the test attempt result.</p>
        <Link to="/exams" className="mt-4 inline-block">
          <Button size="sm">Back to Tests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white border-0 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="success"
              className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
            >
              Exam Attempt Completed
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Attempt ID: {result.attemptId.slice(0, 12)}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {result.testTitle || 'Mock Test Performance Report'}
          </h1>

          {/* Main Scorecard Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">Total Score</p>
              <p className="text-2xl font-black text-white mt-0.5">
                {result.score.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ {result.totalMarks}</span>
              </p>
              <p className="text-[10px] text-indigo-300 font-semibold mt-0.5">
                {result.percentage.toFixed(1)}% Marks
              </p>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">Accuracy</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {result.accuracy.toFixed(1)}%
              </p>
              <p className="text-[10px] text-emerald-300/80 font-semibold mt-0.5">
                {result.correctCount}/{result.correctCount + result.wrongCount} Attempted
              </p>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">State Rank</p>
              <p className="text-2xl font-black text-blue-400 mt-0.5">
                {result.rank !== null ? `#${result.rank}` : '—'}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  {result.rank !== null ? `/ ${result.totalCandidates}` : ''}
                </span>
              </p>
              <p className="text-[10px] text-blue-300/80 font-semibold mt-0.5">
                {result.percentile !== null ? `${result.percentile}th %ile` : 'Rank Pending'}
              </p>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">Time Taken</p>
              <p className="text-2xl font-black text-slate-200 mt-0.5">
                {formatSeconds(result.timeSpentSeconds)}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Completed</p>
            </div>
          </div>
        </div>

        {/* Decorative background trophy icon */}
        <Award className="absolute right-4 -bottom-6 w-56 h-56 text-white/5 pointer-events-none" />
      </Card>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Correct Answers
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{result.correctCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Full marks awarded</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Incorrect Answers
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1">{result.wrongCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Negative marks deducted</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Skipped / Unanswered
            </span>
            <p className="text-2xl font-black text-slate-600 mt-1">{result.skippedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">0 marks change</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
            <MinusCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Section-Wise Performance Breakdown */}
      {sectionBreakdown.length > 0 && (
        <Card className="p-5 border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Section-Wise Performance Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              {sectionBreakdown.length} Section{sectionBreakdown.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Section</th>
                  <th className="px-3.5 py-2.5 text-center">Questions</th>
                  <th className="px-3.5 py-2.5 text-center">Attempted</th>
                  <th className="px-3.5 py-2.5 text-center text-emerald-600">Correct</th>
                  <th className="px-3.5 py-2.5 text-center text-rose-600">Wrong</th>
                  <th className="px-3.5 py-2.5 text-center">Accuracy</th>
                  <th className="px-3.5 py-2.5 text-right font-bold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionBreakdown.map((sec) => {
                  const secAccuracy =
                    sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 100) : 0;
                  return (
                    <tr key={sec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{sec.name}</td>
                      <td className="px-3.5 py-2.5 text-center text-slate-600">{sec.totalQs}</td>
                      <td className="px-3.5 py-2.5 text-center text-slate-600">{sec.attempted}</td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-emerald-600">
                        {sec.correct}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-rose-600">
                        {sec.wrong}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {sec.attempted > 0 ? `${secAccuracy}%` : '—'}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-black text-indigo-600">
                        {sec.score.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Automatic Mistakes Notebook Banner */}
      {result.wrongCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-900">
            <span className="font-bold">Automated Mistakes Notebook Linkage:</span> We detected{' '}
            <strong>{result.wrongCount} wrong answers</strong>. These questions have been
            automatically added to your <strong>Mistakes Notebook</strong> so you can revise them
            without repeating mistakes.
          </div>
          <Link to="/practice">
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-amber-300 text-amber-800 shrink-0"
            >
              Open Notebook
            </Button>
          </Link>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          size="lg"
          className="w-full sm:w-auto font-bold shadow-md"
          rightIcon={<ChevronRight className="w-4 h-4" />}
          onClick={() => navigate(`/exams/${testId}/solutions/${attemptId}`)}
        >
          Review Detailed Question Solutions
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-xs"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => navigate(`/exams/${testId}`)}
          >
            Retake Mock Test
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto text-xs"
            onClick={() => navigate('/exams')}
          >
            Back to Tests
          </Button>
        </div>
      </div>
    </div>
  );
};
