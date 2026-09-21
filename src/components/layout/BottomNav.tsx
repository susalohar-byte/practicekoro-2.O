import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, BookOpen, BarChart3, User } from 'lucide-react';
import { cn, isStudentNavActive } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Exams', path: '/exams', icon: Layers },
    { label: 'Practice', path: '/practice', icon: BookOpen },
    { label: 'Results', path: '/results', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 safe-area-bottom pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isStudentNavActive(location.pathname, tab.label);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center py-1 gap-1 transition-all select-none group',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
              )}
            >
              <div
                className={cn(
                  'w-9 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-xs scale-105'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60'
                )}
              >
                <Icon
                  className={cn(
                    'w-[19px] h-[19px] transition-transform',
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-tight leading-none',
                  isActive ? 'font-bold' : 'font-medium'
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
