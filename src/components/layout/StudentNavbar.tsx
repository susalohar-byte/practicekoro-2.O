import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { isStudentNavActive } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
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
  PanelLeftOpen
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
  const { user, role, isPro, isAdmin, logout, switchDemoRole } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const location = useLocation();
  const navigate = useNavigate();

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Exams', path: '/exams' },
    { label: 'Practice', path: '/practice' },
    { label: 'Results', path: '/results' },
    { label: 'Profile', path: '/profile' },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith('/dashboard') || path === '/') return 'Dashboard';
    if (path.startsWith('/exams')) return 'Exams Hub';
    if (path.startsWith('/practice')) return 'Practice';
    if (path.startsWith('/results')) return 'Results';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/subscription')) return 'Pro Pass';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo, Sidebar Toggles & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Sidebar Trigger Button */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar width"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
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
              <span className="font-black text-lg text-slate-900 tracking-tight flex items-center">
                Practice<span className="text-blue-600">Koro</span>
              </span>
            </Link>

            {/* Desktop Breadcrumb Header */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pl-1">
              <span className="font-extrabold text-slate-900">Portal</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-blue-600">{getPageTitle(location.pathname)}</span>
            </div>

            {/* Exam Selector Pill */}
            <div className="relative ml-1 sm:ml-2">
              <button
                type="button"
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="text-slate-500 font-normal">Exam:</span>
                <span className="truncate max-w-[130px] font-bold">
                  {selectedExam?.title || 'Select Exam'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {examDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setExamDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Target Examination
                    </p>
                  </div>
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam);
                        setExamDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <span className="truncate font-semibold">{exam.title}</span>
                      {selectedExam?.id === exam.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex lg:hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isStudentNavActive(location.pathname, link.label);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            {/* Pro Badge / Pass CTA */}
            {isPro ? (
              <Link to="/subscription">
                <Badge variant="premium" className="hidden sm:inline-flex gap-1 py-1 px-2.5 shadow-sm hover:opacity-90 cursor-pointer">
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span className="font-bold">PRO PASS</span>
                </Badge>
              </Link>
            ) : (
              <Button
                variant="pro"
                size="sm"
                className="hidden sm:inline-flex text-xs font-bold"
                onClick={() => navigate('/subscription')}
                leftIcon={<Crown className="w-3.5 h-3.5" />}
              >
                Get Pro Pass
              </Button>
            )}

            {/* Admin Switcher / Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user?.fullName || 'Aspirant'}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/subscription"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-semibold"
                  >
                    <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                    Pro Pass & Billing
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Student Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    Settings & Preferences
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-blue-700 font-semibold hover:bg-blue-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Admin Control Panel
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Demo Role Switcher
                    </p>
                    <button
                      onClick={() => {
                        switchDemoRole(role === 'admin' ? 'student' : 'admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-medium"
                    >
                      Switch to {role === 'admin' ? 'Student View' : 'Admin View'}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile quick menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle exam switcher"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-2">
            <div className="px-2 pb-2">
              <label className="text-[11px] font-semibold uppercase text-slate-400 px-2 block mb-1">
                Active Exam
              </label>
              <select
                value={selectedExam?.id || ''}
                onChange={(e) => {
                  const f = exams.find(x => x.id === e.target.value);
                  if (f) setSelectedExam(f);
                }}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-100 rounded-lg border border-slate-200"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg mx-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Open Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
