import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Medal,
  Award,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { TestAttempt } from '@/types';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarText: string;
  avatarBg: string;
  tests: number;
  avgScore: number;
  accuracy: number;
  totalMarks: number;
  streak: number;
  tag?: string;
  exam?: string;
  isCurrentUser?: boolean;
}

// Mock dataset matching the user's reference mockup for WBP Constable & other exams
const LEADERBOARD_DATA: Record<string, LeaderboardUser[]> = {
  'WBP Constable': [
    {
      rank: 1,
      name: 'Ananya Pramanik',
      avatarText: 'AP',
      avatarBg: 'bg-amber-100 text-amber-800 ring-4 ring-amber-300/80',
      tests: 86,
      avgScore: 92.4,
      accuracy: 94,
      totalMarks: 7946,
      streak: 18,
      tag: 'Topper',
      exam: 'WBP Constable',
    },
    {
      rank: 2,
      name: 'Rohit Sarkar',
      avatarText: 'RS',
      avatarBg: 'bg-blue-100 text-blue-800 ring-4 ring-slate-300/80',
      tests: 78,
      avgScore: 88.1,
      accuracy: 90,
      totalMarks: 6872,
      streak: 14,
      tag: 'Achiever',
      exam: 'WBP Constable',
    },
    {
      rank: 3,
      name: 'Priya Mondal',
      avatarText: 'PM',
      avatarBg: 'bg-orange-100 text-orange-800 ring-4 ring-orange-300/80',
      tests: 72,
      avgScore: 86.7,
      accuracy: 88,
      totalMarks: 6242,
      streak: 11,
      tag: 'Star Performer',
      exam: 'WBP Constable',
    },
    {
      rank: 4,
      name: 'Arindam Das',
      avatarText: 'AD',
      avatarBg: 'bg-blue-50 text-blue-700',
      tests: 68,
      avgScore: 84.2,
      accuracy: 87,
      totalMarks: 5820,
      streak: 12,
      exam: 'WBP Constable',
    },
    {
      rank: 5,
      name: 'Sayon Dutta',
      avatarText: 'SD',
      avatarBg: 'bg-emerald-50 text-emerald-700',
      tests: 65,
      avgScore: 82.9,
      accuracy: 85,
      totalMarks: 5610,
      streak: 10,
      exam: 'WBP Constable',
    },
    {
      rank: 6,
      name: 'Sneha Paul',
      avatarText: 'SP',
      avatarBg: 'bg-purple-50 text-purple-700',
      tests: 63,
      avgScore: 81.4,
      accuracy: 84,
      totalMarks: 5420,
      streak: 9,
      exam: 'WBP Constable',
    },
    {
      rank: 7,
      name: 'Koushik Maity',
      avatarText: 'KM',
      avatarBg: 'bg-pink-50 text-pink-700',
      tests: 60,
      avgScore: 79.8,
      accuracy: 82,
      totalMarks: 5210,
      streak: 8,
      exam: 'WBP Constable',
    },
    {
      rank: 8,
      name: 'Mousumi Khatun',
      avatarText: 'MK',
      avatarBg: 'bg-indigo-50 text-indigo-700',
      tests: 58,
      avgScore: 78.6,
      accuracy: 81,
      totalMarks: 5040,
      streak: 7,
      exam: 'WBP Constable',
    },
    {
      rank: 9,
      name: 'Abhishek Roy',
      avatarText: 'AR',
      avatarBg: 'bg-amber-50 text-amber-700',
      tests: 56,
      avgScore: 77.1,
      accuracy: 80,
      totalMarks: 4880,
      streak: 6,
      exam: 'WBP Constable',
    },
    {
      rank: 10,
      name: 'Tania Saha',
      avatarText: 'TS',
      avatarBg: 'bg-teal-50 text-teal-700',
      tests: 54,
      avgScore: 76.3,
      accuracy: 79,
      totalMarks: 4620,
      streak: 5,
      exam: 'WBP Constable',
    },
  ],
};

