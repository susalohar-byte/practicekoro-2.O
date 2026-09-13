import React from 'react';
import { Outlet } from 'react-router-dom';
import { StudentNavbar } from './StudentNavbar';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StudentNavbar />
      <main className="flex-1 pb-20 md:pb-12">
        <Outlet />
      </main>
      <footer className="hidden md:block border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-600">
            © {new Date().getFullYear()} PracticeKoro. Focused Mock Test & Practice Platform.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">WB Police • SI • WBCS • WBPSC</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v2.0 Production
            </span>
          </div>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
};
