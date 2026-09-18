import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pro';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] select-none whitespace-nowrap';

    const variants = {
      primary:
        'bg-pk-primary text-white hover:bg-pk-primary-interactive focus:ring-pk-primary-accent shadow-xs active:bg-pk-primary-interactive',
      secondary:
        'bg-pk-blue-light text-pk-navy hover:bg-pk-blue-soft dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus:ring-pk-primary-interactive',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-pk-navy dark:text-slate-200 hover:bg-pk-blue-light dark:hover:bg-slate-800 focus:ring-pk-primary shadow-xs',
      ghost:
        'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-pk-blue-light dark:hover:bg-slate-800 hover:text-pk-navy dark:hover:text-white focus:ring-pk-primary/30',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-xs',
      pro: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-400 shadow-xs',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
      md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
      lg: 'text-base px-5 py-3 gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" /> : leftIcon}
        <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
