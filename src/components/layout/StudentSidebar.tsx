import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { isStudentNavActive, cn } from '@/lib/utils';
import { api } from '@/services/api';
import {
  LayoutDashboard,
  Compass,
  Zap,
  BarChart3,
  User,
  AlertTriangle,
  Bookmark,
  Crown,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, role, isPro, isAdmin, logout } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const location = useLocation();
  const navigate = useNavigate();

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      Promise.all([
        api.getMistakes(user.id).catch(() => []),
        api.getBookmarks(user.id).catch(() => []),
      ]).then(([mistakes, bookmarks]) => {
        if (isMounted) {
          setMistakesCount(mistakes ? mistakes.length : 0);
          setBookmarksCount(bookmarks ? bookmarks.length : 0);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, location.pathname]);

  const mainNav = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Exams', path: '/exams', icon: Compass },
    { label: 'Practice', path: '/practice', icon: Zap },
    { label: 'Results', path: '/results', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const practiceTools = [
    {
      label: 'Mistakes Notebook',
      path: '/practice',
      search: '?tab=mistakes',
      icon: AlertTriangle,
      count: mistakesCount,
      countColor: 'bg-rose-50 text-rose-600 border-rose-200/60',
    },
    {
      label: 'Saved Questions',
      path: '/practice',
      search: '?tab=bookmarks',
      icon: Bookmark,
      count: bookmarksCount,
      countColor: 'bg-blue-50 text-blue-600 border-blue-200/60',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Fixed & Sticky with ZERO scrollbar on desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-sm',
          'lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-72 sm:w-80 lg:w-auto'
        )}
      >
        {/* Top Section: Brand Header, Exam Switcher, and Nav Items */}
        <div className="flex flex-col min-h-0">
          {/* Brand & Toggle Header */}
          <div
            className={cn(
              'h-16 flex items-center border-b border-slate-100 px-4 transition-all duration-300 shrink-0',
              isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'
            )}
          >
            <Link
              to="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 overflow-hidden group"
              title="PracticeKoro Student Portal"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/logo-icon-transparent.png"
                  alt="PracticeKoro"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className={cn('flex flex-col min-w-0', isCollapsed && 'lg:hidden')}>
                <span className="font-black text-base text-slate-900 tracking-tight leading-tight flex items-center">
                  Practice<span className="text-blue-600">Koro</span>
                </span>
                <span className="text-[10px] font-extrabold text-blue-600/80 uppercase tracking-wider">
                  Student Portal
                </span>
              </div>
            </Link>

            {/* Controls: Collapse on desktop, Close on mobile */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Target Exam Switcher Card (hidden in desktop collapsed mode) */}
          <div className={cn('px-3 pt-2.5 pb-1 shrink-0', isCollapsed && 'lg:hidden')}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px] border border-blue-200/60">
                    WB
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider leading-none">
                      Focus Exam
                    </p>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5 group-hover:text-blue-600 transition-colors">
                      {selectedExam?.title || 'Select Target Exam'}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1',
                    examDropdownOpen && 'rotate-180 text-blue-600'
                  )}
                />
              </button>

              {examDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto"
                  onMouseLeave={() => setExamDropdownOpen(false)}
                >
                  <div className="px-3 py-1 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Exam Focus
                    </span>
                  </div>
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam);
                        setExamDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors',
                        selectedExam?.id === exam.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      )}
                    >
                      <span className="truncate pr-2">{exam.title}</span>
                      {selectedExam?.id === exam.id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Area - No scrollbar on desktop */}
          <div className="py-2 px-3 space-y-3.5 overflow-y-auto lg:overflow-hidden">
            {/* Main Navigation Group */}
            <div>
              <p
                className={cn(
                  'px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400',
                  isCollapsed && 'lg:hidden'
                )}
              >
                Menu
              </p>
              <nav className="space-y-0.5">
                {mainNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = isStudentNavActive(location.pathname, item.label);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all group relative',
                        isCollapsed && 'lg:justify-center lg:px-2',
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                        )}
                      />
                      <span className={cn('truncate', isCollapsed && 'lg:hidden')}>{item.label}</span>
                      {isActive && (
                        <span
                          className={cn(
                            'absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse',
                            isCollapsed && 'lg:hidden'
                          )}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Study Tools Group */}
            <div>
              <p
                className={cn(
                  'px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400',
                  isCollapsed && 'lg:hidden'
                )}
              >
                Practice Tools
              </p>
              <div className="space-y-0.5">
                {practiceTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.label}
                      to={`${tool.path}${tool.search}`}
                      onClick={onClose}
                      title={isCollapsed ? `${tool.label} (${tool.count})` : undefined}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 transition-all group',
                        isCollapsed && 'lg:justify-center lg:px-2'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                        <span className={cn('truncate', isCollapsed && 'lg:hidden')}>
                          {tool.label}
                        </span>
                      </div>
                      {tool.count > 0 && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0',
                            tool.countColor,
                            isCollapsed && 'lg:hidden'
                          )}
                        >
                          {tool.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pro Pass Card Banner - Modern & Compact */}
            <div className={cn('pt-1', isCollapsed && 'lg:hidden')}>
              {isPro ? (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-amber-500/25 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-amber-300 uppercase tracking-tight">
                          Pro Pass Active
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">All Tests Unlocked</p>
                    </div>
                  </div>
                  <Link
                    to="/subscription"
                    onClick={onClose}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 shrink-0 ml-1"
                  >
                    Manage
                  </Link>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black leading-tight truncate">Pro Pass</p>
                      <p className="text-[10px] text-blue-100 leading-none">₹299 / Year</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/subscription');
                    }}
                    className="py-1 px-2 rounded-lg bg-white text-blue-700 font-extrabold text-[10px] hover:bg-blue-50 transition-colors shrink-0 shadow-xs flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Collapsed Icon-Only Mode (Desktop only when collapsed) */}
            {isCollapsed && (
              <div className="hidden lg:flex justify-center pt-1">
                <button
                  onClick={() => navigate('/subscription')}
                  title={isPro ? 'Pro Pass Active' : 'Upgrade to Pro Pass (₹299/year)'}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                    isPro
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                  )}
                >
                  <Crown className={cn('w-4 h-4', isPro && 'fill-slate-950')} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Account Section */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          {/* Expanded Footer */}
          <div className={cn('space-y-2', isCollapsed && 'lg:hidden')}>
            <div className="flex items-center justify-between gap-2 px-1">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-2.5 min-w-0 group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0 group-hover:scale-105 transition-transform">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {user?.fullName || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">
                    {role || 'aspirant'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  to="/settings"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Control Panel
              </Link>
            )}
          </div>

          {/* Collapsed Footer (Desktop only when collapsed) */}
          {isCollapsed && (
            <div className="hidden lg:flex flex-col items-center gap-2">
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200"
                title="Student Profile"
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
