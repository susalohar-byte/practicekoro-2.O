import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { SubscriptionPlan } from '@/types';

export function useSubscription() {
  const { user, isPro } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await api.getSubscriptionPlans();
        setPlans(data);
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const hasAccessToTest = (isPremiumTest: boolean): boolean => {
    if (!isPremiumTest) return true; // Free test is accessible to everyone
    if (user?.role === 'admin') return true; // Admin has universal access
    return isPro; // Premium tests require active subscription
  };

  return {
    plans,
    isPro: isPro || user?.role === 'admin',
    hasAccessToTest,
    loading,
  };
}
