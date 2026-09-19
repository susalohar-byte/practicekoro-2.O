import React from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  CreditCard,
  ShieldCheck,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/pages/landing/sections/Navbar';
import { Footer } from '@/pages/landing/sections/Footer';

export const RefundPolicy: React.FC = () => {
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
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Fair & Transparent Billing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>

          <p className="text-base sm:text-lg font-semibold text-pk-primary dark:text-blue-400 font-bengali">
            রিফান্ড ও সাবস্ক্রিপশন ক্যান্সেলেশন নীতি
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PracticeKoro believes in fair, student-first digital service delivery. Here is our
            transparent policy regarding subscription refunds, accidental payments, and
            cancellations.
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
              Compliance:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                Razorpay Merchant Guidelines
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
        {/* Step-by-Step Flow Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-pk-primary" />
            <span>How Refund Processing Works</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-pk-primary text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Submit Request</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Email support within 7 days with your Razorpay Payment ID.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-pk-primary text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Verification & Audit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Billing team reviews duplicate/technical claims in 24–48 hours.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-pk-primary text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bank Credit</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Funds returned directly to your original payment account.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Policy Text in Beautiful Container */}
        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-pk-primary" />
              <span>1. Digital Goods Nature & Activation</span>
            </h2>
            <p>
              PracticeKoro provides digital examination preparation services, including mock tests,
              sectional practice sets, performance analytics, and solution explanations. Upon
              successful payment verification via Razorpay, access to the purchased Pro Pass plan is
              granted instantly to the student account.
            </p>
            <p>
              Because digital study material and test questions are accessible immediately upon
              activation, refund requests are governed strictly by the fair eligibility conditions
              detailed below.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pk-primary" />
              <span>2. Refund Eligibility Criteria</span>
            </h2>

            {/* 100% Refund Card */}
            <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Eligible for 100% Full Refund:</span>
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                <li>
                  <strong>Duplicate Transactions:</strong> You were charged multiple times for the
                  same subscription plan due to a network lag or payment gateway glitch.
                </li>
                <li>
                  <strong>Technical Non-Delivery:</strong> You paid successfully and have a valid
                  Razorpay payment ID, but your account failed to activate within 48 hours and our
                  support team could not resolve the technical issue.
                </li>
                <li>
                  <strong>Unused Plan Cancellation:</strong> You purchased a pass mistakenly and
                  have NOT attempted any mock tests or accessed premium analytics, provided the
                  refund request is raised within 7 calendar days of payment.
                </li>
              </ul>
            </div>

            {/* Non-Refundable Card */}
            <div className="p-5 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-2">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Non-Refundable Circumstances:</span>
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-rose-800 dark:text-rose-300">
                <li>
                  <strong>Substantial Content Consumption:</strong> Any account that has already
                  attempted 3 or more premium mock tests or generated detailed rank percentiles.
                </li>
                <li>
                  <strong>Time-Barred Requests:</strong> Refund claims submitted after 7 calendar
                  days from the transaction date.
                </li>
                <li>
                  <strong>Violation of Terms of Service:</strong> Accounts suspended or terminated
                  due to credential sharing, unauthorized content scraping, or scraping attempts.
                </li>
                <li>
                  <strong>Exam Rescheduling / Candidate Mindset:</strong> Rescheduling,
                  cancellation, or change of recruitment dates by WBPRB, WBPSC, SSC, or any
                  government authority.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-pk-primary" />
              <span>3. Subscription Cancellation Policy</span>
            </h2>
            <p>
              PracticeKoro Pro Passes are <strong>fixed-validity passes</strong> (e.g., 30 Days, 90
              Days, or 365 Days). We do <strong>NOT</strong> operate silent auto-debit recurring
              mandates. Your payment is a one-time transaction for the specified duration.
            </p>
            <p>
              You are never locked into unwanted renewals. When your pass validity expires, access
              to premium tests simply pauses until you choose to renew voluntarily.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-pk-primary" />
              <span>4. Step-by-Step Refund Request Process</span>
            </h2>
            <p>To request a refund under the eligible criteria:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
              <li>
                Send an email to{' '}
                <a
                  href="mailto:support@practicekoro.online"
                  className="text-pk-primary font-semibold hover:underline"
                >
                  support@practicekoro.online
                </a>{' '}
                from your PracticeKoro registered email address.
              </li>
              <li>
                Set the email subject to:{' '}
                <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs font-semibold">
                  Refund Request - [Your Registered Email] - [Razorpay Payment ID]
                </code>
              </li>
              <li>
                Attach your payment receipt or Razorpay transaction confirmation ID (e.g.,{' '}
                <code>pay_...</code>).
              </li>
              <li>Specify the reason for the refund request (e.g., duplicate charge).</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-pk-primary" />
              <span>5. Refund Turnaround & Payout Timelines</span>
            </h2>
            <p>
              Once approved by our billing desk, refunds are initiated immediately through the
              Razorpay payment gateway back to your original source of payment:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>
                <strong>UPI & Net Banking:</strong> 2 to 5 business working days.
              </li>
              <li>
                <strong>Credit / Debit Cards:</strong> 5 to 7 business working days (subject to your
                issuing bank&apos;s processing cycle).
              </li>
              <li>
                <strong>Wallets:</strong> 24 to 48 business hours.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-6 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pk-primary" />
                  <span>Have questions about your transaction?</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Our billing desk is available Mon – Sat (10:00 AM – 7:00 PM IST).
                </p>
              </div>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-pk-primary hover:bg-pk-primary-interactive text-white rounded-xl text-xs font-semibold shadow-xs shrink-0"
              >
                <span>Contact Billing Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