const TOP_PERFORMERS_BY_EXAM = [
  { exam: 'WBP Constable', student: 'Ananya P.', score: 92.4, rankType: 'gold' },
  { exam: 'WBSSC Group D', student: 'Rohit S.', score: 89.1, rankType: 'silver' },
  { exam: 'SSC GD', student: 'Priya M.', score: 87.6, rankType: 'bronze' },
  { exam: 'Primary TET', student: 'Arindam D.', score: 85.2, rankType: 'normal', rankNum: 4 },
  { exam: 'WBPSC Clerkship', student: 'Mousumi K.', score: 84.8, rankType: 'normal', rankNum: 5 },
];

export const Rank: React.FC = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [, setLoading] = useState(true);

  // Filters
  const [selectedExam, setSelectedExam] = useState<string>('WBP Constable');
  const [selectedScope, setSelectedScope] = useState<string>('All India');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getUserAttempts(user.id)
      .then(setAttempts)
      .finally(() => setLoading(false));
  }, [user]);

  // Compute live user stats from their actual test attempts
  const completedAttempts = useMemo(() => {
    return attempts.filter((a) => a.status === 'completed');
  }, [attempts]);

  const userTestCount = completedAttempts.length > 0 ? completedAttempts.length : 32;
  const userAvgScore = completedAttempts.length > 0
    ? Number((completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length).toFixed(1))
    : 68.4;
  const userAccuracy = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / completedAttempts.length)
    : 72;
  const userTotalMarks = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((s, a) => s + (a.score || 0), 0))
    : 2980;

  // Active exam list
  const currentLeaderboard = useMemo(() => {
    const list = LEADERBOARD_DATA[selectedExam] || LEADERBOARD_DATA['WBP Constable'];
    return list;
  }, [selectedExam]);

  const top1 = currentLeaderboard.find((u) => u.rank === 1);
  const top2 = currentLeaderboard.find((u) => u.rank === 2);
  const top3 = currentLeaderboard.find((u) => u.rank === 3);
  const restRanks = currentLeaderboard.filter((u) => u.rank > 3);

  // Current user row
  const displayName = user?.fullName || 'Susanta Lohar';
  const currentUserRow: LeaderboardUser = {
    rank: 147,
    name: displayName,
    avatarText: displayName
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    avatarBg: 'bg-[#0158fc] text-white',
    tests: userTestCount,
    avgScore: userAvgScore,
    accuracy: userAccuracy,
    totalMarks: userTotalMarks,
    streak: 4,
    isCurrentUser: true,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200">Leaderboard</span>
        </nav>

        {/* 1. Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-[#d6e5f8] dark:border-slate-800 bg-gradient-to-r from-[#f4f9fd] via-[#eef6fe] to-[#e4f0ff] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl z-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a8a] dark:text-blue-300 tracking-tight">
                Leaderboard
              </h1>
              <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 leading-snug">
                Compete, stay consistent and climb the ranks!
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <span>Your hard work today builds a brighter tomorrow.</span>
                <span>💙</span>
              </p>
            </div>

            {/* Banner Illustration (Trophy + Arrows) */}
            <div className="relative shrink-0 flex items-center justify-end">
              <img
                src="/images/leaderboard_hero_art.png"
                alt="Leaderboard Trophy - Top Aspirants Stronger Bengal"
                className="h-28 sm:h-36 w-auto object-contain drop-shadow-sm select-none pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* 2. Main Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Filters, Podium Cards, Rankings Table (col-span-8 or 9) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Exam Selector */}
              <div className="relative">
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  aria-label="Filter by exam"
                  className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
                >
                  <option value="WBP Constable">WBP Constable</option>
                  <option value="KP SI">KP SI</option>
                  <option value="WBPSC Clerkship">WBPSC Clerkship</option>
                  <option value="Primary TET">Primary TET</option>
                  <option value="SSC GD">SSC GD</option>
                </select>
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                  WB
                </div>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {/* Scope Selector */}
              <div className="relative">
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  aria-label="Filter by region scope"
                  className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
                >
                  <option value="All India">All India</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="District">My District</option>
                </select>
                <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {/* Period Selector */}
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  aria-label="Filter by time period"
                  className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
                >
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                  <option value="All Time">All Time</option>
                </select>
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* 3. Top 3 Spotlight Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
              {/* RANK 2: Silver (Left) */}
              {top2 && (
                <div className="rounded-3xl border border-blue-100/90 dark:border-slate-800 bg-gradient-to-b from-[#f8faff] to-[#eff4fc] dark:from-slate-900 dark:to-slate-850 p-5 text-center shadow-sm relative pt-8">
                  {/* Silver Crown Badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center h-8 w-11 rounded-full bg-slate-100 border border-slate-300 shadow-sm text-slate-700 font-black text-xs">
                    <span className="mr-0.5">🥈</span> 2
                  </div>

                  {/* Avatar */}
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-slate-200 to-blue-200 p-1 flex items-center justify-center shadow-md">
                    <div className="h-full w-full rounded-full bg-slate-800 text-white font-bold text-lg flex items-center justify-center shadow-inner">
                      {top2.avatarText}
                    </div>
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900 dark:text-white text-base">
                    {top2.name}
                  </h3>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-bold text-[#0158fc] dark:text-blue-400">
                      ✦ {top2.tag || 'Achiever'}
                    </span>
                  </div>

                  {/* 3 Stats */}
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-1">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">Tests</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {top2.tests}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">Avg. Score</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {top2.avgScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">Accuracy</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {top2.accuracy}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RANK 1: Gold / Topper (Middle, Elevated) */}
              {top1 && (
                <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-500/50 bg-gradient-to-b from-[#fffbeb] via-[#fffdf5] to-[#fef3c7]/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 p-6 text-center shadow-lg relative pt-9 md:-translate-y-2">
                  {/* Golden Crown Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center h-9 w-12 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-300 shadow-md text-amber-950 font-black text-xs">
                    <Crown className="h-4 w-4 mr-0.5 fill-amber-900 text-amber-900" /> 1
                  </div>

                  {/* Avatar with Golden Laurel / Halo */}
                  <div className="mx-auto relative">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 p-1 flex items-center justify-center shadow-md">
                      <div className="h-full w-full rounded-full bg-amber-900 text-amber-100 font-extrabold text-xl flex items-center justify-center shadow-inner">
                        {top1.avatarText}
                      </div>
                    </div>
                    {/* Laurel Wreath leaves decoration */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-amber-500 text-lg select-none">
                      🌿
                    </div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-amber-500 text-lg scale-x-[-1] select-none">
                      🌿
                    </div>
                  </div>

                  <h3 className="mt-3 font-extrabold text-slate-900 dark:text-white text-lg">
                    {top1.name}
                  </h3>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/80 px-3 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs">
                      ★ {top1.tag || 'Topper'}
                    </span>
                  </div>

                  {/* 3 Stats */}
                  <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-slate-800 grid grid-cols-3 gap-1">
                    <div>
                      <div className="text-[11px] font-semibold text-amber-800/70 dark:text-amber-300/60">
                        Tests
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {top1.tests}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-amber-800/70 dark:text-amber-300/60">
                        Avg. Score
                      </div>
                      <div className="text-base font-black text-[#0158fc] dark:text-blue-400 mt-0.5">
                        {top1.avgScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-amber-800/70 dark:text-amber-300/60">
                        Accuracy
                      </div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {top1.accuracy}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RANK 3: Bronze (Right) */}
              {top3 && (
                <div className="rounded-3xl border border-orange-100/90 dark:border-slate-800 bg-gradient-to-b from-[#fffaf5] to-[#fef1e6] dark:from-slate-900 dark:to-slate-850 p-5 text-center shadow-sm relative pt-8">
                  {/* Bronze Crown Badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center h-8 w-11 rounded-full bg-orange-100 border border-orange-300 shadow-sm text-orange-800 font-black text-xs">
                    <span className="mr-0.5">🥉</span> 3
                  </div>

                  {/* Avatar */}
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-orange-200 to-amber-200 p-1 flex items-center justify-center shadow-md">
                    <div className="h-full w-full rounded-full bg-orange-950 text-orange-100 font-bold text-lg flex items-center justify-center shadow-inner">
                      {top3.avatarText}
                    </div>
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900 dark:text-white text-base">
                    {top3.name}
                  </h3>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 dark:text-orange-400">
                      ★ {top3.tag || 'Star Performer'}
                    </span>
                  </div>

                  {/* 3 Stats */}
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-1">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">Tests</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {top3.tests}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">Avg. Score</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {top3.avgScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">Accuracy</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {top3.accuracy}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Leaderboard Table (Ranks 4 to 10 + Sticky User Row) */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4 text-center">Tests</th>
                      <th className="py-3.5 px-4 text-center">Average Score</th>
                      <th className="py-3.5 px-4 text-center">Accuracy</th>
                      <th className="py-3.5 px-4 text-center">Total Marks</th>
                      <th className="py-3.5 px-4 text-center">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs sm:text-sm">
                    {restRanks.map((student) => (
                      <tr
                        key={student.rank}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                          {student.rank}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${student.avatarBg}`}
                            >
                              {student.avatarText}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                          {student.tests}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                          {student.avgScore}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                          {student.accuracy}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                          {student.totalMarks.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Flame className="h-3.5 w-3.5 fill-current text-orange-500" />
                            {student.streak}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Current User Highlighted Sticky Row */}
                    <tr className="bg-[#edf4fe] dark:bg-blue-950/40 border-t-2 border-blue-200 dark:border-blue-800 font-semibold">
                      <td className="py-4 px-4 text-center font-extrabold text-[#0158fc] text-sm">
                        {currentUserRow.rank}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#0158fc] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {currentUserRow.avatarText}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#063585] dark:text-blue-200 text-sm">
                              {currentUserRow.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>Keep going! You can do better!</span>
                              <span>💪</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-[#063585] dark:text-blue-300">
                        {currentUserRow.tests}
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-[#0158fc]">
                        {currentUserRow.avgScore}
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-[#063585] dark:text-blue-300">
                        {currentUserRow.accuracy}%
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-[#063585] dark:text-blue-300">
                        {currentUserRow.totalMarks.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-extrabold text-orange-600 dark:text-orange-400">
                          <Flame className="h-4 w-4 fill-current text-orange-500" />
                          {currentUserRow.streak}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Cards (col-span-4 or 3) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Card 1: Your Rank */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your Rank</h4>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    # 147
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                    ↑ 23
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  out of 2,843 students
                </div>
              </div>

              {/* Green Improvement Notice */}
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Rank improved by 23 places!</span>
              </div>

              {/* 3 Stats in Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {currentUserRow.tests}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">Tests Taken</div>
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {currentUserRow.avgScore}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">Avg. Score</div>
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {currentUserRow.accuracy}%
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">Accuracy</div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/test-series"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0158fc] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm"
              >
                <span>Keep Practicing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 2: Top Performers by Exam */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Performers by Exam
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedExam('WBP Constable')}
                  className="text-xs font-bold text-[#0158fc] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {TOP_PERFORMERS_BY_EXAM.map((item, idx) => {
                  return (
                    <div
                      key={item.exam}
                      onClick={() => setSelectedExam(item.exam)}
                      className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.rankType === 'gold' ? (
                          <div className="h-7 w-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Trophy className="h-4 w-4 fill-amber-500 text-amber-600" />
                          </div>
                        ) : item.rankType === 'silver' ? (
                          <div className="h-7 w-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Medal className="h-4 w-4 text-slate-500" />
                          </div>
                        ) : item.rankType === 'bronze' ? (
                          <div className="h-7 w-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <Award className="h-4 w-4 text-orange-500" />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.exam}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.student}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">
                        {item.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Motivational Quote Card */}
            <div className="rounded-3xl border border-[#d2e4f7] dark:border-slate-800 bg-gradient-to-br from-[#ebf4fd] via-[#f0f7fe] to-[#e4f0fc] dark:from-slate-900 dark:to-slate-850 p-5 relative overflow-hidden shadow-sm">
              <div className="text-4xl sm:text-5xl font-serif text-blue-400/50 dark:text-blue-400/30 leading-none select-none">
                “
              </div>
              <p className="text-xs sm:text-sm font-semibold italic text-[#063585] dark:text-blue-200 mt-1 leading-relaxed">
                "Discipline today creates success tomorrow."
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  — PracticeKoro
                </span>
                <img
                  src="/images/leaderboard_plant.png"
                  alt="Plant Doodle"
                  className="h-10 w-10 object-contain drop-shadow-sm select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
