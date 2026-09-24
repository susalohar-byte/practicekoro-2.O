import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Shield,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Mail,
  UserCheck,
  UserMinus,
  RefreshCw,
  X,
} from 'lucide-react';
import type { AdminRole, AdminStaffMember } from '@/types';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';

export const AdminStaff: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Role Change / Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStaff, setSelectedStaff] = useState<AdminStaffMember | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('content_writer');
  const [isSaving, setIsSaving] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  // Demote confirmation modal state
  const [demoteConfirmMember, setDemoteConfirmMember] = useState<AdminStaffMember | null>(null);
  const [isDemoting, setIsDemoting] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getStaffMembers();
      setStaff(data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesRole = roleFilter === 'all' || s.adminRole === roleFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [staff, roleFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: staff.length,
      super_admin: staff.filter((s) => s.adminRole === 'super_admin').length,
      content_writer: staff.filter((s) => s.adminRole === 'content_writer').length,
      support_agent: staff.filter((s) => s.adminRole === 'support_agent').length,
    };
  }, [staff]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedStaff(null);
    setEmailInput('');
    setSelectedRole('content_writer');
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: AdminStaffMember) => {
    setModalMode('edit');
    setSelectedStaff(member);
    setEmailInput(member.email);
    setSelectedRole(member.adminRole);
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);

    try {
      setIsSaving(true);
      if (modalMode === 'add') {
        const res = await api.assignStaffByEmail(emailInput, selectedRole, currentAdmin);
        if (!res.success) {
          setModalFeedback({ type: 'error', text: res.error || 'Failed to assign role' });
          return;
        }
        setModalFeedback({
          type: 'success',
          text: `Successfully assigned ${emailInput} as ${selectedRole.replace('_', ' ')}!`,
        });
      } else if (modalMode === 'edit' && selectedStaff) {
        const res = await api.updateStaffRole(selectedStaff.id, selectedRole, currentAdmin);
        if (!res.success) {
          setModalFeedback({ type: 'error', text: res.error || 'Failed to update role' });
          return;
        }
        setModalFeedback({
          type: 'success',
          text: `Role for ${selectedStaff.fullName} updated to ${selectedRole.replace('_', ' ')}!`,
        });
      }

      await loadStaff();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 900);
    } catch (err: unknown) {
      setModalFeedback({ type: 'error', text: getErrorMessage(err, 'Failed to save staff role') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDemoteStaff = async () => {
    if (!demoteConfirmMember) return;
    try {
      setIsDemoting(true);
      const res = await api.removeStaffMember(demoteConfirmMember.id, currentAdmin);
      if (!res.success) {
        alert(res.error || 'Failed to remove staff member');
        return;
      }
      setDemoteConfirmMember(null);
      await loadStaff();
    } catch (err) {
      console.error('Demote staff error:', err);
      alert('An unexpected error occurred while demoting staff member.');
    } finally {
      setIsDemoting(false);
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Shield className="w-3.5 h-3.5" />
            Super Admin
          </span>
        );
      case 'content_writer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Edit2 className="w-3.5 h-3.5" />
            Content Writer (কনটেন্ট রাইটার)
          </span>
        );
      case 'support_agent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            Support Agent (সাপোর্ট টিম)
          </span>
        );
      default:
        return null;
    }
  };

  const getRolePermissionsDescription = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'Full access: All Settings, Subscriptions, Coupons, Destructive Deletions, Staff RBAC, Audit Logs.';
      case 'content_writer':
        return 'Question Bank, Mock Tests, Exams & Topics. Blocked from billing, settings, and deleting live tests.';
      case 'support_agent':
        return 'Support tickets & student inquiries only. Blocked from question bank, exams, and platform settings.';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Team & Staff RBAC (টিম ও পারমিশন)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage granular role-based access control across Super Admins, Content Writers, and
                Support Agents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStaff}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-pk-primary hover:bg-pk-primary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-pk-primary/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Assign Staff</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Staff
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Authorized personnel</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/20 dark:border-purple-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Super Admins
            </span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.super_admin}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Full platform authority</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-sky-500/20 dark:border-sky-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Content Writers
            </span>
            <Edit2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.content_writer}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Question Bank & Tests</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Support Agents
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {counts.support_agent}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Student tickets & resolution</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-pk-primary"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'super_admin', 'content_writer', 'support_agent'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer',
                roleFilter === r
                  ? 'bg-pk-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {r === 'all'
                ? `All (${counts.total})`
                : r === 'super_admin'
                  ? `Super Admin (${counts.super_admin})`
                  : r === 'content_writer'
                    ? `Content Writer (${counts.content_writer})`
                    : `Support (${counts.support_agent})`}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-pk-primary border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading team permissions...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No staff members found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try changing search or add a new team member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4 hidden md:table-cell">Permitted Scope</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pk-primary/20 to-indigo-500/20 border border-pk-primary/20 flex items-center justify-center font-bold text-pk-primary text-xs shrink-0">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRoleBadge(member.adminRole)}
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      {getRolePermissionsDescription(member.adminRole)}
                    </td>

                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-400 whitespace-nowrap">
                      {new Date(member.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Role</span>
                        </button>
                        {member.email.toLowerCase() !== 'admin@practicekoro.online' && (
                          <button
                            onClick={() => setDemoteConfirmMember(member)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Remove staff role and revert to Student"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Demote to Student</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Management / Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pk-primary/10 text-pk-primary flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {modalMode === 'add' ? 'Add / Assign Staff Member' : 'Edit Staff Role'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure admin sub-role and system authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              {modalFeedback && (
                <div
                  className={cn(
                    'p-3 rounded-xl flex items-center gap-2 text-xs font-semibold',
                    modalFeedback.type === 'error'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                  )}
                >
                  {modalFeedback.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={modalMode === 'edit'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. writer@practicekoro.online"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pk-primary disabled:opacity-60"
                />
                {modalMode === 'add' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    The user must have registered on PracticeKoro with this email address.
                  </p>
                )}
              </div>

              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Permission Level
                </label>
                <div className="space-y-2.5">
                  {/* Super Admin */}
                  <div
                    onClick={() => setSelectedRole('super_admin')}
                    className={cn(
                      'p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                      selectedRole === 'super_admin'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-1 ring-purple-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Super Admin
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Full platform control: subscriptions, coupons, platform settings, test
                        deletion, team RBAC, and live audit trails.
                      </p>
                    </div>
                  </div>

                  {/* Content Writer */}
                  <div
                    onClick={() => setSelectedRole('content_writer')}
                    className={cn(
                      'p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                      selectedRole === 'content_writer'
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 ring-1 ring-sky-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Content Writer (কনটেন্ট রাইটার)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Create and edit Question Bank, Mock Tests, Subjects, and Exams. Cannot view
                        or edit subscriptions, settings, or delete live tests.
                      </p>
                    </div>
                  </div>

                  {/* Support Agent */}
                  <div
                    onClick={() => setSelectedRole('support_agent')}
                    className={cn(
                      'p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                      selectedRole === 'support_agent'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Support Agent (সাপোর্ট টিম)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Manage and resolve student support tickets and inquiries. Strictly
                        restricted from modifying tests or platform settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-pk-primary hover:bg-pk-primary/90 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-pk-primary/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : modalMode === 'add' ? 'Assign Role' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Demote to Student Confirmation Modal */}
      {demoteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <UserMinus className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revert Staff to Regular Student?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to demote <span className="font-semibold text-slate-800 dark:text-slate-200">{demoteConfirmMember.fullName}</span> ({demoteConfirmMember.email})?
                They will lose all administrative rights and become a regular student.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDemoting}
                onClick={() => setDemoteConfirmMember(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDemoting}
                onClick={handleDemoteStaff}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDemoting ? 'Demoting...' : 'Yes, Demote to Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
