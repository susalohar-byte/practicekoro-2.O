import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, Crown, Layers3, ListChecks, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useExam } from '@/context/ExamContext';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import type { Chapter, MockTest, Subject } from '@/types';

export const TopicTests: React.FC = () => {
  const navigate = useNavigate();
  const { selectedExam } = useExam();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSubjects = async () => {
      if (!selectedExam) {
        setSubjects([]);
        setSelectedSubjectId('');
        return;
      }

      setLoadingSubjects(true);
      setSelectedSubjectId('');
      setSelectedTopicId('');
      setTopics([]);
      setTests([]);

      try {
        const result = await api.getSubjects(selectedExam.id);
        if (!active) return;
        setSubjects(result);
        setSelectedSubjectId(result[0]?.id ?? '');
      } finally {
        if (active) setLoadingSubjects(false);
      }
    };

    loadSubjects();
    return () => {
      active = false;
    };
  }, [selectedExam]);

  useEffect(() => {
    let active = true;

    const loadTopics = async () => {
      if (!selectedSubjectId) {
        setTopics([]);
        setSelectedTopicId('');
        return;
      }

      setLoadingTopics(true);
      setSelectedTopicId('');
      setTests([]);

      try {
        const result = await api.getChapters(selectedSubjectId);
        if (!active) return;
        setTopics(result);
        setSelectedTopicId(result[0]?.id ?? '');
      } finally {
        if (active) setLoadingTopics(false);
      }
    };

    loadTopics();
    return () => {
      active = false;
    };
  }, [selectedSubjectId]);

  useEffect(() => {
    let active = true;

    const loadTests = async () => {
      if (!selectedTopicId || !selectedExam) {
        setTests([]);
        return;
      }

      setLoadingTests(true);
      try {
        const result = await api.getTests(selectedTopicId, selectedExam.id);
        if (active) setTests(result);
      } finally {
        if (active) setLoadingTests(false);
      }
    };

    loadTests();
    return () => {
      active = false;
    };
  }, [selectedTopicId, selectedExam]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-indigo-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-600 p-2.5 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Topic-wise Practice Tests</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Select a subject, choose a topic, and start a focused test for{' '}
              {selectedExam?.title ?? 'your exam'}.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-3" aria-labelledby="subject-heading">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
            1
          </span>
          <h3 id="subject-heading" className="text-sm font-black text-slate-900">
            Select Subject
          </h3>
        </div>

        {loadingSubjects ? (
          <LoadingRow label="Loading subjects" />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No subjects available"
            description="No active subjects are available for the selected exam yet."
          />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {subjects.map((subject) => {
              const selected = subject.id === selectedSubjectId;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  aria-pressed={selected}
                  className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    selected
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  <span className="block text-sm font-bold">{subject.name}</span>
                  {subject.chaptersCount !== undefined && (
                    <span
                      className={`mt-0.5 block text-[11px] ${selected ? 'text-brand-100' : 'text-slate-400'}`}
                    >
                      {subject.chaptersCount} topics
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedSubjectId && (
        <section className="space-y-3" aria-labelledby="topic-heading">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
              2
            </span>
            <div>
              <h3 id="topic-heading" className="text-sm font-black text-slate-900">
                Select Topic
              </h3>
              <p className="text-[11px] text-slate-500">Topics from {selectedSubject?.name}</p>
            </div>
          </div>

          {loadingTopics ? (
            <LoadingRow label="Loading topics" />
          ) : topics.length === 0 ? (
            <EmptyState
              title="No topics available"
              description="Topics have not been added to this subject yet."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, index) => {
                const selected = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    aria-pressed={selected}
                    className={`rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                      selected
                        ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`rounded-lg p-2 ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                      >
                        <Layers3 className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        Topic {index + 1}
                      </span>
                    </div>
                    <h4 className="mt-3 text-sm font-bold leading-5 text-slate-900">
                      {topic.name}
                    </h4>
                    {topic.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {topic.description}
                      </p>
                    )}
                    {topic.testsCount !== undefined && (
                      <p className="mt-2 text-[11px] font-semibold text-brand-600">
                        {topic.testsCount} tests available
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {selectedTopicId && (
        <section className="space-y-3" aria-labelledby="test-heading">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
              3
            </span>
            <div>
              <h3 id="test-heading" className="text-sm font-black text-slate-900">
                Available Tests
              </h3>
              <p className="text-[11px] text-slate-500">Tests for {selectedTopic?.name}</p>
            </div>
          </div>

          {loadingTests ? (
            <LoadingRow label="Loading tests" />
          ) : tests.length === 0 ? (
            <EmptyState
              title="No tests available"
              description="No published tests are available for this topic yet."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {tests.map((test) => (
                <Card key={test.id} className="p-4 sm:p-5">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant={test.isPremium ? 'warning' : 'success'} size="sm">
                            {test.isPremium ? 'PRO TEST' : 'FREE TEST'}
                          </Badge>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Topic Test
                          </span>
                        </div>
                        <h4 className="text-sm font-black leading-5 text-slate-900 sm:text-base">
                          {test.title}
                        </h4>
                        {test.description && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {test.description}
                          </p>
                        )}
                      </div>
                      {test.isPremium && <Crown className="h-5 w-5 shrink-0 text-amber-500" />}
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        {test.totalQuestions} Questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {test.durationMinutes} Minutes
                      </span>
                      <span>{test.totalMarks} Marks</span>
                    </div>

                    <Button
                      className="w-full sm:w-fit"
                      size="sm"
                      variant={test.isPremium ? 'pro' : 'primary'}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      onClick={() => navigate(`/exams/${test.id}`)}
                    >
                      View Test
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const LoadingRow: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-sm font-medium text-slate-500">
    <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
    {label}...
  </div>
);
