import React from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}

/**
 * Shared premium section header: eyebrow pill + bold title + muted description.
 * Keeps every landing section visually consistent in both themes.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  dark = false,
  className,
}) => {
  return (
    <Reveal
      className={cn(
        'space-y-3.5 max-w-2xl mb-10 sm:mb-14',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.12em] border shadow-xs',
          dark
            ? 'bg-white/10 border-white/15 text-blue-200'
            : 'bg-blue-50 border-blue-100 text-blue-700'
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', dark ? 'bg-blue-300' : 'bg-blue-600')} />
        {eyebrow}
      </span>
      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.12]',
          dark ? 'text-white' : 'text-slate-900'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-sm sm:text-base leading-relaxed font-normal',
            dark ? 'text-slate-300' : 'text-slate-600'
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
};
