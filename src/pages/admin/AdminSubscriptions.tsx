import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TrendingUp,
  Calendar,
  IndianRupee,
  Shield,
  UserCheck,
  Clock,
  Star,
  ChevronDown,
} from 'lucide-react';
import type {
  SubscriptionPlan,
  AdminSubscriptionRow,
  AdminPaymentRow,
  AdminStudentRow,
} from '@/types';

// ─── Stat Card ──────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, gradient, iconBg }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/10 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mr-8 -mt-8" />
    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 -ml-6 -mb-6" />
    <div className="relative flex items-start gap-3.5">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5 leading-none">{value}</p>
        {subtitle && <p className="text-[11px] text-white/50 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// ─── Status Badge ───────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    expired: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
    },
    cancelled: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-500 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
    completed: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    pending: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
    failed: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
    },
  };
  const c = config[status] || config.cancelled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Avatar ─────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; isPro?: boolean }> = ({ name, isPro }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="relative">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
          isPro
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
        }`}
      >
        {initials}
      </div>
      {isPro && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <Crown className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
};

// ─── Empty State ────────────────────────────────────────────────
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isLoading?: boolean;
}> = ({ icon, title, subtitle, isLoading }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4">
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {isLoading ? 'Loading...' : title}
    </p>
    {!isLoading && (
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm">{subtitle}</p>
    )}
  </div>
);

// ─── Search Bar ─────────────────────────────────────────────────
const SearchBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1">
    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────
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

  // ─── Computed Stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === 'active').length;
    const expiredSubs = subscriptions.filter((s) => s.status === 'expired').length;
    const totalRevenue = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const proStudents = students.filter((s) => s.isPro).length;
    return { activeSubs, expiredSubs, totalRevenue, proStudents };
  }, [subscriptions, payments, students]);

  // ─── Tab Config ─────────────────────────────────────────────
  const tabs = [
    {
      key: 'subscriptions' as const,
      label: 'Active Subs',
      icon: CreditCard,
      count: subscriptions.length,
    },
    { key: 'students' as const, label: 'Students', icon: Users, count: students.length },
    { key: 'payments' as const, label: 'Payments', icon: Receipt, count: payments.length },
    { key: 'plans' as const, label: 'Plans', icon: Layers, count: plans.length },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            Subscription Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 ml-[52px]">
            Manage subscribers, student passes, payments & plans
          </p>
        </div>
      </div>

      {/* ─── Stats Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-white" />}
          label="Active Subscribers"
          value={stats.activeSubs}
          subtitle={`${stats.expiredSubs} expired`}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-white" />}
          label="Pro Members"
          value={stats.proStudents}
          subtitle={`of ${students.length} total students`}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<IndianRupee className="w-5 h-5 text-white" />}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          subtitle={`${payments.length} transactions`}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<Layers className="w-5 h-5 text-white" />}
          label="Active Plans"
          value={plans.filter((p) => p.isActive).length}
          subtitle={`${plans.length} total configured`}
          gradient="bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800"
          iconBg="bg-white/20"
        />
      </div>

      {/* ─── Tab Navigation ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-1.5 shadow-sm">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span
                  className={`text-[11px] rounded-md px-1.5 py-0.5 font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: PRO SUBSCRIBERS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={subSearch}
              onChange={setSubSearch}
              placeholder="Search by name or email..."
            />
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={subFilter}
                  onChange={(e) => setSubFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={fetchSubscriptions}
                disabled={subLoading}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${subLoading ? 'animate-spin text-indigo-500' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700/50">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Payment Ref
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={<Crown className="w-7 h-7 text-slate-400" />}
                          title="No subscriptions found"
                          subtitle="Active and past subscription records from student checkouts will appear here in real time."
                          isLoading={subLoading}
                        />
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={sub.studentName} isPro={sub.status === 'active'} />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                {sub.studentName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {sub.studentEmail}
                              </div>
                              {sub.studentPhone && (
                                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                  {sub.studentPhone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                            <Star className="w-3 h-3" />
                            {sub.planTitle}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            {new Date(sub.startsAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            to{' '}
                            {new Date(sub.expiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {sub.status === 'active' ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                                  style={{
                                    width: `${Math.min(100, (sub.daysRemaining / 365) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {sub.daysRemaining}d
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Expired</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md truncate max-w-[140px] inline-block">
                            {sub.paymentId || 'Manual Grant'}
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

      {/* ═══════════════════════════════════════════════════════
          TAB 2: REGISTERED STUDENTS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={studentSearch}
              onChange={setStudentSearch}
              placeholder="Search student by name or email..."
            />
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Members</option>
                  <option value="pro">Pro Pass Holders</option>
                  <option value="free">Free Aspirants</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={fetchStudents}
                disabled={studentLoading}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${studentLoading ? 'animate-spin text-indigo-500' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700/50">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Membership
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Expiry
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={<Users className="w-7 h-7 text-slate-400" />}
                          title="No students found"
                          subtitle="Student profiles from Supabase authentication will appear here."
                          isLoading={studentLoading}
                        />
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={st.fullName || 'Student'} isPro={st.isPro} />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                {st.fullName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {st.email}
                              </div>
                              {st.phone && (
                                <div className="text-[11px] text-slate-400">{st.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {st.isPro ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-black border border-amber-500/20">
                              <Crown className="w-3 h-3" />
                              PRO MEMBER
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                              <Shield className="w-3 h-3" />
                              FREE TIER
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {st.planTitle || (st.isPro ? 'Pro Pass' : '—')}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {st.expiresAt ? (
                            new Date(st.expiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(st.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setGrantModalStudent(st);
                              setGrantFeedback('');
                              setGrantDurationDays(365);
                              setGrantPlanId(plans[0]?.id || 'pro_1_year');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/30 transition-all active:scale-95"
                          >
                            <Crown className="w-3 h-3" />
                            {st.isPro ? 'Extend' : 'Grant Pro'}
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

      {/* ═══════════════════════════════════════════════════════
          TAB 3: PAYMENTS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={paySearch}
              onChange={setPaySearch}
              placeholder="Search by student name, order ID, or payment ID..."
            />
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={payFilter}
                  onChange={(e) => setPayFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={fetchPayments}
                disabled={payLoading}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${payLoading ? 'animate-spin text-indigo-500' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700/50">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={<Receipt className="w-7 h-7 text-slate-400" />}
                          title="No payments found"
                          subtitle="Payment records from Razorpay will appear here automatically."
                          isLoading={payLoading}
                        />
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {new Date(p.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {new Date(p.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={p.studentName} />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                {p.studentName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {p.studentEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {p.planTitle || 'Pro Pass'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                            {p.gateway}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div className="bg-slate-50 dark:bg-slate-800/30 px-2 py-0.5 rounded-md inline-block">
                              {p.orderId || p.razorpayOrderId || 'N/A'}
                            </div>
                            {p.razorpayPaymentId && (
                              <div className="text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md inline-block">
                                {p.razorpayPaymentId}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={p.status} />
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

      {/* ═══════════════════════════════════════════════════════
          TAB 4: SUBSCRIPTION PLANS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'plans' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subscription Plans
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Configure pricing, durations, and features for student passes
              </p>
            </div>
            <button
              onClick={handleOpenCreatePlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${
                  p.isActive
                    ? 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-indigo-500/5'
                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                {/* Plan Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {p.title}
                        </h4>
                        {p.isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            OFF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenEditPlan(p)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{p.price}
                    </span>
                    {p.originalPrice && (
                      <span className="text-sm text-slate-400 line-through mb-1">
                        ₹{p.originalPrice}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      / {p.durationDays} days
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                    <span className="font-mono bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                      {p.id}
                    </span>
                    <span>{p.currency || 'INR'}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                      Features
                    </p>
                    <ul className="space-y-2">
                      {p.features.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Discount Badge */}
                {p.originalPrice && p.price < p.originalPrice && (
                  <div className="absolute top-4 right-14">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Add Plan Card */}
            <button
              onClick={handleOpenCreatePlan}
              className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 p-8 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all group min-h-[280px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Create New Plan</p>
                <p className="text-xs mt-1">Add a new subscription package</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          GRANT PRO ACCESS MODAL
      ═══════════════════════════════════════════════════════ */}
      {grantModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                Grant Pro Access
              </h3>
              <button
                onClick={() => setGrantModalStudent(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantPro} className="space-y-4">
              {grantFeedback && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400 font-medium">
                  {grantFeedback}
                </div>
              )}

              {/* Student Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
                <Avatar name={grantModalStudent.fullName || 'Student'} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {grantModalStudent.fullName}
                  </p>
                  <p className="text-xs text-slate-500">{grantModalStudent.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Select Plan
                </label>
                <div className="relative">
                  <select
                    value={grantPlanId}
                    onChange={(e) => setGrantPlanId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.durationDays} Days — ₹{p.price})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={grantDurationDays}
                  onChange={(e) => setGrantDurationDays(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setGrantModalStudent(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGranting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95"
                >
                  {isGranting ? 'Granting...' : 'Confirm Pro Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PLAN EDIT / CREATE MODAL
      ═══════════════════════════════════════════════════════ */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                {editingPlan ? `Edit ${editingPlan.title}` : 'Create Plan'}
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              {planSaveError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400 font-medium">
                  {planSaveError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Plan ID *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan}
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm font-mono text-slate-600 dark:text-slate-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm font-bold text-slate-900 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Orig. Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={planOrigPrice}
                    onChange={(e) => setPlanOrigPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Days *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Features (one per line)
                </label>
                <textarea
                  rows={4}
                  value={planFeaturesText}
                  onChange={(e) => setPlanFeaturesText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={planIsActive}
                    onChange={(e) => setPlanIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-indigo-500 rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Plan is active & visible
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
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
