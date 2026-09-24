import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
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
  Clock,
  ChevronDown,
  Download,
  CheckSquare2,
  Send,
  RotateCcw,
  UsersRound,
  Tag,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { SubscriptionPlan, AdminPaymentRow, AdminStudentRow, AdminBatch } from '@/types';

function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  const escapeCell = (cell: any) => {
    if (cell == null) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Stat Card --------------------------------------------------
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

// --- Status Badge -----------------------------------------------
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
    refunded: {
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

// --- Avatar -----------------------------------------------------
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

// --- Empty State ------------------------------------------------
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

// --- Search Bar -------------------------------------------------
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

// --- Main Component ---------------------------------------------
export const AdminSubscriptions: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'aspirants' | 'payments' | 'plans'>('aspirants');

  // Aspirants (merged students + subscription info) state
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'plan' | 'batch' | 'notify' | null>(null);
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [bulkPlanId, setBulkPlanId] = useState('pro_1_year');
  const [bulkDurationDays, setBulkDurationDays] = useState(365);
  const [bulkBatchId, setBulkBatchId] = useState('');
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDescription, setNewBatchDescription] = useState('');
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState('');

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
  const [refundPayment, setRefundPayment] = useState<AdminPaymentRow | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundId, setRefundId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundWorking, setRefundWorking] = useState(false);
  const [refundFeedback, setRefundFeedback] = useState('');

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

  // Delete Plan state
  const [deletePlan, setDeletePlan] = useState<SubscriptionPlan | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [planActionFeedback, setPlanActionFeedback] = useState<string>('');

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
      // includeInactive = true so admins can view and manage both active and archived plans
      const data = await api.getSubscriptionPlans(true);
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      setBatches(await api.getAdminBatches());
    } catch (err) {
      console.error('Failed to load student batches:', err);
    }
  }, []);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const toggleAllVisibleStudents = () => {
    const visibleIds = students.map((student) => student.id);
    setSelectedStudentIds((current) =>
      visibleIds.length > 0 && visibleIds.every((id) => current.includes(id))
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  };

  const openBulkAction = (action: 'plan' | 'batch' | 'notify') => {
    setBulkAction(action);
    setBulkFeedback('');
    if (action === 'plan') {
      setBulkPlanId(plans.find((plan) => plan.price > 0)?.id || 'pro_1_year');
      setBulkDurationDays(365);
    }
    if (action === 'batch') {
      setBulkBatchId(batches[0]?.id || '');
      setNewBatchName('');
      setNewBatchDescription('');
    }
    if (action === 'notify') {
      setBulkTitle('');
      setBulkMessage('');
    }
  };

  const handleBulkAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedStudentIds.length === 0 || !bulkAction) return;
    setBulkWorking(true);
    setBulkFeedback('');
    try {
      if (bulkAction === 'plan') {
        const result = await api.bulkGrantStudentSubscription(
          selectedStudentIds,
          bulkPlanId,
          Number(bulkDurationDays)
        );
        if (!result.success) throw new Error(result.error || 'Could not assign plan');
        await fetchStudents();
        setBulkFeedback(`${result.count || selectedStudentIds.length} students received the plan.`);
      } else if (bulkAction === 'batch') {
        let batchId = bulkBatchId;
        if (!batchId && newBatchName.trim()) {
          const created = await api.createAdminBatch(newBatchName, newBatchDescription);
          if (!created.success || !created.batchId) {
            throw new Error(created.error || 'Could not create batch');
          }
          batchId = created.batchId;
        }
        if (!batchId) throw new Error('Select an existing batch or enter a new batch name.');
        const result = await api.bulkAssignStudentsToBatch(batchId, selectedStudentIds);
        if (!result.success) throw new Error(result.error || 'Could not assign batch');
        await fetchBatches();
        setBulkFeedback(
          `${result.count || selectedStudentIds.length} students were added to the batch.`
        );
      } else {
        if (!bulkTitle.trim() || !bulkMessage.trim()) {
          throw new Error('Notification title and message are required.');
        }
        const result = await api.createTargetedNotification({
          title: bulkTitle.trim(),
          message: bulkMessage.trim(),
          channel: 'in_app',
          userIds: selectedStudentIds,
        });
        if (!result.success) throw new Error(result.error || 'Could not send notification');
        setBulkFeedback(`Notification sent to ${selectedStudentIds.length} students.`);
      }
    } catch (err) {
      setBulkFeedback(err instanceof Error ? err.message : 'Bulk action failed.');
    } finally {
      setBulkWorking(false);
    }
  };

  const handleRefund = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!refundPayment) return;
    setRefundWorking(true);
    setRefundFeedback('');
    try {
      const amount = Number(refundAmount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > refundPayment.amount) {
        throw new Error('Enter a refund amount no greater than the payment amount.');
      }
      const result = await api.markPaymentRefunded(
        refundPayment.id,
        amount,
        refundId,
        refundReason
      );
      if (!result.success) throw new Error(result.error || 'Could not record refund');
      setPayments((current) =>
        current.map((payment) =>
          payment.id === refundPayment.id
            ? {
                ...payment,
                status: 'refunded',
                refundAmount: amount,
                refundId: refundId.trim() || undefined,
                refundReason: refundReason.trim() || undefined,
                refundedAt: new Date().toISOString(),
              }
            : payment
        )
      );
      setStudents((current) =>
        current.map((st) =>
          st.id === refundPayment.userId || st.email === refundPayment.studentEmail
            ? {
                ...st,
                isPro: false,
                subscriptionStatus: 'cancelled',
                planTitle: 'Free Plan',
              }
            : st
        )
      );
      setRefundPayment(null);
    } catch (err) {
      setRefundFeedback(err instanceof Error ? err.message : 'Refund tracking update failed.');
    } finally {
      setRefundWorking(false);
    }
  };

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
        await api.logAdminActivity({
          action: 'SUBSCRIPTION_MANUAL_GRANT',
          entityType: 'subscription',
          entityId: grantModalStudent.id,
          entityName: `${grantModalStudent.fullName} (${grantModalStudent.email})`,
          details: {
            planId: grantPlanId,
            durationDays: Number(grantDurationDays),
          },
          adminUser: currentAdmin,
        });

        setGrantModalStudent(null);
        await fetchStudents();
      } else {
        setGrantFeedback(res.error || 'Failed to grant subscription');
      }
    } catch (err: unknown) {
      setGrantFeedback(err instanceof Error ? err.message : 'Error granting subscription');
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokePro = async (student: AdminStudentRow) => {
    if (
      !window.confirm(`Are you sure you want to revoke Pro subscription for ${student.fullName}?`)
    ) {
      return;
    }
    try {
      setStudentLoading(true);
      const res = await api.revokeStudentSubscription(student.id);
      if (res.success) {
        await api.logAdminActivity({
          action: 'SUBSCRIPTION_REVOKE',
          entityType: 'subscription',
          entityId: student.id,
          entityName: `${student.fullName} (${student.email})`,
          details: {
            previousStatus: student.isPro ? 'pro' : 'free',
          },
          adminUser: currentAdmin,
        });

        await fetchStudents();
      } else {
        alert(res.error || 'Failed to revoke subscription');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error revoking subscription');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleExportStudentsCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Plan', 'Expires At', 'Registered At'];
    const rows = students.map((s) => [
      s.fullName,
      s.email,
      s.phone || '',
      s.isPro ? 'Pro' : 'Free',
      s.planTitle || (s.isPro ? 'Pro Pass' : 'Free Plan'),
      s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : '',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
    ]);
    exportToCSV(`students_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleExportPaymentsCSV = () => {
    const headers = [
      'Date',
      'Student Name',
      'Student Email',
      'Plan',
      'Amount (INR)',
      'Gateway',
      'Payment ID',
      'Status',
    ];
    const rows = payments.map((p) => [
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
      p.studentName,
      p.studentEmail,
      p.planTitle || '',
      p.amount,
      p.gateway,
      p.razorpayPaymentId || p.transactionId || p.orderId || p.id,
      p.status,
    ]);
    exportToCSV(`payments_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
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

  const handleOpenDeletePlan = (p: SubscriptionPlan) => {
    setDeletePlan(p);
    setPlanActionFeedback('');
  };

  const handleConfirmDeletePlan = async () => {
    if (!deletePlan) return;
    try {
      setIsDeletingPlan(true);
      setPlanActionFeedback('');
      const res = await api.deleteSubscriptionPlan(deletePlan.id);
      if (!res.success) {
        setPlanActionFeedback(res.error || 'Failed to delete subscription plan');
        return;
      }

      await api.logAdminActivity({
        action: res.archived ? 'archive' : 'delete',
        entityType: 'subscription_plan',
        entityId: deletePlan.id,
        entityName: deletePlan.title,
        details: {
          price: deletePlan.price,
          durationDays: deletePlan.durationDays,
          archived: res.archived,
        },
        adminUser: currentAdmin,
      });

      setDeletePlan(null);
      await fetchPlans();
      if (res.message) {
        setPlanActionFeedback(res.message);
      }
    } catch (err) {
      setPlanActionFeedback(err instanceof Error ? err.message : 'Error deleting plan');
    } finally {
      setIsDeletingPlan(false);
    }
  };

  // Initial mount: load all sections concurrently so badges, counts, and stat cards are immediately accurate
  useEffect(() => {
    fetchStudents();
    fetchPayments();
    fetchPlans();
    fetchBatches();
  }, [fetchStudents, fetchPayments, fetchPlans, fetchBatches]);

  // --- Computed Stats -----------------------------------------
  const stats = useMemo(() => {
    const proStudents = students.filter((s) => s.isPro).length;
    const freeStudents = students.length - proStudents;
    const totalRevenue = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    return { proStudents, freeStudents, totalRevenue };
  }, [payments, students]);

  // --- Tab Config ---------------------------------------------
  const tabs = [
    { key: 'aspirants' as const, label: 'Aspirants', icon: Users, count: students.length },
    { key: 'payments' as const, label: 'Payments', icon: Receipt, count: payments.length },
    { key: 'plans' as const, label: 'Plans', icon: Layers, count: plans.length },
  ];

  return (
    <div className="space-y-6">
      {/* --- Header ------------------------------------------ */}
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

      {/* --- Stats Row --------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-white" />}
          label="Total Aspirants"
          value={students.length}
          subtitle={`${stats.proStudents} Paid - ${stats.freeStudents} Free`}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<Crown className="w-5 h-5 text-white" />}
          label="Paid Subscribers"
          value={stats.proStudents}
          subtitle="Active Pro Pass holders"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<IndianRupee className="w-5 h-5 text-white" />}
          label="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString('en-IN')}`}
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

      {/* --- Tab Navigation ---------------------------------- */}
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

      {/* =======================================================
          TAB 1: ASPIRANTS (Unified Free + Paid)
      ======================================================= */}
      {activeTab === 'aspirants' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={studentSearch}
              onChange={setStudentSearch}
              placeholder="Search aspirant by name or email..."
            />
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Aspirants</option>
                  <option value="pro">Paid Subscribers</option>
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
              <button
                onClick={handleExportStudentsCSV}
                disabled={students.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all disabled:opacity-50"
                title="Export Aspirants as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {selectedStudentIds.length > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <CheckSquare2 className="h-4 w-4" />
                {selectedStudentIds.length} student{selectedStudentIds.length === 1 ? '' : 's'}{' '}
                selected
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openBulkAction('plan')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  <Tag className="h-3.5 w-3.5" />
                  Assign Plan
                </button>
                <button
                  onClick={() => openBulkAction('batch')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-300"
                >
                  <UsersRound className="h-3.5 w-3.5" />
                  Assign Batch
                </button>
                <button
                  onClick={() => openBulkAction('notify')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-300"
                >
                  <Send className="h-3.5 w-3.5" />
                  Notify
                </button>
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white dark:hover:bg-slate-800"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Aspirants Table */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700/50">
                    <th className="w-12 px-5 py-3.5">
                      <input
                        type="checkbox"
                        aria-label="Select all visible students"
                        checked={
                          students.length > 0 &&
                          students.every((student) => selectedStudentIds.includes(student.id))
                        }
                        onChange={toggleAllVisibleStudents}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Aspirant
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
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
                      <td colSpan={7}>
                        <EmptyState
                          icon={<Users className="w-7 h-7 text-slate-400" />}
                          title="No aspirants found"
                          subtitle="Registered aspirants will appear here automatically."
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
                          <input
                            type="checkbox"
                            aria-label={`Select ${st.fullName}`}
                            checked={selectedStudentIds.includes(st.id)}
                            onChange={() => toggleStudentSelection(st.id)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={st.fullName || 'Aspirant'} isPro={st.isPro} />
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
                              PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                              <Shield className="w-3 h-3" />
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {st.planTitle || (st.isPro ? 'Pro Pass' : 'Free Plan')}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {st.expiresAt ? (
                            new Date(st.expiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setGrantModalStudent(st);
                                setGrantFeedback('');
                                setGrantDurationDays(365);
                                setGrantPlanId(plans.find((p) => p.price > 0)?.id || 'pro_1_year');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/30 transition-all active:scale-95"
                            >
                              <Crown className="w-3 h-3" />
                              {st.isPro ? 'Extend' : 'Grant Pro'}
                            </button>
                            {st.isPro && (
                              <button
                                onClick={() => handleRevokePro(st)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
                                title="Revoke Pro Access"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
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

      {/* =======================================================
          TAB 2: PAYMENTS
      ======================================================= */}
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
                  <option value="refunded">Refunded</option>
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
              <button
                onClick={handleExportPaymentsCSV}
                disabled={payments.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all disabled:opacity-50"
                title="Export Payments as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
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
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                      Refund
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
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
                            Rs. {p.amount.toLocaleString('en-IN')}
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
                        <td className="px-5 py-4 text-right">
                          {p.status === 'refunded' ? (
                            <div className="text-right">
                              <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                Rs. {(p.refundAmount ?? p.amount).toLocaleString('en-IN')}
                              </div>
                              {p.refundId && (
                                <div
                                  className="max-w-[120px] truncate text-[10px] text-slate-400"
                                  title={p.refundId}
                                >
                                  {p.refundId}
                                </div>
                              )}
                            </div>
                          ) : p.status === 'completed' ? (
                            <button
                              onClick={() => {
                                setRefundPayment(p);
                                setRefundAmount(String(p.amount));
                                setRefundId('');
                                setRefundReason('');
                                setRefundFeedback('');
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                              title="Record the Razorpay refund in the database"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Record
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                          )}
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

      {/* =======================================================
          TAB 3: SUBSCRIPTION PLANS
      ======================================================= */}
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

          {planActionFeedback && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{planActionFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setPlanActionFeedback('')}
                className="p-1 hover:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPlan(p)}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="Edit plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {p.id !== 'plan_free' && (
                        <button
                          onClick={() => handleOpenDeletePlan(p)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete or archive plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      Rs. {p.price}
                    </span>
                    {p.originalPrice && (
                      <span className="text-sm text-slate-400 line-through mb-1">
                        Rs. {p.originalPrice}
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

                {/* Discount Badge (display-only: must not block the edit/delete buttons below it) */}
                {p.originalPrice && p.price < p.originalPrice && (
                  <div className="absolute top-4 right-14 pointer-events-none">
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

      {/* =======================================================
          BULK STUDENT ACTION MODAL
      ======================================================= */}
      {bulkAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 p-4">
          <div className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white">
                  {bulkAction === 'plan' && <Tag className="h-5 w-5 text-indigo-500" />}
                  {bulkAction === 'batch' && <UsersRound className="h-5 w-5 text-indigo-500" />}
                  {bulkAction === 'notify' && <Send className="h-5 w-5 text-indigo-500" />}
                  {bulkAction === 'plan'
                    ? 'Assign plan to selected students'
                    : bulkAction === 'batch'
                      ? 'Assign batch to selected students'
                      : 'Notify selected students'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  This action applies to {selectedStudentIds.length} selected student
                  {selectedStudentIds.length === 1 ? '' : 's'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkAction(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkAction} className="space-y-4">
              {bulkFeedback && (
                <div
                  className={`rounded-xl border p-3 text-sm font-medium ${
                    bulkFeedback.includes('received') ||
                    bulkFeedback.includes('added') ||
                    bulkFeedback.includes('sent')
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
                  }`}
                >
                  {bulkFeedback}
                </div>
              )}

              {bulkAction === 'plan' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                      Plan
                    </label>
                    <select
                      value={bulkPlanId}
                      onChange={(event) => setBulkPlanId(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    >
                      {plans
                        .filter((plan) => plan.price > 0)
                        .map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.title} ({plan.durationDays} days - Rs. {plan.price})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={bulkDurationDays}
                      onChange={(event) => setBulkDurationDays(Number(event.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    />
                  </div>
                </>
              )}

              {bulkAction === 'batch' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                      Existing batch
                    </label>
                    <select
                      value={bulkBatchId}
                      onChange={(event) => setBulkBatchId(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    >
                      <option value="">Create a new batch below</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name} ({batch.memberCount} students)
                        </option>
                      ))}
                    </select>
                  </div>
                  {!bulkBatchId && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                          New batch name
                        </label>
                        <input
                          value={newBatchName}
                          onChange={(event) => setNewBatchName(event.target.value)}
                          placeholder="e.g. WBP Constable 2026 - Morning"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                          Description (optional)
                        </label>
                        <input
                          value={newBatchDescription}
                          onChange={(event) => setNewBatchDescription(event.target.value)}
                          placeholder="Batch notes or cohort details"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {bulkAction === 'notify' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                      Title
                    </label>
                    <input
                      value={bulkTitle}
                      onChange={(event) => setBulkTitle(event.target.value)}
                      required
                      placeholder="Important update"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                      Message
                    </label>
                    <textarea
                      value={bulkMessage}
                      onChange={(event) => setBulkMessage(event.target.value)}
                      required
                      rows={4}
                      placeholder="Write the message for these students..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setBulkAction(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkWorking}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {bulkWorking
                    ? 'Working...'
                    : bulkAction === 'notify'
                      ? 'Send Notification'
                      : bulkAction === 'batch'
                        ? 'Assign Batch'
                        : 'Assign Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          REFUND TRACKING MODAL
      ======================================================= */}
      {refundPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 p-4">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <RotateCcw className="h-5 w-5 text-rose-500" />
                  Record Razorpay refund
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Record the refund after it has been issued in Razorpay. This updates the payment
                  status and keeps an audit trail.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRefundPayment(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRefund} className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/40">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {refundPayment.studentName}
                </div>
                <div className="text-xs text-slate-500">{refundPayment.studentEmail}</div>
                <div className="mt-2 font-bold text-slate-800 dark:text-slate-200">
                  Original payment: Rs. {refundPayment.amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-bold">স্বয়ংক্রিয় ফ্রি প্ল্যান রূপান্তর (Auto Revoke):</span> রিফান্ড সম্পন্ন হওয়া মাত্রই সংশ্লিষ্ট স্টুডেন্টের সক্রিয় প্রো সাবস্ক্রিপশন বাতিল হয়ে যাবে এবং স্টুডেন্ট সরাসরি <strong>Free Plan</strong>-এ ফিরে যাবে।
                </div>
              </div>

              {refundFeedback && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  {refundFeedback}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Refund amount (Rs. )
                </label>
                <input
                  type="number"
                  min={0.01}
                  max={refundPayment.amount}
                  step="0.01"
                  required
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Razorpay refund ID (optional)
                </label>
                <input
                  value={refundId}
                  onChange={(event) => setRefundId(event.target.value)}
                  placeholder="rfnd_..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Reason (optional)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(event) => setRefundReason(event.target.value)}
                  rows={3}
                  placeholder="Reason for refund"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setRefundPayment(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundWorking}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {refundWorking ? 'Saving...' : 'Save Refund Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          GRANT PRO ACCESS MODAL
      ======================================================= */}
      {grantModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
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
                        {p.title} ({p.durationDays} Days - Rs. {p.price})
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

      {/* =======================================================
          PLAN EDIT / CREATE MODAL
      ======================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
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
                    Price (Rs. ) *
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
                    Orig. Price (Rs. )
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

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/50">
                {editingPlan && editingPlan.id !== 'plan_free' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const p = editingPlan;
                      setIsPlanModalOpen(false);
                      handleOpenDeletePlan(p);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Plan
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          DELETE PLAN CONFIRMATION MODAL
      ======================================================= */}
      {deletePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Delete Subscription Plan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {deletePlan.title} ({deletePlan.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletePlan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {planActionFeedback && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {planActionFeedback}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Safety & History Protection</span>
              </div>
              <p>
                Are you sure you want to delete <strong>{deletePlan.title}</strong>?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                • If no students have purchased this plan, it will be <strong>permanently deleted</strong>.
                <br />
                • If students already have active or past subscriptions with this plan, it will be safely <strong>deactivated and archived</strong> so that historical invoices and student pass access remain intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => setDeletePlan(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPlan}
                onClick={handleConfirmDeletePlan}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 active:scale-95"
              >
                {isDeletingPlan ? 'Processing...' : 'Confirm Delete / Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
