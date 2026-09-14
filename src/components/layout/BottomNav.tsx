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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-bottom pb-safe shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isStudentNavActive(location.pathname, tab.label);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors select-none',
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              )}
            >
              <div className={cn('p-1 rounded-full', isActive && 'bg-blue-50')}>
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isActive && 'scale-110 stroke-[2.5]'
                  )}
                />
              </div>
              <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
