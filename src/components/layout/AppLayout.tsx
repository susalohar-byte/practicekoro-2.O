import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudentNavbar } from './StudentNavbar';
import { StudentSidebar } from './StudentSidebar';
import { BottomNav } from './BottomNav';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useAuth } from '@/context/AuthContext';
import { MaintenanceScreen } from '@/components/common/MaintenanceScreen';

export const AppLayout: React.FC = () => {
  const { isMaintenanceMode, loading: maintLoading } = useMaintenance();
  const { isAdmin } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pk_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // If platform maintenance mode is enabled and user is NOT an admin, block student access and display MaintenanceScreen
  if (!maintLoading && isMaintenanceMode && !isAdmin) {
    return <MaintenanceScreen />;
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pk_sidebar_collapsed', String(next));
      } catch {
        // Ignore malformed cached UI preference and retain the default layout.
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Side Navbar Component for Student Dashboard */}
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <StudentNavbar
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onToggleCollapse={toggleCollapse}
          isSidebarCollapsed={isCollapsed}
        />
        <main className="flex-1 pb-20 lg:pb-12">
          <Outlet
            context={{
              onToggleMobileSidebar: () => setMobileSidebarOpen((prev) => !prev),
              onToggleCollapse: toggleCollapse,
              isSidebarCollapsed: isCollapsed,
            }}
          />
        </main>
        <footer className="border-t border-slate-200 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0158FC] to-[#0080FF] flex items-center justify-center text-white shadow-xs">
                <img
                  src="/logo-icon-transparent.png"
                  alt="PracticeKoro"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="text-left">
                <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                  Practice<span className="text-[#0158FC]">Koro</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  Practice Today, Progress Tomorrow.
                </p>
              </div>
            </div>

            {/* Legal & Policy Links */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <a href="/legal/contact" className="hover:text-[#0158FC] transition-colors">About</a>
              <span>•</span>
              <a href="/legal/contact" className="hover:text-[#0158FC] transition-colors">Contact</a>
              <span>•</span>
              <a href="/legal/privacy" className="hover:text-[#0158FC] transition-colors">Privacy</a>
              <span>•</span>
              <a href="/legal/terms" className="hover:text-[#0158FC] transition-colors">Terms</a>
              <span>•</span>
              <a href="/legal/refund" className="hover:text-[#0158FC] transition-colors">Refund Policy</a>
            </div>

            {/* Social Media & Made with love tagline */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-slate-400">
                {/* YouTube */}
                <a href="https://youtube.com/@practicekoro" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors" title="YouTube">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                {/* Telegram */}
                <a href="https://t.me/practicekoro" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors" title="Telegram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com/practicekoro" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors" title="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                {/* Facebook */}
                <a href="https://facebook.com/practicekoro" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" title="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.704 0-1.042.15-1.229.412-.187.262-.266.702-.266 1.401v2.167h4.088l-.539 3.667h-3.549v7.98c5.447-.94 9.576-5.673 9.576-11.364 0-6.402-5.191-11.594-11.594-11.594s-11.594 5.192-11.594 11.594c0 5.691 4.129 10.424 9.576 11.364z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href="https://twitter.com/practicekoro" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors" title="X (Twitter)">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Made with <span className="text-rose-500">❤️</span> for aspirants of Bengal
              </span>
            </div>
          </div>
        </footer>
        <BottomNav />
      </div>
    </div>
  );
};
