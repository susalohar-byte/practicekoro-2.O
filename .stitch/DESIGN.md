# Design System: PracticeKoro 2.0 (Student Dashboard & Platform)
**Project Title:** PracticeKoro 2.0  
**Target:** West Bengal Competitive Exams Platform (WBP, Kolkata Police, WBCS, WBPSC, Railway, SSC)  
**Form Factors:** Mobile App Experience (375px-430px PWA), Tablet (768px-1024px), Desktop (1280px-1440px+)

---

## 1. Visual Theme & Atmosphere
- **Philosophy:** High-focus, distraction-free, modern commercial EdTech platform. Clear visual hierarchy, cohesive pastel subject color-coding, elegant micro-animations, and immediate feedback.
- **Atmosphere:** Clean, energetic, motivating, and authoritative.
- **Surfaces & Cards:** Crisp white cards (`#ffffff`) with subtle rounded borders (`border-slate-100` / `border-slate-200`) and soft elevation shadows (`shadow-sm`, `shadow-md`).
- **Accent Elements:** Gradient hero banners (electric blue `#0158fc` to `#0198fd`, deep navy `#063585`, and gold/amber `#f59e0b` for Pro Pass).

---

## 2. Color Palette & Functional Roles
- **Primary Brand (Electric Blue):** `#0158fc` (`blue-600`) — Primary actions, active navigation tabs, selected options, progress rings.
- **Primary Hover (Deep Electric Blue):** `#0062fd` / `#1d4ed8` — Active/hover states.
- **Primary Subtle / Wash:** `#eff5fb` (`sky-50` / `blue-50`) — Active pill backgrounds, icon badges.
- **Brand Navy:** `#063585` / `#0b1f44` — Student profile header, bold typography, authoritative cards.
- **Pro Pass Gold / Amber:** `#f59e0b` to `#d97706` — Crown badge, premium subscription highlights, trophies.
- **Success / Correct (Emerald):** `#10b981` / `#059669` / `#ecfdf5` — Correct answers, high accuracy badges.
- **Danger / Incorrect (Rose/Red):** `#ef4444` / `#dc2626` / `#fef2f2` — Wrong answers, mistakes revision, negative marking.
- **Skipped / Neutral (Slate):** `#64748b` / `#94a3b8` / `#f1f5f9` — Skipped questions, unattempted tags.

### Subject Specific Color Tokens
- **Mathematics:** Royal Blue (`text-blue-600 bg-blue-50 border-blue-100`)
- **Reasoning:** Vibrant Pink/Rose (`text-pink-600 bg-pink-50 border-pink-100`)
- **General Knowledge:** Emerald Green (`text-emerald-600 bg-emerald-50 border-emerald-100`)
- **English:** Indigo / Purple (`text-purple-600 bg-purple-50 border-purple-100`)
- **Bengali:** Warm Amber / Orange (`text-amber-600 bg-amber-50 border-amber-100`)
- **Computer:** Cyan / Sky (`text-sky-600 bg-sky-50 border-sky-100`)

---

## 3. Typography & Badges
- **Font Family:** Inter, system-ui, -apple-system, sans-serif with Noto Sans Bengali fallback.
- **Pill Badges:** Fully rounded (`rounded-full px-4 py-1.5 text-xs font-bold`).
  - Active: `bg-blue-600 text-white shadow-sm`
  - Inactive: `bg-slate-100 text-slate-600 hover:bg-slate-200`
- **Cards:** `rounded-2xl` or `rounded-3xl` with `border border-slate-100` and soft elevation.

---

## 4. 17-Screen Architecture Specification

| # | Screen | Key Elements & Layout |
|---|---|---|
| **1** | Splash Screen | Electric blue gradient, brand logo, tagline "Small Steps Big Results", progress bar |
| **2** | Onboarding 1 | "Your Dream Starts with Practice", 3D student illustration, pagination dots, Next button |
| **3** | Onboarding 2 | "Learn Smarter Not Harder", feature cards stack (Mock Tests, Topic Practice, PYQ, Performance) |
| **4** | Onboarding 3 | "Be Exam Ready With PracticeKoro", trophy "DISCIPLINE TODAY SUCCESS TOMORROW", 3 stat pills |
| **5** | Exam Selection | "Choose Your Exam", search bar, category pills [West Bengal, SSC, Railway, All], exam list |
| **6** | Primary Exam Selection | "Set Your Primary Exam", radio selection cards with "Selected" badge, full-width Continue CTA |
| **7** | Home Screen | "Hi, Student 👋", Daily Goal card (circular ring 60%), 4 Quick Actions (Practice, Mock Tests, PYQ, Notes), Popular Exams, Continue Practice |
| **8** | Practice Screen | Header with back + info, pills [Subjects \| Topics], 2-col pastel subject grid, Quick Practice cards (Daily Practice, Weak Topics) |
| **9** | Topic Screen | Subject title + count, "Change" button, filters [All Topics \| Weak \| Attempted], topic cards with counts |
| **10** | Test Series Screen | Header with search, filter chips [All Exams, WBSSC, WBP, SSC], test series cards with question counts |
| **11** | Live Test Screen | Header with Exam Name, status bar (Timer, Question progress, Grid icon), section pill, question card, option selector cards, Previous/Next/Mark/Clear footer |
| **12** | Result Screen | Trophy with stars, "Great Job!", Score badge "72 / 100", metric cards (Correct, Incorrect, Skipped), View Detailed Analysis, Review Answers, Re-attempt, Back to Home |
| **13** | Detailed Analysis Screen | Tabs [Overview \| Subject-wise \| Topic-wise], Accuracy donut chart, Subject performance progress bars |
| **14** | Saved Questions Screen | Filter pills [All \| Bookmarks \| Incorrect], question cards with subject badges and date |
| **15** | Leaderboard Screen | Filter pills [All India \| West Bengal \| Friends], Top 3 podium with gold/silver/bronze medals, student rank list, sticky bottom card for user |
| **16** | Subscription Screen | Crown icon, "Go Premium", Monthly / Yearly toggle, feature checklist, price callout, "Get All Access" CTA |
| **17** | Profile Screen | Dark navy student card, Pro Plan gold banner with Upgrade button, clean menu item cards (My Tests, Saved Questions, My Results, etc.) |

---

## 5. Navigation System
- **Mobile Bottom Navigation Bar (5 Primary Destinations):**
  1. 🏠 **Home** (`/dashboard`)
  2. 📝 **Exams** (`/exams`)
  3. 📚 **Practice** (`/practice`)
  4. 📊 **Results** (`/results`)
  5. 👤 **Profile** (`/profile`)
