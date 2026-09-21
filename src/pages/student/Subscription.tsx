import { getErrorMessage } from '@/lib/errors';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Crown,
  CheckCircle2,
  Shield,
  Zap,
  ArrowRight,
  Calendar,
  AlertCircle,
  Receipt,
  LifeBuoy,
} from 'lucide-react';
import { openRazorpayCheckout } from '@/utils/razorpay';
import type { Payment, SubscriptionPlan, CouponValidationResult } from '@/types';
import { StudentSupportModal } from '@/components/student/StudentSupportModal';

export const Subscription: React.FC = () => {
  const { user, refreshProStatus } = useAuth();
  const { plans, subscriptionDetails, refreshSubscription } = useSubscription();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Payment states: idle | preparing | processing | success | failed | cancelled | delayed
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'preparing' | 'processing' | 'success' | 'failed' | 'cancelled' | 'delayed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    planTitle: string;
    expiresAt: string;
    isRenewal: boolean;
  } | null>(null);

  // Coupon state (coupon UI removed during redesign — kept for future reuse)
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);

  // Support intake modal state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<'Payment Issue' | 'Subscription Issue'>(
    'Payment Issue'
  );
  const [supportSubject, setSupportSubject] = useState('');
  const [supportIssue, setSupportIssue] = useState('');

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // Coupon validation handler (UI removed during redesign — kept for future reuse)
  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !activePlan) return;
    try {
      const res = await api.validateCoupon(
        couponInput.trim(),
        activePlan.id,
        activePlan.price,
        user?.id
      );
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponInput('');
      }
    } catch {
      // silently fail
    }
  };
  void handleApplyCoupon;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      // Only show purchasable plans (price > 0) — free plan is automatic for all users
      const paidPlans = plans.filter((p) => p.price > 0);
      const defaultPlan = paidPlans.find((p) => p.id === 'pro_1_year') || paidPlans[0] || plans[0];
      setSelectedPlan(defaultPlan);
    }
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (user) {
      api
        .getStudentPaymentHistory()
        .then(setPayments)
        .catch((err) => console.error('Error fetching payments:', err));
    }
  }, [user, paymentStatus]);

  const activeSub = subscriptionDetails?.isActive;
  // const isExpired =
  //   subscriptionDetails?.status === 'expired' ||
  //   (!activeSub && subscriptionDetails?.hasSubscription);
  const daysLeft = subscriptionDetails?.daysRemaining ?? 0;

  const handleInitiateCheckout = async (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/subscription' } } });
      return;
    }

    // Prevent duplicate clicks
    if (paymentStatus === 'preparing' || paymentStatus === 'processing') {
      return;
    }

    setPaymentStatus('preparing');
    setErrorMessage(null);

    try {
      // 1. Create order on server (authoritative database pricing enforced)
      const order = await api.createRazorpayOrder(plan.id);

      if (
        !order ||
        !order.keyId ||
        !order.keyId.trim() ||
        order.keyId === 'rzp_test_testkey123' ||
        order.keyId === 'rzp_test_practicekoro_key'
      ) {
        throw new Error(
          'Payment Gateway (Razorpay) Key is not configured with your real account. Please configure your Live Razorpay Key in Admin Settings.'
        );
      }

      setPaymentStatus('processing');

      // 2. Build Razorpay checkout options
      // Note: Only attach order_id if this is a verified real order created through Razorpay Orders API.
      // Providing a dummy or non-existent order_id will crash Razorpay checkout SDK with BAD_REQUEST_ERROR.
      const checkoutOptions: Parameters<typeof openRazorpayCheckout>[0] = {
        key: order.keyId.trim(),
        amount: Math.round(order.amount * 100), // in paise
        currency: order.currency || 'INR',
        name: 'PracticeKoro',
        description: `${plan.title} (All-Access Pro Pass)`,
        prefill: {
          name: user.fullName || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: '#4f46e5', // Brand Indigo
        },
        handler: async (response) => {
          // 3. Verify Razorpay response server-side (HMAC signature, idempotency, renewal)
          setPaymentStatus('processing');
          try {
            const verification = await api.verifyRazorpayPayment({
              orderId: response.razorpay_order_id || order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature || '',
              planId: plan.id,
            });

            if (verification.success) {
              setSuccessInfo({
                planTitle: verification.planTitle || plan.title,
                expiresAt: verification.expiresAt,
                isRenewal: verification.isRenewal,
              });
              setPaymentStatus('success');
              await Promise.all([
                refreshSubscription(),
                refreshProStatus ? refreshProStatus() : Promise.resolve(),
              ]);
            } else {
              setPaymentStatus('delayed');
            }
          } catch (verifErr) {
            console.error('Payment verification failed:', verifErr);
            setErrorMessage(getErrorMessage(verifErr, 'Verification could not be completed.'));
            setPaymentStatus('failed');
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus((prev) =>
              prev === 'processing' || prev === 'preparing' ? 'cancelled' : prev
            );
          },
        },
      };

      // Only attach order_id if verified real Razorpay order (created via Razorpay Orders API)
      if (order.isRealRazorpayOrder && order.orderId && !order.orderId.startsWith('pk_local_')) {
        checkoutOptions.order_id = order.orderId;
      }

      // Launch Razorpay Checkout Modal
      const checkoutResult = await openRazorpayCheckout(checkoutOptions);

      if (checkoutResult.error) {
        setErrorMessage(checkoutResult.error);
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      setErrorMessage(getErrorMessage(err, 'Failed to initiate payment. Please try again.'));
      setPaymentStatus('failed');
    }
  };

  // Manual status check handler (UI removed during redesign — kept for future reuse)
  // const handleManualStatusCheck = async () => { ... };

  // Primary plan reference
  const activePlan = selectedPlan ||
    plans.find((p) => p.id === 'pro_1_year') ||
    plans[0] || {
      id: 'pro_1_year',
      title: '1-Year All-Access Pro Pass',
      price: 299,
      durationDays: 365,
      description: 'Universal mock test access across all West Bengal competitive exams.',
      features: [
        'Unlock all premium mock tests',
        'Access every premium test series',
        'Practice across supported exams',
        'Re-attempt tests whenever available',
        'Review detailed solutions and analysis',
        'Mistakes Notebook integration for focused revision',
      ],
    };

  // Toggle state for Screen 16 billing selector: 'monthly' | 'yearly'
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-16">
      {/* =========================================================================
          SCREEN 16: HEADER
          Back Arrow + Crown Icon + "Go Premium - Unlock Your Full Potential"
          ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          aria-label="Back"
        >
          <ArrowRight className="w-4 h-4 transform rotate-180" />
        </button>
        <div className="w-9" />
      </div>

      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
          <Crown className="w-6 h-6 fill-amber-500 text-amber-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Go Premium
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          Unlock Your Full Potential
        </p>
      </div>

      {/* Period Toggle Pills (Screen 16: Monthly | Yearly 40% OFF) */}
      <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setBillingPeriod('monthly')}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
            billingPeriod === 'monthly'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingPeriod('yearly')}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
            billingPeriod === 'yearly'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Yearly (40% OFF)
        </button>
      </div>

      {/* Active Subscription Status Banner if already Pro */}
      {activeSub && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase">
              <Crown className="w-3.5 h-3.5 fill-white" />
              <span>Pro Plan Active</span>
            </div>
            <p className="text-[11px] text-amber-100 mt-0.5">
              Valid for {daysLeft} more days • Universal mock tests unlocked
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs">
            Active
          </span>
        </div>
      )}

      {/* =========================================================================
          SCREEN 16: RESPONSIVE PRICING & CHECKOUT
          Desktop: 2-Columns (7 cols features + 5 cols pricing & checkout)
          Mobile: Single-Column Card
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Features Checklist (7 cols on desktop) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Included in your Pro Pass:
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {[
              'All Exams Access (WBSSC, WBP, WBPSC, SSC, Railways)',
              'Unlimited Full-Length Mock Tests with Negative Marking',
              'Chapter-wise & Topic-wise Practice Questions',
              'Previous Year Question Papers (PYQ) with Explanations',
              'Detailed Bengali & English Step-by-Step Solutions',
              'Statewide & National Rank Leaderboard with Percentile',
              'Full Access on Android Mobile App & Web Browser',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Plan & CTA Box (5 cols on desktop) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {billingPeriod === 'yearly' ? 'Annual Pass' : 'Monthly Access'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
              {billingPeriod === 'yearly' ? 'Save 40%' : 'Standard'}
            </span>
          </div>

          {/* Price Callout */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{appliedCoupon ? appliedCoupon.finalPrice : billingPeriod === 'yearly' ? 299 : 49}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              for {billingPeriod === 'yearly' ? '12 Months' : '1 Month'}
            </span>
            <span className="text-xs line-through text-slate-400 font-medium">
              ₹{billingPeriod === 'yearly' ? 499 : 99}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            One small investment for your government job preparation. No recurring auto-debit surprise.
          </p>

          {/* Primary CTA Button (Screen 16: Get All Access) */}
          <button
            type="button"
            disabled={paymentStatus === 'preparing' || paymentStatus === 'processing'}
            onClick={() => handleInitiateCheckout(activePlan as SubscriptionPlan)}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-transform active:scale-[0.98]"
          >
            {paymentStatus === 'preparing'
              ? 'Preparing Checkout...'
              : activeSub
              ? `Extend Pro Pass (+365 Days) — ₹${activePlan.price}`
              : 'Get All Access'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          LIGHTWEIGHT TRUST SECTION (PART B)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">Secure Payment</h4>
            <p className="text-[11px] text-slate-500 leading-tight">
              256-bit encrypted checkout via Razorpay.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-brand-600 fill-brand-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">Instant Access</h4>
            <p className="text-[11px] text-slate-500 leading-tight">
              Immediate server-side verification and activation.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">365-Day Access</h4>
            <p className="text-[11px] text-slate-500 leading-tight">
              Full 1-year coverage from purchase date.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">No Per-Test Fees</h4>
            <p className="text-[11px] text-slate-500 leading-tight">
              Zero individual test purchases required.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PAYMENT RESULT MODALS: SUCCESS & FAILURE (PART D)
          ========================================================================= */}
      {paymentStatus === 'success' && successInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {successInfo.isRenewal ? 'Pass Extended Successfully!' : 'Pro Pass Activated 🎉'}
              </h3>
              <p className="text-xs text-slate-600">
                Your payment was verified by the server. All premium tests are now fully unlocked.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-900">{successInfo.planTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Period:</span>
                <span className="font-bold text-slate-900">365 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">New Expiry:</span>
                <span className="font-bold text-slate-900">
                  {new Date(successInfo.expiresAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                className="w-full font-bold"
                onClick={() => {
                  setPaymentStatus('idle');
                  navigate('/exams');
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Practicing
              </Button>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Payment Not Completed</h3>
              <p className="text-xs text-slate-600">
                {errorMessage || 'Your subscription was not activated. You can try again.'}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                className="w-full font-bold"
                onClick={() => setPaymentStatus('idle')}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-slate-700 font-semibold"
                onClick={() => {
                  setSupportCategory('Payment Issue');
                  setSupportSubject(`Payment Failed: ${selectedPlan?.title || 'Pro Pass'}`);
                  setSupportIssue(
                    `My payment for ${selectedPlan?.title || 'Pro Pass'} (₹${selectedPlan?.price || 0}) encountered an error.\nError message: "${errorMessage || 'Payment was not completed'}"\n\nPlease verify whether the amount was debited from my account.`
                  );
                  setIsSupportModalOpen(true);
                }}
                leftIcon={<LifeBuoy className="w-3.5 h-3.5 text-blue-600" />}
              >
                Submit Payment Help Ticket
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500"
                onClick={() => setPaymentStatus('idle')}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Support & Billing Assistance Card */}
      <Card className="p-5 border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white border border-blue-200 text-blue-600 shadow-xs shrink-0">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Need Billing or Subscription Assistance?
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                If an amount was debited but Pro Pass was not activated, or if you have any UPI delay or coupon inquiries, submit a ticket directly to our support desk.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSupportCategory('Payment Issue');
                setSupportSubject('Payment / Subscription Inquiry');
                setSupportIssue(
                  `I have a question or request regarding my Pro Pass subscription:\n\nSelected Plan: ${selectedPlan?.title || 'Pro Pass'} (₹${selectedPlan?.price || 0})\nInquiry Details: `
                );
                setIsSupportModalOpen(true);
              }}
              leftIcon={<LifeBuoy className="w-3.5 h-3.5 text-blue-600" />}
              className="w-full sm:w-auto text-xs font-bold border-blue-300 text-blue-700 hover:bg-blue-100/50 cursor-pointer"
            >
              Submit Support Ticket
            </Button>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          PAYMENT HISTORY SECTION
          ========================================================================= */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              Payment & Transaction History
            </h2>
            <p className="text-xs text-slate-500">
              Receipts and authoritative records for all your Pro Pass purchases
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500 border-dashed">
            No payment records found. Your completed transactions will appear here.
          </Card>
        ) : (
          <Card className="overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Order / Txn ID</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {p.planTitle || 'Pro Pass'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹{p.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                        {p.transactionId || p.orderId || p.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            p.status === 'completed'
                              ? 'success'
                              : p.status === 'pending'
                                ? 'warning'
                                : 'outline'
                          }
                          className={
                            p.status === 'failed' ? 'text-rose-600 border-rose-200 bg-rose-50' : ''
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Student Support Modal */}
      <StudentSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        defaultCategory={supportCategory}
        defaultSubject={supportSubject}
        defaultIssue={supportIssue}
      />
    </div>
  );
};
