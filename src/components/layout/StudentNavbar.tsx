import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { api } from '@/services/api';
import type { NotificationItem } from '@/types';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Check,
  Clock,
} from 'lucide-react';

interface StudentNavbarProps {
  onToggleMobileSidebar?: () => void;
  onToggleCollapse?: () => void;
  isSidebarCollapsed?: boolean;
  embedded?: boolean;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  onToggleMobileSidebar,
  onToggleCollapse,
  isSidebarCollapsed = false,
  embedded = false,
}) => {
  const { user, isPro } = useAuth();
  const { selectedExam } = useExam();
  const navigate = useNavigate();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
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
      const now = new Date();
      const filtered = allNotifs.filter((n) => {
        // 1. Status check: sent OR scheduled whose scheduled time has arrived
        const isSent = n.status === 'sent';
        const isScheduledDue =
          n.status === 'scheduled' && n.scheduledAt && new Date(n.scheduledAt) <= now;

        if (!isSent && !isScheduledDue) return false;

        // 2. Audience check: Normalize audience string
        const target = (n.targetAudience || 'all').toLowerCase().trim();

        if (target === 'all') return true;

        // Pro audience check: matches 'pro', 'pro_users', 'premium'
        const isProAudience = target === 'pro' || target === 'pro_users' || target === 'premium';
        if (isPro && isProAudience) return true;

        // Free tier check: matches 'free', 'free_users'
        const isFreeAudience = target === 'free' || target === 'free_users';
        if (!isPro && isFreeAudience) return true;

        // Exam specific check: matches exam:<exam_id> against candidate's target or selected exam
        if (target.startsWith('exam:')) {
          const targetExamId = target.replace('exam:', '').trim();
          if (
            (user?.targetExamId && user.targetExamId.toLowerCase() === targetExamId) ||
            (selectedExam?.id && selectedExam.id.toLowerCase() === targetExamId)
          ) {
            return true;
          }
        }

        return false;
      });
      setNotifications(filtered);
    } catch (err) {
      console.error('Failed to load student notifications:', err);
    }
  }, [isPro, user?.targetExamId, selectedExam?.id]);

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

  const WrapperTag = embedded ? 'div' : 'header';
  const wrapperClass = embedded
    ? 'w-full transition-all'
    : 'sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all';
  const innerClass = embedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <WrapperTag className={wrapperClass}>
      <div className={innerClass}>
        <div className={`flex items-center justify-between gap-3 ${embedded ? 'py-1' : 'h-16'}`}>
          {/* Left: Mobile Brand Logo & Sidebar Toggles */}
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

            {/* Desktop Sidebar Collapse / Expand Toggle Button - Hidden on Home Page Header */}
            {!embedded && onToggleCollapse && (
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
          </div>

          {/* Center / Search Pill matching mockup */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-2">
            <button
              onClick={() => navigate('/exams')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-[#edf2f7] dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-[#0158FC] transition-colors" />
                <span className="truncate text-slate-500 dark:text-slate-400 font-medium">
                  Search exams, tests, subjects or topics...
                </span>
              </div>
              <kbd className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                ⌘ K
              </kbd>
            </button>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-3 shrink-0">
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
                                {new Date(
                                  n.sentAt || n.scheduledAt || n.createdAt
                                ).toLocaleDateString()}
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
          </div>
        </div>
      </div>
    </WrapperTag>
  );
};
