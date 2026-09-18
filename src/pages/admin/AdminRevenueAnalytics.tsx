import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import type {
  DateRangePreset,
  DateRangeRevenueStats,
  AdminPaymentRow,
} from '@/types';
import { cn } from '@/lib/utils';

export const AdminRevenueAnalytics: React.FC = () => {
  const [preset, setPreset] = useState<DateRangePreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [rangeStats, setRangeStats] = useState<DateRangeRevenueStats | null>(null);
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const loadAnalytics = useCallback(
    async (selectedPreset: DateRangePreset, start?: string, end?: string) => {
      try {
        setIsLoading(true);
        const [statsData, paymentsData] = await Promise.all([
          api.getDateRangeRevenueStats(
            selectedPreset === 'custom' ? start : undefined,
            selectedPreset === 'custom' ? end : undefined,
            selectedPreset
          ),
          api.getAdminPayments(),
        ]);

        setRangeStats(statsData);
        setPayments(paymentsData);
      } catch (err) {
        console.error('Failed to load revenue analytics:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics(preset, customStartDate, customEndDate);
  }, [loadAnalytics, preset]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    setPreset('custom');
    loadAnalytics('custom', customStartDate, customEndDate);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalytics(preset, customStartDate, customEndDate);
  };

  // Filter payments within the selected time window and search term
  const filteredPayments = useMemo(() => {
    if (!rangeStats) return payments;
    const startMs = new Date(rangeStats.startDate).getTime();
    const endMs = new Date(rangeStats.endDate).getTime() + 86400000; // end of day

    return payments.filter((p) => {
      const createdDate = p.createdAt || p.created_at;
      if (!createdDate) return false;
      const t = new Date(createdDate).getTime();

      // Check within range
      if (t < startMs || t > endMs) return false;

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Search filter
      if (transactionSearch.trim()) {
        const q = transactionSearch.toLowerCase();
        return (
          p.studentName?.toLowerCase().includes(q) ||
          p.studentEmail?.toLowerCase().includes(q) ||
          p.orderId?.toLowerCase().includes(q) ||
          p.planTitle?.toLowerCase().includes(q) ||
          p.gateway?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payments, rangeStats, statusFilter, transactionSearch]);

  // Export Revenue Report to CSV (Excel Ready with UTF-8 BOM)
  const handleExportCsv = () => {
    if (!rangeStats) return;

    const headers = [
      'Transaction ID',
      'Student Name',
      'Student Email',
      'Plan Title',
      'Amount (INR)',
      'Gateway',
      'Status',
      'Date & Time (IST)',
    ];

    const escapeCell = (cell: any): string => {
      if (cell == null) return '""';
      const str = String(cell);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredPayments.map((p) => [
      p.orderId || p.razorpayOrderId || p.id,
      p.studentName,
      p.studentEmail,
      p.planTitle || 'Pro Subscription',
      p.amount,
      p.gateway || 'Razorpay',
      p.status,
      new Date(p.createdAt || p.created_at || Date.now()).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      }),
    ]);

    const csvRows = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))];
    const csvContent = '\uFEFF' + csvRows.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `PracticeKoro_Revenue_Report_${rangeStats.startDate}_to_${rangeStats.endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const presetOptions: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today (আজ)' },
    { id: 'yesterday', label: 'Yesterday (গতকাল)' },
    { id: '7d', label: 'Last 7 Days (গত ৭ দিন)' },
    { id: 'this_month', label: 'This Month (চলতি মাস)' },
    { id: '30d', label: 'Last 30 Days (গত ৩০ দিন)' },
    { id: 'this_year', label: 'This Year (চলতি বছর)' },
    { id: 'custom', label: 'Custom Range (নির্দিষ্ট তারিখ)' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Financial & Revenue Trends</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Analytics & Reports
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                আর্থিক ও রাজস্ব বিশ্লেষণ — Subscription earnings, transactions volume, and student acquisition trends.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={cn('w-4 h-4', (isLoading || isRefreshing) && 'animate-spin')} />
          </button>
          <button
            onClick={handleExportCsv}
            disabled={isLoading || filteredPayments.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Revenue CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector Pill Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Select Timeframe:</span>
          </div>
          {rangeStats && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Window: <strong className="text-slate-800 dark:text-slate-200">{rangeStats.startDate}</strong> to{' '}
              <strong className="text-slate-800 dark:text-slate-200">{rangeStats.endDate}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presetOptions.map((opt) => {
            const isSelected = preset === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreset(opt.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Form */}
        {preset === 'custom' && (
          <form
            onSubmit={handleApplyCustomRange}
            className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Apply Filter
            </button>
          </form>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Period Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Period Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {isLoading ? '...' : `₹${(rangeStats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {rangeStats?.preset ? rangeStats.preset.replace('_', ' ').toUpperCase() : 'SELECTED PERIOD'}
            </span>
            <span>earnings</span>
          </div>
        </div>

        {/* Card 2: Completed Transactions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Orders / Transactions
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {isLoading ? '...' : (rangeStats?.totalTransactions ?? rangeStats?.transactionCount ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Average order value: <strong className="text-slate-700 dark:text-slate-300">₹{(rangeStats?.avgOrderValue ?? 0).toLocaleString('en-IN')}</strong>
          </p>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-2 tracking-tight">
            {isLoading ? '...' : `₹${(rangeStats?.avgOrderValue ?? 0).toLocaleString('en-IN')}`}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Per paying aspirant in this timeframe
          </p>
        </div>

        {/* Card 4: New Registrations in Period */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              New Registrations
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2 tracking-tight">
            {isLoading ? '...' : `+${rangeStats?.newStudentSignups ?? rangeStats?.newSignupsCount ?? 0}`}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Aspirants registered in this window
          </p>
        </div>
      </div>

      {/* Dynamic Daily Revenue Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daily Revenue Trend Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Day-by-day revenue velocity and completed transaction volume.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {rangeStats?.dailyTrend?.length ?? 0} data points
          </div>
        </div>

        <div className="min-h-[180px] flex items-end justify-between gap-2 pt-6 px-3 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/50 pb-3 overflow-x-auto">
          {rangeStats?.dailyTrend && rangeStats.dailyTrend.length > 0 ? (
            (() => {
              const maxVal = Math.max(
                ...(rangeStats.dailyTrend.map((t) => t.amount) || [100]),
                100
              );
              return rangeStats.dailyTrend.map((point) => {
                const heightPercent = Math.max(8, Math.round((point.amount / maxVal) * 100));
                return (
                  <div
                    key={point.date}
                    className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group"
                  >
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{point.amount}
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-200/70 dark:bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-32 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500 transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-300 rounded-t-lg shadow-xs"
                        title={`${point.date}: ₹${point.amount} (${point.transactions} orders)`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors truncate max-w-[48px]">
                      {point.label}
                    </span>
                  </div>
                );
              });
            })()
          ) : (
            <div className="w-full text-center text-xs text-slate-500 py-12">
              No revenue transactions recorded in this selected range.
            </div>
          )}
        </div>
      </div>

      {/* Transactions Ledger Table for Selected Range */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Transactions in Selected Period ({filteredPayments.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified order payments processed within {rangeStats?.startDate} to {rangeStats?.endDate}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                placeholder="Search student or order..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed (সফল)</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Student Aspirant</th>
                <th className="px-5 py-3">Plan / Pass</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Gateway</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Date & Time (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {payment.studentName || 'Student'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {payment.studentEmail}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {payment.planTitle || 'Pro Pass'}
                      </span>
                      {payment.orderId && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {payment.orderId}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{payment.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {payment.gateway || 'Razorpay'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                          payment.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : payment.status === 'failed'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        )}
                      >
                        {payment.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {payment.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        <span className="capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(payment.createdAt || payment.created_at || Date.now()).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-slate-400">
                    No transactions found for the specified filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
