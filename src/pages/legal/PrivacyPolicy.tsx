import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, UserCheck, Bell, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      bengaliTitle="গোপনীয়তা ও তথ্য সুরক্ষা নীতি"
      subtitle="Learn how PracticeKoro collects, protects, uses, and respects your personal and academic performance data."
      lastUpdated="September 19, 2026"
      badge="Data Privacy & Security Standards"
    >
      {/* 1. Overview */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-pk-primary" />
          <span>1. Introduction &amp; Commitment to Privacy</span>
        </h2>
        <p>
          At <strong>PracticeKoro</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we
          take the privacy of our student community and website visitors seriously. This Privacy
          Policy details our policies regarding the collection, storage, use, and disclosure of
          personal and academic performance information when you use{' '}
          <a
            href="https://practicekoro.online"
            className="text-pk-primary hover:underline font-semibold"
          >
            https://practicekoro.online
          </a>{' '}
          and related digital applications.
        </p>
        <p>
          We comply with the Information Technology Act, 2000, the Information Technology
          (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information)
          Rules, 2011, and the Digital Personal Data Protection Act (DPDPA), 2023 of the Republic of
          India.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-pk-primary" />
          <span>2. Information We Collect</span>
        </h2>
        <div className="space-y-3 text-slate-600 dark:text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              A. Information You Provide to Us:
            </h3>
            <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
              <li>
                <strong>Account Credentials:</strong> Full name, email address, password, and mobile
                number (optional).
              </li>
              <li>
                <strong>Google OAuth Data:</strong> When registering via Google 1-Click Sign-in, we
                receive your name, verified email address, and avatar URL provided by Google LLC.
              </li>
              <li>
                <strong>Exam Preferences:</strong> Target examinations selected by you (e.g. WBP
                Constable, KP SI, WBCS).
              </li>
              <li>
                <strong>Support Communications:</strong> Inquiries, bug reports, and ticket messages
                submitted via our helpdesk.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              B. Academic &amp; Performance Data:
            </h3>
            <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
              <li>Test start times, submission timestamps, and time taken per question.</li>
              <li>Answers selected, accuracy rates, and question review bookmarks.</li>
              <li>
                Calculated scores, state-level percentile benchmarks, and mistake notebook history.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              C. Technical &amp; Device Information:
            </h3>
            <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
              <li>
                IP address, browser user-agent, operating system, and screen resolution to provide
                an optimal test-taking UI.
              </li>
              <li>
                Local storage tokens to maintain authenticated sessions and dark/light UI theme
                choices.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Payment Information & Security */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600" />
          <span>3. Payment Card &amp; Financial Information Security</span>
        </h2>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
          <p className="font-bold flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            We Do NOT Store Your Financial Card or UPI MPIN Details
          </p>
          <p className="leading-relaxed">
            All payments on PracticeKoro are executed through{' '}
            <strong>Razorpay Software Private Limited</strong>, an RBI-regulated payment aggregator
            with PCI-DSS Level 1 compliance. When subscribing to a Pro Pass, your credit card, debit
            card, net banking, or UPI credentials are sent directly to Razorpay over 256-bit
            encrypted TLS connections. PracticeKoro only receives a cryptographically signed
            transaction token (Razorpay Payment ID &amp; Order ID) to unlock your Pro subscription.
          </p>
        </div>
      </section>

      {/* 4. How We Use Your Information */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-pk-primary" />
          <span>4. How We Use Collected Information</span>
        </h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>To create, manage, and secure your student account.</li>
          <li>
            To evaluate test submissions, generate scorecards, and compute comparative leaderboards.
          </li>
          <li>
            To compile smart mistake notebooks and personalized chapter revision recommendations.
          </li>
          <li>
            To issue payment receipts, transaction confirmations, and password reset instructions.
          </li>
          <li>To prevent fraudulent activity, unauthorized account sharing, and automated bots.</li>
        </ul>
      </section>

      {/* 5. Data Sharing & Third-Party Service Providers */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-pk-primary" />
          <span>5. Data Sharing &amp; Third-Party Disclosures</span>
        </h2>
        <p>
          <strong>
            We never sell, rent, or trade student personal data to third-party advertisers or
            telemarketers.
          </strong>{' '}
          We share information exclusively with trusted infrastructure partners essential to
          delivering our services:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Supabase Inc.:</strong> Encrypted cloud database and identity management
            infrastructure.
          </li>
          <li>
            <strong>Razorpay:</strong> Payment processing and invoice reconciliation.
          </li>
          <li>
            <strong>Google LLC:</strong> Identity verification via Google Sign-In.
          </li>
          <li>
            <strong>Law Enforcement &amp; Legal Requests:</strong> Only when strictly required by a
            competent court order or law enforcement agency in compliance with Indian statutes.
          </li>
        </ul>
      </section>

      {/* 6. Student Data Rights & Deletion */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-pk-primary" />
          <span>6. Your Rights &amp; Account Deletion</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Every student has complete control over their personal profile. You may:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
          <li>
            Review and update your profile details directly from the{' '}
            <Link to="/profile" className="text-pk-primary hover:underline font-medium">
              Student Profile
            </Link>{' '}
            page.
          </li>
          <li>
            Request complete deletion of your account, email, and test attempt history by contacting
            us at{' '}
            <a
              href="mailto:support@practicekoro.online"
              className="text-pk-primary hover:underline"
            >
              support@practicekoro.online
            </a>
            . Accounts are permanently purged within 14 business days.
          </li>
        </ul>
      </section>

      {/* 7. Grievance Redressal Officer (Mandatory under IT Act) */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-pk-primary" />
          <span>7. Grievance Redressal Officer</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          In accordance with the Information Technology Act 2000 and the Rules made thereunder, the
          contact details of the Grievance Officer are provided below:
        </p>
        <div className="text-xs sm:text-sm space-y-1 font-medium text-slate-800 dark:text-slate-200">
          <p>
            <strong>Designation:</strong> Grievance Redressal &amp; Privacy Officer
          </p>
          <p>
            <strong>Platform:</strong> PracticeKoro (practicekoro.online)
          </p>
          <p>
            <strong>Location:</strong> West Bengal, India
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a
              href="mailto:support@practicekoro.online"
              className="text-pk-primary hover:underline font-semibold"
            >
              support@practicekoro.online
            </a>{' '}
            (Subject: <em>Attention: Grievance Officer</em>)
          </p>
          <p>
            <strong>Response Turnaround:</strong> Acknowledgement within 24–48 hours, complete
            resolution within 15 days.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};
