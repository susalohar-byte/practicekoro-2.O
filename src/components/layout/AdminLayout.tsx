import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  BookOpen,
  FolderTree,
  FileQuestion,
  Layers,
  CreditCard,
  LogOut,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminLayout: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Manage Exams', path: '/admin/exams', icon: Shield },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Chapters', path: '/admin/chapters', icon: FolderTree },
    { label: 'Mock Tests', path: '/admin/tests', icon: Layers },
    { label: 'Questions Bank', path: '/admin/questions', icon: FileQuestion },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              P
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">PracticeKoro</span>
              <span className="block text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Exam Content Hierarchy
            </p>
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/60">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Student Platform</span>
          </Link>

          <button
            onClick={() => {
              switchDemoRole('student');
              navigate('/');
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-slate-900 transition-colors"
          >
            <span>Switch to Student Role</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-semibold text-slate-200">
                Production Administration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400">Super Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
              A
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
