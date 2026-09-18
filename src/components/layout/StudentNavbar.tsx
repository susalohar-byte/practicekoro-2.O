import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { api } from '@/services/api';
import type { NotificationItem } from '@/types';
import { StudentSupportModal } from '@/components/student/StudentSupportModal';
import {
  ChevronDown,
  Crown,
  LogOut,
  User,
  Settings as SettingsIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Bell,
  HelpCircle,
  LifeBuoy,
  Check,
  Clock,
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
  const location = useLocation();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pk_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadNotifications = useCallback(async () => {
    try {
      const allNotifs = await api.getNotifications();
      const filtered = allNotifs.filter((n) => {
        if (n.status !== 'sent') return false;
        if (n.targetAudience === 'all') return true;
        if (isPro && (n.targetAudience === 'pro' || n.targetAudience === 'pro_users')) return true;
        if (!isPro && (n.targetAudience === 'free' || n.targetAudience === 'free_users')) return true;
        if (
          n.targetAudience.startsWith('exam:') &&
          user?.targetExamId &&
          n.targetAudience === `exam:${user.targetExamId}`
        ) {
          return true;
        }
        return false;
      });
      setNotifications(filtered);
    } catch (err) {
      console.error('Failed to load student notifications:', err);
    }
  }, [isPro, user?.targetExamId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const merged = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(merged);
    localStorage.setItem('pk_read_notifications', JSON.stringify(merged));
  };

  const unreadCount = notifications.filter((n) => !readNotifIds.includes(n.id)).length;

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
              <span className="font-black text-base text-pk-navy dark:text-white tracking-tight flex items-center">
                Practice<span className="text-pk-primary">Koro</span>
              </span>
            </Link>

            {/* Desktop Breadcrumb Header */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pl-1">
              <span className="font-bold text-slate-400">Portal</span>
              <span className="text-slate-300">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-pk-primary animate-pulse" />
                <span>{getPageTitle(location.pathname)}</span>
              </div>
            </div>
          </div>

          {/* Center: Quick Search Command Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm justify-center">
            <button
              onClick={() => navigate('/exams')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/70 border border-slate-200/70 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-all group shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-pk-primary transition-colors" />
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

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setNotifDropdownOpen(false)}
                >
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-pk-primary" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Announcements & Alerts
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-pk-primary hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 px-2 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No new notifications right now.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isRead = readNotifIds.includes(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl transition-colors ${
                              isRead
                                ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                                : 'bg-pk-blue-light/60 dark:bg-slate-800 font-medium'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {n.sentAt ? new Date(n.sentAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pk-primary hover:bg-pk-primary-interactive text-white text-xs font-bold shadow-md shadow-pk-primary/20 hover:shadow-pk-primary/30 transition-all"
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
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/70 dark:hover:border-slate-700 transition-all"
              >
                <div className="relative">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'Candidate'}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pk-primary to-pk-primary-bright text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
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

                    <Link
                      to="/support"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <LifeBuoy className="w-4 h-4 text-slate-400" />
                      <span>Help Desk & FAQs</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsSupportModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Raise Support Ticket</span>
                    </button>

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
          </div>
        </div>
      </div>

      <StudentSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </header>
  );
};
