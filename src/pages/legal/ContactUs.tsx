import React, { useState } from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Clock, Send, CheckCircle2, ShieldCheck, Headphones } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate inquiry intake
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <LegalLayout
      title="Contact Us & Support"
      bengaliTitle="যোগাযোগ ও সহায়তা কেন্দ্র"
      subtitle="Have questions, partnership inquiries, or need assistance with your subscription? We are here to help."
      lastUpdated="September 19, 2026"
      badge="Customer Support & Merchant Disclosure"
    >
      {/* Overview & Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-pk-primary/10 text-pk-primary flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Email Us</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Direct response in 24h</p>
          <a
            href="mailto:support@practicekoro.online"
            className="text-xs font-semibold text-pk-primary hover:underline block pt-1"
          >
            support@practicekoro.online
          </a>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Operating Hours</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">IST (Indian Standard Time)</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 pt-1">
            Mon – Sat: 10:00 AM – 7:00 PM
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Location</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Headquarters</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 pt-1">
            West Bengal, India
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Student Support Link */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
        {/* Contact Form */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-pk-primary" />
            <span>Send Us a Direct Message</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Fill out the form below and our team will get back to your registered email address
            within 24–48 hours.
          </p>

          {submitted ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Message Sent Successfully!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Thank you for contacting PracticeKoro. We will review your query and reply to your
                email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold text-pk-primary hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Your Full Name"
                  type="text"
                  placeholder="e.g. Sourav Banerjee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. sourav@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Subject / Topic"
                type="text"
                placeholder="e.g. Pro Pass Payment Inquiry / Question Discrepancy"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 block">
                  Detailed Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide complete details including Exam Name or Razorpay Payment ID if applicable..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pk-primary focus:border-transparent transition-all"
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Submit Inquiry
              </Button>
            </form>
          )}
        </div>

        {/* Right Column: Support Options & Legal Disclosures */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-pk-primary/5 dark:bg-pk-primary/10 border border-pk-primary/20 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Headphones className="w-4 h-4 text-pk-primary" />
              <span>Are You an Enrolled Student?</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If you already have a PracticeKoro account, you can submit an expedited support ticket
              directly from your student dashboard.
            </p>
            <Link
              to="/support"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-pk-primary hover:bg-pk-primary-interactive text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span>Open Student Helpdesk</span>
            </Link>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Merchant Information</span>
            </h4>
            <p>
              <strong>Platform:</strong> PracticeKoro (practicekoro.online)
            </p>
            <p>
              <strong>Service Type:</strong> Online Exam Preparation &amp; Mock Tests
            </p>
            <p>
              <strong>Primary Support:</strong> support@practicekoro.online
            </p>
            <p>
              <strong>Billing Inquiries:</strong> support@practicekoro.online
            </p>
            <p className="pt-1 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-700">
              For subscription refunds, please consult our{' '}
              <Link to="/refund-policy" className="text-pk-primary hover:underline">
                Refund Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};
