import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-pk-primary text-white shadow-xs',
        secondary:
          'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        destructive: 'border-transparent bg-rose-500 text-white shadow-xs',
        outline: 'text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
        pro: 'border-amber-200 bg-amber-50 text-amber-800 font-bold',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold',
        pill: 'border-pk-blue-soft bg-pk-blue-light text-pk-navy font-bold uppercase tracking-wider text-[11px]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
