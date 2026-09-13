import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Crown,
  CheckCircle2,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isPro, logout } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const { plans } = useSubscription();

  const [proActiveState, setProActiveState] = useState(isPro);

  const toggleProSimulated = () => {
    const nextState = !proActiveState;
    setProActiveState(nextState);
    localStorage.setItem('practicekoro_is_pro', nextState ? 'true' : 'false');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-2xl border-2 border-brand-200">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {user?.fullName || 'Student Aspirant'}
                </h1>
                {isPro ? (
                  <Badge variant="premium" className="gap-1">
                    <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    PRO PASS ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="default">FREE TIER</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                  Target Exam: {selectedExam?.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-rose-500" />}
              className="text-rose-600 hover:text-rose-700"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* SUBSCRIPTION & MONETIZATION SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              PracticeKoro Pro Subscription
            </h2>
            <p className="text-xs text-slate-500">
              Rule: One active subscription gives you unlimited access to ALL Premium Mock Tests
            </p>
          </div>
          <button
            onClick={toggleProSimulated}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 underline"
          >
            [Dev: Toggle Pro Status]
          </button>
        </div>

        {isPro ? (
          <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  ACTIVE MEMBERSHIP
                </div>
                <h3 className="text-xl font-black pt-1">
                  1-Year All-Access Pass
                </h3>
                <p className="text-xs text-amber-100">
                  Expires in 348 days • All premium mock tests and solution analysis unlocked
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center sm:text-right">
                <p className="text-xs uppercase font-bold text-amber-200">Subscription Status</p>
                <p className="text-lg font-black text-white">Full Access</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 border-slate-200 flex flex-col justify-between relative overflow-hidden"
              >
                {plan.id === 'pro_1_year' && (
                  <div className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{plan.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                  <div className="my-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-emerald-600">
                      /{plan.durationDays} days
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3">
                  <Button
                    variant={plan.id === 'pro_1_year' ? 'pro' : 'primary'}
                    className="w-full font-bold text-xs"
                    onClick={toggleProSimulated}
                    leftIcon={<Zap className="w-3.5 h-3.5" />}
                  >
                    Activate {plan.title}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Target Exam Preference */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Exam Preference
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch your primary examination to tailor subjects and chapter mock tests
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exams.map((exam) => {
            const isSelected = selectedExam?.id === exam.id;
            return (
              <button
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                className={`p-3.5 rounded-xl text-left border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{exam.title}</p>
                  <p className="text-[11px] text-slate-500">{exam.category}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
