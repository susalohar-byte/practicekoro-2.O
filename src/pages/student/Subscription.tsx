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
  RotateCcw,
  Sparkles,
  Lock,
  RefreshCw,
  Tag,
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
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    planTitle: string;
    expiresAt: string;
    isRenewal: boolean;
  } | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Support intake modal state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<'Payment Issue' | 'Subscription Issue'>(
    'Payment Issue'
  );
  const [supportSubject, setSupportSubject] = useState('');
  const [supportIssue, setSupportIssue] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !activePlan) return;
    try {
      setIsValidatingCoupon(true);
      setCouponError('');
      const res = await api.validateCoupon(
        couponInput.trim(),
        activePlan.id,
        activePlan.price,
        user?.id
      );
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

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
  const isExpired =
    subscriptionDetails?.status === 'expired' ||
    (!activeSub && subscriptionDetails?.hasSubscription);
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

  const handleManualStatusCheck = async () => {
    setCheckingStatus(true);
    try {
      await Promise.all([
        refreshSubscription(),
        refreshProStatus ? refreshProStatus() : Promise.resolve(),
      ]);
      if (subscriptionDetails?.isActive) {
        setPaymentStatus('success');
      }
    } catch (err) {
      console.error('Error refreshing subscription status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pk-student-page">
      {/* =========================================================================
          HERO SECTION (PART B)
          ========================================================================= */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
          <span>ONE PRO PASS • ALL PREMIUM MOCK TESTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Practice More. Improve Faster.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unlock every premium mock test and practice without limits across WBP Constable, Kolkata
          Police SI, WBCS, and WBPSC Clerkship.
        </p>
      </div>

      {/* =========================================================================
          ACTIVE SUBSCRIPTION STATUS CARD (PART E)
          ========================================================================= */}
      {activeSub && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="premium"
                  className="bg-white/20 text-white border-white/30 gap-1 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  PRO PASS ACTIVE
                </Badge>
                <span className="text-xs text-amber-100 font-semibold">
                  {daysLeft} Days Remaining
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {subscriptionDetails?.planTitle || 'PracticeKoro All-Access Pro Pass'}
              </h2>
              <p className="text-xs text-amber-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Valid until:{' '}
                {subscriptionDetails?.expiresAt
                  ? new Date(subscriptionDetails.expiresAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Active'}
              </p>
              <p className="text-xs text-amber-100/90 pt-1">
                Universal access is active. All premium mock tests and test series are unlocked.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="md"
                className="bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md"
                onClick={() => navigate('/exams')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Practicing
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20 border-white/40 font-bold text-xs"
                disabled={paymentStatus === 'preparing' || paymentStatus === 'processing'}
                onClick={() => handleInitiateCheckout(activePlan as SubscriptionPlan)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {paymentStatus === 'preparing'
                  ? 'Preparing checkout…'
                  : `Extend Pass (+365 Days) — ₹${activePlan.price}`}
              </Button>
              <span className="text-[11px] text-amber-100/80">
                Seamless renewal: adds 365 days to your existing expiry date.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EXPIRED SUBSCRIPTION STATUS CARD (PART E)
          ========================================================================= */}
      {isExpired && !activeSub && (
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 border border-amber-300 text-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="gap-1 font-bold">
                <Lock className="w-3 h-3" />
                PRO PASS EXPIRED
              </Badge>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Renew your Pro Pass to unlock premium mock tests.
            </h3>
            <p className="text-xs text-slate-600">
              Your previous Pro Pass has expired. Re-activate your 365-day universal access to all
              premium tests.
            </p>
          </div>
          <Button
            variant="pro"
            size="md"
            className="font-bold text-xs shrink-0 self-stretch sm:self-auto shadow-sm"
            disabled={paymentStatus === 'preparing' || paymentStatus === 'processing'}
            onClick={() => handleInitiateCheckout(activePlan as SubscriptionPlan)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {paymentStatus === 'preparing'
              ? 'Preparing secure checkout…'
              : `Renew Pro Pass — ₹${activePlan.price}`}
          </Button>
        </div>
      )}

      {/* =========================================================================
          FEEDBACK ALERTS: CANCELLED & DELAYED STATES (PART D)
          ========================================================================= */}
      {paymentStatus === 'cancelled' && (
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Payment cancelled. Your Pro Pass has not been activated. You can try again whenever
              you are ready.
            </span>
          </div>
          <button
            onClick={() => setPaymentStatus('idle')}
            className="font-bold text-brand-600 hover:text-brand-800 text-xs shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {paymentStatus === 'delayed' && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0 animate-spin" />
            <span>
              Payment received. We're confirming your Pro Pass with the server. This usually takes
              just a few seconds.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={checkingStatus}
            onClick={handleManualStatusCheck}
            className="shrink-0 text-xs font-bold"
          >
            Check Status
          </Button>
        </div>
      )}

      {/* =========================================================================
          PRIMARY PRO PASS PRICING & BENEFIT SHOWCASE (PART B)
          ========================================================================= */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 sm:p-8 border-2 border-brand-600 shadow-xl ring-4 ring-brand-500/10 rounded-2xl relative overflow-hidden">
          <div className="space-y-6">
            {/* Header / Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0 border border-brand-100">
                  <Crown className="w-6 h-6 fill-brand-500 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{activePlan.title}</h3>
                  <p className="text-xs text-slate-500">
                    Validity: {activePlan.durationDays} Days (1 Full Year)
                  </p>
                </div>
              </div>
              <Badge variant="premium" className="font-bold text-xs shrink-0">
                ALL-ACCESS PASS
              </Badge>
            </div>

            {/* Pricing Callout (NO DARK PATTERNS, NO CROSSED-OUT FAKE PRICES) */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    ₹{appliedCoupon ? appliedCoupon.finalPrice : activePlan.price}
                  </span>
                  {appliedCoupon && (
                    <span className="text-base line-through text-slate-400 font-bold">
                      ₹{activePlan.price}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500">/ 365 Days</span>
                </div>
                {appliedCoupon ? (
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coupon {appliedCoupon.code} applied: ₹{appliedCoupon.discountAmount} saved!
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    Transparent All-Inclusive Pricing • Single One-Time Payment
                  </p>
                )}
              </div>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                Universal Access
              </span>
            </div>

            {/* Value Proposition Box */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 space-y-1">
              <p className="font-bold text-amber-900">One Pass. Everything Premium.</p>
              <p className="text-slate-600 leading-relaxed">
                Instead of selling individual tests, one ₹299 Pro Pass unlocks the entire premium
                mock-test library for 365 days.
              </p>
            </div>

            {/* Real Benefits List (PART B) */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Included in Your Pro Pass:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">Unlock all premium mock tests</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">
                    Access every premium test series
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">
                    Practice across supported exams (WBP Constable, KP SI, WBCS, WBPSC)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">
                    Re-attempt tests whenever available
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">
                    Review detailed solutions and analysis
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">
                    Automated Mistakes Notebook for targeted error correction
                  </span>
                </li>
              </ul>
            </div>

            {/* Coupon Code Redemption Box */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono font-black">{appliedCoupon.code}</span> applied:
                      <span className="font-bold ml-1 text-emerald-700">
                        ₹{appliedCoupon.discountAmount} Off
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="relative grow">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME50)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase placeholder:normal-case placeholder:font-normal text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="text-xs font-bold shrink-0"
                    >
                      {isValidatingCoupon ? 'Checking…' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] font-semibold text-rose-600 pl-1">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Primary CTA & Duplicate Click Protection (PART D) */}
            <div className="pt-2 space-y-2.5">
              <Button
                variant="pro"
                size="lg"
                className="w-full font-black text-sm shadow-md py-3.5"
                disabled={paymentStatus === 'preparing' || paymentStatus === 'processing'}
                isLoading={paymentStatus === 'preparing' || paymentStatus === 'processing'}
                onClick={() => handleInitiateCheckout(activePlan as SubscriptionPlan)}
                leftIcon={
                  activeSub ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4 fill-current" />
                  )
                }
              >
                {paymentStatus === 'preparing'
                  ? 'Preparing secure checkout…'
                  : activeSub
                    ? `Extend Pass (+365 Days) — ₹${appliedCoupon ? appliedCoupon.finalPrice : activePlan.price}`
                    : `Get Pro Pass — ₹${appliedCoupon ? appliedCoupon.finalPrice : activePlan.price}`}
              </Button>
            </div>
          </div>
        </Card>
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
                পেমেন্ট হেল্প টিকেট সাবমিট করুন (Report to Support)
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
                পেমেন্ট বা সাবস্ক্রিপশন সংক্রান্ত সহায়তা দরকার? (Need Billing Assistance?)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                টাকা কেটে নেওয়া কিন্তু প্রো পাস চালু না হওয়া, ইউপিআই বিলম্ব বা কুপন সংক্রান্ত যেকোনো
                বিষয়ে আমাদের অ্যাডমিন ডেস্কে সরাসরি টিকেট তৈরি করুন।
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
              সাপোর্ট টিকেট সাবমিট করুন
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
