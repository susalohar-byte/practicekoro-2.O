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
    bengaliTag: 'রিয়েল পরীক্ষার সিমুলেটর',
    description: 'Select the exam with real exam pattern.',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon: CheckCircle2,
    title: 'Previous Year Questions',
    bengaliTag: 'PYQ প্রশ্নব্যাংক',
    description: 'Practice PYQs to understand the exam trend.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: Target,
    title: 'Topic-wise Practice',
    bengaliTag: 'অধ্যায়ভিত্তিক প্রস্তুতি',
    description: 'Focus on your weak topics and build strong concepts.',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
  },
  {
    icon: BarChart3,
    title: 'Performance Analysis',
    bengaliTag: 'নির্ভুল অ্যানালিসিস ও র‍্যাঙ্ক',
    description: 'Detailed analysis to track your progress.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: Bookmark,
    title: 'Bookmarks & Notes',
    bengaliTag: 'গুরুত্বপূর্ণ নোটস',
    description: 'Save important questions for quick revision.',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    icon: Clock,
    title: 'Practice History',
    bengaliTag: 'ভুল সংশোধন খাতা',
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
    q: 'ভুল সংশোধন খাতা (Mistakes Notebook) কীভাবে কাজ করে?',
    a: 'টেস্ট সাবমিট করার পর আপনার ভুল হওয়া প্রশ্নগুলো স্বয়ংক্রিয়ভাবে আপনার Mistakes Notebook-এ জমা হয়ে যায়। সেখানে প্রতিটি ভুলের সঠিক ব্যাখ্যা দেখে আপনি ভুল শুধরে নেওয়ার প্র্যাকটিস করতে পারবেন।',
  },
  {
    q: 'PracticeKoro-র মক টেস্টগুলো কি সম্পূর্ণ বাংলায়?',
    a: 'হ্যাঁ! প্রতিটি মক টেস্ট বাংলা এবং ইংরেজি উভয় ভাষাতেই উপলব্ধ। টেস্ট চলাকালীন যেকোনো সময় এক ক্লিকে প্রশ্নের ভাষা পরিবর্তন করা যায়।',
  },
  {
    q: 'প্রো পাস নিলে কি সব পরীক্ষার মক টেস্ট পাবো?',
    a: 'হ্যাঁ। একটি মাত্র All-Access Pro Pass (₹২৯৯ / ৩৬৫ দিন) নিলে WBP, KP, WBCS, WBPSC, Railway সহ সমস্ত পরীক্ষার সমস্ত প্রিমিয়াম টেস্ট আনলক হয়ে যায়।',
  },
  {
    q: 'আমি কি বিনামূল্যে কোনো টেস্ট দিতে পারবো?',
    a: 'অবশ্যই! PracticeKoro-তে ফ্রি মক টেস্ট সবসময় উপলব্ধ (ফ্রি টায়ার ₹০)। আপনি অ্যাকাউন্ট খুলেই টেস্ট দিয়ে পরখ করতে পারেন।',
  },
];
