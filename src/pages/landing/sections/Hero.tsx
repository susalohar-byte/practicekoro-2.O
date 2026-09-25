import React from 'react';
import { Reveal } from './Reveal';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden min-h-screen min-h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20">
      {/* Background Lifestyle Video of Indian Aspirant Studying */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/hero_student_study_bg.jpg"
          className="w-full h-full object-cover object-[center_35%] filter blur-[2.5px] scale-[1.03] opacity-85 dark:opacity-45 transition-all duration-300"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/Hero video.mp4" type="video/mp4" />
          <source src="/Hero%20video.mp4" type="video/mp4" />
          {/* Fallback image if video cannot be played */}
          <img
            src="/images/hero_student_study_bg.jpg"
            alt="Government Exam Aspirant Studying at Home"
            className="w-full h-full object-cover object-[center_35%] filter blur-[2.5px]"
          />
        </video>
        {/* Soft atmospheric gradient wash - smooth depth & perfect text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/20 sm:from-white/80 sm:via-white/45 sm:to-transparent dark:from-slate-950/85 dark:via-slate-950/60 dark:to-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-white/70 dark:from-slate-950/50 dark:via-transparent dark:to-slate-950/75" />
      </div>

      {/* Main Content Column - Headline & Subheadline Only */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center my-auto py-12">
        {/* Main Headline */}
        <Reveal delay={80}>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2] font-headline text-balance drop-shadow-xs">
            আত্মবিশ্বাসের সাথে জয় <br className="hidden sm:inline" />
            করো স্বপ্নের সরকারি <span className="text-blue-600 dark:text-blue-400">চাকরি।</span>
          </h1>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay={160}>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-700 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium text-balance">
            আসল পরীক্ষার ধাঁচে মক টেস্ট, ১০+ বছরের সমাধানসহ PYQ ও টপিক-ভিত্তিক প্র্যাকটিস। WBP, WBPSC, WBSSC, Primary TET ও Railways-এর জন্য।
          </p>
        </Reveal>
      </div>
    </section>
  );
};
