import React, { useState } from 'react';
import { faqs } from '../data';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative py-14 sm:py-20 lg:py-24 bg-slate-50/50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 scroll-mt-24"
    >
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Help Center"
          title="Frequently Asked Questions (FAQ)"
          description="Frequently asked questions and comprehensive answers"
        />

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <Reveal key={faq.q} delay={index * 60}>
                <div
                  className={cn(
                    'rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all duration-300',
                    isOpen
                      ? 'border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/10'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                        isOpen
                          ? 'bg-blue-600 text-white rotate-45'
                          : 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700'
                      )}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-300 ease-in-out',
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 sm:pt-3.5 mt-0.5 mx-0">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
