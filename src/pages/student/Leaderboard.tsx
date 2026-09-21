import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterRegion, setFilterRegion] = useState<'All India' | 'West Bengal' | 'Friends'>('West Bengal');

  // Aspirant leaderboard data matching Screen 15
  const students = [
    { rank: 1, name: 'Ananya P.', score: '98.6%', avatar: 'AP', isUser: false, medal: 'gold' },
    { rank: 2, name: 'Rohit S.', score: '97.2%', avatar: 'RS', isUser: false, medal: 'silver' },
    { rank: 3, name: 'Sayon D.', score: '96.8%', avatar: 'SD', isUser: false, medal: 'bronze' },
    { rank: 4, name: 'Priya M.', score: '96.1%', avatar: 'PM', isUser: false },
    { rank: 5, name: 'Arindam D.', score: '95.4%', avatar: 'AD', isUser: false },
    { rank: 6, name: 'Debolina K.', score: '94.8%', avatar: 'DK', isUser: false },
    { rank: 7, name: 'Subham B.', score: '93.9%', avatar: 'SB', isUser: false },
  ];

  const userRank = {
    rank: 147,
    name: user?.fullName || 'You',
    score: '78.3%',
    avatar: user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'ME',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-28 md:pb-16 relative min-h-[85vh] flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header (Screen 15) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Rank
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                State & national level comparative merit
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Trophy className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Filter Pills: [All India] | [West Bengal] | [Friends] */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['All India', 'West Bengal', 'Friends'] as const).map((tab) => {
            const isActive = filterRegion === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterRegion(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Top 3 Aspirants Podium (Tablet & Desktop) */}
        <div className="hidden sm:grid grid-cols-3 gap-4 items-end pt-2 pb-2">
          {/* 2nd Place - Silver */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center space-y-2 shadow-xs">
            <span className="inline-block text-2xl">🥈</span>
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm">
              RS
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Rohit S.</h4>
              <p className="text-[11px] text-slate-400 font-semibold">Rank #2</p>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-200">
              97.2%
            </span>
          </div>

          {/* 1st Place - Gold (Taller & Highlighted) */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-700 text-center space-y-2.5 shadow-md shadow-amber-500/10 -translate-y-2">
            <span className="inline-block text-3xl animate-bounce duration-1000">🥇</span>
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base shadow-sm ring-4 ring-amber-200 dark:ring-amber-900">
              AP
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Ananya P.</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">State Topper #1</p>
            </div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-xs">
              98.6%
            </span>
          </div>

          {/* 3rd Place - Bronze */}
          <div className="p-4 rounded-3xl bg-amber-50/40 dark:bg-slate-800/50 border border-amber-200/60 dark:border-slate-700 text-center space-y-2 shadow-xs">
            <span className="inline-block text-2xl">🥉</span>
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-sm">
              SD
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Sayon D.</h4>
              <p className="text-[11px] text-slate-400 font-semibold">Rank #3</p>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-xs font-black text-amber-800 dark:text-amber-300">
              96.8%
            </span>
          </div>
        </div>

        {/* Leaderboard Table / Cards (Screen 15) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-12">Rank</span>
            <span className="flex-1">Student</span>
            <span className="text-right">Score</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student) => (
              <div
                key={student.rank}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Rank Column with Medals */}
                <div className="w-12 flex items-center">
                  {student.medal === 'gold' && (
                    <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs shadow-2xs">
                      🥇
                    </span>
                  )}
                  {student.medal === 'silver' && (
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shadow-2xs">
                      🥈
                    </span>
                  )}
                  {student.medal === 'bronze' && (
                    <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs shadow-2xs">
                      🥉
                    </span>
                  )}
                  {!student.medal && (
                    <span className="text-xs font-black text-slate-500 pl-2">{student.rank}</span>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {student.avatar}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {student.name}
                  </span>
                </div>

                {/* Score Column */}
                <div className="text-right font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  {student.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Current User Card (Screen 15: #147 You 78.3%) */}
      <div className="sticky bottom-18 md:bottom-6 z-20 pt-3">
        <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-slate-900 border-2 border-blue-500/80 shadow-lg shadow-blue-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-xs">
              {userRank.rank}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {userRank.avatar}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-blue-950 dark:text-white">
                  {userRank.name} (You)
                </h4>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Top 15% Statewide
                </p>
              </div>
            </div>
          </div>

          <div className="text-right font-black text-sm text-blue-700 dark:text-blue-300">
            {userRank.score}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Rank = Leaderboard;
