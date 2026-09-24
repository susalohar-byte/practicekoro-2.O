import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import {
  LifeBuoy,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Mail,
  Edit2,
  Plus,
  X,
} from 'lucide-react';
import type { SupportTicketItem } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const AdminSupport: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit / Resolve Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [editStatus, setEditStatus] = useState<SupportTicketItem['status']>('open');
  const [editPriority, setEditPriority] = useState<SupportTicketItem['priority']>('medium');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Create Ticket Modal (e.g. phone/WhatsApp reported)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicketItem['category']>('Payment Issue');
  const [newPriority, setNewPriority] = useState<SupportTicketItem['priority']>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSupportTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleOpenTicket = (ticket: SupportTicketItem) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setResolutionNotes(ticket.resolutionNotes || '');
    setUpdateError('');
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);
      setUpdateError('');
      const res = await api.updateSupportTicket(selectedTicket.id, {
        status: editStatus,
        priority: editPriority,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });

      if (!res.success) {
        setUpdateError(res.error || 'Failed to update ticket');
        return;
      }

      await api.logAdminActivity({
        action: 'SUPPORT_TICKET_UPDATE',
        entityType: 'support_ticket',
        entityId: selectedTicket.id,
        entityName: `Ticket #${selectedTicket.id.slice(0, 8)} - ${selectedTicket.subject}`,
        details: {
          previousStatus: selectedTicket.status,
          newStatus: editStatus,
          previousPriority: selectedTicket.priority,
          newPriority: editPriority,
          studentEmail: selectedTicket.studentEmail,
          resolutionNotes: resolutionNotes.trim() || null,
        },
        adminUser: currentAdmin,
      });

      setSelectedTicket(null);
      await loadTickets();
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newSubject.trim() || !newIssue.trim()) {
      setCreateError('Student name, subject, and issue description are required.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');
      const res = await api.createSupportTicket({
        studentName: newStudentName.trim(),
        studentEmail: newStudentEmail.trim() || 'student@practicekoro.online',
        subject: newSubject.trim(),
        issue: newIssue.trim(),
        category: newCategory,
        priority: newPriority,
        status: 'open',
      });

      if (!res.success) {
        setCreateError(res.error || 'Failed to create ticket');
        return;
      }

      await api.logAdminActivity({
        action: 'SUPPORT_TICKET_CREATE',
        entityType: 'support_ticket',
        entityId: res.ticketId || 'new-ticket',
        entityName: `Ticket - ${newSubject.trim()}`,
        details: {
          studentName: newStudentName.trim(),
          studentEmail: newStudentEmail.trim() || 'student@practicekoro.online',
          category: newCategory,
          priority: newPriority,
        },
        adminUser: currentAdmin,
      });

      setIsCreateModalOpen(false);
      await loadTickets();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.studentName.toLowerCase().includes(q) ||
        t.studentEmail.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.issue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-indigo-400" />
            Support & Help Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resolve student queries, payment issues, subscription activation tickets, and question
            feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              setNewStudentName('');
              setNewStudentEmail('');
              setNewSubject('');
              setNewIssue('');
              setNewCategory('Payment Issue');
              setNewPriority('medium');
              setCreateError('');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Ticket</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Open Tickets</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{openCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Awaiting first response</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">In Progress / Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">{pendingCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Under investigation</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{resolvedCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Completed inquiries</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/90">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-850 w-full md:w-auto">
          {[
            { id: 'all', label: `All (${tickets.length})` },
            { id: 'open', label: `Open (${openCount})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by student, subject, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-850">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
            Loading support tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-850">
            <LifeBuoy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No support tickets match the current filter.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isOpen = ticket.status === 'open';
            const isResolved = ticket.status === 'resolved';

            return (
              <div
                key={ticket.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{ticket.subject}</span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOpen
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : isResolved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {isOpen ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : isResolved ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {ticket.status.toUpperCase()}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ticket.priority === 'high'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          : ticket.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {ticket.priority.toUpperCase()} PRIORITY
                    </span>

                    {/* Category */}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {ticket.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenTicket(ticket)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors self-start md:self-auto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Manage / Resolve</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                  {ticket.issue}
                </p>

                {ticket.resolutionNotes && (
                  <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                    <strong className="text-emerald-400">Resolution: </strong>
                    {ticket.resolutionNotes}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {ticket.studentName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {ticket.studentEmail}
                    </span>
                  </div>
                  <span>
                    Logged:{' '}
                    {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Details / Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-indigo-400" />
                Manage Support Ticket
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1 text-xs">
                <p className="font-bold text-white">{selectedTicket.subject}</p>
                <p className="text-slate-400">{selectedTicket.issue}</p>
                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Student: {selectedTicket.studentName}</span>
                  <span>Email: {selectedTicket.studentEmail}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              {updateError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {updateError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Ticket Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending / Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Resolution Notes / Student Response
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes explaining how the issue was investigated or resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Save Ticket Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/35">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Log Inward Support Inquiry
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              {createError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sen"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment not reflecting in subscription"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Issue Details *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the complaint or feedback..."
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as SupportTicketItem['category'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Subscription Issue">Subscription Issue</option>
                    <option value="Test Issue">Test / Question Error</option>
                    <option value="Account Issue">Account Access</option>
                    <option value="Result Issue">Result Issue</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Logging...' : 'Log Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSupport;
