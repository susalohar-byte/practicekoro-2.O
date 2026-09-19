import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {},
  supabaseRuntime: {},
}));

import { api } from '@/services/api';

describe('Platform Analytics & Reports System (Overview, Ranks, Question Insights, Revenue)', () => {
  it('loads comprehensive platform analytics overview with all 3 core sections', async () => {
    const data = await api.getPlatformAnalyticsOverview('this_month');

    // Section 1: Student Performance
    expect(data.studentPerformance).toBeDefined();
    expect(typeof data.studentPerformance.totalStudents).toBe('number');
    expect(typeof data.studentPerformance.activeStudents).toBe('number');
    expect(typeof data.studentPerformance.testsAttempted).toBe('number');
    expect(typeof data.studentPerformance.questionsAnswered).toBe('number');
    expect(typeof data.studentPerformance.overallAccuracy).toBe('number');
    expect(data.studentPerformance.overallAccuracy).toBeGreaterThanOrEqual(0);
    expect(data.studentPerformance.overallAccuracy).toBeLessThanOrEqual(100);
    expect(Array.isArray(data.studentPerformance.performanceTrend)).toBe(true);

    // Section 2: Student Leaderboard / Rankings
    expect(Array.isArray(data.studentRankings)).toBe(true);
    expect(data.studentRankings.length).toBeGreaterThan(0);

    const firstStudent = data.studentRankings[0];
    expect(firstStudent.rank).toBe(1);
    expect(firstStudent.name).toBeDefined();
    expect(firstStudent.email).toBeDefined();
    expect(typeof firstStudent.totalTests).toBe('number');
    expect(typeof firstStudent.questionsAttempted).toBe('number');
    expect(typeof firstStudent.accuracy).toBe('number');
    expect(typeof firstStudent.totalScore).toBe('number');

    // Section 3: Question & Topic Insights
    expect(data.questionInsights).toBeDefined();
    expect(Array.isArray(data.questionInsights.mostWrongQuestions)).toBe(true);
    expect(Array.isArray(data.questionInsights.weakestTopics)).toBe(true);
    expect(Array.isArray(data.questionInsights.weakestSubjects)).toBe(true);

    // Section 4: Revenue
    expect(data.revenue).toBeDefined();
    expect(typeof data.revenue.totalRevenue).toBe('number');
    expect(typeof data.revenue.monthlyRevenue).toBe('number');
    expect(typeof data.revenue.paidStudents).toBe('number');
    expect(typeof data.revenue.activeSubscriptions).toBe('number');
    expect(Array.isArray(data.revenue.revenueTrend)).toBe(true);
  });

  it('correctly ranks students in descending order of total score and accuracy', async () => {
    const data = await api.getPlatformAnalyticsOverview();
    const rankings = data.studentRankings;

    for (let i = 0; i < rankings.length - 1; i++) {
      const curr = rankings[i];
      const next = rankings[i + 1];

      expect(curr.rank).toBe(i + 1);
      expect(next.rank).toBe(i + 2);

      // Current rank score must be greater than or equal to next
      if (curr.totalScore === next.totalScore) {
        expect(curr.accuracy).toBeGreaterThanOrEqual(next.accuracy);
      } else {
        expect(curr.totalScore).toBeGreaterThanOrEqual(next.totalScore);
      }
    }
  });

  it('supports custom date ranges without crashing', async () => {
    const data = await api.getPlatformAnalyticsOverview('custom', '2026-09-01', '2026-09-18');
    expect(data.revenue).toBeDefined();
    expect(data.studentPerformance).toBeDefined();
  });
});
