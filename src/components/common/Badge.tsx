import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'free' | 'premium' | 'success' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    free: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    premium: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    outline: 'border border-slate-300 text-slate-600',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
