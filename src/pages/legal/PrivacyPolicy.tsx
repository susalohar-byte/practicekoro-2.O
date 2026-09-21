import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Trash2,
  Scale,
  EyeOff,
  Server,
  UserCheck,
} from 'lucide-react';
import { Navbar } from '@/pages/landing/sections/Navbar';
import { Footer } from '@/pages/landing/sections/Footer';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-pk-primary selection:text-white">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-pk-primary/10 rounded-full blur-3xl pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-pk-primary dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transparent Data Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-base sm:text-lg font-semibold text-pk-primary dark:text-blue-400">
            Privacy &amp; Data Protection Policy
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PracticeKoro is committed to upholding the privacy and security of our students. This
            policy outlines how we collect, safeguard, and respect your personal and learning data.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Last Updated:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                September 19, 2026
              </strong>
            </span>
            <span>•</span>
            <span>
              Legal Framework:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                IT Act 2000 & SPDI Rules
              </strong>
            </span>
            <span>•</span>
            <span>
              Jurisdiction:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                West Bengal, India
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Key Guarantees Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Zero Financial Data Stored
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never touch or store card numbers, CVVs, or UPI MPINs. All transactions run on
              Razorpay&apos;s RBI-authorized PCI-DSS Level 1 infrastructure.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-pk-primary flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Data Selling</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your test scores, mock attempts, contact info, and learning habits are never sold,
              rented, or shared with third-party advertisers or coaching institutes.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Right to Account Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Students own their data. You can request complete account and learning history
              deletion anytime with a statutory 14-day completion SLA.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Grievance Officer</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In full compliance with Indian Information Technology Rules, 2021, an official
              Grievance Officer is appointed with guaranteed acknowledgment in 24–48 hours.
            </p>
          </div>
        </div>

        {/* Policy Document Body */}
        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-pk-primary" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              When you interact with PracticeKoro (https://practicekoro.online), we collect only the
              essential information necessary to deliver high-performance test series and analytics:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Profile Identification:</strong> Name, Email address, optional phone number,
                and Google OAuth identifier (for one-click social sign-in).
              </li>
              <li>
                <strong>Academic & Examination Performance:</strong> Test attempts, question
                answers, time spent per question, accuracy percentiles, bookmarks, and mistake
                notebook entries.
              </li>
              <li>
                <strong>Technical Telemetry:</strong> Browser type, operating system, IP address
                (for session concurrency and fraud prevention), and error diagnostic logs.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-pk-primary" />
              <span>2. Purpose & Use of Collected Data</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>
                To administer timed mock tests, chapter tests, and previous year test engines.
              </li>
              <li>
                To generate detailed comparative rank percentiles and topic mastery breakdowns.
              </li>
              <li>
                To authenticate user access, enforce single-device session integrity, and prevent
                account abuse.
              </li>
              <li>
                To deliver service updates, critical system notifications, and payment receipts.
              </li>
            </ul>
          </section>

          {/* Section 3: Payment Card Security */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-pk-primary" />
              <span>3. Payment Card & Financial Information Security</span>
            </h2>
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                We Do NOT Store Your Financial Card or UPI MPIN Details
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                PracticeKoro does NOT collect, capture, or store sensitive financial instruments,
                including credit/debit card numbers, CVVs, expiration dates, or bank net banking
                credentials on any of our servers.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                All checkout operations are handled directly via an encrypted iframe/modal powered
                by <strong>Razorpay Software Private Limited</strong>, which complies strictly with
                Reserve Bank of India (RBI) tokenization guidelines and holds PCI-DSS Level 1
                certification.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-pk-primary" />
              <span>4. Data Sharing & Third-Party Disclosure</span>
            </h2>
            <p>
              We do not sell, rent, trade, or otherwise commercialize your personal information.
              Data is shared strictly with essential service infrastructure providers:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Database & Authentication Infrastructure:</strong> Supabase Inc. (ISO/IEC
                27001 certified cloud database and auth infrastructure with Row Level Security).
              </li>
              <li>
                <strong>Payment Aggregator:</strong> Razorpay (to process transactions and verify
                subscription status).
              </li>
              <li>
                <strong>Legal Obligations:</strong> Where mandated by court orders, statutory
                investigations, or applicable Indian law enforcement requests.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pk-primary" />
              <span>5. Data Security & Storage Architecture</span>
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards. All
              data in transit is encrypted using TLS 1.3. User passwords utilize salted bcrypt
              hashes. Furthermore, database-level Row Level Security (RLS) guarantees that no
              student can view or tamper with another student&apos;s scores or profile records.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-pk-primary" />
              <span>6. Student Rights & Account Deletion</span>
            </h2>
            <p>
              Students have full ownership of their data. You have the right to access, rectify, or
              permanently erase your account and test attempt history.
            </p>
            <p>
              To request account deletion, email{' '}
              <a
                href="mailto:support@practicekoro.online"
                className="text-pk-primary font-semibold hover:underline"
              >
                support@practicekoro.online
              </a>{' '}
              with the subject &quot;Account Deletion Request&quot;. Deletion requests are processed
              and confirmed within a 14-day statutory turnaround.
            </p>
          </section>

          {/* Section 7: Grievance Redressal Officer */}
          <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-pk-primary" />
              <span>7. Grievance Redressal Officer</span>
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000 and the Information Technology
              (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the contact
              details of the Grievance Officer are published below:
            </p>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs sm:text-sm">
              <p>
                <strong>Designation:</strong> Grievance Redressal &amp; Privacy Officer
              </p>
              <p>
                <strong>Entity:</strong> PracticeKoro EdTech Services
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:support@practicekoro.online"
                  className="text-pk-primary font-semibold hover:underline"
                >
                  support@practicekoro.online
                </a>
              </p>
              <p>
                <strong>Turnaround Time:</strong> Acknowledgement within 24–48 hours; resolution
                within 15 working days.
              </p>
              <p>
                <strong>Location:</strong> West Bengal, India
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Questions about our Privacy Policy?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Feel free to reach out to our privacy officer directly.
                </p>
              </div>
              <Link
                to="/contact-us"
                className="px-4 py-2 bg-pk-primary hover:bg-pk-primary-interactive text-white rounded-xl text-xs font-semibold shadow-xs shrink-0"
              >
                Contact Privacy Desk
              </Link>
            </div>
          </section>
        </article>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
