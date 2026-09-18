import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default: 'bg-pk-primary text-white shadow-md shadow-pk-primary/20 hover:bg-pk-primary-interactive',
        destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
        outline:
          'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-pk-navy dark:text-slate-200 hover:bg-pk-blue-light dark:hover:bg-slate-800 hover:text-pk-navy',
        secondary: 'bg-pk-blue-light text-pk-navy hover:bg-pk-blue-soft dark:bg-slate-800 dark:text-slate-200',
        ghost: 'hover:bg-pk-blue-light dark:hover:bg-slate-800 hover:text-pk-navy dark:hover:text-white',
        link: 'text-pk-primary underline-offset-4 hover:underline',
        pro: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-xl px-7 text-base font-bold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
