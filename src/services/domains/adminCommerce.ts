import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/authPolicy';
import type {
  AdminSubscriptionRow,
  AdminPaymentRow,
  AdminDashboardStats,
  AdminDashboardV2Stats,
  AdminStudentRow,
  AdminStudentDetails,
  SubscriptionPlan,
  TestAttempt,
  CouponItem,
  CouponValidationResult,
} from '@/types';
import {
  localExams,
  localSubjects,
  localChapters,
  localTestSeries,
  localTests,
  localQuestions,
  localCoupons,
} from '@/services/domains/localStore';

/**
 * Admin subscriptions, payments & dashboard statistics API.
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
        console.warn('Could not fetch admin subscriptions from RPC, trying direct query:', err);
      }

      // Direct fallback query against Supabase subscriptions table
      try {
        let query = supabase
          .from('subscriptions')
          .select(
            `
            id,
            user_id,
            plan_id,
            status,
            starts_at,
            expires_at,
            payment_id,
            created_at,
            profiles:user_id(full_name, email, phone),
            subscription_plans:plan_id(title)
          `
          )
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data
            .filter((d: any) => {
              if (!search) return true;
              const s = search.toLowerCase();
              const name = d.profiles?.full_name?.toLowerCase() || '';
              const email = d.profiles?.email?.toLowerCase() || '';
              return name.includes(s) || email.includes(s);
            })
            .map((d: any) => {
              const now = Date.now();
              const exp = new Date(d.expires_at).getTime();
              const daysRemaining = Math.max(0, Math.ceil((exp - now) / (1000 * 60 * 60 * 24)));
              return {
                id: d.id,
                userId: d.user_id,
                studentName: d.profiles?.full_name || 'Registered Student',
                studentEmail: d.profiles?.email || '',
                studentPhone: d.profiles?.phone || undefined,
                planId: d.plan_id,
                planTitle: d.subscription_plans?.title || 'Pro Pass',
                status: d.status,
                startsAt: d.starts_at,
                expiresAt: d.expires_at,
                paymentId: d.payment_id || undefined,
                daysRemaining,
                createdAt: d.created_at,
              };
            });
        }
      } catch (err) {
        console.warn('Direct query on subscriptions failed:', err);
      }
    }

    // Return empty list when no real database subscriptions exist
    return [];
  },

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
        console.warn('Could not fetch admin payments from RPC, trying direct query:', err);
      }

      // Direct fallback query against Supabase payments table
      try {
        let query = supabase
          .from('payments')
          .select(
            `
            id,
            user_id,
            plan_id,
            amount,
            currency,
            gateway,
            order_id,
            razorpay_order_id,
            transaction_id,
            razorpay_payment_id,
            status,
            created_at,
            profiles:user_id(full_name, email),
            subscription_plans:plan_id(title)
          `
          )
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data
            .filter((d: any) => {
              if (!search) return true;
              const s = search.toLowerCase();
              const name = d.profiles?.full_name?.toLowerCase() || '';
              const email = d.profiles?.email?.toLowerCase() || '';
              const orderId = (d.order_id || d.razorpay_order_id || '').toLowerCase();
              return name.includes(s) || email.includes(s) || orderId.includes(s);
            })
            .map((d: any) => ({
              id: d.id,
              userId: d.user_id,
              studentName: d.profiles?.full_name || 'Registered Student',
              studentEmail: d.profiles?.email || '',
              planId: d.plan_id || undefined,
              planTitle: d.subscription_plans?.title || 'Pro Pass',
              amount: Number(d.amount || 0),
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
        console.warn('Direct query on payments failed:', err);
      }
    }

    // Return empty list when no real database payments exist
    return [];
  },

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const studentCount = 0;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_admin_dashboard_counts');
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

      try {
        const [
          examsRes,
          subjectsRes,
          chaptersRes,
          testSeriesRes,
          testsRes,
          questionsRes,
          attemptsRes,
          profilesRes,
        ] = await Promise.all([
          supabase.from('exams').select('*', { count: 'exact', head: true }),
          supabase.from('subjects').select('*', { count: 'exact', head: true }),
          supabase.from('chapters').select('*', { count: 'exact', head: true }),
          supabase.from('test_series').select('*', { count: 'exact', head: true }),
          supabase.from('tests').select('status'),
          supabase.from('questions').select('is_active, status'),
          supabase.from('test_attempts').select('status'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);

        const tests = Array.isArray(testsRes.data) ? testsRes.data : [];
        const questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
        const attempts = Array.isArray(attemptsRes.data) ? attemptsRes.data : [];

        return {
          totalExams: examsRes.count ?? 0,
          activeExams: examsRes.count ?? 0,
          totalSubjects: subjectsRes.count ?? 0,
          totalChapters: chaptersRes.count ?? 0,
          totalTestSeries: testSeriesRes.count ?? 0,
          totalTests: tests.length,
          publishedTests: tests.filter((t: any) => t.status === 'published').length,
          draftTests: tests.filter((t: any) => t.status === 'draft').length,
          archivedTests: tests.filter((t: any) => t.status === 'archived').length,
          totalQuestions: questions.length,
          activeQuestions: questions.filter((q: any) => q.is_active && q.status !== 'archived')
            .length,
          totalAttempts: attempts.length,
          completedAttempts: attempts.filter((a: any) => a.status === 'completed').length,
          totalStudents: profilesRes.count ?? 0,
        };
      } catch (err) {
        console.warn('Fallback direct stats calculation failed:', err);
        return {
          totalExams: 0,
          activeExams: 0,
          totalSubjects: 0,
          totalChapters: 0,
          totalTestSeries: 0,
          totalTests: 0,
          publishedTests: 0,
          draftTests: 0,
          archivedTests: 0,
          totalQuestions: 0,
          activeQuestions: 0,
          totalAttempts: 0,
          completedAttempts: 0,
          totalStudents: 0,
        };
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
      totalAttempts: 0,
      completedAttempts: 0,
      totalStudents: studentCount,
    };
  },

  async getAdminDashboardV2Stats(): Promise<AdminDashboardV2Stats> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_admin_dashboard_v2_stats');
        if (!error && data) {
          return {
            totalRevenue: Number(data.totalRevenue || 0),
            todayRevenue: Number(data.todayRevenue || 0),
            monthRevenue: Number(data.monthRevenue || 0),
            yearRevenue: Number(data.yearRevenue || 0),
            revenueTrend: Array.isArray(data.revenueTrend) ? data.revenueTrend : [],
            totalStudents: Number(data.totalStudents || 0),
            newStudents: Number(data.newStudents || 0),
            activeStudents: Number(data.activeStudents || 0),
            freeStudents: Number(data.freeStudents || 0),
            proStudents: Number(data.proStudents || 0),
            activeSubscriptions: Number(data.activeSubscriptions || 0),
            totalExams: Number(data.totalExams || 0),
            totalTests: Number(data.totalTests || 0),
            topicTests: Number(data.topicTests || 0),
            fullMockTests: Number(data.fullMockTests || 0),
            pyqTests: Number(data.pyqTests || 0),
            totalQuestions: Number(data.totalQuestions || 0),
            topicQuestions: Number(data.topicQuestions || 0),
            fullMockQuestions: Number(data.fullMockQuestions || 0),
            pyqQuestions: Number(data.pyqQuestions || 0),
            recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
          };
        }
      } catch (err) {
        console.warn('Fallback computing dashboard v2 stats from database tables:', err);
      }

      // Query real metrics directly from tables
      try {
        const [profilesRes, proSubRes, paymentsRes, examsRes, testsRes, questionsRes] =
          await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase
              .from('subscriptions')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'active'),
            supabase.from('payments').select('amount, created_at').eq('status', 'completed'),
            supabase.from('exams').select('*', { count: 'exact', head: true }),
            supabase.from('tests').select('test_type'),
            supabase.from('questions').select('chapter_id, exam_id'),
          ]);

        const totalStudents = profilesRes.count || 0;
        const activeSubscriptions = proSubRes.count || 0;
        const proStudents = activeSubscriptions;
        const freeStudents = Math.max(0, totalStudents - proStudents);

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthRevenue = 0;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        if (Array.isArray(paymentsRes.data)) {
          for (const p of paymentsRes.data) {
            const amt = Number(p.amount || 0);
            totalRevenue += amt;
            const pTime = new Date(p.created_at).getTime();
            if (pTime >= startOfToday) todayRevenue += amt;
            if (pTime >= startOfMonth) monthRevenue += amt;
          }
        }

        const tests = Array.isArray(testsRes.data) ? testsRes.data : [];
        const fullMockTests = tests.filter((t: any) => t.test_type === 'full_mock').length;
        const pyqTests = tests.filter((t: any) => t.test_type === 'pyq').length;
        const topicTests = tests.filter(
          (t: any) => t.test_type !== 'full_mock' && t.test_type !== 'pyq'
        ).length;

        const questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
        const topicQuestions = questions.filter((q: any) => q.chapter_id).length;
        const fullMockQuestions = questions.filter((q: any) => !q.chapter_id && q.exam_id).length;
        const pyqQuestions = Math.max(0, questions.length - topicQuestions - fullMockQuestions);

        return {
          totalRevenue,
          todayRevenue,
          monthRevenue,
          yearRevenue: totalRevenue,
          revenueTrend: [],
          totalStudents,
          newStudents: totalStudents,
          activeStudents: totalStudents,
          freeStudents,
          proStudents,
          activeSubscriptions,
          totalExams: examsRes.count ?? 0,
          totalTests: tests.length,
          topicTests,
          fullMockTests,
          pyqTests,
          totalQuestions: questions.length,
          topicQuestions,
          fullMockQuestions,
          pyqQuestions,
          recentActivity: [],
        };
      } catch (err) {
        console.warn('Direct computation of stats failed:', err);
        return {
          totalRevenue: 0,
          todayRevenue: 0,
          monthRevenue: 0,
          yearRevenue: 0,
          revenueTrend: [],
          totalStudents: 0,
          newStudents: 0,
          activeStudents: 0,
          freeStudents: 0,
          proStudents: 0,
          activeSubscriptions: 0,
          totalExams: 0,
          totalTests: 0,
          topicTests: 0,
          fullMockTests: 0,
          pyqTests: 0,
          totalQuestions: 0,
          topicQuestions: 0,
          fullMockQuestions: 0,
          pyqQuestions: 0,
          recentActivity: [],
        };
      }
    }

    return {
      totalRevenue: 0,
      todayRevenue: 0,
      monthRevenue: 0,
      yearRevenue: 0,
      revenueTrend: [],
      totalStudents: 0,
      newStudents: 0,
      activeStudents: 0,
      freeStudents: 0,
      proStudents: 0,
      activeSubscriptions: 0,
      totalExams: localExams.length,
      totalTests: localTests.length,
      topicTests: localTests.filter((t) => t.testType === 'chapter_mock' || t.testType === 'topic')
        .length,
      fullMockTests: localTests.filter((t) => t.testType === 'full_mock').length,
      pyqTests: localTests.filter((t) => t.testType === 'pyq').length,
      totalQuestions: localQuestions.length,
      topicQuestions: localQuestions.filter((q) => q.chapterId).length,
      fullMockQuestions: localQuestions.filter((q) => !q.chapterId && q.id.includes('fm')).length,
      pyqQuestions: localQuestions.filter((q) => !q.chapterId && q.id.includes('pyq')).length,
      recentActivity: [],
    };
  },

  async getAdminStudents(
    search?: string,
    filterPlan?: string,
    filterStatus?: string,
    limit = 200,
    offset = 0
  ): Promise<AdminStudentRow[]> {
    if (isSupabaseConfigured) {
      // Attempt 1: RPC function (most complete data)
      try {
        const { data, error } = await supabase.rpc('get_admin_students', {
          p_search: search || null,
          p_plan: filterPlan === 'all' ? null : filterPlan || null,
          p_status: filterStatus === 'all' ? null : filterStatus || null,
          p_limit: limit,
          p_offset: offset,
        });

        if (!error && Array.isArray(data)) {
          return data
            .filter((d) => {
              const email = (d.email || '').toLowerCase().trim();
              return !isAdminEmail(email);
            })
            .map((d) => ({
              id: d.id,
              fullName: d.full_name || 'Aspirant',
              email: d.email || '',
              phone: d.phone || undefined,
              avatarUrl: d.avatar_url || undefined,
              createdAt: d.created_at,
              planTitle: d.plan_title || 'Free Plan',
              planId: d.plan_id || 'plan_free',
              subscriptionStatus: d.subscription_status || 'none',
              isPro: Boolean(d.is_pro),
              expiresAt: d.expires_at || undefined,
              totalAttempts: Number(d.total_attempts || 0),
              lastActive: d.last_active || d.created_at,
            }));
        }
        if (error) {
          console.warn('RPC get_admin_students failed:', error.message, error.code);
        }
      } catch (err) {
        console.warn('RPC get_admin_students exception:', err);
      }

      // Attempt 2: Direct query on profiles (simple, no nested join)
      try {
        let query = supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url, role, created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: profileData, error: profileError } = await query;
        if (profileError) {
          console.warn('Direct profiles query failed:', profileError.message);
        }

        if (!profileError && Array.isArray(profileData) && profileData.length > 0) {
          // Filter out admins
          const studentProfiles = profileData.filter((d: any) => {
            const email = (d.email || '').toLowerCase().trim();
            if (isAdminEmail(email)) {
              return false;
            }
            if (d.role === 'admin') return false;
            return true;
          });

          // Fetch subscriptions separately to avoid ambiguous FK join issues
          const userIds = studentProfiles.map((p: any) => p.id);
          const subsMap: Record<string, any> = {};

          if (userIds.length > 0) {
            try {
              const { data: subsData } = await supabase
                .from('subscriptions')
                .select('user_id, plan_id, status, expires_at, subscription_plans(title)')
                .in('user_id', userIds)
                .order('created_at', { ascending: false });

              if (Array.isArray(subsData)) {
                for (const s of subsData) {
                  // Keep only the most recent subscription per user
                  if (!subsMap[s.user_id]) {
                    subsMap[s.user_id] = s;
                  }
                }
              }
            } catch {
              // Subscriptions lookup is optional — students still show without it
            }
          }

          return studentProfiles
            .map((d: any) => {
              const sub = subsMap[d.id];
              const isPro = sub?.status === 'active';
              const planTitle =
                (sub?.subscription_plans as any)?.title || (isPro ? 'Pro Pass' : 'Free Aspirant');

              return {
                id: d.id,
                fullName: d.full_name || 'Registered Aspirant',
                email: d.email || '',
                phone: d.phone || undefined,
                avatarUrl: d.avatar_url || undefined,
                createdAt: d.created_at,
                planTitle,
                planId: sub?.plan_id || 'plan_free',
                subscriptionStatus: sub?.status || 'none',
                isPro,
                expiresAt: sub?.expires_at || undefined,
                totalAttempts: 0,
                lastActive: d.created_at,
              };
            })
            .filter((st) => {
              if (filterPlan === 'pro' && !st.isPro) return false;
              if (filterPlan === 'free' && st.isPro) return false;
              if (filterStatus === 'active' && !st.isPro) return false;
              if (filterStatus === 'expired' && st.subscriptionStatus !== 'expired') return false;
              return true;
            });
        }
      } catch (err) {
        console.warn('Direct profiles query exception:', err);
      }
    }

    // Return empty list when no real registered students exist in database
    return [];
  },

  async getAdminStudentDetails(userId: string): Promise<AdminStudentDetails | null> {
    const students = await this.getAdminStudents();
    const student = students.find((s) => s.id === userId);
    if (!student) return null;

    let attempts: TestAttempt[] = [];
    let payments: AdminPaymentRow[] = [];
    let subscriptions: AdminSubscriptionRow[] = [];

    if (isSupabaseConfigured) {
      try {
        const [attRes, payRes, subRes] = await Promise.all([
          supabase
            .from('test_attempts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('subscriptions')
            .select('*, subscription_plans(title)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        ]);

        if (attRes.data && attRes.data.length > 0) {
          attempts = attRes.data.map((a) => ({
            id: a.id,
            userId: a.user_id,
            testId: a.test_id,
            status: a.status,
            startTime: a.start_time,
            endTime: a.end_time,
            timeSpentSeconds: a.time_spent_seconds,
            score: Number(a.score),
            totalMarks: Number(a.total_marks),
            correctCount: a.correct_count,
            wrongCount: a.wrong_count,
            skippedCount: a.skipped_count,
            accuracy: Number(a.accuracy),
            rank: a.rank,
            percentile: Number(a.percentile),
            createdAt: a.created_at,
          }));
        }

        if (payRes.data) {
          payments = payRes.data.map((p) => ({
            id: p.id,
            userId: p.user_id,
            studentName: student.fullName,
            studentEmail: student.email,
            amount: Number(p.amount),
            currency: p.currency,
            gateway: p.gateway,
            orderId: p.order_id,
            transactionId: p.transaction_id,
            status: p.status,
            createdAt: p.created_at,
          }));
        }

        if (subRes.data) {
          subscriptions = subRes.data.map((s) => ({
            id: s.id,
            userId: s.user_id,
            studentName: student.fullName,
            studentEmail: student.email,
            planId: s.plan_id,
            planTitle: (s.subscription_plans as { title?: string })?.title || 'Pro Pass',
            status: s.status,
            startsAt: s.starts_at,
            expiresAt: s.expires_at,
            daysRemaining: Math.max(
              0,
              Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / (24 * 3600 * 1000))
            ),
            createdAt: s.created_at,
          }));
        }
      } catch (err) {
        console.warn('Error loading student details:', err);
      }
    }

    return {
      ...student,
      recentAttempts: attempts,
      paymentHistory: payments,
      subscriptionHistory: subscriptions,
    };
  },

  async updateSubscriptionPlan(
    id: string,
    updates: Partial<SubscriptionPlan>
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
        if (updates.durationDays !== undefined) payload.duration_days = updates.durationDays;
        if (updates.features !== undefined) payload.features = updates.features;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.currency !== undefined) payload.currency = updates.currency;

        const { error } = await supabase.from('subscription_plans').update(payload).eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
      }
    }
    return { success: true };
  },

  async createSubscriptionPlan(
    plan: SubscriptionPlan
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('subscription_plans').insert({
          id: plan.id,
          name: plan.name || plan.title,
          title: plan.title,
          description: plan.description,
          duration_days: plan.durationDays,
          price: plan.price,
          original_price: plan.originalPrice,
          currency: plan.currency || 'INR',
          features: plan.features,
          is_active: plan.isActive,
          order_index: plan.orderIndex || 1,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Creation failed' };
      }
    }
    return { success: true };
  },

  async grantStudentSubscription(
    userId: string,
    planId: string,
    durationDays: number
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const startsAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          starts_at: startsAt,
          expires_at: expiresAt,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Grant subscription failed',
        };
      }
    }
    return { success: true };
  },

  async revokeStudentSubscription(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            expires_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'active');
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Revoke subscription failed',
        };
      }
    }
    return { success: true };
  },

  async cancelSubscription(
    subscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            expires_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Cancel subscription failed',
        };
      }
    }
    return { success: true };
  },

  // --------------------------------------------------------------------------
  // COUPONS & DISCOUNTS API
  // --------------------------------------------------------------------------
  async getAdminCoupons(): Promise<CouponItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Failed to fetch coupons from database:', error);
          return localCoupons;
        }

        if (data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            code: d.code,
            description: d.description || undefined,
            discountType: d.discount_type,
            discountValue: Number(d.discount_value),
            maxDiscountAmount: d.max_discount_amount ? Number(d.max_discount_amount) : undefined,
            minOrderAmount: Number(d.min_order_amount || 0),
            maxUses: d.max_uses ? Number(d.max_uses) : undefined,
            usedCount: Number(d.used_count || 0),
            maxUsesPerUser: Number(d.max_uses_per_user || 1),
            applicablePlanId: d.applicable_plan_id || undefined,
            validFrom: d.valid_from,
            validUntil: d.valid_until || undefined,
            isActive: Boolean(d.is_active),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Error loading coupons:', err);
      }
    }
    return localCoupons;
  },

  async createAdminCoupon(
    coupon: Omit<CouponItem, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; coupon?: CouponItem; error?: string }> {
    const normalizedCode = coupon.code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .insert({
            code: normalizedCode,
            description: coupon.description || null,
            discount_type: coupon.discountType,
            discount_value: coupon.discountValue,
            max_discount_amount: coupon.maxDiscountAmount || null,
            min_order_amount: coupon.minOrderAmount || 0,
            max_uses: coupon.maxUses || null,
            max_uses_per_user: coupon.maxUsesPerUser || 1,
            applicable_plan_id: coupon.applicablePlanId || null,
            valid_from: coupon.validFrom || new Date().toISOString(),
            valid_until: coupon.validUntil || null,
            is_active: coupon.isActive ?? true,
          })
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        const newCoupon: CouponItem = {
          id: data.id,
          code: data.code,
          description: data.description || undefined,
          discountType: data.discount_type,
          discountValue: Number(data.discount_value),
          maxDiscountAmount: data.max_discount_amount ? Number(data.max_discount_amount) : undefined,
          minOrderAmount: Number(data.min_order_amount || 0),
          maxUses: data.max_uses ? Number(data.max_uses) : undefined,
          usedCount: Number(data.used_count || 0),
          maxUsesPerUser: Number(data.max_uses_per_user || 1),
          applicablePlanId: data.applicable_plan_id || undefined,
          validFrom: data.valid_from,
          validUntil: data.valid_until || undefined,
          isActive: Boolean(data.is_active),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        return { success: true, coupon: newCoupon };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Create coupon failed' };
      }
    }

    const fallbackCoupon: CouponItem = {
      ...coupon,
      id: 'local_coupon_' + Date.now(),
      code: normalizedCode,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localCoupons.unshift(fallbackCoupon);
    return { success: true, coupon: fallbackCoupon };
  },

  async updateAdminCoupon(
    id: string,
    updates: Partial<CouponItem>
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.code) payload.code = updates.code.trim().toUpperCase();
        if (updates.description !== undefined) payload.description = updates.description || null;
        if (updates.discountType) payload.discount_type = updates.discountType;
        if (updates.discountValue !== undefined) payload.discount_value = updates.discountValue;
        if (updates.maxDiscountAmount !== undefined) payload.max_discount_amount = updates.maxDiscountAmount || null;
        if (updates.minOrderAmount !== undefined) payload.min_order_amount = updates.minOrderAmount;
        if (updates.maxUses !== undefined) payload.max_uses = updates.maxUses || null;
        if (updates.maxUsesPerUser !== undefined) payload.max_uses_per_user = updates.maxUsesPerUser;
        if (updates.applicablePlanId !== undefined) payload.applicable_plan_id = updates.applicablePlanId || null;
        if (updates.validFrom) payload.valid_from = updates.validFrom;
        if (updates.validUntil !== undefined) payload.valid_until = updates.validUntil || null;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        const { error } = await supabase.from('coupons').update(payload).eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Update coupon failed' };
      }
    }

    const idx = localCoupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      localCoupons[idx] = { ...localCoupons[idx], ...updates, updatedAt: new Date().toISOString() };
    }
    return { success: true };
  },

  async deleteAdminCoupon(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Delete coupon failed' };
      }
    }

    const idx = localCoupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      localCoupons.splice(idx, 1);
    }
    return { success: true };
  },

  async validateCoupon(
    code: string,
    planId: string,
    amount: number,
    userId?: string
  ): Promise<CouponValidationResult> {
    const normalizedCode = code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('validate_coupon_code', {
          p_code: normalizedCode,
          p_plan_id: planId,
          p_amount: amount,
          p_user_id: userId || null,
        });

        if (!error && data) {
          return {
            valid: Boolean(data.valid),
            couponId: data.coupon_id,
            code: data.code,
            discountType: data.discount_type,
            discountValue: data.discount_value ? Number(data.discount_value) : undefined,
            discountAmount: Number(data.discount_amount || 0),
            finalPrice: Number(data.final_price ?? amount),
            message: data.message || (data.valid ? 'Coupon applied!' : 'Invalid coupon'),
          };
        }
      } catch (err) {
        console.warn('Coupon validation RPC error, falling back to local evaluation:', err);
      }
    }

    // Local evaluation fallback
    const matched = localCoupons.find((c) => c.code.toUpperCase() === normalizedCode && c.isActive);
    if (!matched) {
      return { valid: false, discountAmount: 0, finalPrice: amount, message: 'Invalid or inactive coupon code.' };
    }

    if (matched.validUntil && new Date(matched.validUntil) < new Date()) {
      return { valid: false, discountAmount: 0, finalPrice: amount, message: 'This coupon code has expired.' };
    }

    if (matched.applicablePlanId && matched.applicablePlanId !== planId) {
      return { valid: false, discountAmount: 0, finalPrice: amount, message: 'This coupon is not valid for the selected plan.' };
    }

    if (amount < matched.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: amount,
        message: `Minimum order value of ₹${matched.minOrderAmount} required for this coupon.`,
      };
    }

    let discount = 0;
    if (matched.discountType === 'percentage') {
      discount = (amount * matched.discountValue) / 100;
      if (matched.maxDiscountAmount && discount > matched.maxDiscountAmount) {
        discount = matched.maxDiscountAmount;
      }
    } else {
      discount = matched.discountValue;
    }

    discount = Math.min(discount, amount);
    const finalPrice = Math.max(0, amount - discount);

    return {
      valid: true,
      couponId: matched.id,
      code: matched.code,
      discountType: matched.discountType,
      discountValue: matched.discountValue,
      discountAmount: Math.round(discount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      message: 'Coupon code applied successfully!',
    };
  },
};
