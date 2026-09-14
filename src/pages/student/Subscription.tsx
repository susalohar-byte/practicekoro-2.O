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
  Sparkles
} from 'lucide-react';
import { openRazorpayCheckout } from '@/utils/razorpay';
import type { Payment, SubscriptionPlan } from '@/types';

export const Subscription: React.FC = () => {
  const { user } = useAuth();
  const { plans, subscriptionDetails, refreshSubscription } = useSubscription();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Payment states
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'cancelled'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    planTitle: string;
    expiresAt: string;
    isRenewal: boolean;
  } | null>(null);

  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      const defaultPlan = plans.find((p) => p.id === 'pro_1_year') || plans[0];
      setSelectedPlan(defaultPlan);
    }
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (user) {
      api.getStudentPaymentHistory()
        .then(setPayments)
        .catch((err) => console.error('Error fetching payments:', err));
    }
  }, [user, paymentStatus]);

  const handleInitiateCheckout = async (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/subscription' } } });
      return;
    }

    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      // 1. Create order on server (authoritative database pricing enforced)
      const order = await api.createRazorpayOrder(plan.id);

      // 2. Launch Razorpay Checkout Modal
      const checkoutResult = await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount * 100, // paise
        currency: order.currency,
        name: 'PracticeKoro',
        description: `${plan.title} (All-Access Pass)`,
        order_id: order.orderId,
        prefill: {
          name: user.fullName,
          email: user.email,
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
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: plan.id,
            });

            if (verification.success) {
              setSuccessInfo({
                planTitle: verification.planTitle || plan.title,
                expiresAt: verification.expiresAt,
                isRenewal: verification.isRenewal,
              });
              setPaymentStatus('success');
              await refreshSubscription();
            } else {
              setErrorMessage('Payment verification returned incomplete. Please contact support.');
              setPaymentStatus('failed');
            }
          } catch (verifErr: any) {
            console.error('Payment verification failed:', verifErr);
            setErrorMessage(verifErr.message || 'Signature verification failed.');
            setPaymentStatus('failed');
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentStatus === 'processing') {
              setPaymentStatus('cancelled');
            }
          },
        },
      });

      if (checkoutResult.error) {
        setErrorMessage(checkoutResult.error);
        setPaymentStatus('failed');
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setErrorMessage(err.message || 'Failed to initiate payment. Please try again.');
      setPaymentStatus('failed');
    }
  };

  const activeSub = subscriptionDetails?.isActive;
  const daysLeft = subscriptionDetails?.daysRemaining ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
          <span>ALL-ACCESS PRO PASS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          One Subscription. Universal Mock Test Access.
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          PracticeKoro does NOT sell mock tests individually. Get one active All-Access Pro Pass
          and unlock <strong>every premium mock test</strong> across WBP Constable, Kolkata Police SI, WBCS, and WBPSC Clerkship.
        </p>
      </div>

      {/* Active Subscription Status Banner */}
      {activeSub && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="premium" className="bg-white/20 text-white border-white/30 gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  ACTIVE MEMBERSHIP
                </Badge>
                <span className="text-xs text-amber-100 font-medium">
                  {daysLeft} Days Remaining
                </span>
              </div>
              <h2 className="text-xl font-black">
                {subscriptionDetails?.planTitle || 'PracticeKoro Pro Pass'}
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
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-amber-800 hover:bg-amber-50 border-white font-bold text-xs"
                onClick={() => {
                  if (selectedPlan) handleInitiateCheckout(selectedPlan);
                }}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Extend Pass (+365 Days)
              </Button>
              <span className="text-[11px] text-amber-100">
                Rule: Renewal extends seamlessly from existing expiry date.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Plan Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {plans.map((plan) => {
          const isPrimary = plan.id === 'pro_1_year';
          return (
            <Card
              key={plan.id}
              className={`p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all ${
                isPrimary
                  ? 'border-2 border-brand-600 shadow-xl ring-2 ring-brand-500/10'
                  : 'border border-slate-200 shadow-sm'
              }`}
            >
              {isPrimary && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-sm">
                  Recommended • Best Value
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5 fill-brand-500 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{plan.title}</h3>
                    <p className="text-xs text-slate-500">Validity: {plan.durationDays} Days</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      All-Inclusive • One-Time Payment
                    </span>
                  </div>

                  {plan.originalPrice && (
                    <Badge variant="success" className="font-bold text-xs">
                      SAVE {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What's Included:
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
                <Button
                  variant={isPrimary ? 'pro' : 'primary'}
                  size="lg"
                  className="w-full font-black text-sm shadow-md"
                  isLoading={paymentStatus === 'processing'}
                  onClick={() => handleInitiateCheckout(plan)}
                  leftIcon={activeSub ? <RotateCcw className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                >
                  {activeSub ? `Extend Pass (₹${plan.price})` : `Get Pro Pass (₹${plan.price})`}
                </Button>
                <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Secure 256-bit encrypted transaction via Razorpay
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment Feedback Modals */}
      {paymentStatus === 'success' && successInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {successInfo.isRenewal ? 'Pass Extended Successfully!' : 'Welcome to Pro Pass!'}
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
                  navigate('/tests');
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Practicing Premium Tests
              </Button>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Payment Failed</h3>
              <p className="text-xs text-slate-600">
                {errorMessage || 'The payment could not be completed or verified.'}
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

      {paymentStatus === 'cancelled' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>Checkout was cancelled. You can retry at any time.</span>
          <button
            onClick={() => setPaymentStatus('idle')}
            className="font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Payment History Section */}
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
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₹{p.amount.toFixed(2)}
                      </td>
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
                          className={p.status === 'failed' ? 'text-rose-600 border-rose-200 bg-rose-50' : ''}
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
    </div>
  );
};
