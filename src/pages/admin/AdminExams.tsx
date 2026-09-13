import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Shield, Plus } from 'lucide-react';
import type { Exam } from '@/types';

export const AdminExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    api.getExams().then(setExams);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Competitive Exams ({exams.length})
          </h2>
          <p className="text-xs text-slate-400">Manage target government examinations</p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('New Exam Creation Modal (Phase 2).')}
        >
          Add New Exam
        </Button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Exam Title</th>
              <th className="p-4">Identifier / Slug</th>
              <th className="p-4">Category</th>
              <th className="p-4">Order</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">{exam.title}</td>
                <td className="p-4 font-mono text-slate-400">{exam.id}</td>
                <td className="p-4">{exam.category}</td>
                <td className="p-4 font-bold text-indigo-400">#{exam.orderIndex}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                    Edit
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
