import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localNotifications, syncLocalScheduledNotifications } from '@/services/domains/localStore';
import type { NotificationItem } from '@/types';

/** Section of the admin API: notifications (split from domains/admin.ts, same behaviour). */
// --------------------------------------------------------------------------
// NOTIFICATIONS API
// --------------------------------------------------------------------------
export async function getNotifications(): Promise<NotificationItem[]> {
  if (isSupabaseConfigured) {
    // 1. Attempt background auto-transition for any scheduled notifications that have reached their time
    try {
      await supabase.rpc('process_scheduled_notifications');
    } catch {
      // Non-fatal if stored procedure is not yet applied in active environment
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (data && data.length > 0) {
      const now = new Date();
      return data.map((d: any) => {
        const scheduledAt = d.scheduled_at || undefined;
        const isDue = d.status === 'scheduled' && scheduledAt && new Date(scheduledAt) <= now;
        const effectiveStatus = isDue ? 'sent' : d.status;
        const effectiveSentAt = isDue ? d.sent_at || scheduledAt : d.sent_at || undefined;

        return {
          id: d.id,
          title: d.title,
          message: d.message,
          targetAudience: d.target_audience,
          channel: d.channel,
          status: effectiveStatus,
          sentAt: effectiveSentAt,
          scheduledAt,
          createdAt: d.created_at,
          createdBy: d.created_by || undefined,
        };
      });
    }
    return [];
  }

  // Fallback: sync scheduled items in local in-memory store
  return [...syncLocalScheduledNotifications()];
}

export async function createNotification(
  notif: Omit<NotificationItem, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('notifications').insert({
      title: notif.title,
      message: notif.message,
      target_audience: notif.targetAudience,
      channel: notif.channel,
      status: notif.status,
      sent_at: notif.status === 'sent' ? notif.sentAt || new Date().toISOString() : undefined,
      scheduled_at: notif.status === 'scheduled' ? notif.scheduledAt : undefined,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Local fallback store
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: notif.title,
    message: notif.message,
    targetAudience: notif.targetAudience,
    channel: notif.channel,
    status: notif.status,
    sentAt: notif.status === 'sent' ? notif.sentAt || new Date().toISOString() : undefined,
    scheduledAt: notif.status === 'scheduled' ? notif.scheduledAt : undefined,
    createdAt: new Date().toISOString(),
  };
  localNotifications.unshift(newNotif);
  return { success: true };
}

export async function createTargetedNotification(
  notif: Pick<NotificationItem, 'title' | 'message' | 'channel'> & { userIds: string[] }
): Promise<{ success: boolean; error?: string }> {
  if (notif.userIds.length === 0) return { success: true };
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('create_targeted_notification', {
      p_title: notif.title,
      p_message: notif.message,
      p_channel: notif.channel,
      p_user_ids: notif.userIds,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  localNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: notif.title,
    message: notif.message,
    targetAudience: 'selected',
    channel: notif.channel,
    status: 'sent',
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  return { success: true };
}

export async function sendNotificationNow(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  const target = localNotifications.find((n) => n.id === id);
  if (target) {
    target.status = 'sent';
    target.sentAt = new Date().toISOString();
  }
  return true;
}

export async function deleteNotification(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  const idx = localNotifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    localNotifications.splice(idx, 1);
  }
  return true;
}

export const adminNotificationsApi = {
  getNotifications,
  createNotification,
  createTargetedNotification,
  sendNotificationNow,
  deleteNotification,
};
