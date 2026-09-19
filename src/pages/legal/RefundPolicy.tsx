import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2, XCircle, Clock, CreditCard, HelpCircle } from 'lucide-react';

export const RefundPolicy: React.FC = () => {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      bengaliTitle="রিফান্ড ও সাবস্ক্রিপশন ক্যান্সেলেশন নীতি"
      subtitle="Clear, fair, and transparent refund standards for PracticeKoro Pro Pass subscriptions and online test packages."
      lastUpdated="September 19, 2026"
      badge="Razorpay Merchant Compliance"
    >
      {/* 1. Digital Content Notice */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-pk-primary" />
          <span>1. Nature of Digital Goods &amp; Services</span>
        </h2>
        <p>
          At <strong>PracticeKoro</strong>, we provide online educational mock tests, previous year
          papers (PYQs), Bengali model answers, and performance analytics. When you purchase a{' '}
          <strong>PracticeKoro Pro Pass</strong>, digital access to all premium tests is provisioned{' '}
          <em>immediately</em> upon successful transaction confirmation from our payment gateway
          partner, <strong>Razorpay</strong>.
        </p>
        <p>
          Because digital content and test solutions are accessible immediately upon purchase, our
          refund policy balances student fairness with the prevention of intellectual property
          exploitation.
        </p>
      </section>

      {/* 2. Refund Eligibility Criteria */}
      <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-pk-primary" />
          <span>2. Refund Eligibility Guidelines</span>
        </h2>

        {/* Case A: 100% Eligible */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm sm:text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Eligible for 100% Full Refund:</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
            <li>
              <strong>Duplicate or Accidental Double Charges:</strong> If your bank account or UPI
              was debited multiple times for a single subscription transaction, the duplicate amount
              is 100% refunded immediately.
            </li>
            <li>
              <strong>Payment Deducted but Access Not Granted:</strong> If payment was debited but
              technical gateway issues prevented Pro Pass activation, and our technical support team
              cannot resolve the activation within 48 hours of reporting.
            </li>
            <li>
              <strong>Major Technical Platform Failure:</strong> If severe platform-wide defects
              persistently prevent test submission or viewing questions within 48 hours of initial
              purchase.
            </li>
          </ul>
        </div>

        {/* Case B: Non-Refundable */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
          <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm sm:text-base flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Non-Refundable Circumstances:</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-rose-800 dark:text-rose-300">
            <li>
              <strong>Substantial Content Consumed:</strong> If a student has already attempted and
              unlocked solutions for more than 2 full-length premium mock tests.
            </li>
            <li>
              <strong>Change of Mind:</strong> Requests submitted more than 7 days after purchase or
              where full access has been utilized.
            </li>
            <li>
              <strong>Account Violations:</strong> Accounts terminated due to unauthorized
              credential sharing, scraping, content piracy, or abusive conduct.
            </li>
            <li>
              <strong>External Factors:</strong> Postponement, rescheduling, or changes in
              examination dates made by government exam authorities (e.g. WBPRB, WBPSC).
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Subscription Cancellation Policy */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-pk-primary" />
          <span>3. Subscription Cancellation Policy</span>
        </h2>
        <p>
          PracticeKoro Pro Passes are purchased on a <strong>one-time fixed validity basis</strong>{' '}
          (e.g. 365 days for the 1-Year Pass).
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>
            <strong>No Hidden Auto-Debits:</strong> PracticeKoro DOES NOT automatically deduct
            recurring subscription fees from your bank or card without explicit consent. When your
            pass expires, you retain free tier access and may renew at your own discretion.
          </li>
          <li>
            <strong>Voluntary Early Cancellation:</strong> You may choose to stop using the service
            at any time by simply logging out or contacting support. However, partial-duration
            pro-rata refunds for unused months are not offered.
          </li>
        </ul>
      </section>

      {/* 4. How to Request a Refund */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-pk-primary" />
          <span>4. Step-by-Step Refund Request Process</span>
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>
            Submit your refund request within <strong>7 calendar days</strong> of the transaction
            date.
          </li>
          <li>
            Email our billing support team at{' '}
            <a
              href="mailto:support@practicekoro.online"
              className="text-pk-primary font-semibold hover:underline"
            >
              support@practicekoro.online
            </a>{' '}
            with the subject line: <code>Refund Request - [Your Registered Email]</code>.
          </li>
          <li>
            Include your <strong>Razorpay Payment ID</strong> (e.g., <code>pay_xxxxxxxxx</code>),
            transaction date, and the specific reason for your request. Registered students may also
            submit a ticket directly from the{' '}
            <Link to="/support" className="text-pk-primary hover:underline font-medium">
              Student Support Desk
            </Link>
            .
          </li>
          <li>
            Our billing team will review the transaction and respond with confirmation within{' '}
            <strong>24 to 48 hours</strong>.
          </li>
        </ol>
      </section>

      {/* 5. Processing Timelines */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-pk-primary" />
          <span>5. Refund Turnaround &amp; Payout Timelines</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Once approved, refunds are credited back directly to the{' '}
          <strong>original source of payment</strong> (Bank Account, Debit/Credit Card, or UPI) via
          Razorpay.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white">UPI &amp; Net Banking</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              2 to 5 business working days
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white">Credit &amp; Debit Cards</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              5 to 7 business working days (subject to card issuing bank)
            </p>
          </div>
        </div>
      </section>

      {/* Contact Notice */}
      <section className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
        Questions about our refund policy? Contact{' '}
        <a
          href="mailto:support@practicekoro.online"
          className="text-pk-primary hover:underline font-semibold"
        >
          support@practicekoro.online
        </a>{' '}
        or visit our{' '}
        <Link to="/contact-us" className="text-pk-primary hover:underline">
          Contact Us
        </Link>{' '}
        page.
      </section>
    </LegalLayout>
  );
};
