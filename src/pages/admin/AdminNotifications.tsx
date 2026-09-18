import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import {
  Bell,
  Plus,
  Send,
  Trash2,
  Users,
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Smartphone,
  Layers,
} from 'lucide-react';
import type { NotificationItem, Exam } from '@/types';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [channel, setChannel] = useState<'in_app' | 'push' | 'both'>('both');
  const [status, setStatus] = useState<'sent' | 'scheduled' | 'draft'>('sent');

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notifsData, examsData] = await Promise.all([
        api.getNotifications(),
        api.getAllAdminExams(),
      ]);
      setNotifications(notifsData);
      setExams(examsData);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleOpenCreateModal = () => {
    setTitle('');
    setMessage('');
    setTargetAudience('all');
    setChannel('both');
    setStatus('sent');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFormError('Both title and message are required.');
      return;
    }

    try {
      setIsSending(true);
      setFormError('');

      const res = await api.createNotification({
        title: title.trim(),
        message: message.trim(),
        targetAudience,
        channel,
        status,
        sentAt: status === 'sent' ? new Date().toISOString() : undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create notification.');
        return;
      }

      setIsModalOpen(false);
      await loadNotifications();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error sending notification.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (statusFilter === 'all') return true;
    return n.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-400" />
            Notifications & Broadcasts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast test releases, exam alerts, subscription offers, and push updates to
            aspirants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadNotifications}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`}
            />
            Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 w-fit">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          {
            id: 'sent',
            label: `Sent (${notifications.filter((n) => n.status === 'sent').length})`,
          },
          {
            id: 'scheduled',
            label: `Scheduled (${notifications.filter((n) => n.status === 'scheduled').length})`,
          },
          {
            id: 'draft',
            label: `Drafts (${notifications.filter((n) => n.status === 'draft').length})`,
          },
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

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-850">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-850">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No broadcast notifications found in this category.
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isSent = notif.status === 'sent';

            return (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{notif.title}</span>

                    {/* Audience Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      {notif.targetAudience === 'pro' || notif.targetAudience === 'pro_users' ? (
                        <>
                          <Crown className="w-3 h-3 text-amber-400" /> Pro Members
                        </>
                      ) : notif.targetAudience === 'free' || notif.targetAudience === 'free_users' ? (
                        <>
                          <Sparkles className="w-3 h-3 text-indigo-400" /> Free Tier
                        </>
                      ) : notif.targetAudience === 'all' ? (
                        <>
                          <Users className="w-3 h-3 text-emerald-400" /> All Students
                        </>
                      ) : notif.targetAudience.startsWith('exam:') ? (
                        <>
                          <Layers className="w-3 h-3 text-cyan-400" />
                          {exams.find((e) => `exam:${e.id}` === notif.targetAudience)?.title || 'Target Exam'}
                        </>
                      ) : (
                        <>
                          <Layers className="w-3 h-3 text-cyan-400" /> {notif.targetAudience}
                        </>
                      )}
                    </span>

                    {/* Channel Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      <Smartphone className="w-3 h-3" />
                      {notif.channel === 'both' ? 'In-App + Push' : notif.channel}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSent
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : notif.status === 'scheduled'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {isSent ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {notif.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>
                      Created:{' '}
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.sentAt && (
                      <span>
                        • Sent:{' '}
                        {new Date(notif.sentAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Compose Broadcast Notification
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New WBP Constable Full Mock Test 05 is Live!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter clear announcement details for students..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="all">All Registered Students</option>
                    <option value="pro">Pro Members Only</option>
                    <option value="free">Free Tier Users Only</option>
                    {exams.length > 0 && (
                      <optgroup label="Exam-Specific Aspirants">
                        {exams.map((ex) => (
                          <option key={ex.id} value={`exam:${ex.id}`}>
                            {ex.title} Aspirants
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Delivery Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="both">In-App + Push Notification</option>
                    <option value="in_app">In-App Notice Only</option>
                    <option value="push">Mobile Push Notification Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Dispatch Mode
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="sent">Send Immediately</option>
                  <option value="draft">Save as Draft</option>
                  <option value="scheduled">Schedule for Later</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSending ? 'Sending...' : status === 'sent' ? 'Broadcast Now' : 'Save Notice'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminNotifications;
