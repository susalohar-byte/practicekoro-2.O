import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

/**
 * ThemeToggle — animated light/dark/system switcher.
 * Collapses to a single sun/moon button on mobile; 3-option segmented pill on desktop.
 * Uses Motion for the sliding indicator; respects prefers-reduced-motion.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const spring = reduce
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 400, damping: 30 };
  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div ref={wrapRef} className={cn('relative inline-flex items-center', className)}>
      {/* Desktop segmented control */}
      <div
        role="radiogroup"
        aria-label="Color theme"
        className="hidden sm:inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 backdrop-blur-sm"
      >
        {OPTIONS.map(({ mode, label, icon: Icon }) => {
          const active = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label} theme`}
              title={`${label} theme`}
              onClick={() => setTheme(mode)}
              className={cn(
                'relative z-10 inline-flex h-7 w-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                active
                  ? 'text-brand-600 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {active && (
                <motion.span
                  layoutId="theme-pill"
                  transition={spring}
                  className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-slate-700 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                />
              )}
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      {/* Mobile: icon button + popup menu */}
      <button
        type="button"
        aria-label={`Switch theme (current: ${theme})`}
        aria-expanded={menuOpen}
        onClick={() => (window.innerWidth < 640 ? setMenuOpen((v) => !v) : toggleTheme())}
        className="sm:hidden relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
      >
        <motion.span
          key={resolvedTheme}
          initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={spring}
          className="inline-flex"
        >
          <ActiveIcon className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="sm:hidden absolute right-0 top-11 z-50 w-36 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl"
            role="menu"
          >
            {OPTIONS.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                role="menuitemradio"
                aria-checked={theme === mode}
                onClick={() => {
                  setTheme(mode);
                  setMenuOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors',
                  theme === mode
                    ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {theme === mode && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Re-export portal-enabled dropdown variant for future inline use (no-op placeholder to keep tree-shaking simple)
export const ThemeTogglePortal: React.FC<{ className?: string }> = ({ className }) =>
  typeof document !== 'undefined' ? (
    createPortal(<ThemeToggle className={className} />, document.body)
  ) : (
    <ThemeToggle className={className} />
  );
