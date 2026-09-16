import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import {
  CreditCard,
  Search,
  RefreshCw,
  Users,
  Receipt,
  Layers,
  CheckCircle2,
  Plus,
  Edit2,
  X,
  Crown,
} from 'lucide-react';
import type {
  SubscriptionPlan,
  AdminSubscriptionRow,
  AdminPaymentRow,
  AdminStudentRow,
} from '@/types';

export const AdminSubscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'students' | 'payments' | 'plans'>(
    'subscriptions'
  );

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRow[]>([]);
  const [subFilter, setSubFilter] = useState<string>('all');
  const [subSearch, setSubSearch] = useState<string>('');
  const [subLoading, setSubLoading] = useState<boolean>(false);

  // Registered Students state
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentLoading, setStudentLoading] = useState<boolean>(false);

  // Grant Pro modal state
  const [grantModalStudent, setGrantModalStudent] = useState<AdminStudentRow | null>(null);
  const [grantPlanId, setGrantPlanId] = useState<string>('pro_1_year');
  const [grantDurationDays, setGrantDurationDays] = useState<number>(365);
  const [isGranting, setIsGranting] = useState<boolean>(false);
  const [grantFeedback, setGrantFeedback] = useState<string>('');

  // Payments state
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [payFilter, setPayFilter] = useState<string>('all');
  const [paySearch, setPaySearch] = useState<string>('');
  const [payLoading, setPayLoading] = useState<boolean>(false);

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planId, setPlanId] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planPrice, setPlanPrice] = useState(199);
  const [planOrigPrice, setPlanOrigPrice] = useState<number | ''>(299);
  const [planDuration, setPlanDuration] = useState(30);
  const [planIsActive, setPlanIsActive] = useState(true);
  const [planFeaturesText, setPlanFeaturesText] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planSaveError, setPlanSaveError] = useState('');

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

  const fetchStudents = useCallback(async () => {
    setStudentLoading(true);
    try {
      const data = await api.getAdminStudents(
        studentSearch || undefined,
        studentFilter === 'all' ? undefined : studentFilter
      );
      setStudents(data);
    } catch (err) {
      console.error('Failed to load registered students:', err);
    } finally {
      setStudentLoading(false);
    }
  }, [studentSearch, studentFilter]);

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

  const handleGrantPro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantModalStudent) return;
    try {
      setIsGranting(true);
      setGrantFeedback('');
      const res = await api.grantStudentSubscription(
        grantModalStudent.id,
        grantPlanId,
        Number(grantDurationDays)
      );
      if (res.success) {
        setGrantModalStudent(null);
        await Promise.all([fetchSubscriptions(), fetchStudents()]);
      } else {
        setGrantFeedback(res.error || 'Failed to grant subscription');
      }
    } catch (err: unknown) {
      setGrantFeedback(err instanceof Error ? err.message : 'Error granting subscription');
    } finally {
      setIsGranting(false);
    }
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanId(`pro_${Date.now().toString().slice(-4)}`);
    setPlanTitle('Custom Pro Pass');
    setPlanDesc('Universal mock test access');
    setPlanPrice(199);
    setPlanOrigPrice(299);
    setPlanDuration(30);
    setPlanIsActive(true);
    setPlanFeaturesText(
      'Unlimited Full Mock Tests\nAll PYQ Solutions\nDetailed Performance Analytics'
    );
    setPlanSaveError('');
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (p: SubscriptionPlan) => {
    setEditingPlan(p);
    setPlanId(p.id);
    setPlanTitle(p.title);
    setPlanDesc(p.description || '');
    setPlanPrice(p.price);
    setPlanOrigPrice(p.originalPrice || '');
    setPlanDuration(p.durationDays);
    setPlanIsActive(p.isActive);
    setPlanFeaturesText(p.features.join('\n'));
    setPlanSaveError('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      setPlanSaveError('Plan title is required.');
      return;
    }

    const features = planFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      setIsSavingPlan(true);
      setPlanSaveError('');

      if (editingPlan) {
        await api.updateSubscriptionPlan(editingPlan.id, {
          title: planTitle.trim(),
          description: planDesc.trim(),
          price: Number(planPrice),
          originalPrice: planOrigPrice ? Number(planOrigPrice) : undefined,
          durationDays: Number(planDuration),
          isActive: planIsActive,
          features,
        });
      } else {
        await api.createSubscriptionPlan({
          id: planId.trim() || `plan_${Date.now()}`,
          title: planTitle.trim(),
          description: planDesc.trim(),
          price: Number(planPrice),
          originalPrice: planOrigPrice ? Number(planOrigPrice) : undefined,
          durationDays: Number(planDuration),
          isActive: planIsActive,
          features,
          currency: 'INR',
          orderIndex: plans.length + 1,
        });
      }

      setIsPlanModalOpen(false);
      await fetchPlans();
    } catch (err: unknown) {
      setPlanSaveError(err instanceof Error ? err.message : 'Failed to save subscription plan');
    } finally {
      setIsSavingPlan(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    } else if (activeTab === 'students') {
      fetchStudents();
      fetchPlans();
    } else if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'plans') {
      fetchPlans();
    }
  }, [activeTab, fetchSubscriptions, fetchStudents, fetchPayments, fetchPlans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Subscriptions & Pro Users
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time subscriber records, student pass management, and universal mock test
            monetization.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pro Subscribers ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Registered Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Plans ({plans.length})
          </button>
        </div>
      </div>

      {/* TAB 1: SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subscriber by name or email..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchSubscriptions}
                disabled={subLoading}
                className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${subLoading ? 'animate-spin text-indigo-500' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student Aspirant</th>
                    <th className="px-4 py-3">Subscribed Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Days Left</th>
                    <th className="px-4 py-3">Payment Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        <div className="max-w-md mx-auto space-y-2">
                          <Crown className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {subLoading
                              ? 'Loading subscriptions...'
                              : 'No subscriptions found matching criteria.'}
                          </p>
                          {!subLoading && (
                            <p className="text-xs text-slate-500">
                              Active and past subscription records from student checkouts will
                              appear here in real time.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {sub.studentName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {sub.studentEmail}
                          </div>
                          {sub.studentPhone && (
                            <div className="text-[10px] text-slate-400">{sub.studentPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-indigo-600 dark:text-indigo-300">
                          {sub.planTitle}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : sub.status === 'expired'
                                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(sub.startsAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(sub.expiresAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === 'active' ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {sub.daysRemaining} days
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">0 days</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                          {sub.paymentId || 'Manual Grant'}
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

      {/* TAB 2: REGISTERED STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search registered student by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Members</option>
                <option value="pro">Pro Pass Holders Only</option>
                <option value="free">Free Aspirants Only</option>
              </select>

              <button
                onClick={fetchStudents}
                disabled={studentLoading}
                className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${studentLoading ? 'animate-spin text-indigo-500' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student Aspirant</th>
                    <th className="px-4 py-3">Status / Tier</th>
                    <th className="px-4 py-3">Current Plan</th>
                    <th className="px-4 py-3">Pass Expiry</th>
                    <th className="px-4 py-3">Registered On</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <div className="max-w-md mx-auto space-y-2">
                          <Users className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {studentLoading
                              ? 'Loading real registered students...'
                              : 'No registered students found.'}
                          </p>
                          {!studentLoading && (
                            <p className="text-xs text-slate-500">
                              Real student profiles from Supabase authentication will appear here
                              automatically.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {st.fullName?.charAt(0) || 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white truncate">
                                {st.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {st.email}
                              </div>
                              {st.phone && (
                                <div className="text-[10px] text-slate-400">{st.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {st.isPro ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Crown className="w-3 h-3" />
                              PRO MEMBER
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              FREE ASPIRANT
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                          {st.planTitle || (st.isPro ? 'Pro Pass' : 'Free Tier')}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {st.expiresAt
                            ? new Date(st.expiresAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(st.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setGrantModalStudent(st);
                              setGrantFeedback('');
                              setGrantDurationDays(365);
                              setGrantPlanId(plans[0]?.id || 'pro_1_year');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 transition-colors"
                          >
                            <Crown className="w-3 h-3" />
                            {st.isPro ? 'Extend Pro' : 'Grant Pro'}
                          </button>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Configured Subscription Plans</h3>
              <p className="text-xs text-slate-400">
                Manage active subscription packages, pricing, durations, and student benefits.
              </p>
            </div>
            <button
              onClick={handleOpenCreatePlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plan</span>
            </button>
          </div>

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

                <div className="pt-2 border-t border-slate-900 flex justify-end">
                  <button
                    onClick={() => handleOpenEditPlan(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grant Pro Access Modal */}
      {grantModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Grant Pro Access
              </h3>
              <button
                onClick={() => setGrantModalStudent(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantPro} className="space-y-4">
              {grantFeedback && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
                  {grantFeedback}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {grantModalStudent.fullName}
                </p>
                <p className="text-[11px] text-slate-500">{grantModalStudent.email}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Select Plan
                </label>
                <select
                  value={grantPlanId}
                  onChange={(e) => setGrantPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.durationDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={grantDurationDays}
                  onChange={(e) => setGrantDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGrantModalStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGranting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isGranting ? 'Granting...' : 'Confirm Pro Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Edit / Create Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                {editingPlan ? `Edit ${editingPlan.title}` : 'Create Subscription Plan'}
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              {planSaveError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {planSaveError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Plan ID *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan}
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-300 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Orig. Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={planOrigPrice}
                    onChange={(e) => setPlanOrigPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Days *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Features (one per line)
                </label>
                <textarea
                  rows={4}
                  value={planFeaturesText}
                  onChange={(e) => setPlanFeaturesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="planIsActive"
                  checked={planIsActive}
                  onChange={(e) => setPlanIsActive(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="planIsActive" className="text-xs text-slate-300 font-medium">
                  Plan is active & visible to students
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSavingPlan ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
