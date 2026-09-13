import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  AlertTriangle,
  Bookmark,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { MistakeItem, BookmarkItem } from '@/types';

export const Practice: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarks' | 'drills'>('mistakes');
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [mList, bList] = await Promise.all([
          api.getMistakes(user.id),
          api.getBookmarks(user.id),
        ]);
        setMistakes(mList);
        setBookmarks(bList);
      } catch (err) {
        console.error('Failed to load practice items:', err);
      }
    }
    loadData();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleResolveMistake = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isResolved: !m.isResolved } : m))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Practice & Revision
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Smart revision engine: Revise incorrect questions and bookmarked problems
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'mistakes'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Mistakes Notebook</span>
          <span className="ml-1 text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            {mistakes.filter((m) => !m.isResolved).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-blue-500" />
          <span>Bookmarks</span>
          <span className="ml-1 text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {bookmarks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('drills')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'drills'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Quick Revision Drills</span>
        </button>
      </div>

      {/* TAB 1: MISTAKES NOTEBOOK */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Automated Mistakes Notebook:</span> Questions answered incorrectly in any mock test are automatically added here. Review the detailed explanation and mark them resolved once understood.
            </div>
          </div>

          {mistakes.length === 0 ? (
            <EmptyState
              title="No mistakes recorded"
              description="Great job! You haven't made any mistakes yet, or all your mistakes have been resolved."
            />
          ) : (
            <div className="space-y-3">
              {mistakes.map((item, idx) => {
                const q = item.question;
                const isExpanded = expandedId === item.id;

                return (
                  <Card
                    key={item.id}
                    className={`p-5 transition-all border ${
                      item.isResolved ? 'opacity-70 bg-slate-50/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">
                            Question #{idx + 1}
                          </span>
                          <Badge variant="warning" size="sm">
                            Wrong {item.wrongCount}x
                          </Badge>
                          {item.isResolved && (
                            <Badge variant="success" size="sm">
                              Resolved
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 pt-1">
                          {q.questionText}
                        </h3>
                        {q.questionBengaliText && (
                          <p className="text-xs text-slate-600 font-medium font-sans">
                            {q.questionBengaliText}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Expandable Options & Explanation */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                            const optKey = `option${opt}` as keyof typeof q;
                            const isCorrect = q.correctOption === opt;
                            return (
                              <div
                                key={opt}
                                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center font-bold text-[10px]">
                                  {opt}
                                </span>
                                <span>{String(q[optKey])}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs text-indigo-950 space-y-1">
                          <p className="font-bold text-[11px] text-brand-700 uppercase">
                            Explanation / ব্যাখ্যা:
                          </p>
                          <p>{q.explanation}</p>
                          {q.explanationBengali && (
                            <p className="text-slate-600 pt-1">{q.explanationBengali}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant={item.isResolved ? 'outline' : 'primary'}
                            onClick={() => handleResolveMistake(item.id)}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            {item.isResolved ? 'Mark as Unresolved' : 'Mark as Understood & Resolved'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKMARKED QUESTIONS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <EmptyState
              title="No bookmarks saved"
              description="While taking mock tests, tap the bookmark icon to save important questions for quick revision."
            />
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bm, idx) => {
                const q = bm.question;
                return (
                  <Card key={bm.id} className="p-5 border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="info" size="sm">
                          Bookmark #{idx + 1}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {new Date(bm.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {q.questionText}
                      </h3>
                      {q.questionBengaliText && (
                        <p className="text-xs text-slate-600 font-medium">
                          {q.questionBengaliText}
                        </p>
                      )}

                      {bm.note && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900">
                          <span className="font-bold">Student Note:</span> {bm.note}
                        </div>
                      )}

                      <div className="pt-2">
                        <p className="text-xs font-semibold text-emerald-700">
                          Correct Answer: Option {q.correctOption}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REVISION DRILLS */}
      {activeTab === 'drills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3 border-slate-200">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl w-fit">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              High-Yield Mistakes Drill
            </h3>
            <p className="text-xs text-slate-500">
              Re-attempt 10 randomized questions that you have previously answered incorrectly across all mock tests.
            </p>
            <Button
              className="mt-2"
              size="sm"
              onClick={() => alert('Starting High-Yield Mistakes Drill (Phase 2).')}
            >
              Start Drill (10 Questions)
            </Button>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Bookmarked Questions Revision
            </h3>
            <p className="text-xs text-slate-500">
              Practice all your saved and flagged questions in rapid test mode with instant solutions.
            </p>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              onClick={() => alert('Starting Bookmarks Revision (Phase 2).')}
            >
              Start Revision Drill
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
