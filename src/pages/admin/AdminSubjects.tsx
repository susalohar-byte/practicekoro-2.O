import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { Subject } from '@/types';

export const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    api.getSubjects('wbp-constable').then(setSubjects);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Subjects (Syllabus Areas)
          </h2>
          <p className="text-xs text-slate-400">Subjects linked to WBP Constable</p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('New Subject Creation Modal (Phase 2).')}
        >
          Add Subject
        </Button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Subject Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Exam</th>
              <th className="p-4">Order</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">{sub.name}</td>
                <td className="p-4 font-mono text-slate-400">{sub.slug}</td>
                <td className="p-4 text-emerald-400">{sub.examId}</td>
                <td className="p-4 font-bold">#{sub.orderIndex}</td>
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
