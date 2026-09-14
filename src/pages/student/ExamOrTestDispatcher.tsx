import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { ExamDetail } from '@/pages/student/ExamDetail';
import { TestDetails } from '@/pages/student/TestDetails';

export const ExamOrTestDispatcher: React.FC = () => {
  const { id, testId } = useParams<{ id?: string; testId?: string }>();
  const effectiveId = id || testId || '';
  const { exams, loading: examsLoading } = useExam();
  const [isExam, setIsExam] = useState<boolean | null>(null);

  useEffect(() => {
    if (!effectiveId) {
      setIsExam(false);
      return;
    }

    // Check if id matches an existing exam id or slug
    const matched = exams.some((e) => e.id === effectiveId || e.slug === effectiveId);
    if (matched) {
      setIsExam(true);
      return;
    }

    // Common exam slugs check
    const knownExamPrefixes = ['wbp-constable', 'kp-police-si', 'wbcs-prelims', 'wbpsc-clerkship'];
    if (knownExamPrefixes.includes(effectiveId)) {
      setIsExam(true);
      return;
    }

    // If exams are still loading, wait before assuming test
    if (examsLoading) {
      return;
    }

    // Known test pattern (e.g. test-indus-01, test-wbp-full-01, test-...)
    if (effectiveId.startsWith('test-')) {
      setIsExam(false);
      return;
    }

    // Default to test details
    setIsExam(false);
  }, [effectiveId, exams, examsLoading]);

  if (isExam === null && examsLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return isExam ? <ExamDetail /> : <TestDetails />;
};
