import { describe, it, expect } from 'vitest';
import {
  parseQuestionsTxt,
  SAMPLE_TXT_CONTENT,
  normalizeBengaliNumerals,
} from './txtQuestionParser';

describe('txtQuestionParser', () => {
  it('correctly normalizes Bengali numerals', () => {
    expect(normalizeBengaliNumerals('১২৩৪৫')).toBe('12345');
    expect(normalizeBengaliNumerals('০৬৭৮৯')).toBe('06789');
  });

  it('parses the sample Bengali TXT content with 100% validity', () => {
    const result = parseQuestionsTxt(SAMPLE_TXT_CONTENT);
    expect(result.totalDetected).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toHaveLength(2);

    const q1 = result.valid[0];
    expect(q1.questionNumber).toBe(1);
    expect(q1.questionText).toContain('ভারতের প্রথম রাষ্ট্রপতি কে ছিলেন?');
    expect(q1.optionA).toBe('ড. রাজেন্দ্র প্রসাদ');
    expect(q1.optionB).toBe('জওহরলাল নেহরু');
    expect(q1.optionC).toBe('সর্বপল্লী রাধাকৃষ্ণন');
    expect(q1.optionD).toBe('ড. বি. আর. আম্বেদকর');
    expect(q1.correctOption).toBe('A');
    expect(q1.explanation).toContain('ড. রাজেন্দ্র প্রসাদ ছিলেন স্বাধীন ভারতের প্রথম রাষ্ট্রপতি।');

    const q2 = result.valid[1];
    expect(q2.questionNumber).toBe(2);
    expect(q2.questionText).toContain('মানবদেহের বৃহত্তম অঙ্গ কোনটি?');
    expect(q2.optionB).toBe('ত্বক (Skin)');
    expect(q2.correctOption).toBe('B');
  });

  it('parses English questions with bullet point explanations', () => {
    const englishSample = `1. What is the capital of West Bengal?
(a) Siliguri
(b) Kolkata
(c) Asansol
(d) Durgapur

Answer: (b) Kolkata

Explanation:
- Kolkata is the capital city of West Bengal.
- It is located on the eastern bank of the Hooghly River.`;

    const result = parseQuestionsTxt(englishSample);
    expect(result.totalDetected).toBe(1);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const q = result.valid[0];
    expect(q.correctOption).toBe('B');
    expect(q.optionA).toBe('Siliguri');
    expect(q.optionB).toBe('Kolkata');
    expect(q.explanation).toContain('Kolkata is the capital city of West Bengal.');
  });

  it('detects errors when a question has only 3 options', () => {
    const incompleteSample = `1. Incomplete question
(a) Option A
(b) Option B
(c) Option C

সঠিক উত্তর: (a) Option A`;

    const result = parseQuestionsTxt(incompleteSample);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason).toContain('Missing: (d)');
  });

  it('detects errors when correct answer is missing', () => {
    const missingAnswerSample = `1. Question without answer
(a) Option A
(b) Option B
(c) Option C
(d) Option D

Explanation:
Some explanation`;

    const result = parseQuestionsTxt(missingAnswerSample);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason).toContain('Missing or undetectable correct answer');
  });

  it('handles Bengali numerals in question numbering with uppercase options', () => {
    const sample = `১. পশ্চিমবঙ্গের জাতীয় পশু কোনটি?
(A) বাঘ
(B) মেছো বিড়াল
(C) হাতি
(D) গণ্ডার

সঠিক উত্তর: (B) মেছো বিড়াল

ব্যাখ্যা:
- পশ্চিমবঙ্গের রাজ্য পশু হলো মেছো বিড়াল (Fishing Cat)।
- এটি মেছো বাঘ নামেও পরিচিত।`;

    const result = parseQuestionsTxt(sample);
    expect(result.totalDetected).toBe(1);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].questionNumber).toBe(1);
    expect(result.valid[0].correctOption).toBe('B');
    expect(result.valid[0].explanation).toContain('Fishing Cat');
  });

  it('handles empty or whitespace-only inputs gracefully', () => {
    const result = parseQuestionsTxt('   \n\n  ');
    expect(result.totalDetected).toBe(0);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
