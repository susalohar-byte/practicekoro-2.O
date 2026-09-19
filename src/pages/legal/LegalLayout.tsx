import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Footer } from '@/pages/landing/sections/Footer';
import { FileText, ShieldCheck, RotateCcw, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  bengaliTitle?: string;
  lastUpdated?: string;
  badge?: string;
  children: React.ReactNode;
}

const LEGAL_NAV_TABS = [
  { label: 'Terms & Conditions', path: '/terms', icon: FileText },
  { label: 'Privacy Policy', path: '/privacy', icon: ShieldCheck },
  { label: 'Refund Policy', path: '/refund-policy', icon: RotateCcw },
  { label: 'Contact Us', path: '/contact-us', icon: Mail },
];

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  bengaliTitle,
  lastUpdated = 'September 2026',
  badge = 'Official Compliance Document',
  children,
}) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-pk-primary selection:text-white">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="PracticeKoro home"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-pk-primary to-pk-primary-bright flex items-center justify-center shadow-md shadow-pk-primary/25 group-hover:scale-105 transition-transform">
              <img
                src="/logo-icon-transparent.png"
                alt="PracticeKoro"
                className="w-6 h-6 object-contain"
              />
            </span>
            <span className="font-black text-xl sm:text-2xl text-pk-navy dark:text-white tracking-tight flex items-center">
              Practice<span className="text-pk-primary">Koro</span>
            </span>
          </Link>

          {/* Actions: Home, ThemeToggle & Auth Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-pk-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <ThemeToggle />

            {user ? (
              <Link
                to={dashboardUrl}
                className="px-4 py-2 bg-pk-primary hover:bg-pk-primary-interactive text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-pk-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-pk-primary hover:bg-pk-primary-interactive text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Document Switcher Tabs for Compliance Auditing */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            {LEGAL_NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                location.pathname === tab.path ||
                (tab.path === '/terms' && location.pathname === '/terms-and-conditions') ||
                (tab.path === '/privacy' && location.pathname === '/privacy-policy') ||
                (tab.path === '/refund-policy' &&
                  (location.pathname === '/cancellation-refund' ||
                    location.pathname === '/refund')) ||
                (tab.path === '/contact-us' && location.pathname === '/contact');

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-pk-primary text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-100/70 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[240px] bg-pk-primary/10 rounded-full blur-3xl pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-pk-primary" />
            <span>{badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>

          {bengaliTitle && (
            <p className="text-sm sm:text-base font-medium text-pk-primary dark:text-blue-400 font-bengali">
              {bengaliTitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Last Updated:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                {lastUpdated}
              </strong>
            </span>
            <span>•</span>
            <span>
              Jurisdiction:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                West Bengal, India
              </strong>
            </span>
            <span>•</span>
            <span>
              Platform:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                practicekoro.online
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Article */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {children}
        </div>
      </main>

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
};
