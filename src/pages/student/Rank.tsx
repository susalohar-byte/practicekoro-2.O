import React, { useEffect, useMemo, useState } from 'react';
import { Award, BarChart3, Flame, Medal, Target, TrendingUp, Trophy, UserRound, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { TestAttempt } from '@/types';

export const Rank: React.FC = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getUserAttempts(user.id).then(setAttempts).finally(() => setLoading(false));
  }, [user]);

  const completed = useMemo(
    () => attempts.filter((a) => a.status === 'completed').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [attempts]
  );
  const ranked = useMemo(() => completed.filter((a) => typeof a.rank === 'number' && (a.rank || 0) > 0), [completed]);
  const latest = ranked[0];
  const bestRank = ranked.length ? Math.min(...ranked.map((a) => a.rank as number)) : null;
  const avgAccuracy = completed.length ? Math.round(completed.reduce((s, a) => s + (a.accuracy || 0), 0) / completed.length) : 0;
  const avgScore = completed.length ? (completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length).toFixed(1) : '0.0';

  return (
    <div className="pk-student-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="pk-content space-y-6">
        <section className="pk-panel overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#eff5fb] via-white to-[#d9e7fd]/60 px-6 py-7 sm:px-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0158fc]">Student Rankings</p>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black">Your Rank</h1>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
                  Track your rank from completed mock tests and keep improving with every attempt.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 px-5 py-4 ring-1 ring-[#d9e7fd]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest rank</p>
                <p className="mt-1 text-3xl font-black text-[#0158fc]">{latest?.rank ? `#${latest.rank}` : '—'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pk-stat p-5"><div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-amber-500" /><span className="text-xs font-bold text-slate-500">Best Rank</span></div><p className="mt-3 text-2xl font-black text-[#063585]">{bestRank ? `#${bestRank}` : '—'}</p></div>
          <div className="pk-stat p-5"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-[#0158fc]" /><span className="text-xs font-bold text-slate-500">Average Score</span></div><p className="mt-3 text-2xl font-black text-[#063585]">{avgScore}</p></div>
          <div className="pk-stat p-5"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-emerald-500" /><span className="text-xs font-bold text-slate-500">Accuracy</span></div><p className="mt-3 text-2xl font-black text-[#063585]">{avgAccuracy}%</p></div>
          <div className="pk-stat p-5"><div className="flex items-center gap-3"><Flame className="h-5 w-5 text-orange-500" /><span className="text-xs font-bold text-slate-500">Completed Tests</span></div><p className="mt-3 text-2xl font-black text-[#063585]">{completed.length}</p></div>
        </section>

        {loading ? (
          <div className="pk-panel flex items-center justify-center py-20 text-sm font-semibold text-slate-500"><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading your rank...</div>
        ) : ranked.length === 0 ? (
          <div className="pk-panel px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff5fb] text-[#0158fc]"><Medal className="h-8 w-8" /></div>
            <h2 className="mt-5 text-xl font-black text-[#063585]">Your rank will appear here</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Complete a ranked mock test to start building your ranking history.</p>
          </div>
        ) : (
          <>
            <section className="pk-panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-extrabold uppercase tracking-wider text-[#0158fc]">Recent performance</p><h2 className="mt-1 text-xl font-black">Rank history</h2></div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff5fb] text-[#0158fc]"><TrendingUp className="h-5 w-5" /></div>
              </div>
              <div className="mt-5 space-y-2">
                {ranked.slice(0, 10).map((attempt) => (
                  <div key={attempt.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff5fb] text-xs font-black text-[#0158fc]"><Award className="h-4 w-4" /></div>
                    <div className="min-w-0"><p className="truncate text-sm font-extrabold text-[#0b1f44]">{attempt.testTitle || 'Mock Test'}</p><p className="text-xs text-slate-400">{attempt.examTitle || 'PracticeKoro'} • {new Date(attempt.createdAt).toLocaleDateString()}</p></div>
                    <div className="text-right"><p className="text-sm font-black text-[#063585]">#{attempt.rank}</p><p className="text-[11px] text-slate-400">{attempt.accuracy}% accuracy</p></div>
                    <div className="hidden text-right sm:block"><p className="text-sm font-black text-slate-700">{attempt.score}/{attempt.totalMarks}</p></div>
                  </div>
                ))}
              </div>
            </section>
            <section className="pk-soft-panel p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0158fc] shadow-sm"><UserRound className="h-5 w-5" /></div>
                <div><h3 className="text-base font-black text-[#063585]">Keep climbing</h3><p className="mt-1 text-sm text-slate-600">Your rank is calculated from ranked attempts available to your account. More completed tests give you more performance history to track.</p></div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
