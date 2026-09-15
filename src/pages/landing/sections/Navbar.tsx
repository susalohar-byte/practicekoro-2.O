import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';
  const navigate = useNavigate();

  return (
    <>
      {/* =========================================================================
          1. NAVBAR
          ========================================================================= */}
      <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-none">
        <div className="w-full max-w-6xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between pointer-events-auto transition-all">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-icon-transparent.png"
              alt="PracticeKoro"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center">
              Practice<span className="text-blue-600">Koro</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#exams" className="hover:text-blue-600 transition-colors">
              Exams
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-blue-600 transition-colors">
              About
            </a>
          </nav>

          {/* Auth / Dashboard CTA */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
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
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-xs sm:text-sm font-semibold text-blue-600 border-slate-200 hover:bg-blue-50 hover:border-blue-300 px-4 sm:px-5 py-2 rounded-xl"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-xl shadow-md shadow-blue-500/20"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
