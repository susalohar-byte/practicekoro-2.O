import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, AlertTriangle, Scale, CreditCard, Mail } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
  return (
    <LegalLayout
      title="Terms and Conditions"
      bengaliTitle="ব্যবহারের সাধারণ নিয়ম ও শর্তাবলি"
      subtitle="Please read these terms carefully before accessing or using the PracticeKoro examination preparation platform."
      lastUpdated="September 19, 2026"
      badge="User Agreement & Platform Terms"
    >
      {/* Introduction */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-pk-primary" />
          <span>1. Introduction & Acceptance of Terms</span>
        </h2>
        <p>
          Welcome to <strong>PracticeKoro</strong> (&quot;PracticeKoro&quot;, &quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;), operating via{' '}
          <a
            href="https://practicekoro.online"
            className="text-pk-primary hover:underline font-semibold"
          >
            https://practicekoro.online
          </a>{' '}
          and related digital services. By creating an account, browsing our website, or subscribing
          to our Pro Pass, you agree to be bound by these Terms and Conditions (&quot;Terms&quot;)
          and our{' '}
          <Link to="/privacy" className="text-pk-primary hover:underline font-medium">
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          If you do not agree to these Terms, please immediately discontinue using our services.
          PracticeKoro is dedicated to providing high-yield mock tests, previous year questions
          (PYQs), topic-wise practice, and performance analytics for competitive examinations
          conducted across West Bengal and India (including WBP Constable, KP SI, WBCS, WBPSC
          Clerkship, Miscellaneous, and Central SSC/Railway exams).
        </p>
      </section>

      {/* User Eligibility & Accounts */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-pk-primary" />
          <span>2. Account Registration & Security</span>
        </h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Eligibility:</strong> You must be at least 16 years of age or preparing for
            eligible competitive examinations to register an account.
          </li>
          <li>
            <strong>Accurate Information:</strong> You agree to provide true, accurate, and complete
            information during registration and keep your profile credentials updated.
          </li>
          <li>
            <strong>Account Confidentiality:</strong> You are solely responsible for maintaining the
            confidentiality of your account credentials (email and password or Google OAuth
            session). Any activity that occurs under your account is your responsibility.
          </li>
          <li>
            <strong>Single User License:</strong> Each user account and subscription is personal and
            non-transferable. Simultaneous logins from multiple distant locations or sharing account
            credentials with study groups or third parties is strictly prohibited and may result in
            immediate suspension without refund.
          </li>
        </ul>
      </section>

      {/* Pro Pass Subscriptions & Payments */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-pk-primary" />
          <span>3. Subscriptions, Payments & Access Rights</span>
        </h2>
        <p>
          PracticeKoro operates on a freemium model. Free mock tests are accessible to all
          registered students. Advanced mock exams, detailed Bengali solutions, rank percentiles,
          and mistake notebooks require an active <strong>Pro Pass</strong>.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Universal Access:</strong> An active Pro Pass grants universal access to all
            premium tests during the specified validity period (e.g., 365 days for the 1-Year
            All-Access Pro Pass).
          </li>
          <li>
            <strong>Payment Aggregation:</strong> All monetary transactions on PracticeKoro are
            securely processed via <strong>Razorpay</strong>, an RBI-authorized payment aggregator.
            We do not store your complete credit/debit card details, net banking credentials, or UPI
            MPIN on our servers.
          </li>
          <li>
            <strong>Taxes:</strong> All fees are stated in Indian Rupees (INR) and are inclusive of
            applicable goods and service taxes unless explicitly stated otherwise.
          </li>
          <li>
            <strong>Refunds:</strong> All purchases are subject to our comprehensive{' '}
            <Link to="/refund-policy" className="text-pk-primary hover:underline font-semibold">
              Refund &amp; Cancellation Policy
            </Link>
            .
          </li>
        </ul>
      </section>

      {/* Intellectual Property */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-pk-primary" />
          <span>4. Intellectual Property Rights</span>
        </h2>
        <p>
          All mock test questions, question curation, Bengali translations, explanations, software
          code, test algorithms, UI designs, graphics, and trademarks are the exclusive proprietary
          property of PracticeKoro.
        </p>
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <strong>Strict Prohibition:</strong> You may not scrape, copy, reproduce, distribute,
          publish, commercially exploit, reverse-engineer, or transmit any test papers or solutions
          to Telegram channels, websites, or coaching institutes without express written
          authorization.
        </div>
      </section>

      {/* Non-Affiliation Disclaimer */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>5. Non-Affiliation Disclaimer (Educational Tool Only)</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          <strong>PracticeKoro is an independent private educational platform.</strong> We are NOT
          affiliated with, sponsored by, endorsed by, or in any way associated with the West Bengal
          Police Recruitment Board (WBPRB), West Bengal Public Service Commission (WBPSC), Staff
          Selection Commission (SSC), Railway Recruitment Board (RRB), or any other government
          recruitment body.
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          Our practice tests, past paper archives, and simulated rankings are strictly intended for
          academic practice and preparation purposes. Enrolling in PracticeKoro or attempting our
          tests does not guarantee appointment, selection, or qualification in any competitive exam.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          6. Limitation of Liability &amp; Platform Availability
        </h2>
        <p>
          While we strive for 99.9% uptime and rigorous academic accuracy across all question banks,
          PracticeKoro provides the service on an &quot;as is&quot; and &quot;as available&quot;
          basis. We are not liable for incidental service interruptions resulting from scheduled
          server maintenance, telecommunication network outages, or internet connectivity issues on
          the student&apos;s device.
        </p>
      </section>

      {/* Governing Law & Dispute Resolution */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          7. Governing Law &amp; Jurisdiction
        </h2>
        <p>
          These Terms shall be governed by and interpreted in accordance with the laws of the
          Republic of India. In the event of any legal dispute or claim arising out of or related to
          these Terms or your use of PracticeKoro, the competent courts situated in{' '}
          <strong>Kolkata / West Bengal, India</strong> shall have exclusive jurisdiction.
        </p>
      </section>

      {/* Contact Section */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-pk-primary" />
          <span>Questions regarding these Terms?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          For legal inquiries, terms clarification, or institutional inquiries, please contact our
          legal and support team at{' '}
          <a
            href="mailto:support@practicekoro.online"
            className="text-pk-primary font-semibold hover:underline"
          >
            support@practicekoro.online
          </a>{' '}
          or reach out via our{' '}
          <Link to="/contact-us" className="text-pk-primary font-semibold hover:underline">
            Contact Us
          </Link>{' '}
          page.
        </p>
      </section>
    </LegalLayout>
  );
};
