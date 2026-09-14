# Design System: PracticeKoro 2.0 (Student Dashboard & Platform)
**Project Title:** PracticeKoro 2.0  
**Target:** West Bengal Competitive Exams Platform (WBP, Kolkata Police, WBCS, WBPSC, Railway)  
**Form Factors:** Desktop (1440px+), Laptop (1024px-1366px), Tablet/Mobile (375px-768px), Mobile App (PWA)

---

## 1. Visual Theme & Atmosphere
- **Philosophy:** High-focus, distraction-free, commercial-grade EdTech SaaS. Eliminates childish gamification slop (coins, avatars, cartoon ranks) in favor of rigorous, clean, authoritative preparation.
- **Mood:** Trustworthy, modern, fast, and empowering.
- **Surface Elevation:** Whisper-soft diffused shadows (`shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]`) on white cards, deep slate-950 contrast cards with electric blue borders for active/in-progress test states.

---

## 2. Color Palette & Functional Roles
- **Primary Brand (Electric Blue):** `#2563eb` (`blue-600`) — Primary actions, active navigation tabs, progress highlights, and main badges.
- **Primary Hover (Deep Electric Blue):** `#1d4ed8` (`blue-700`) — Hover states for primary buttons.
- **Secondary Accent (Sky Blue):** `#0284c7` (`sky-600`) / `#e0f2fe` (`sky-100`) — Tagline eyebrows, secondary indicators, topic badges.
- **Background Base:** `#ffffff` (White) / `#f8fafc` (`slate-50`) — Page backdrop and card surfaces.
- **Card Borders:** `#f1f5f9` (`slate-100`) to `#e2e8f0` (`slate-200`) — Crisp, subtle separation.
- **Pro Pass Gold / Amber:** `#f59e0b` (`amber-500`) to `#d97706` (`amber-600`) — All-Access Pass badges, crown icons, and premium subscription callouts.
- **Success / Accuracy (Emerald):** `#10b981` (`emerald-600`) / `#ecfdf5` (`emerald-50`) — High accuracy indicators, passed cutoffs, answered questions.
- **Warning / Mistakes (Amber/Orange):** `#f97316` (`orange-500`) / `#fff7ed` (`orange-50`) — Mistakes Notebook revisions and error flags.
- **Danger / Negative Marks (Rose):** `#e11d48` (`rose-600`) / `#ffe4e6` (`rose-100`) — Negative marking penalties and critical alerts.
- **Typography Colors:**
  - Headings: `#0f172a` (`slate-900`) — Font weight 800/900.
  - Body Text: `#334155` (`slate-700`) / `#475569` (`slate-600`).
  - Muted / Metadata: `#94a3b8` (`slate-400`) / `#64748b` (`slate-500`).

---

## 3. Typography Rules
- **Primary Font Family:** Inter, system-ui, -apple-system, sans-serif.
- **Bilingual Bengali Support:** Noto Sans Bengali / Hind Siliguri fallback for authentic Bengali characters.
- **Scale:**
  - H1 Page Title: `text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight`.
  - Section Headings: `text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight`.
  - Card Titles: `text-sm sm:text-base font-bold text-slate-900`.
  - Metric Numbers: `text-2xl sm:text-3xl font-black font-mono`.
  - Captions / Tags: `text-[10px] sm:text-xs font-semibold tracking-wider`.

---

## 4. Multi-Device Layout Architecture

### A. Desktop (1440px+)
- **Container:** `max-w-7xl mx-auto px-6 lg:px-8`.
- **Layout Structure:**
  - Sticky primary header with full horizontal navigation.
  - Hero Header with dynamic time-based greeting, active exam badge, and quick target-exam switcher dropdown.
  - 4-column Performance Metric grid (`grid-cols-4`).
  - 3-column Quick Practice entry cards (`grid-cols-3`).
  - 2-column Curated Test Series & Mock Test cards (`grid-cols-2`).
  - Side-by-side Recommended Action & Pro Pass Status banners.

### B. Laptop (1024px - 1366px)
- **Container:** `max-w-6xl mx-auto px-4 sm:px-6`.
- **Layout Structure:**
  - Compact vertical padding (`py-6 space-y-6`).
  - 4-column metrics row with slightly condensed font sizing.
  - 3-column Quick Practice cards.
  - High-density mock test list items for maximum information visibility without endless scrolling.

### C. Tablet & Mobile (375px - 768px)
- **Container:** `w-full px-4 space-y-5 pb-24`.
- **Layout Structure:**
  - Compact header with stacked or modal exam selector.
  - 2x2 Performance Metric grid (`grid-cols-2 gap-3`).
  - 1-column full-width cards with generous touch targets (min 44px tap area).
  - Horizontal scrolling subject pill chips with snap scrolling.
  - Bottom navigation bar padding (`pb-24`) ensuring no elements are obscured by the mobile bottom bar.

### D. Mobile App Experience (PWA Shell)
- **Navigation:** Fixed bottom navigation bar with 5 primary touch destinations:
  - 🏠 Home (`/dashboard`)
  - 📝 Exams (`/exams`)
  - 📚 Practice (`/practice`)
  - 📊 Results (`/results`)
  - 👤 Profile (`/profile`)
- **App Bar:** Minimalist top app bar with Target Exam badge, quick switcher, and student avatar with Pro Pass crown badge.
- **Haptic/Micro-interactions:** Smooth active press states (`active:scale-[0.98]`), instant feedback, and zero layout shift.

---

## 5. Component Design Specifications
- **Cards:** Rounded 2xl (`rounded-2xl` or `rounded-3xl`), border `border-slate-100/90`, hover elevation `hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300`.
- **Primary Buttons:** Pill or soft-rounded (`rounded-xl`), electric blue `#2563eb`, bold font, `shadow-lg shadow-blue-500/20`.
- **Status Badges:** Rounded-full, high contrast, subtle borders (e.g. `bg-emerald-50 text-emerald-700 border border-emerald-200`).
- **Progress Bars:** Smooth animated bars with electric blue fill on slate-100 track.
