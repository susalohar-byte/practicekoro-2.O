// Static landing-page content extracted from the original Landing.tsx.
import { FileText, CheckCircle2, Target, BarChart3, Bookmark, Clock } from 'lucide-react';

// West Bengal & Central Competitive Exams Coverage
export const SUPPORTED_EXAM_CATEGORIES = [
  'WBP Constable',
  'Kolkata Police',
  'WBCS Prelims',
  'WBPSC Clerkship',
  'Railway Group D',
  'Primary & Upper Primary TET',
];

export const examCategories = [
  { id: 'all', label: 'All Exams' },
  { id: 'west-bengal', label: 'West Bengal' },
  { id: 'central', label: 'Central' },
  { id: 'state', label: 'State' },
  { id: 'teaching', label: 'Teaching' },
];

export const popularExams = [
  {
    title: 'WBP Constable',
    subtitle: 'West Bengal Police',
    icon: '/images/exams/wbp_police.png',
    route: '/exams/wbp-constable',
    categories: ['all', 'west-bengal', 'state'],
  },
  {
    title: 'Kolkata Police',
    subtitle: 'Kolkata Police',
    icon: '/images/exams/icon_kolkata_police.png',
    route: '/exams/kp-police-si',
    categories: ['all', 'west-bengal', 'state'],
  },
  {
    title: 'Railway (RRB)',
    subtitle: 'Indian Railways',
    icon: '/images/exams/icon_railway_exact.png',
    route: '/exams/railway-group-d',
    categories: ['all', 'central'],
  },
  {
    title: 'SSC GD',
    subtitle: 'Staff Selection Commission',
    icon: '/images/exams/icon_ssc_clean.png',
    route: '/exams',
    categories: ['all', 'central'],
  },
  {
    title: 'SSC MTS',
    subtitle: 'Staff Selection Commission',
    icon: '/images/exams/icon_ssc_clean.png',
    route: '/exams',
    categories: ['all', 'central'],
  },
  {
    title: 'WBSSC',
    subtitle: 'School Service Commission',
    icon: '/images/exams/wbssc_emblem.png',
    route: '/exams',
    categories: ['all', 'west-bengal', 'teaching', 'state'],
  },
  {
    title: 'Group C & D',
    subtitle: 'West Bengal',
    icon: '/images/exams/icon_primary_tet.png',
    route: '/exams',
    categories: ['all', 'west-bengal', 'state'],
  },
  {
    title: 'More Exams',
    subtitle: 'Explore other exams',
    icon: '',
    isCustomIcon: true,
    route: '/exams',
    categories: ['all', 'west-bengal', 'central', 'state', 'teaching'],
  },
];

export const toolsFeatures = [
  {
    icon: FileText,
    title: 'Mock Tests',
    bengaliTag: 'Real Exam Simulator',
    description: 'Select the exam with real exam pattern.',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon: CheckCircle2,
    title: 'Previous Year Questions',
    bengaliTag: 'PYQ Question Bank',
    description: 'Practice PYQs to understand the exam trend.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: Target,
    title: 'Topic-wise Practice',
    bengaliTag: 'Topic-wise Preparation',
    description: 'Focus on your weak topics and build strong concepts.',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
  },
  {
    icon: BarChart3,
    title: 'Performance Analysis',
    bengaliTag: 'Accuracy & Analytics',
    description: 'Detailed analysis to track your progress.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: Bookmark,
    title: 'Bookmarks & Notes',
    bengaliTag: 'High-Yield Notes',
    description: 'Save important questions for quick revision.',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    icon: Clock,
    title: 'Practice History',
    bengaliTag: 'Mistakes Notebook',
    description: 'Keep track of all your tests and improve consistently.',
    color: 'text-sky-600 bg-sky-50 border-sky-100',
  },
];

export const testimonials = [
  {
    quote: 'PracticeKoro helped me improve my score by 40%. The mock tests are really helpful!',
    name: 'Ritwik Das',
    role: 'WBP Constable Aspirant',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'The PYQ section is a game changer. Easy to use and very useful for serious aspirants.',
    name: 'Puja Saha',
    role: 'SSC GD Aspirant',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    quote: 'Best platform for West Bengal exams. Clean UI and relevant questions.',
    name: 'Arindam Pal',
    role: 'Railway Aspirant',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5,
  },
];

export const faqs = [
  {
    q: 'How does the Mistakes Notebook work?',
    a: 'After submitting any test, questions you answered incorrectly are automatically organized into your Mistakes Notebook with detailed explanations for targeted review.',
  },
  {
    q: 'Are PracticeKoro mock tests fully available in English?',
    a: 'Yes! PracticeKoro is fully optimized for English with authentic exam patterns, timer simulation, and step-by-step answer explanations.',
  },
  {
    q: 'Does the Pro Pass unlock all competitive exams?',
    a: 'Yes. A single All-Access Pro Pass (₹299 / 365 Days) unlocks all premium mock test series across State and Central exams including WBP, KP, WBCS, WBPSC, SSC, and Railway.',
  },
  {
    q: 'Can I attempt mock tests for free?',
    a: 'Absolutely! PracticeKoro offers free full mock tests and daily practice sets so you can experience the test runner immediately with no payment details required.',
  },
];
