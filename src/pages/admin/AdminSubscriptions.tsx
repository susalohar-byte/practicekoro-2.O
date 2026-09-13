import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { CreditCard } from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

export const AdminSubscriptions: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    api.getSubscriptionPlans().then(setPlans);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-400" />
            Subscription Plans & Monetization ({plans.length})
          </h2>
          <p className="text-xs text-slate-400">
            Rule: 1 Active Subscription = Universal Access to ALL Premium Mock Tests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{p.title}</span>
              <span className="text-base font-black text-amber-400">₹{p.price}</span>
            </div>
            <p className="text-xs text-slate-400">{p.description}</p>
            <div className="text-[11px] text-slate-500 font-mono">
              Validity: {p.durationDays} Days • ID: {p.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
