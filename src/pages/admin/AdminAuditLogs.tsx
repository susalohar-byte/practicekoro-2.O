import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import {
  History,
  Search,
  Download,
  RefreshCw,
  Shield,
  Trash2,
  PlusCircle,
  Edit3,
  CreditCard,
  Settings as SettingsIcon,
  HelpCircle,
  Tag,
  Users,
  Eye,
  X,
  Copy,
  Check,
} from 'lucide-react';
import type { AdminAuditLog, AdminRole } from '@/types';
import { cn } from '@/lib/utils';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [adminEmailFilter, setAdminEmailFilter] = useState('');

  // Selected Log for Details Modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [copied, setCopied] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminAuditLogs({
        action: selectedAction,
        entityType: selectedEntity,
        adminEmail: adminEmailFilter,
        search: searchTerm,
        limit: 100,
      });
      setLogs(res.logs);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAction, selectedEntity, adminEmailFilter, searchTerm]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Statistics
  const stats = useMemo(() => {
    const deletions = logs.filter(
      (l) => l.action.includes('DELETE') || l.action.includes('REVOKE')
    ).length;
    const subscriptions = logs.filter((l) => l.entityType === 'subscription').length;
    const contentEdits = logs.filter(
      (l) => l.entityType === 'question' || l.entityType === 'test'
    ).length;
    return {
      total: totalCount || logs.length,
      deletions,
      subscriptions,
      contentEdits,
    };
  }, [logs, totalCount]);

  const handleExportCsv = () => {
    api.exportAuditLogsToCsv(logs);
  };

  const handleCopyDetails = (details: any) => {
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (action: string) => {
    const isDelete =
      action.includes('DELETE') || action.includes('REVOKE') || action.includes('CANCEL');
    const isCreate =
      action.includes('CREATE') || action.includes('IMPORT') || action.includes('ASSIGN');
    const isUpdate = action.includes('UPDATE') || action.includes('EDIT');
    const isGrant = action.includes('GRANT');

    if (isDelete) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <Trash2 className="w-3 h-3" />
          {action}
        </span>
      );
    }

    if (isGrant) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <CreditCard className="w-3 h-3" />
          {action}
        </span>
      );
    }

    if (isCreate) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <PlusCircle className="w-3 h-3" />
          {action}
        </span>
      );
    }

    if (isUpdate) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Edit3 className="w-3 h-3" />
          {action}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
        {action}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'test':
        return <History className="w-3.5 h-3.5 text-indigo-500" />;
      case 'question':
        return <Edit3 className="w-3.5 h-3.5 text-sky-500" />;
      case 'subscription':
        return <CreditCard className="w-3.5 h-3.5 text-purple-500" />;
      case 'coupon':
        return <Tag className="w-3.5 h-3.5 text-emerald-500" />;
      case 'settings':
        return <SettingsIcon className="w-3.5 h-3.5 text-amber-500" />;
      case 'support_ticket':
        return <HelpCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'staff':
        return <Users className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
            Super Admin
          </span>
        );
      case 'content_writer':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
            Content Writer
          </span>
        );
      case 'support_agent':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Support
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Admin Audit Trail (অ্যাক্টিভিটি হিস্ট্রি)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tamper-evident audit log tracking all test deletions, question updates, manual
                grants, and settings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAuditLogs}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV (Excel Ready)</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Logged Events
            </span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Recorded audit entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Destructive Actions
            </span>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.deletions}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Deletions & cancellations</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Subscription Grants
            </span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.subscriptions}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Manual Pro grants & extensions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-sky-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Content Changes
            </span>
            <Edit3 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.contentEdits}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Question & test modifications</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search target or admin..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pk-primary"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pk-primary"
            >
              <option value="all">All Action Types</option>
              <option value="TEST_DELETE">TEST_DELETE (মক টেস্ট মোছা)</option>
              <option value="TEST_CREATE">TEST_CREATE (টেস্ট তৈরি)</option>
              <option value="TEST_UPDATE">TEST_UPDATE (টেস্ট এডিট)</option>
              <option value="QUESTION_CREATE">QUESTION_CREATE (প্রশ্ন তৈরি)</option>
              <option value="QUESTION_UPDATE">QUESTION_UPDATE (প্রশ্ন এডিট)</option>
              <option value="QUESTION_DELETE">QUESTION_DELETE (প্রশ্ন মোছা)</option>
              <option value="QUESTION_BULK_IMPORT">QUESTION_BULK_IMPORT (বাল্ক আপলোড)</option>
              <option value="SUBSCRIPTION_MANUAL_GRANT">
                SUBSCRIPTION_MANUAL_GRANT (ম্যানুয়াল প্রো)
              </option>
              <option value="SUBSCRIPTION_CANCEL">SUBSCRIPTION_CANCEL (সাবস্ক্রিপশন বাতিল)</option>
              <option value="COUPON_CREATE">COUPON_CREATE (কুপন তৈরি)</option>
              <option value="COUPON_DELETE">COUPON_DELETE (কুপন মোছা)</option>
              <option value="SETTINGS_UPDATE">SETTINGS_UPDATE (সেটিংস পরিবর্তন)</option>
              <option value="SUPPORT_TICKET_UPDATE">SUPPORT_TICKET_UPDATE (টিকিট সমাধান)</option>
              <option value="STAFF_ROLE_UPDATE">STAFF_ROLE_UPDATE (স্টাফ রোল পরিবর্তন)</option>
              <option value="STAFF_ROLE_ASSIGN">STAFF_ROLE_ASSIGN (স্টাফ নিয়োগ)</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pk-primary"
            >
              <option value="all">All Entity Types</option>
              <option value="test">Mock Tests</option>
              <option value="question">Questions</option>
              <option value="subscription">Subscriptions / Pro</option>
              <option value="coupon">Coupons</option>
              <option value="settings">Platform Settings</option>
              <option value="support_ticket">Support Tickets</option>
              <option value="staff">Staff Members</option>
            </select>
          </div>

          {/* Admin Email Filter */}
          <div>
            <input
              type="text"
              value={adminEmailFilter}
              onChange={(e) => setAdminEmailFilter(e.target.value)}
              placeholder="Filter by admin email..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pk-primary"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-pk-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No audit records found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try resetting search filters or performing an admin action.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Admin Responsible</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4 hidden md:table-cell">Details Summary</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div>
                        {new Date(log.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Admin Responsible */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                              {log.adminName || 'Admin'}
                            </span>
                            {getRoleBadge(log.adminRole)}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            {log.adminEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                    {/* Target Entity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getEntityIcon(log.entityType)}
                        <span
                          className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]"
                          title={log.entityName || log.entityId}
                        >
                          {log.entityName || log.entityId || log.entityType}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        {log.entityType}
                      </span>
                    </td>

                    {/* Details Summary */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate font-mono">
                      {log.details && Object.keys(log.details).length > 0
                        ? Object.entries(log.details)
                            .slice(0, 2)
                            .map(
                              ([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`
                            )
                            .join('; ')
                        : '—'}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        title="View Change Parameters"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Audit Event Payload
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Event Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Admin</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedLog.adminName} ({selectedLog.adminRole})
                  </span>
                  <span className="block text-[11px] text-slate-500 font-mono">
                    {selectedLog.adminEmail}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Action Executed</span>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Entity</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedLog.entityName || selectedLog.entityId || 'N/A'}
                  </span>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">
                    {selectedLog.entityType} (ID: {selectedLog.entityId || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Timestamp (IST)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })}
                  </span>
                </div>
              </div>

              {/* Raw JSON Parameters */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Operation Parameters & Diff
                  </span>
                  <button
                    onClick={() => handleCopyDetails(selectedLog.details)}
                    className="flex items-center gap-1 text-[11px] text-pk-primary hover:underline font-semibold cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
