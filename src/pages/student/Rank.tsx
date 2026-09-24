import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Flame,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { TestAttempt } from '@/types';
import { StudentNavbar } from '@/components/layout/StudentNavbar';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarUrl: string;
  fallbackText: string;
  tests: number;
  avgScore: number;
  accuracy: number;
  totalMarks: number;
  streak: number;
  tag?: string;
  exam?: string;
  isCurrentUser?: boolean;
}

// Laurel wreath SVG wrapping around Rank 1 avatar
const GoldenLaurelWreath: React.FC = () => (
  <svg
    className="absolute -inset-3.5 w-[130%] h-[130%] pointer-events-none select-none z-10"
    viewBox="0 0 100 100"
    fill="none"
  >
    {/* Left branch */}
    <path d="M 28 80 C 12 65 12 35 30 20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 22 72 Q 10 70 18 64 Q 24 68 22 72 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    <path d="M 18 58 Q 6 54 16 48 Q 21 53 18 58 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    <path d="M 17 44 Q 6 38 18 32 Q 22 38 17 44 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    <path d="M 22 30 Q 12 22 25 18 Q 27 24 22 30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />

    {/* Right branch */}
    <path d="M 72 80 C 88 65 88 35 70 20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 78 72 Q 90 70 82 64 Q 76 68 78 72 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    <path d="M 82 58 Q 94 54 84 48 Q 79 53 82 58 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    <path d="M 83 44 Q 94 38 82 32 Q 78 38 83 44 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
    <path d="M 78 30 Q 88 22 75 18 Q 73 24 78 30 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
  </svg>
);

// Dataset matching the reference mockup for WBP Constable & other exams
const LEADERBOARD_DATA: Record<string, LeaderboardUser[]> = {
  'WBP Constable': [
    {
      rank: 1,
      name: 'Ananya Pramanik',
      avatarUrl: '/images/leaderboard_ananya.jpg',
      fallbackText: 'AP',
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
      avatarUrl: '/images/leaderboard_rohit.jpg',
      fallbackText: 'RS',
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
      avatarUrl: '/images/leaderboard_priya.jpg',
      fallbackText: 'PM',
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
      avatarUrl: '/images/avatar_arindam.jpg',
      fallbackText: 'AD',
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
      avatarUrl: '/images/avatar_sayon.jpg',
      fallbackText: 'SD',
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
      avatarUrl: '/images/avatar_sneha.jpg',
      fallbackText: 'SP',
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
      avatarUrl: '/images/avatar_koushik.jpg',
      fallbackText: 'KM',
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
      avatarUrl: '/images/avatar_mousumi.jpg',
      fallbackText: 'MK',
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
      avatarUrl: '/images/avatar_abhishek.jpg',
      fallbackText: 'AR',
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
      avatarUrl: '/images/avatar_tania.jpg',
      fallbackText: 'TS',
      tests: 54,
      avgScore: 76.3,
      accuracy: 79,
      totalMarks: 4620,
      streak: 5,
      exam: 'WBP Constable',
    },
  ],
  'KP SI': [
    {
      rank: 1,
      name: 'Debasish Ghosh',
      avatarUrl: '/images/leaderboard_rohit.jpg',
      fallbackText: 'DG',
      tests: 74,
      avgScore: 89.5,
      accuracy: 91,
      totalMarks: 6623,
      streak: 15,
      tag: 'Topper',
      exam: 'KP SI',
    },
    {
      rank: 2,
      name: 'Poulomi Das',
      avatarUrl: '/images/leaderboard_priya.jpg',
      fallbackText: 'PD',
      tests: 69,
      avgScore: 86.2,
      accuracy: 88,
      totalMarks: 5948,
      streak: 12,
      tag: 'Achiever',
      exam: 'KP SI',
    },
    {
      rank: 3,
      name: 'Rupam Mondal',
      avatarUrl: '/images/avatar_arindam.jpg',
      fallbackText: 'RM',
      tests: 65,
      avgScore: 84.1,
      accuracy: 86,
      totalMarks: 5466,
      streak: 9,
      tag: 'Star Performer',
      exam: 'KP SI',
    },
    {
      rank: 4,
      name: 'Suman Roy',
      avatarUrl: '/images/avatar_sayon.jpg',
      fallbackText: 'SR',
      tests: 61,
      avgScore: 81.3,
      accuracy: 83,
      totalMarks: 4959,
      streak: 8,
      exam: 'KP SI',
    },
    {
      rank: 5,
      name: 'Anirban Bera',
      avatarUrl: '/images/avatar_koushik.jpg',
      fallbackText: 'AB',
      tests: 57,
      avgScore: 79.5,
      accuracy: 81,
      totalMarks: 4531,
      streak: 7,
      exam: 'KP SI',
    },
  ],
  'WBPSC Clerkship': [
    {
      rank: 1,
      name: 'Sujata Majumder',
      avatarUrl: '/images/leaderboard_ananya.jpg',
      fallbackText: 'SM',
      tests: 81,
      avgScore: 91.2,
      accuracy: 93,
      totalMarks: 7387,
      streak: 16,
      tag: 'Topper',
      exam: 'WBPSC Clerkship',
    },
    {
      rank: 2,
      name: 'Bikram Sarkar',
      avatarUrl: '/images/avatar_sayon.jpg',
      fallbackText: 'BS',
      tests: 76,
      avgScore: 87.8,
      accuracy: 89,
      totalMarks: 6672,
      streak: 13,
      tag: 'Achiever',
      exam: 'WBPSC Clerkship',
    },
    {
      rank: 3,
      name: 'Ankita Sen',
      avatarUrl: '/images/avatar_sneha.jpg',
      fallbackText: 'AS',
      tests: 70,
      avgScore: 85.4,
      accuracy: 87,
      totalMarks: 5978,
      streak: 10,
      tag: 'Star Performer',
      exam: 'WBPSC Clerkship',
    },
  ],
};

