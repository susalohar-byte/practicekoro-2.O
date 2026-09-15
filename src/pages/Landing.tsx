import React from 'react';
import { Navbar } from '@/pages/landing/sections/Navbar';
import { Hero } from '@/pages/landing/sections/Hero';
import { PopularExams } from '@/pages/landing/sections/PopularExams';
import { HowItWorks } from '@/pages/landing/sections/HowItWorks';
import { Features } from '@/pages/landing/sections/Features';
import { Pricing } from '@/pages/landing/sections/Pricing';
import { Testimonials } from '@/pages/landing/sections/Testimonials';
import { BottomCta } from '@/pages/landing/sections/BottomCta';
import { FaqSection } from '@/pages/landing/sections/FaqSection';
import { Footer } from '@/pages/landing/sections/Footer';

export { SUPPORTED_EXAM_CATEGORIES } from '@/pages/landing/data';

/**
 * RootRoute:
 * - Always displays the public Landing Page at https://practicekoro.online/
 * - If user is logged in, Landing Page dynamically displays Dashboard button instead of Login/Get Started
 */
export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <Hero />
      <PopularExams />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <BottomCta />
      <FaqSection />
      <Footer />
    </div>
  );
};
