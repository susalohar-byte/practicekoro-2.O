import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { CreditCard, Search, RefreshCw, Users, Receipt, Layers, CheckCircle2 } from 'lucide-react';
import type { SubscriptionPlan, AdminSubscriptionRow, AdminPaymentRow } from '@/types';

export const AdminSubscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments' | 'plans'>(
    'subscriptions'
  );

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRow[]>([]);
  const [subFilter, setSubFilter] = useState<string>('all');
  const [subSearch, setSubSearch] = useState<string>('');
  const [subLoading, setSubLoading] = useState<boolean>(false);

  // Payments state
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [payFilter, setPayFilter] = useState<string>('all');
  const [paySearch, setPaySearch] = useState<string>('');
  const [payLoading, setPayLoading] = useState<boolean>(false);

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const fetchSubscriptions = useCallback(async () => {
    setSubLoading(true);
    try {
      const data = await api.getAdminSubscriptions(
        subFilter === 'all' ? undefined : subFilter,
        subSearch || undefined
      );
      setSubscriptions(data);
    } catch (err) {
      console.error('Failed to load admin subscriptions:', err);
    } finally {
      setSubLoading(false);
    }
  }, [subFilter, subSearch]);

  const fetchPayments = useCallback(async () => {
    setPayLoading(true);
    try {
      const data = await api.getAdminPayments(
        payFilter === 'all' ? undefined : payFilter,
        paySearch || undefined
      );
      setPayments(data);
    } catch (err) {
      console.error('Failed to load admin payments:', err);
    } finally {
      setPayLoading(false);
    }
  }, [payFilter, paySearch]);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await api.getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    } else if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'plans') {
      fetchPlans();
    }
  }, [activeTab, fetchSubscriptions, fetchPayments, fetchPlans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            Subscriptions & Payments Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monetization Model: 1 Active Pro Pass = Universal Access to ALL Premium Mock Tests
            across all exams
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'plans'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Plans
          </button>
        </div>
      </div>

      {/* TAB 1: SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name or email..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchSubscriptions}
                disabled={subLoading}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${subLoading ? 'animate-spin text-indigo-400' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Days Left</th>
                    <th className="px-4 py-3">Payment Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        {subLoading
                          ? 'Loading subscriptions...'
                          : 'No subscriptions found matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{sub.studentName}</div>
                          <div className="text-[11px] text-slate-400">{sub.studentEmail}</div>
                          {sub.studentPhone && (
                            <div className="text-[10px] text-slate-500">{sub.studentPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-indigo-300">{sub.planTitle}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : sub.status === 'expired'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(sub.startsAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(sub.expiresAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === 'active' ? (
                            <span className="font-bold text-emerald-400">
                              {sub.daysRemaining} days
                            </span>
                          ) : (
                            <span className="text-slate-500">0 days</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                          {sub.paymentId || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, order ID, or payment ID..."
                value={paySearch}
                onChange={(e) => setPaySearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={payFilter}
                onChange={(e) => setPayFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Payment Statuses</option>
                <option value="completed">Completed (Successful)</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <button
                onClick={fetchPayments}
                disabled={payLoading}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${payLoading ? 'animate-spin text-indigo-400' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Gateway</th>
                    <th className="px-4 py-3">Order / Txn ID</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        {payLoading
                          ? 'Loading payments...'
                          : 'No payments found matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{p.studentName}</div>
                          <div className="text-[11px] text-slate-400">{p.studentEmail}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-200">
                          {p.planTitle || 'Pro Pass'}
                        </td>
                        <td className="px-4 py-3 font-bold text-amber-400">
                          ₹{p.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 uppercase text-[11px] text-slate-400">
                          {p.gateway}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                          <div>Ord: {p.orderId || p.razorpayOrderId || 'N/A'}</div>
                          {p.razorpayPaymentId && (
                            <div className="text-indigo-400">Pay: {p.razorpayPaymentId}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : p.status === 'pending'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">{p.title}</span>
                    <p className="text-xs text-slate-400">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400">₹{p.price}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-slate-500 line-through block">
                        ₹{p.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 space-y-1">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      Plan ID: <code className="text-indigo-300 font-mono">{p.id}</code>
                    </span>
                    <span>
                      Duration: <strong className="text-white">{p.durationDays} Days</strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      Status:{' '}
                      <strong className={p.isActive ? 'text-emerald-400' : 'text-slate-500'}>
                        {p.isActive ? 'Active' : 'Disabled'}
                      </strong>
                    </span>
                    <span>
                      Currency: <strong className="text-white">{p.currency || 'INR'}</strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Plan Features:
                  </p>
                  <ul className="space-y-1">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
