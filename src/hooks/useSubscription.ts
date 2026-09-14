import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { SubscriptionPlan, StudentSubscriptionDetails } from '@/types';

export function useSubscription() {
  const { user, isPro } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<StudentSubscriptionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getStudentSubscriptionDetails(),
      ]);
      setPlans(plansData);
      setSubscriptionDetails(subData);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, user]);

  const activePro = isPro || subscriptionDetails?.isActive || user?.role === 'admin';

  const hasAccessToTest = (isPremiumTest: boolean): boolean => {
    if (!isPremiumTest) return true; // Free test is accessible to everyone
    if (user?.role === 'admin') return true; // Admin has universal access
    return !!activePro; // Premium tests require active subscription
  };

  return {
    plans,
    subscriptionDetails,
    isPro: !!activePro,
    hasAccessToTest,
    loading,
    refreshSubscription: loadData,
  };
}
