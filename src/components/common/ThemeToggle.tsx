import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle — single animated icon switcher between Light and Dark mode.
 * System mode has been removed; clicking directly flips between light and dark.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const reduce = useReducedMotion();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-xl',
        'border border-slate-200/80 dark:border-white/10',
        'bg-slate-100/90 dark:bg-white/[0.08] hover:bg-slate-200/80 dark:hover:bg-white/[0.16]',
        'text-slate-700 dark:text-amber-300',
        'transition-all duration-150 outline-none select-none shrink-0 shadow-2xs active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-blue-500',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={reduce ? undefined : { rotate: -75, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { rotate: 75, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-amber-400 stroke-[2.2]" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={reduce ? undefined : { rotate: 75, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { rotate: -75, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-flex items-center justify-center"
          >
            <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200 stroke-[2.2]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export const ThemeTogglePortal: React.FC<{ className?: string }> = (props) => (
  <ThemeToggle {...props} />
);
