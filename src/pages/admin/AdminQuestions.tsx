import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { FileQuestion, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { Question } from '@/types';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    api.getTestQuestions('test-indus-01').then(setQuestions);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-purple-400" />
            Centralized Question Bank ({questions.length})
          </h2>
          <p className="text-xs text-slate-400">Questions linked to Indus Valley Civilization chapter</p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('New Question Form (Phase 2).')}
        >
          Add Question
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-400">
                Question #{idx + 1} • {q.difficulty.toUpperCase()} • +{q.defaultMarks} / -{q.defaultNegativeMarks}
              </span>
              <span className="text-[11px] font-bold text-emerald-400">
                Correct: Option {q.correctOption}
              </span>
            </div>

            <p className="font-bold text-white text-sm">{q.questionText}</p>
            {q.questionBengaliText && (
              <p className="text-slate-300 font-medium">{q.questionBengaliText}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <span className={q.correctOption === 'A' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                A: {q.optionA}
              </span>
              <span className={q.correctOption === 'B' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                B: {q.optionB}
              </span>
              <span className={q.correctOption === 'C' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                C: {q.optionC}
              </span>
              <span className={q.correctOption === 'D' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                D: {q.optionD}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
