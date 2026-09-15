import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_ATTEMPTS } from '@/services/mockData';
import type { AdminSubscriptionRow, AdminPaymentRow, AdminDashboardStats } from '@/types';
import {
  localExams,
  localSubjects,
  localChapters,
  localTestSeries,
  localTests,
  localQuestions,
} from '@/services/domains/localStore';

/**
 * Admin subscriptions, payments & dashboard statistics API.
 * Methods extracted verbatim from the original src/services/api.ts.
 */

export const adminCommerceApi = {
  async getAdminSubscriptions(
    status?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<AdminSubscriptionRow[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('get_admin_subscriptions', {
          p_status: status || null,
          p_search: search || null,
          p_limit: limit,
          p_offset: offset,
        });

        if (!error && Array.isArray(data)) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            studentName: d.student_name || 'Student Aspirant',
            studentEmail: d.student_email || '',
            studentPhone: d.student_phone || undefined,
            planId: d.plan_id,
            planTitle: d.plan_title || 'Pro Pass',
            status: d.status,
            startsAt: d.starts_at,
            expiresAt: d.expires_at,
            paymentId: d.payment_id || undefined,
            daysRemaining: Number(d.days_remaining || 0),
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch admin subscriptions from RPC:', err);
      }
    }

    // Fallback mock
    return [
      {
        id: 'sub_admin_demo_1',
        userId: 'student-free-01',
        studentName: 'Subhas Chandra',
        studentEmail: 'subhas@example.com',
        studentPhone: '9876543210',
        planId: 'pro_1_year',
        planTitle: '1-Year All-Access Pro Pass',
        status: 'active',
        startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 335,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sub_admin_demo_2',
        userId: 'student-pro-02',
        studentName: 'Amiya Mondal',
        studentEmail: 'amiya@example.com',
        planId: 'pro_6_month',
        planTitle: '6-Month Exam Pass',
        status: 'expired',
        startsAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 0,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  async getAdminPayments(
    status?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<AdminPaymentRow[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('get_admin_payments', {
          p_status: status || null,
          p_search: search || null,
          p_limit: limit,
          p_offset: offset,
        });

        if (!error && Array.isArray(data)) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            studentName: d.student_name || 'Student Aspirant',
            studentEmail: d.student_email || '',
            planId: d.plan_id || undefined,
            planTitle: d.plan_title || 'Pro Pass',
            amount: Number(d.amount),
            currency: d.currency || 'INR',
            gateway: d.gateway || 'razorpay',
            orderId: d.order_id || undefined,
            razorpayOrderId: d.razorpay_order_id || undefined,
            transactionId: d.transaction_id || undefined,
            razorpayPaymentId: d.razorpay_payment_id || undefined,
            status: d.status,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch admin payments from RPC:', err);
      }
    }

    // Fallback mock
    return [
      {
        id: 'pm_admin_demo_1',
        userId: 'student-free-01',
        studentName: 'Subhas Chandra',
        studentEmail: 'subhas@example.com',
        planId: 'pro_1_year',
        planTitle: '1-Year All-Access Pro Pass',
        amount: 299,
        currency: 'INR',
        gateway: 'razorpay',
        orderId: 'order_K8d72kd91',
        razorpayPaymentId: 'pay_K8d7992j3l',
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pm_admin_demo_2',
        userId: 'student-pro-02',
        studentName: 'Amiya Mondal',
        studentEmail: 'amiya@example.com',
        planId: 'pro_6_month',
        planTitle: '6-Month Exam Pass',
        amount: 199,
        currency: 'INR',
        gateway: 'razorpay',
        orderId: 'order_F38h2kd90',
        razorpayPaymentId: 'pay_F38h0192la',
        status: 'completed',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('get_admin_dashboard_counts');
        if (!error && data) {
          return {
            totalExams: Number(data.total_exams || 0),
            activeExams: Number(data.total_exams || 0),
            totalSubjects: Number(data.total_subjects || 0),
            totalChapters: Number(data.total_chapters || 0),
            totalTestSeries: Number(data.total_test_series || 0),
            totalTests: Number(data.total_tests || 0),
            publishedTests: Number(data.published_tests || 0),
            draftTests: Number(data.draft_tests || 0),
            archivedTests: Number(data.archived_tests || 0),
            totalQuestions: Number(data.total_questions || 0),
            activeQuestions: Number(data.total_questions || 0),
            totalAttempts: Number(data.total_attempts || 0),
            completedAttempts: Number(data.completed_attempts || 0),
            totalStudents: Number(data.total_students || 0),
          };
        }
      } catch (err) {
        console.warn('Fallback to local stats calculation', err);
      }
    }

    return {
      totalExams: localExams.length,
      activeExams: localExams.filter((e) => e.isActive).length,
      totalSubjects: localSubjects.length,
      totalChapters: localChapters.length,
      totalTestSeries: localTestSeries.length,
      totalTests: localTests.length,
      publishedTests: localTests.filter((t) => t.status === 'published').length,
      draftTests: localTests.filter((t) => t.status === 'draft').length,
      archivedTests: localTests.filter((t) => t.status === 'archived').length,
      totalQuestions: localQuestions.length,
      activeQuestions: localQuestions.filter((q) => q.isActive && q.status !== 'archived').length,
      totalAttempts: MOCK_ATTEMPTS.length,
      completedAttempts: MOCK_ATTEMPTS.filter((a) => a.status === 'completed').length,
      totalStudents: 142,
    };
  },
};
