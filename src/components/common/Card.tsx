import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  selected = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200 overflow-hidden',
        selected
          ? 'bg-pk-blue-light border-pk-primary ring-1 ring-pk-primary shadow-xs'
          : 'bg-pk-surface dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 shadow-xs',
        hoverable &&
          'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('px-5 py-4 border-b border-slate-100', className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('px-5 py-3.5 bg-slate-50/50 border-t border-slate-100', className)} {...props}>
    {children}
  </div>
);
