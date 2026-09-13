import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { formatSeconds } from '@/lib/utils';
import type { GradedResult } from '@/types';

export const TestResult: React.FC = () => {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<GradedResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!attemptId) return;
      setLoading(true);
      try {
        const data = await api.getAttemptResult(attemptId);
        setResult(data);
      } catch (err) {
        console.error('Failed to load attempt result:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Result Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unable to locate the test attempt result.</p>
        <Link to="/tests" className="mt-4 inline-block">
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
            <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
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
                {result.score.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ {result.totalMarks}</span>
              </p>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">Accuracy</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {result.accuracy.toFixed(1)}%
              </p>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">State Rank</p>
              <p className="text-2xl font-black text-blue-400 mt-0.5">
                #{result.rank} <span className="text-xs text-slate-400 font-normal">/ {result.totalCandidates}</span>
              </p>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-slate-300">Time Taken</p>
              <p className="text-2xl font-black text-slate-200 mt-0.5">
                {formatSeconds(result.timeSpentSeconds)}
              </p>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct Answers</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{result.correctCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Full marks awarded</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incorrect Answers</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{result.wrongCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Negative marks deducted</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skipped / Unanswered</span>
            <p className="text-2xl font-black text-slate-600 mt-1">{result.skippedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">0 marks change</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
            <MinusCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Automatic Mistakes Notebook Banner */}
      {result.wrongCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-900">
            <span className="font-bold">Automated Mistakes Notebook Linkage:</span> We detected <strong>{result.wrongCount} wrong answers</strong>. These questions have been automatically added to your <strong>Mistakes Notebook</strong> so you can revise them without repeating mistakes.
          </div>
          <Link to="/practice">
            <Button size="sm" variant="outline" className="bg-white border-amber-300 text-amber-800 shrink-0">
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
          onClick={() => navigate(`/tests/${testId}/solutions/${attemptId}`)}
        >
          Review Detailed Question Solutions
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-xs"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => navigate(`/tests/${testId}`)}
          >
            Retake Mock Test
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto text-xs"
            onClick={() => navigate('/tests')}
          >
            Back to Tests
          </Button>
        </div>
      </div>
    </div>
  );
};
