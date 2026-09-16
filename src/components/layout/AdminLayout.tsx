import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  LayoutDashboard,
  Shield,
  BookOpen,
  FileQuestion,
  Layers,
  CreditCard,
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
      title: 'CONTENT & QUESTION BANK',
      items: [
        {
          label: 'Subjects & Topics',
          path: '/admin/subjects',
          altPaths: ['/admin/topics', '/admin/chapters'],
          icon: BookOpen,
        },
        {
          label: 'Universal Question Bank',
          path: '/admin/questions',
          altPaths: ['/admin/full-mock-questions', '/admin/pyq-questions'],
          icon: FileQuestion,
        },
      ],
    },
    {
      title: 'TEST MANAGEMENT',
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
          altPaths: ['/admin/tests/'],
          icon: Layers,
        },
      ],
    },
    {
      title: 'COMMERCE & ADMIN',
      items: [
        {
          label: 'Subscriptions & Pro Users',
          path: '/admin/subscriptions',
          icon: CreditCard,
        },
        {
          label: 'Overview / Analytics',
          path: '/admin',
          icon: LayoutDashboard,
          end: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed/Sticky with NO scrollbar on desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 shadow-2xl',
          'lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Header & Navigation Container */}
        <div className="flex flex-col min-h-0">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
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
                  <span className="font-black text-sm tracking-tight text-white leading-tight">
                    PracticeKoro
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  Admin Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - Grouped cleanly into 3 sections */}
          <div className="py-3 px-3 space-y-4 overflow-y-auto lg:overflow-hidden">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
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
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                            isItemActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-indigo-400'
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
        <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-slate-950/80 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-800/80 bg-slate-900/90">
            <span className="text-xs font-semibold text-slate-400">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.fullName || 'Administrator'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-slate-400">Super Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
        <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-bold text-slate-200">Production Administration</h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                v2.0 Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400">Super Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-xs shadow-inner">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