// Top performers across exams list
const TOP_PERFORMERS_BY_EXAM = [
  {
    exam: 'WBP Constable',
    student: 'Ananya P.',
    score: '92.4',
    medal: 'gold',
  },
  {
    exam: 'WBSSC Group D',
    student: 'Rohit S.',
    score: '89.1',
    medal: 'silver',
  },
  {
    exam: 'SSC GD',
    student: 'Priya M.',
    score: '87.6',
    medal: 'bronze',
  },
  {
    exam: 'Primary TET',
    student: 'Arindam D.',
    score: '85.2',
    rank: 4,
    avatarUrl: '/images/avatar_arindam.jpg',
  },
  {
    exam: 'WBPSC Clerkship',
    student: 'Mousumi K.',
    score: '84.8',
    rank: 5,
    avatarUrl: '/images/avatar_mousumi.jpg',
  },
];

export const Rank: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onToggleMobileSidebar } = useOutletContext<{ onToggleMobileSidebar?: () => void }>() || {};

  const [selectedExam, setSelectedExam] = useState<string>('WBP Constable');
  const [selectedScope, setSelectedScope] = useState<string>('All India');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  // Load genuine student test attempts
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    api
      .getUserAttempts(user.id)
      .then((data) => {
        if (isMounted) setAttempts(data || []);
      })
      .catch((err) => {
        console.error('Failed to load user attempts for rank page:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Compute live user stats from their actual test attempts or use benchmark
  const completedAttempts = useMemo(() => {
    return attempts.filter((a) => a.status === 'completed');
  }, [attempts]);

  const userTestCount = completedAttempts.length > 0 ? completedAttempts.length : 32;
  const userAvgScore =
    completedAttempts.length > 0
      ? Number((completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length).toFixed(1))
      : 68.4;
  const userAccuracy =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / completedAttempts.length)
      : 72;
  const userTotalMarks =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((s, a) => s + (a.score || 0), 0))
      : 2980;

  // Active exam list
  const currentLeaderboard = useMemo(() => {
    return LEADERBOARD_DATA[selectedExam] || LEADERBOARD_DATA['WBP Constable'];
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
    avatarUrl: user?.avatarUrl || '/images/profile_user_avatar.jpg',
    fallbackText: displayName
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    tests: userTestCount,
    avgScore: userAvgScore,
    accuracy: userAccuracy,
    totalMarks: userTotalMarks,
    streak: 4,
    isCurrentUser: true,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <StudentNavbar embedded onToggleMobileSidebar={onToggleMobileSidebar} />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Leaderboard</span>
        </nav>

        {/* 2. Page Header with Trophy Illustration */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
              Leaderboard
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 leading-snug">
              Compete, stay consistent and climb the ranks!
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Your hard work today builds a brighter tomorrow.</span>
              <span className="text-blue-500">💙</span>
            </p>

            {/* Filter Dropdown Pills directly under Header */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              {/* Exam Selector */}
              <div className="relative">
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  aria-label="Filter by exam"
                  className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="WBP Constable">WBP Constable</option>
                  <option value="KP SI">KP SI</option>
                  <option value="WBPSC Clerkship">WBPSC Clerkship</option>
                  <option value="Primary TET">Primary TET</option>
                  <option value="SSC GD">SSC GD</option>
                </select>
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-md bg-blue-100 dark:bg-blue-900/60 text-[#1e60f2] dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
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
                  className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All India">All India</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="District">My District</option>
                </select>
                <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e60f2]" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {/* Period Selector */}
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  aria-label="Filter by time period"
                  className="appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                  <option value="All Time">All Time</option>
                </select>
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e60f2]" />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Top Right Exact Hero Trophy Art */}
          <div className="relative shrink-0 flex items-center justify-end">
            <img
              src="/images/leaderboard_hero_art_exact.png"
              alt="Leaderboard Trophy - Same Dream Bigger Preparation - Top Aspirants Stronger Bengal"
              className="h-28 sm:h-36 lg:h-40 w-auto object-contain select-none pointer-events-none drop-shadow-xs"
            />
          </div>
        </div>

        {/* 3. Top 3 Spotlight Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-end pt-3">
          {/* RANK 2: Silver (Left) */}
          {top2 && (
            <div className="rounded-3xl border border-[#dbeafe] dark:border-slate-800 bg-gradient-to-b from-[#f0f6ff] to-[#ffffff] dark:from-slate-900 dark:to-slate-850 p-5 text-center shadow-xs relative pt-7">
              {/* Silver Crown Badge */}
              <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="relative">
                  <svg className="w-9 h-9 text-slate-400 fill-slate-300 drop-shadow-sm" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-slate-800 pt-1.5">
                    2
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="mx-auto h-20 w-20 rounded-full p-1 flex items-center justify-center">
                <img
                  src={top2.avatarUrl}
                  alt={top2.name}
                  className="h-18 w-18 rounded-full object-cover shadow-sm ring-4 ring-slate-200 dark:ring-slate-700"
                  onError={(e) => {
                    e.currentTarget.src = '/images/profile_user_avatar.jpg';
                  }}
                />
              </div>

              {/* Name & Tag */}
              <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white truncate">
                {top2.name}
              </h3>
              <div className="mt-1 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                  <span>✦</span>
                  <span>{top2.tag || 'Achiever'}</span>
                </span>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{top2.tests}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Score</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{top2.avgScore}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{top2.accuracy}%</p>
                </div>
              </div>
            </div>
          )}

          {/* RANK 1: Gold (Center - Taller & Highlighted) */}
          {top1 && (
            <div className="rounded-3xl border border-[#fef08a] dark:border-amber-900/60 bg-gradient-to-b from-[#fffdf5] via-[#fef9c3]/30 to-[#ffffff] dark:from-slate-900 dark:to-slate-850 p-6 text-center shadow-md relative pt-8 md:-mt-2">
              {/* Gold Crown Badge */}
              <div className="absolute -top-5.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="relative">
                  <svg className="w-11 h-11 text-amber-500 fill-amber-400 drop-shadow-sm" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-amber-950 pt-2">
                    1
                  </span>
                </div>
              </div>

              {/* Avatar with Golden Laurel Wreath */}
              <div className="relative mx-auto h-22 w-22 flex items-center justify-center">
                <GoldenLaurelWreath />
                <img
                  src={top1.avatarUrl}
                  alt={top1.name}
                  className="h-19 w-19 rounded-full object-cover shadow-md ring-4 ring-amber-300 dark:ring-amber-500 z-0"
                  onError={(e) => {
                    e.currentTarget.src = '/images/profile_user_avatar.jpg';
                  }}
                />
              </div>

              {/* Name & Tag */}
              <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white truncate">
                {top1.name}
              </h3>
              <div className="mt-1 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  <span>★</span>
                  <span>{top1.tag || 'Topper'}</span>
                </span>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3.5 border-t border-amber-100 dark:border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{top1.tests}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Score</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{top1.avgScore}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{top1.accuracy}%</p>
                </div>
              </div>
            </div>
          )}

          {/* RANK 3: Bronze (Right) */}
          {top3 && (
            <div className="rounded-3xl border border-[#ffedd5] dark:border-slate-800 bg-gradient-to-b from-[#fff7ed] to-[#ffffff] dark:from-slate-900 dark:to-slate-850 p-5 text-center shadow-xs relative pt-7">
              {/* Bronze Crown Badge */}
              <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="relative">
                  <svg className="w-9 h-9 text-amber-700 fill-amber-600/70 drop-shadow-sm" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-amber-950 pt-1.5">
                    3
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="mx-auto h-20 w-20 rounded-full p-1 flex items-center justify-center">
                <img
                  src={top3.avatarUrl}
                  alt={top3.name}
                  className="h-18 w-18 rounded-full object-cover shadow-sm ring-4 ring-orange-200 dark:ring-orange-800"
                  onError={(e) => {
                    e.currentTarget.src = '/images/profile_user_avatar.jpg';
                  }}
                />
              </div>

              {/* Name & Tag */}
              <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white truncate">
                {top3.name}
              </h3>
              <div className="mt-1 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800">
                  <span>★</span>
                  <span>{top3.tag || 'Star Performer'}</span>
                </span>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{top3.tests}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Score</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{top3.avgScore}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{top3.accuracy}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Main Two-Column Grid: Rankings Table (Left) + Side Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT COLUMN: Rankings Table (Col-span 8) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3.5 pl-6 pr-3">#</th>
                    <th className="py-3.5 px-3">Student</th>
                    <th className="py-3.5 px-3 text-center">Tests</th>
                    <th className="py-3.5 px-3 text-center">Average Score</th>
                    <th className="py-3.5 px-3 text-center">Accuracy</th>
                    <th className="py-3.5 px-3 text-center">Total Marks</th>
                    <th className="py-3.5 pr-6 pl-3 text-center">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm font-semibold">
                  {restRanks.map((student) => (
                    <tr
                      key={student.rank}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 pl-6 pr-3 font-bold text-slate-500">
                        {student.rank}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-8 w-8 rounded-full object-cover shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/images/profile_user_avatar.jpg';
                            }}
                          />
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">
                        {student.tests}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                        {student.avgScore}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">
                        {student.accuracy}%
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">
                        {student.totalMarks.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 pr-6 pl-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                          <span>{student.streak}</span>
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* STICKY / HIGHLIGHTED CURRENT USER ROW */}
                  <tr className="bg-[#eff6ff] dark:bg-blue-950/40 border-t-2 border-blue-200 dark:border-blue-800">
                    <td className="py-3 pl-6 pr-3 font-black text-[#1e60f2] text-sm">
                      {currentUserRow.rank}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUserRow.avatarUrl}
                          alt={currentUserRow.name}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-[#1e60f2] shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/images/profile_user_avatar.jpg';
                          }}
                        />
                        <div>
                          <p className="font-black text-slate-900 dark:text-white leading-tight">
                            {currentUserRow.name}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            Keep going! You can do better! 💪
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1e60f2]">
                      {currentUserRow.tests}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white">
                      {currentUserRow.avgScore}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1e60f2]">
                      {currentUserRow.accuracy}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-200">
                      {currentUserRow.totalMarks.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-6 pl-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                        <span>{currentUserRow.streak}</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: 3 Stacked Cards (Col-span 4) */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            {/* CARD 1: "Your Rank" */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Your Rank
                </h3>
              </div>

              {/* Big Rank Number & Improvement Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-2xl font-bold">#</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      147
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    out of 2,843 students
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>23</span>
                </div>
              </div>

              {/* Rank Improvement Alert */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rank improved by 23 places!</span>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {userTestCount}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tests Taken</p>
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {userAvgScore}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Avg. Score</p>
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {userAccuracy}%
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Accuracy</p>
                </div>
              </div>

              {/* Action Button: Keep Practicing */}
              <button
                type="button"
                onClick={() => navigate('/practice')}
                className="w-full py-2.5 rounded-xl bg-[#1e60f2] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Keep Practicing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* CARD 2: "Top Performers by Exam" */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Top Performers by Exam
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedScope('All India')}
                  className="text-xs font-bold text-[#1e60f2] hover:text-blue-700 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {TOP_PERFORMERS_BY_EXAM.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Trophy or Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base">
                        {item.medal === 'gold' && '🏆'}
                        {item.medal === 'silver' && '🥈'}
                        {item.medal === 'bronze' && '🥉'}
                        {!item.medal && (
                          <img
                            src={item.avatarUrl || '/images/avatar_arindam.jpg'}
                            alt={item.student}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.exam}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.student}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm shrink-0">
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: "Motivational Quote & Potted Plant" */}
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:to-slate-850 rounded-3xl p-5 sm:p-6 border border-blue-100/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 relative overflow-hidden">
              <div className="space-y-1 z-10 max-w-[75%]">
                <span className="text-[#1e60f2] text-3xl font-serif font-black leading-none block">
                  &ldquo;
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug italic">
                  Discipline today creates success tomorrow.
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                  — PracticeKoro
                </p>
              </div>

              {/* Plant Illustration */}
              <div className="shrink-0 flex items-end justify-end">
                <img
                  src="/images/leaderboard_plant.png"
                  alt="Green Plant"
                  className="w-12 h-14 object-contain drop-shadow-2xs select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
