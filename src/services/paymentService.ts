import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_SUBSCRIPTION_PLANS } from './mockData';
import type { Database } from '@/types/database';
import type {
  SubscriptionPlan,
  Payment,
  RazorpayOrderResponse,
  RazorpayVerificationPayload,
  StudentSubscriptionDetails,
  AdminSubscriptionRow,
  AdminPaymentRow,
} from '@/types';
type PlanRow = Database['public']['Tables']['subscription_plans']['Row'];
export const paymentService = {
  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!isSupabaseConfigured) return MOCK_SUBSCRIPTION_PLANS;
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) return MOCK_SUBSCRIPTION_PLANS;
      return (data as PlanRow[]).map((d) => ({
        id: d.id,
        name: d.title ?? undefined,
        title: d.title,
        description: d.description ?? undefined,
        durationDays: d.duration_days,
        price: Number(d.price),
        originalPrice: d.original_price ? Number(d.original_price) : undefined,
        currency: 'INR',
        features: Array.isArray(d.features) ? (d.features as string[]) : [],
        isActive: d.is_active,
        orderIndex: d.order_index,
      }));
    } catch {
      return MOCK_SUBSCRIPTION_PLANS;
    }
  },

  // ==========================================
  // PHASE 4: SUBSCRIPTION & RAZORPAY API
  // ==========================================

  // Create Razorpay Order on server
  async createRazorpayOrder(planId: string): Promise<RazorpayOrderResponse> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('create_razorpay_order', {
        p_plan_id: planId,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment order on server');
      }

      return {
        orderId: data.order_id,
        paymentId: data.payment_id,
        planId: data.plan_id,
        planTitle: data.plan_title,
        amount: Number(data.amount),
        currency: data.currency || 'INR',
        durationDays: Number(data.duration_days),
        keyId:
          data.key_id ||
          (import.meta.env.VITE_RAZORPAY_KEY as string) ||
          (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
          '',
      };
    }

    // Fallback/Local mock mode
    const plan = MOCK_SUBSCRIPTION_PLANS.find((p) => p.id === planId) || MOCK_SUBSCRIPTION_PLANS[0];
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 10)}`;
    const mockPaymentId = `pay_mock_${Date.now()}`;
    return {
      orderId: mockOrderId,
      paymentId: mockPaymentId,
      planId: plan.id,
      planTitle: plan.title,
      amount: plan.price,
      currency: 'INR',
      durationDays: plan.durationDays,
      keyId:
        (import.meta.env.VITE_RAZORPAY_KEY as string) ||
        (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
        '',
    };
  },

  // Verify Razorpay payment on server
  async verifyRazorpayPayment(payload: RazorpayVerificationPayload): Promise<{
    success: boolean;
    subscriptionId: string;
    status: string;
    startsAt: string;
    expiresAt: string;
    isRenewal: boolean;
    planTitle?: string;
  }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('verify_razorpay_payment', {
        p_order_id: payload.orderId,
        p_payment_id: payload.paymentId,
        p_signature: payload.signature,
        p_plan_id: payload.planId,
      });

      if (error) {
        throw new Error(error.message || 'Payment verification failed on server');
      }

      return {
        success: data.success,
        subscriptionId: data.subscription_id,
        status: data.status,
        startsAt: data.starts_at,
        expiresAt: data.expires_at,
        isRenewal: !!data.is_renewal,
        planTitle: data.plan_title,
      };
    }

    // Fallback/Local mock mode
    const plan =
      MOCK_SUBSCRIPTION_PLANS.find((p) => p.id === payload.planId) || MOCK_SUBSCRIPTION_PLANS[0];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    localStorage.setItem('practicekoro_is_pro', 'true');
    localStorage.setItem(
      'practicekoro_sub_details',
      JSON.stringify({
        hasSubscription: true,
        isActive: true,
        status: 'active',
        planId: plan.id,
        planTitle: plan.title,
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        daysRemaining: plan.durationDays,
      })
    );

    // Save payment in local storage
    const localPayments = JSON.parse(localStorage.getItem('practicekoro_payments') || '[]');
    localPayments.unshift({
      id: `pm_${Date.now()}`,
      userId: 'mock-student-id',
      planId: plan.id,
      planTitle: plan.title,
      amount: plan.price,
      currency: 'INR',
      gateway: 'razorpay',
      orderId: payload.orderId,
      transactionId: payload.paymentId,
      status: 'completed',
      createdAt: now.toISOString(),
    });
    localStorage.setItem('practicekoro_payments', JSON.stringify(localPayments));

    return {
      success: true,
      subscriptionId: `sub_${Date.now()}`,
      status: 'active',
      startsAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isRenewal: false,
      planTitle: plan.title,
    };
  },

  // Get student subscription details & days remaining
  async getStudentSubscriptionDetails(): Promise<StudentSubscriptionDetails> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_student_subscription_details');
        if (!error && data) {
          return {
            hasSubscription: !!data.has_subscription,
            isActive: !!data.is_active,
            status: data.status || 'none',
            subscriptionId: data.subscription_id,
            planId: data.plan_id,
            planTitle: data.plan_title,
            startsAt: data.starts_at,
            expiresAt: data.expires_at,
            daysRemaining:
              typeof data.days_remaining === 'number' ? data.days_remaining : undefined,
          };
        }
      } catch (err) {
        console.warn('Could not fetch student subscription details from RPC:', err);
      }
    }

    // Fallback/Local mock mode
    const isPro = localStorage.getItem('practicekoro_is_pro') === 'true';
    const saved = localStorage.getItem('practicekoro_sub_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore malformed local demo data and continue with an empty fallback.
      }
    }

    if (isPro) {
      return {
        hasSubscription: true,
        isActive: true,
        status: 'active',
        planId: 'pro_1_year',
        planTitle: '1-Year All-Access Pro Pass',
        startsAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 348 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 348,
      };
    }

    return {
      hasSubscription: false,
      isActive: false,
      status: 'none',
    };
  },

  // Get student payment history
  async getStudentPaymentHistory(): Promise<Payment[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, subscription_plans(title)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            userId: d.user_id,
            planId: d.plan_id,
            planTitle: d.subscription_plans?.title || 'Pro Pass',
            amount: Number(d.amount),
            currency: 'INR',
            gateway: d.gateway || 'razorpay',
            orderId: d.order_id,
            razorpayOrderId: d.razorpay_order_id,
            transactionId: d.transaction_id,
            razorpayPaymentId: d.razorpay_payment_id,
            status: d.status,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch student payments from table:', err);
      }
    }

    // Fallback/Local mock mode
    const localPayments = JSON.parse(localStorage.getItem('practicekoro_payments') || '[]');
    if (localPayments.length > 0) return localPayments;

    const isPro = localStorage.getItem('practicekoro_is_pro') === 'true';
    if (isPro) {
      return [
        {
          id: 'pay_demo_01',
          userId: 'mock-student-id',
          planId: 'pro_1_year',
          planTitle: '1-Year All-Access Pro Pass',
          amount: 299,
          currency: 'INR',
          gateway: 'razorpay',
          orderId: 'order_demo_101',
          transactionId: 'pay_demo_202',
          status: 'completed',
          createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }

    return [];
  },

  // Admin: Get Subscriptions
  async getAdminSubscriptions(
    status?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<AdminSubscriptionRow[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_admin_subscriptions', {
          p_status: status || null,
          p_search: search || null,
          p_limit: limit,
          p_offset: offset,
        });

        if (!error && Array.isArray(data)) {
          return data.map((d) => ({
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

  // Admin: Get Payments
  async getAdminPayments(
    status?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<AdminPaymentRow[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_admin_payments', {
          p_status: status || null,
          p_search: search || null,
          p_limit: limit,
          p_offset: offset,
        });

        if (!error && Array.isArray(data)) {
          return data.map((d) => ({
            id: d.id,
            userId: d.user_id,
            studentName: d.student_name || 'Student Aspirant',
            studentEmail: d.student_email || '',
            planId: d.plan_id || undefined,
            planTitle: d.plan_title || 'Pro Pass',
            amount: Number(d.amount),
            currency: 'INR',
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
};
