import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Bookmark,
  ArrowLeft,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import type { QuestionSolution } from '@/types';

export const TestSolutions: React.FC = () => {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [solutions, setSolutions] = useState<QuestionSolution[]>([]);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'skipped'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSolutions() {
      if (!testId || !attemptId) return;
      setLoading(true);
      try {
        const data = await api.getAttemptSolutions(attemptId, testId);
        setSolutions(data);
      } catch (err) {
        console.error('Failed to load solutions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSolutions();
  }, [testId, attemptId]);

  const handleToggleBookmark = async (qId: string) => {
    if (!user) return;
    const isNowBookmarked = await api.toggleBookmark(user.id, qId);
    setSolutions((prev) =>
      prev.map((s) => (s.id === qId ? { ...s, isBookmarked: isNowBookmarked } : s))
    );
  };

  const filteredSolutions = solutions.filter((s) => {
    if (filter === 'wrong') return s.selectedOption !== null && !s.isCorrect;
    if (filter === 'correct') return s.isCorrect;
    if (filter === 'skipped') return s.selectedOption === null;
    return true;
  });

  const correctCount = solutions.filter((s) => s.isCorrect).length;
  const wrongCount = solutions.filter((s) => s.selectedOption !== null && !s.isCorrect).length;
  const skippedCount = solutions.filter((s) => s.selectedOption === null).length;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/exams/${testId}/results/${attemptId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scorecard
        </button>

        <div className="flex items-center gap-2">
          <Link to="/practice">
            <Button size="sm" variant="outline" className="text-xs" leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}>
              Open Mistakes Notebook
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Detailed Solutions & Explanations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Question-wise authoritative answer key, student selection comparison, and bilingual notes
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Questions ({solutions.length})
        </button>

        <button
          onClick={() => setFilter('wrong')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'wrong'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Incorrect Answers ({wrongCount})
        </button>

        <button
          onClick={() => setFilter('correct')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'correct'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          Correct Answers ({correctCount})
        </button>

        <button
          onClick={() => setFilter('skipped')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'skipped'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Skipped ({skippedCount})
        </button>
      </div>

      {/* Solutions List */}
      <div className="space-y-4">
        {filteredSolutions.map((sol) => {
          const isWrong = sol.selectedOption !== null && !sol.isCorrect;
          const isSkipped = sol.selectedOption === null;

          return (
            <Card key={sol.id} className="p-6 border-slate-200 space-y-4">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    Q {sol.questionOrder}
                  </span>

                  {sol.isCorrect && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{sol.marksAwarded})
                    </Badge>
                  )}
                  {isWrong && (
                    <Badge variant="warning" className="bg-rose-50 text-rose-700 border-rose-200 gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect ({sol.marksAwarded})
                    </Badge>
                  )}
                  {isSkipped && (
                    <Badge variant="default" className="gap-1">
                      <MinusCircle className="w-3.5 h-3.5 text-slate-400" /> Skipped (0)
                    </Badge>
                  )}
                </div>

                <button
                  onClick={() => handleToggleBookmark(sol.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    sol.isBookmarked
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title={sol.isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                >
                  <Bookmark className={`w-4 h-4 ${sol.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {sol.questionText}
                </h3>
                {sol.questionBengaliText && (
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {sol.questionBengaliText}
                  </p>
                )}
              </div>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const optText = sol[`option${opt}` as keyof QuestionSolution] as string;
                  const isAnswer = sol.correctOption === opt;
                  const isUserChoice = sol.selectedOption === opt;

                  let style = 'bg-white border-slate-200 text-slate-700';

                  if (isAnswer) {
                    style = 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400';
                  } else if (isUserChoice && !sol.isCorrect) {
                    style = 'bg-rose-50/80 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-400';
                  }

                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${style}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                          {opt}
                        </span>
                        <span>{optText}</span>
                      </div>

                      {isAnswer && (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100 shrink-0">
                          Correct
                        </span>
                      )}
                      {isUserChoice && !sol.isCorrect && (
                        <span className="text-[10px] uppercase font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-100 shrink-0">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                <p className="font-bold text-[11px] text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Detailed Academic Explanation / ব্যাখ্যা:
                </p>
                <p className="leading-relaxed">{sol.explanation}</p>
                {sol.explanationBengali && (
                  <p className="text-slate-700 pt-1 border-t border-indigo-100/60 leading-relaxed font-sans">
                    {sol.explanationBengali}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
