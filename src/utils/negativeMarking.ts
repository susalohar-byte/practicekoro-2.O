/**
 * Test-level negative marking policy.
 *
 * - Negative marking is configured ONLY at the test level, at test creation
 *   time, and ONLY for Full Mock tests and PYQ papers.
 * - It is OPTIONAL: a test may carry 0 (no negative marking), because some
 *   exams have no negative marking scheme.
 * - Questions NEVER carry negative marks: no negative-marks field exists at
 *   question upload / question-bank / per-question assignment level.
 * - Scoring (server RPC + local fallback) must resolve the effective value
 *   through `resolveTestNegativeMarking`, never from question-level data.
 */

export const NEGATIVE_MARKING_TEST_TYPES = ['full_mock', 'pyq'] as const;

export type NegativeMarkingTestType = (typeof NEGATIVE_MARKING_TEST_TYPES)[number];

/** True when this test type supports an (optional) negative marking scheme. */
export function supportsNegativeMarking(testType: string | undefined | null): boolean {
  return (
    testType === 'full_mock' || testType === 'pyq'
  );
}

/**
 * Resolve the effective negative marks deducted per wrong answer for a test.
 * Returns 0 when the test type does not support negative marking or when the
 * admin left it unset (optional scheme).
 */
export function resolveTestNegativeMarking(
  testType: string | undefined | null,
  negativeMarking: number | null | undefined
): number {
  if (!supportsNegativeMarking(testType)) return 0;
  const value = Number(negativeMarking);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value;
}
