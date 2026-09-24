import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StudentSupportModal } from '@/components/student/StudentSupportModal';
import { cn } from '@/lib/utils';
import {
  Home,
  Layers,
  Zap,
  BarChart3,
  Bookmark,
  Trophy,
  HelpCircle,
  User,
  Crown,
  CheckCircle2,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronUp,
  Settings as SettingsIcon,
  LifeBuoy,
  ShieldAlert,
  LogOut,
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isPro, isAdmin, logout } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Test Series', path: '/test-series', icon: Layers },
    { label: 'Practice', path: '/practice', icon: Zap },
    { label: 'Results', path: '/results', icon: BarChart3 },
    { label: 'Saved Questions', path: '/saved-questions', icon: Bookmark },
    { label: 'Rank', path: '/rank', icon: Trophy },
    { label: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/test-series') {
      return (
        location.pathname.startsWith('/test-series') ||
        location.pathname.startsWith('/exams') ||
        location.pathname.startsWith('/tests')
      );
    }
    if (path === '/saved-questions') {
      return location.pathname === '/saved-questions' || (location.pathname.startsWith('/practice') && location.search.includes('tab=bookmarks'));
    }
    if (path === '/practice') {
      return location.pathname.startsWith('/practice') && !location.search.includes('tab=bookmarks');
    }
    return location.pathname.startsWith(path);
  };

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

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-sm',
          'lg:sticky lg:top-0 lg:h-screen lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-72 sm:w-80 lg:w-auto'
        )}
      >
        {/* Top: Brand Header */}
        <div
          className={cn(
            'h-20 flex items-center px-5 border-b border-slate-100 dark:border-slate-800 transition-all shrink-0',
            isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'
          )}
        >
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0158FC] to-[#0047cc] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/logo-icon-transparent.png"
                alt="PracticeKoro"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className={cn('flex flex-col min-w-0', isCollapsed && 'lg:hidden')}>
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                Practice<span className="text-[#0158FC]">Koro</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-1">
                Practice Today, Progress Tomorrow.
              </span>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Center: Navigation Menu + PRO PASS Card */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-2 space-y-4">
          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group relative active:scale-[0.98]',
                    isCollapsed && 'lg:justify-center lg:px-2',
                    active
                      ? 'bg-[#0158FC] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#0158FC] dark:group-hover:text-blue-400'
                    )}
                  />
                  <span className={cn('truncate', isCollapsed && 'lg:hidden')}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* PRO PASS Card (hidden when collapsed) */}
          <div className={cn('px-3', isCollapsed && 'lg:hidden')}>
            <div className="rounded-2xl bg-gradient-to-b from-[#f0f7ff] to-[#e4f0fe] dark:from-slate-800/90 dark:to-slate-850/90 border border-blue-100/90 dark:border-slate-700/80 p-4 text-center relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Crown className="w-4 h-4 fill-amber-500" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-0.5">
                PRO PASS
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
                Unlock Your Full Potential
              </p>

              <div className="space-y-1.5 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-4 px-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0158FC] dark:text-blue-400 shrink-0" />
                  <span>All Exams</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0158FC] dark:text-blue-400 shrink-0" />
                  <span>Mock Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0158FC] dark:text-blue-400 shrink-0" />
                  <span>PYQ &amp; Topic Practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0158FC] dark:text-blue-400 shrink-0" />
                  <span>Detailed Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0158FC] dark:text-blue-400 shrink-0" />
                  <span>Web + Mobile Access</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/subscription');
                }}
                className="w-full py-2 rounded-xl bg-[#0158FC] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
              >
                <span>Upgrade Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Profile Section (Replaces Bengal Skyline) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 relative bg-white dark:bg-slate-900">
          {/* Backdrop for closing popover when clicking outside */}
          {profileDropdownOpen && (
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setProfileDropdownOpen(false)}
            />
          )}

          {/* Profile Card / Chip Button */}
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className={cn(
              'w-full flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer text-left',
              isCollapsed
                ? 'justify-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            )}
            title={isCollapsed ? (user?.fullName || 'Candidate Profile') : undefined}
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatarUrl || '/images/student_avatar.png'}
                alt={user?.fullName || 'Candidate'}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                onError={(e) => {
                  e.currentTarget.src = '/images/student_avatar.png';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {user?.fullName || 'Candidate'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1">
                  Student •{' '}
                  <span className="text-amber-500 font-bold">{isPro ? 'Pro Pass' : 'Free'}</span>
                </p>
              </div>
            )}

            {!isCollapsed && (
              <ChevronUp
                className={cn(
                  'w-4 h-4 text-[#0158FC] dark:text-blue-400 transition-transform duration-200 shrink-0',
                  profileDropdownOpen && 'rotate-180'
                )}
              />
            )}
          </button>

          {/* Profile Popover Menu (Upward / Floating) */}
          {profileDropdownOpen && (
            <div
              className={cn(
                'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100',
                isCollapsed
                  ? 'fixed left-20 bottom-3 w-64'
                  : 'absolute bottom-full left-2 right-2 mb-2 w-[calc(100%-1rem)]'
              )}
            >
              {/* User Header */}
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img
                      src={user?.avatarUrl || '/images/student_avatar.png'}
                      alt={user?.fullName || 'Candidate'}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      onError={(e) => {
                        e.currentTarget.src = '/images/student_avatar.png';
                      }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.fullName || 'Candidate'}
                      </p>
                      {isPro ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                          PRO
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items matching screenshot */}
              <div className="py-1">
                <Link
                  to="/subscription"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 font-semibold transition-colors"
                >
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span>Pro Pass &amp; Billing</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Candidate Profile</span>
                </Link>

                <Link
                  to="/results"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Test Performance</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Preferences</span>
                </Link>

                <Link
                  to="/support"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium transition-colors"
                >
                  <LifeBuoy className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Help Desk &amp; FAQs</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setIsSupportModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium transition-colors text-left cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Raise Support Ticket</span>
                </button>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}
              </div>

              {/* Sign Out */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                    onClose();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Support Modal */}
      <StudentSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  );
};
