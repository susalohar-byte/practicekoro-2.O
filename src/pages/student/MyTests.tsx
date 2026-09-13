import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronRight,
  FileCheck2
} from 'lucide-react';
import { formatSeconds } from '@/lib/utils';
import type { TestAttempt } from '@/types';

export const MyTests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    async function loadAttempts() {
      if (!user) return;
      try {
        const data = await api.getUserAttempts(user.id);
        setAttempts(data);
      } catch (err) {
        console.error('Failed to load user attempts:', err);
      }
    }
    loadAttempts();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Mock Test Attempts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review past test attempts, detailed question-by-question solutions, and score trends
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-8 h-8" />}
          title="No test attempts yet"
          description="Start by taking a free diagnostic chapter test or full mock test from the Tests section."
          actionLabel="Browse Available Tests"
          onAction={() => navigate('/tests')}
        />
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <Card key={attempt.id} className="p-5 border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Completed</Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(attempt.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {attempt.testTitle || 'Mock Test Part 01: Indus Valley (Free)'}
                  </h3>

                  {/* Analytics Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-sm font-black text-slate-900">
                        {attempt.score.toFixed(2)} / {attempt.totalMarks}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-sm font-black text-emerald-600">
                        {attempt.accuracy.toFixed(1)}%
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Time Taken</p>
                      <p className="text-sm font-black text-slate-700">
                        {formatSeconds(attempt.timeSpentSeconds)}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">State Rank</p>
                      <p className="text-sm font-black text-blue-600">
                        {attempt.rank ? (
                          <>
                            #{attempt.rank}{' '}
                            <span className="text-[10px] font-normal text-slate-500">
                              ({attempt.percentile ? `${attempt.percentile}%ile` : 'Ranked'})
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">— (Pending)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown pill */}
                  <div className="flex items-center gap-4 text-xs font-semibold pt-1 text-slate-600">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {attempt.correctCount} Correct
                    </span>
                    <span className="flex items-center gap-1 text-rose-600">
                      <XCircle className="w-3.5 h-3.5" /> {attempt.wrongCount} Wrong
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MinusCircle className="w-3.5 h-3.5" /> {attempt.skippedCount} Skipped
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => {
                      alert(`Reviewing attempt ${attempt.id} solutions.\nDetailed question-by-question review module will be integrated in Phase 2.`);
                    }}
                  >
                    Review Solutions
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
