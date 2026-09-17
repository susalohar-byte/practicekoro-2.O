import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Shield,
  FileText,
  Layers,
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
  badge?: string;
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
      title: 'Core',
      items: [
        {
          label: 'Dashboard',
          path: '/admin',
          end: true,
          altPaths: ['/admin/analytics', '/admin/overview'],
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Test & Question Engine',
      items: [
        {
          label: 'Question Bank',
          path: '/admin/question-bank',
          altPaths: ['/admin/questions', '/admin/full-mock-questions', '/admin/pyq-questions'],
          icon: BookOpen,
        },
        {
          label: 'Manage Exams',
          path: '/admin/exams',
          altPaths: ['/admin/exam-topics'],
          icon: Shield,
        },
        {
          label: 'Mock Test Management',
          path: '/admin/tests',
          altPaths: ['/admin/test-series'],
          icon: FileText,
        },
        {
          label: 'Subjects & Topics',
          path: '/admin/subjects',
          altPaths: ['/admin/topics', '/admin/chapters'],
          icon: Layers,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Subscriptions & Students',
          path: '/admin/subscriptions',
          altPaths: ['/admin/students', '/admin/pro-users'],
          icon: CreditCard,
        },
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

      {/* Sidebar - Fixed/Sticky with rich 70% dark blue theme */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0a1226] text-slate-100 border-r border-[#152347] flex flex-col justify-between transition-all duration-200 shadow-2xl dark',
          'lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-[#152347] shrink-0 bg-[#070d1d]/80 backdrop-blur-md">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/logo-icon-transparent.png"
                alt="PracticeKoro"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white leading-tight">
                  PracticeKoro
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List - Scrollable with subtle custom scrollbar */}
        <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto overscroll-contain">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                  <motion.div
                    key={item.path}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ x: 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 select-none',
                        isItemActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/30 border border-blue-400/40'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0',
                            isItemActive
                              ? 'bg-white/20 text-white shadow-xs'
                              : 'text-slate-400 group-hover:text-sky-300 group-hover:bg-white/10'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                            {item.badge}
                          </span>
                        )}
                        {isItemActive && (
                          <motion.span
                            layoutId="activeNavDot"
                            className="w-2 h-2 rounded-full bg-sky-300 shadow-sm shadow-sky-300/90 ring-2 ring-sky-400/30"
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          />
                        )}
                      </div>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions & Profile Chip */}
        <div className="p-3 border-t border-[#152347] bg-[#070d1d]/80 shrink-0 space-y-2">
          {/* Integrated Theme Toggle Row */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-[#1d2d54] bg-[#0e1935] shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-300">Appearance</span>
            <ThemeToggle />
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e1935] border border-[#1d2d54] shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-sm shadow-blue-500/30">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a1226]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName || 'Administrator'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">Super Admin</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
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
