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
      className="relative py-14 sm:py-20 bg-slate-50/50 border-t border-slate-100 scroll-mt-24"
    >
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Help Center"
          title="Frequently Asked Questions (FAQ)"
          description="সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নাবলি ও সঠিক উত্তর"
        />

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <Reveal key={faq.q} delay={index * 60}>
                <div
                  className={cn(
                    'rounded-2xl border bg-white overflow-hidden shadow-xs transition-all duration-300',
                    isOpen
                      ? 'border-blue-300 shadow-md shadow-blue-500/10'
                      : 'border-slate-200/80 hover:border-blue-200'
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                        isOpen
                          ? 'bg-blue-600 text-white rotate-45'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
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
                      <p className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5 mt-0.5 mx-0">
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
