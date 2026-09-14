import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white shadow-sm',
        secondary: 'border-transparent bg-slate-100 text-slate-800',
        destructive: 'border-transparent bg-rose-500 text-white shadow-sm',
        outline: 'text-slate-800 border-slate-200',
        pro: 'border-amber-200 bg-amber-50 text-amber-800 font-bold',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold',
        pill: 'border-blue-100 bg-blue-50 text-blue-700 font-bold uppercase tracking-wider text-[11px]',
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
