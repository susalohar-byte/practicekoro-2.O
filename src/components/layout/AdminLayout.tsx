import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  LayoutDashboard,
  BookOpen,
  Shield,
  FileText,
  FileQuestion,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  altPaths?: string[];
}

interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navSections: AdminNavSection[] = [
    {
      title: '📚 Content & Question Bank',
      items: [
        {
          label: 'Subjects & Topics',
          path: '/admin/subjects',
          altPaths: ['/admin/topics', '/admin/chapters'],
          icon: BookOpen,
        },
        {
          label: 'Universal Question Bank',
          path: '/admin/question-bank',
          altPaths: ['/admin/questions', '/admin/full-mock-questions', '/admin/pyq-questions'],
          icon: FileQuestion,
        },
      ],
    },
    {
      title: '🎯 Test Management',
      items: [
        {
          label: 'Manage Exams',
          path: '/admin/exams',
          altPaths: ['/admin/exam-topics'],
          icon: Shield,
        },
        {
          label: 'Mock Tests & PYQ',
          path: '/admin/tests',
          altPaths: ['/admin/test-series'],
          icon: FileText,
        },
      ],
    },
    {
      title: '💳 Commerce & Admin',
      items: [
        {
          label: 'Subscriptions & Pro Users',
          path: '/admin/subscriptions',
          altPaths: ['/admin/students', '/admin/pro-users'],
          icon: CreditCard,
        },
        {
          label: 'Overview / Analytics',
          path: '/admin',
          end: true,
          altPaths: ['/admin/analytics', '/admin/overview'],
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: '⚙️ Utilities',
      items: [
        {
          label: 'Notifications',
          path: '/admin/notifications',
          icon: Bell,
        },
        {
          label: 'Support & Help',
          path: '/admin/support',
          icon: HelpCircle,
        },
        {
          label: 'Settings',
          path: '/admin/settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="admin-scope min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed/Sticky with clean scrollbar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-200 shadow-sm dark:shadow-2xl',
          'lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Header & Navigation Container */}
        <div className="flex flex-col min-h-0">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/logo-icon-transparent.png"
                  alt="PracticeKoro"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                    PracticeKoro
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  Admin Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-3 px-3 space-y-4 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </p>
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = item.end
                    ? location.pathname === item.path
                    : location.pathname === item.path ||
                      Boolean(item.altPaths?.some((p) => location.pathname.startsWith(p)));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative',
                        isItemActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/80'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                            isItemActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isItemActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions & Profile Chip */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5 bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'Administrator'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Production Administration
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                v2.0 Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.fullName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Super Administrator
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shadow-inner">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900/60">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
