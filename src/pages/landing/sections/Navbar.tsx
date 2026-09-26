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
  { label: 'Exams', href: '/#exams' },
  { label: 'App Features', href: '/#inside-app' },
  { label: 'Pro Pass', href: '/#pro-pass' },
  { label: 'Install App', href: '/#app-install' },
  { label: 'FAQ', href: '/#faq' },
];

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none">
      <div
        className={cn(
          'w-full max-w-6xl rounded-2xl sm:rounded-full px-4 sm:px-6 flex items-center justify-between pointer-events-auto transition-all duration-300',
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_12px_40px_-8px_rgba(37,99,235,0.18)] h-[4.25rem]'
            : 'bg-transparent border border-transparent shadow-none h-16 sm:h-18'
        )}
      >
        {/* Logo */}
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
          <span
            className={cn(
              'font-black text-xl sm:text-2xl tracking-tight flex items-center transition-colors',
              scrolled ? 'text-pk-navy dark:text-white' : 'text-white'
            )}
          >
            Practice<span className={scrolled ? 'text-pk-primary' : 'text-blue-400'}>Koro</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          className={cn(
            'hidden md:flex items-center gap-7 text-sm font-semibold transition-colors',
            scrolled ? 'text-slate-600 dark:text-slate-300' : 'text-slate-200'
          )}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:rounded-full after:transition-all',
                scrolled
                  ? 'hover:text-pk-primary after:bg-pk-primary hover:after:w-full'
                  : 'hover:text-white after:bg-blue-400 hover:after:w-full'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth / Dashboard CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="pointer-events-auto">
            <ThemeToggle
              className={cn(
                'transition-all',
                !scrolled &&
                  'bg-white/10 hover:bg-white/20 border-white/20 text-white dark:text-white shadow-none'
              )}
            />
          </div>

          {user ? (
            <InteractiveHoverButton
              text="Dashboard"
              onClick={() => navigate(dashboardUrl)}
              className={cn(
                'w-32 sm:w-36 text-xs sm:text-sm h-9 sm:h-10 shadow-xs transition-all',
                scrolled
                  ? 'border-pk-blue-soft text-pk-primary'
                  : 'bg-white/15 hover:bg-white/25 border-white/30 text-white backdrop-blur-xs'
              )}
            />
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className={cn(
                  'text-sm font-semibold px-5 py-2 rounded-xl transition-all',
                  scrolled
                    ? 'text-pk-primary border-slate-200 hover:bg-pk-blue-light hover:border-pk-blue-soft'
                    : 'text-white border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 backdrop-blur-xs'
                )}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className={cn(
                  'text-sm font-bold px-5 py-2 rounded-xl shadow-md transition-all text-white',
                  scrolled
                    ? 'bg-gradient-to-r from-pk-primary to-pk-primary-bright hover:from-pk-primary-interactive hover:to-pk-primary shadow-pk-primary/25'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/35'
                )}
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
              className={cn(
                'sm:hidden p-2 rounded-xl transition-colors',
                scrolled
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-white hover:bg-white/15'
              )}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {!user && menuOpen && (
        <div className="sm:hidden absolute top-full mt-2 w-full max-w-6xl pointer-events-auto">
          <div className="mx-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 space-y-1">

            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-pk-blue-light dark:hover:bg-slate-800 hover:text-pk-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/login');
                }}
                className="font-semibold text-pk-primary border-slate-200 rounded-xl"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/register');
                }}
                className="font-bold bg-pk-primary hover:bg-pk-primary-interactive text-white rounded-xl"
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
