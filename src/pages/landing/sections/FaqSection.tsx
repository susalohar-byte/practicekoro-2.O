import React, { useState } from 'react';
import { faqs } from '../data';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* =========================================================================
          9. FAQ SECTION (Interactive Accordion)
          ========================================================================= */}
      <section className="py-12 bg-slate-50/50 border-t border-slate-100">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions (FAQ)</h3>
            <p className="text-xs text-slate-500">সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নাবলি ও সঠিক উত্তর</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
