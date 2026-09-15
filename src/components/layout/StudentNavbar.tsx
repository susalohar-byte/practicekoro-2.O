import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  ChevronDown,
  Crown,
  LogOut,
  User,
  LayoutDashboard,
  Settings as SettingsIcon,
  Check,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';

export interface StudentNavbarProps {
  onToggleMobileSidebar?: () => void;
  onToggleCollapse?: () => void;
  isSidebarCollapsed?: boolean;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  onToggleMobileSidebar,
  onToggleCollapse,
  isSidebarCollapsed = false,
}) => {
  const { user, isPro, isAdmin, logout } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const location = useLocation();
  const navigate = useNavigate();

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = (path: string) => {
    if (path.startsWith('/dashboard') || path === '/') return 'Dashboard';
    if (path.startsWith('/exams')) return 'Exams Hub';
    if (path.startsWith('/practice')) return 'Practice Lab';
    if (path.startsWith('/results')) return 'Performance & Results';
    if (path.startsWith('/profile')) return 'Candidate Profile';
    if (path.startsWith('/settings')) return 'Preferences';
    if (path.startsWith('/subscription')) return 'Pro Pass';
    return 'Student Portal';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo, Sidebar Toggles & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Sidebar Trigger Button */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              aria-label="Open side navigation"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse / Expand Toggle Button */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar width"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Brand Logo */}
            <Link to="/dashboard" className="flex lg:hidden items-center gap-2 group">
              <img
                src="/logo-icon-transparent.png"
                alt="PracticeKoro"
                className="w-8 h-8 object-contain rounded-xl transition-transform group-hover:scale-105"
              />
              <span className="font-black text-base text-slate-900 tracking-tight flex items-center">
                Practice<span className="text-blue-600">Koro</span>
              </span>
            </Link>

            {/* Desktop Breadcrumb Header */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pl-1">
              <span className="font-bold text-slate-400">Portal</span>
              <span className="text-slate-300">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60 text-slate-800 font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>{getPageTitle(location.pathname)}</span>
              </div>
            </div>

            {/* Exam Selector Pill (Desktop) */}
            <div className="relative ml-1 sm:ml-2">
              <button
                type="button"
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 rounded-xl border border-slate-200/80 transition-all group"
              >
                <div className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-black text-[9px]">
                  WB
                </div>
                <span className="truncate max-w-[140px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {selectedExam?.title || 'Select Exam'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-600" />
              </button>

              {examDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setExamDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Target Examination
                    </p>
                    <span className="text-[10px] text-blue-600 font-bold">Focus Mode</span>
                  </div>
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam);
                        setExamDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition-colors"
                    >
                      <span className="truncate font-semibold">{exam.title}</span>
                      {selectedExam?.id === exam.id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Quick Search Command Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm justify-center">
            <button
              onClick={() => navigate('/exams')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/70 text-slate-400 hover:text-slate-700 text-xs transition-all group shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="truncate">Search tests, topics...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white text-slate-400 border border-slate-200 group-hover:border-slate-300 shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Pro Pass CTA */}
            {isPro ? (
              <Link to="/subscription">
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/15 border border-amber-500/25 text-amber-700 text-xs font-extrabold hover:border-amber-500/40 shadow-xs transition-all">
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>PRO PASS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                </div>
              </Link>
            ) : (
              <button
                onClick={() => navigate('/subscription')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Get Pro Pass</span>
              </button>
            )}

            {/* Profile Dropdown Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100/90 border border-transparent hover:border-slate-200/70 transition-all"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user?.fullName || 'Candidate'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize leading-none font-medium">
                    {isPro ? 'Pro Aspirant' : 'Free Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  {/* User Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                      {isPro ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          PRO
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/subscription"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50/70 font-semibold transition-colors"
                    >
                      <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>Pro Pass & Billing</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Candidate Profile</span>
                    </Link>

                    <Link
                      to="/results"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span>Test Performance</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Preferences</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-indigo-700 font-bold hover:bg-indigo-50/70 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        <span>Admin Control Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Exam Selector Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Accordion */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 py-3 space-y-2.5">
            <div className="px-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block mb-1">
                Active Target Exam
              </label>
              <select
                value={selectedExam?.id || ''}
                onChange={(e) => {
                  const f = exams.find((x) => x.id === e.target.value);
                  if (f) setSelectedExam(f);
                }}
                className="w-full text-xs font-bold py-2 px-3 bg-slate-100 rounded-xl border border-slate-200"
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            {!isPro && (
              <div className="px-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/subscription');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Get Pro Pass (₹299/yr)
                </button>
              </div>
            )}

            {isAdmin && (
              <div className="px-2 pt-1">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Open Admin Console
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
