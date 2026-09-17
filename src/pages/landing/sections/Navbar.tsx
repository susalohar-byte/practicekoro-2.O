import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Exams', href: '#exams' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none">
      <div
        className={cn(
          'w-full max-w-6xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border rounded-2xl sm:rounded-full px-4 sm:px-6 flex items-center justify-between pointer-events-auto transition-all duration-300',
          scrolled
            ? 'border-slate-200 shadow-[0_12px_40px_-8px_rgba(37,99,235,0.18)] h-[4.25rem]'
            : 'border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-16 sm:h-18'
        )}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group shrink-0"
          aria-label="PracticeKoro home"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <img
              src="/logo-icon-transparent.png"
              alt="PracticeKoro"
              className="w-6 h-6 object-contain"
            />
          </span>
          <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center">
            Practice<span className="text-blue-600 dark:text-blue-400">Koro</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:rounded-full after:bg-blue-600 hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth / Dashboard CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="pointer-events-auto">
            <ThemeToggle />
          </div>
          {user ? (
            <InteractiveHoverButton
              text="Dashboard"
              onClick={() => navigate(dashboardUrl)}
              className="w-32 sm:w-36 text-xs sm:text-sm h-9 sm:h-10 border-blue-200 text-blue-600 shadow-sm"
            />
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-blue-600 border-slate-200 hover:bg-blue-50 hover:border-blue-300 px-5 py-2 rounded-xl"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl shadow-md shadow-blue-500/25"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          {!user && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {!user && menuOpen && (
        <div className="sm:hidden absolute top-full mt-2 w-full max-w-6xl pointer-events-auto">
          <div className="mx-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 shadow-xl p-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/login');
                }}
                className="font-semibold text-blue-600 border-slate-200 rounded-xl"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/register');
                }}
                className="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
