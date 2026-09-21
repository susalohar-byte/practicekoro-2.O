import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, Play, Search, Trash2, BookOpen, Target, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { BookmarkItem } from '@/types';

export const SavedQuestions: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setItems(await api.getBookmarks(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const subjects = useMemo(() => {
    const values = Array.from(new Set(items.map((x) => x.subjectName).filter(Boolean))) as string[];
    return ['all', ...values];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSubject = subject === 'all' || item.subjectName === subject;
      const text = item.question.questionText.toLowerCase();
      return matchesSubject && (!q || text.includes(q) || (item.examTitle || '').toLowerCase().includes(q));
    });
  }, [items, query, subject]);

  const remove = async (item: BookmarkItem) => {
    if (!user) return;
    await api.toggleBookmark(user.id, item.questionId);
    setItems((current) => current.filter((x) => x.id !== item.id));
  };

  return (
    <div className="pk-student-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="pk-content space-y-6">
        <section className="pk-panel overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#eff5fb] via-white to-[#d9e7fd]/50 px-6 py-7 sm:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0158fc]">Revision Library</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black">Saved Questions</h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
                Keep important questions in one place and return to them whenever you revise.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#d9e7fd] bg-white px-3 py-1.5 text-xs font-bold text-[#063585]">
                  {items.length} saved
                </span>
                <span className="rounded-full border border-[#d9e7fd] bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                  Focused revision
                </span>
              </div>
            </div>
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#0198fd]/10 blur-2xl" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="pk-stat p-5">
            <div className="flex items-center gap-3"><Bookmark className="h-5 w-5 text-[#0158fc]" /><span className="text-xs font-bold text-slate-500">Questions Saved</span></div>
            <p className="mt-3 text-2xl font-black text-[#063585]">{items.length}</p>
          </div>
          <div className="pk-stat p-5">
            <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-emerald-500" /><span className="text-xs font-bold text-slate-500">Subjects</span></div>
            <p className="mt-3 text-2xl font-black text-[#063585]">{Math.max(subjects.length - 1, 0)}</p>
          </div>
          <div className="pk-stat p-5">
            <div className="flex items-center gap-3"><Target className="h-5 w-5 text-violet-500" /><span className="text-xs font-bold text-slate-500">Revision Ready</span></div>
            <p className="mt-3 text-2xl font-black text-[#063585]">{filtered.length}</p>
          </div>
        </section>

        <section className="pk-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="pk-search flex min-w-0 items-center gap-2 rounded-2xl px-4 py-3 lg:max-w-md lg:flex-1">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search saved questions..."
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {subjects.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSubject(value)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${subject === value ? 'pk-chip-active' : 'border-slate-200 bg-white text-slate-600 hover:border-[#d9e7fd] hover:bg-[#eff5fb]'}`}
                >
                  {value === 'all' ? `All (${items.length})` : value}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="pk-panel flex items-center justify-center py-20 text-sm font-semibold text-slate-500">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading saved questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="pk-panel px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff5fb] text-[#0158fc]"><Bookmark className="h-7 w-7" /></div>
            <h2 className="mt-5 text-xl font-black text-[#063585]">No saved questions yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Bookmark questions while practicing and they will appear here for focused revision.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, index) => (
              <article key={item.id} className="pk-panel p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5fb] text-sm font-black text-[#0158fc] sm:flex">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.subjectName && <span className="rounded-full bg-[#eff5fb] px-2.5 py-1 text-[11px] font-bold text-[#063585]">{item.subjectName}</span>}
                      {item.examTitle && <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{item.examTitle}</span>}
                      {item.question.difficulty && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold capitalize text-amber-700">{item.question.difficulty}</span>}
                    </div>
                    <h3 className="mt-3 text-base font-extrabold leading-7 text-[#0b1f44]">{item.question.questionText}</h3>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {[
                        ['A', item.question.optionA],
                        ['B', item.question.optionB],
                        ['C', item.question.optionC],
                        ['D', item.question.optionD],
                      ].map(([letter, value]) => (
                        <div key={letter} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-600">
                          <span className="mr-2 font-black text-[#0158fc]">{letter}.</span>{value}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Answer: {item.question.correctOption}</span>
                      <span className="text-xs text-slate-400">Saved {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button type="button" onClick={() => window.location.assign('/practice?tab=bookmarks')} className="inline-flex items-center gap-1.5 rounded-xl bg-[#0158fc] px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#0062fd]">
                      <Play className="h-3.5 w-3.5" /> Practice
                    </button>
                    <button type="button" onClick={() => remove(item)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
