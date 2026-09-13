import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Shield, Mail, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            Practice<span className="text-brand-600">Koro</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email to receive reset instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                ✓
              </div>
              <h3 className="text-sm font-bold text-slate-900">Instructions Sent</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                If an account exists for <strong>{email}</strong>, we have sent a password reset link.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                placeholder="aspirant@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
