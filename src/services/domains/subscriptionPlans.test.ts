import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {},
  supabaseRuntime: {},
}));

import { api } from '@/services/api';
import { MOCK_SUBSCRIPTION_PLANS } from '@/services/mockData';
import type { SubscriptionPlan } from '@/types';

describe('Subscription Plans Management & Deletion System', () => {
  beforeEach(() => {
    // Reset or ensure known test plan in mock
    const existing = MOCK_SUBSCRIPTION_PLANS.find((p) => p.id === 'test_temp_plan');
    if (!existing) {
      MOCK_SUBSCRIPTION_PLANS.push({
        id: 'test_temp_plan',
        title: 'Temporary Test Plan',
        price: 99,
        durationDays: 14,
        features: ['Mock test access'],
        currency: 'INR',
        isActive: true,
        orderIndex: 99,
      });
    }
  });

  it('prevents deletion of core free system tier (plan_free)', async () => {
    const result = await api.deleteSubscriptionPlan('plan_free');
    expect(result.success).toBe(false);
    expect(result.error).toContain('core system tier');
  });

  it('allows fetching only active plans or including archived/inactive plans', async () => {
    // Add an inactive plan
    const inactivePlan: SubscriptionPlan = {
      id: 'test_inactive_plan',
      title: 'Inactive Archived Plan',
      price: 149,
      durationDays: 30,
      features: ['Archived access'],
      currency: 'INR',
      isActive: false,
      orderIndex: 100,
    };
    await api.createSubscriptionPlan(inactivePlan);

    // Active-only fetch
    const activePlans = await api.getSubscriptionPlans(false);
    expect(activePlans.some((p) => p.id === 'test_inactive_plan')).toBe(false);

    // Admin fetch including inactive plans
    const allPlans = await api.getSubscriptionPlans(true);
    expect(allPlans.some((p) => p.id === 'test_inactive_plan')).toBe(true);

    // Cleanup
    await api.deleteSubscriptionPlan('test_inactive_plan');
  });

  it('safely deletes an unused plan', async () => {
    const planId = `plan_temp_${Date.now()}`;
    const newPlan: SubscriptionPlan = {
      id: planId,
      title: 'Deletable Plan',
      price: 249,
      durationDays: 45,
      features: ['Testing delete'],
      currency: 'INR',
      isActive: true,
      orderIndex: 50,
    };

    const createRes = await api.createSubscriptionPlan(newPlan);
    expect(createRes.success).toBe(true);

    // Confirm it exists
    let all = await api.getSubscriptionPlans(true);
    expect(all.some((p) => p.id === planId)).toBe(true);

    // Delete it
    const delRes = await api.deleteSubscriptionPlan(planId);
    expect(delRes.success).toBe(true);

    // Confirm it was removed
    all = await api.getSubscriptionPlans(true);
    expect(all.some((p) => p.id === planId)).toBe(false);
  });
});
