import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Layers, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { MockTest } from '@/types';

export const AdminTests: React.FC = () => {
  const [tests, setTests] = useState<MockTest[]>([]);

  useEffect(() => {
    api.getTests('wbp-hist-indus', 'wbp-constable').then(setTests);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Mock Tests Management ({tests.length})
          </h2>
          <p className="text-xs text-slate-400">Tests under Indus Valley Civilization</p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('Create Mock Test Wizard (Phase 2).')}
        >
          Create Mock Test
        </Button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Test Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Access Tier</th>
              <th className="p-4">Time</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Marks</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tests.map((test) => (
              <tr key={test.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">{test.title}</td>
                <td className="p-4 capitalize text-slate-400">{test.testType.replace('_', ' ')}</td>
                <td className="p-4">
                  {test.isPremium ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="w-3 h-3" /> PRO PASS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      FREE
                    </span>
                  )}
                </td>
                <td className="p-4">{test.durationMinutes}m</td>
                <td className="p-4 font-bold text-indigo-400">{test.totalQuestions}</td>
                <td className="p-4 font-bold">{test.totalMarks}</td>
                <td className="p-4 text-right">
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
