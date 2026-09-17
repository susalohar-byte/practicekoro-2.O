import { describe, it, expect } from 'vitest';
import {
  isMathematicsSubject,
  isMathematicsQuestion,
  validateShortNotes,
  normalizeShortNotes,
  getAiQuestionGenerationPrompt,
} from './shortNotes';

describe('isMathematicsSubject & isMathematicsQuestion', () => {
  it('detects mathematics from various subject and context keywords', () => {
    expect(isMathematicsSubject('Elementary Mathematics (পাটিগণিত)')).toBe(true);
    expect(isMathematicsSubject({ name: 'Mathematics', slug: 'math', id: 'wbp-math' })).toBe(true);
    expect(isMathematicsSubject('পাটিগণিত')).toBe(true);
    expect(isMathematicsSubject('General Science', { chapterName: 'Algebra & Arithmetic' })).toBe(
      true
    );
    expect(isMathematicsQuestion({ subjectName: 'Mathematics' })).toBe(true);
    expect(isMathematicsQuestion({ subjectId: 'wbp-math' })).toBe(true);
  });

  it('correctly identifies non-mathematics subjects', () => {
    expect(isMathematicsSubject('Indian History (ভারত ও বাংলার ইতিহাস)')).toBe(false);
    expect(isMathematicsSubject('General Science (সাধারণ বিজ্ঞান)')).toBe(false);
    expect(isMathematicsSubject('Geography of West Bengal')).toBe(false);
    expect(
      isMathematicsQuestion({ subjectName: 'Indian History', chapterName: 'Indus Valley' })
    ).toBe(false);
  });
});

describe('validateShortNotes', () => {
  const validBengaliShortNotes = `• হরপ্পা প্রত্নক্ষেত্রটি ১৯২১ সালে দয়ারাম সাহনি আবিষ্কার করেন।
• এটি বর্তমান পাকিস্তানের পাঞ্জাব প্রদেশের শাহিওয়াল জেলায় ইরাবতী নদীর তীরে অবস্থিত।
• সিন্ধু সভ্যতার আবিষ্কৃত প্রথম শহর হওয়ায় সমগ্র সভ্যতাকে হরপ্পা সভ্যতা বলা হয়।
• এখান থেকে একটি বিশাল শস্যভাণ্ডার ও তামা গলানোর চুল্লি আবিষ্কৃত হয়েছে।
• লোথাল গুজরাটে অবস্থিত এবং বিশ্বের প্রাচীনতম সামুদ্রিক ডকইয়ার্ডের জন্য খ্যাত।`;

  it('accepts valid 4-5 bullet Short Notes starting with •', () => {
    const errors = validateShortNotes(validBengaliShortNotes, false);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-math short notes with fewer than 4 bullets', () => {
    const tooFew = `• পয়েন্ট এক\n• পয়েন্ট দুই\n• পয়েন্ট তিন`;
    const errors = validateShortNotes(tooFew, false);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('অন্তত ৪টি বুলেট পয়েন্ট');
  });

  it('rejects non-math short notes with more than 5 bullets', () => {
    const tooMany = `• ১\n• ২\n• ৩\n• ৪\n• ৫\n• ৬`;
    const errors = validateShortNotes(tooMany, false);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('সর্বোচ্চ ৫টি বুলেট পয়েন্ট');
  });

  it('rejects lines that do not start with •', () => {
    const badBullets = `1. পয়েন্ট এক\n2. পয়েন্ট দুই\n3. পয়েন্ট তিন\n4. পয়েন্ট চার`;
    const errors = validateShortNotes(badBullets, false);
    expect(errors.some((e) => e.includes("প্রতিটি পয়েন্ট অবশ্যই '•' দিয়ে শুরু"))).toBe(true);
  });

  it('rejects forbidden phrases like "সঠিক উত্তর:", "Option A সঠিক", "Option B ভুল"', () => {
    const forbiddenAns = `• সঠিক উত্তর: রাখিগড়ি।
• এটি ভারতীয় উপমহাদেশের বৃহৎ হরপ্পা বসতিগুলির অন্যতম।
• রাখিগড়ি থেকে পরিকল্পিত বসতি ও বিভিন্ন প্রত্নবস্তু পাওয়া গেছে।
• লোথাল বর্তমান গুজরাটে অবস্থিত একটি বিখ্যাত ডকইয়ার্ড।`;
    expect(validateShortNotes(forbiddenAns, false)[0]).toContain('"সঠিক উত্তর:"');

    const forbiddenOpt = `• রাখিগড়ি হরপ্পা সভ্যতার বৃহত্তম ভারতীয় প্রত্নস্থল।
• Option A সঠিক।
• Option B ভুল কারণ লোথাল গুজরাটে।
• ধোলাভিরা উন্নত জল সংরক্ষণ ব্যবস্থার জন্য বিখ্যাত।`;
    const errs = validateShortNotes(forbiddenOpt, false);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]).toContain('"Option');
  });

  it('allows standard mathematical explanations when isMath is true', () => {
    const mathExp = 'ধরি সংখ্যাটি x। প্রশ্নানুসারে, 2x + 5 = 25 => 2x = 20 => x = 10।';
    expect(validateShortNotes(mathExp, true)).toEqual([]);
    expect(validateShortNotes('', true)).toEqual([]);
  });
});

describe('normalizeShortNotes', () => {
  it('normalizes escaped newlines and ensures bullet points', () => {
    const raw = `তথ্য ১\\nতথ্য ২\\nতথ্য ৩\\nতথ্য ৪`;
    const normalized = normalizeShortNotes(raw);
    expect(normalized).toBe(`• তথ্য ১\n• তথ্য ২\n• তথ্য ৩\n• তথ্য ৪`);
  });
});

describe('getAiQuestionGenerationPrompt', () => {
  it('generates Short Notes prompt for non-mathematics', () => {
    const prompt = getAiQuestionGenerationPrompt({
      subject: 'Indian History',
      topic: 'Mughal Empire',
    });
    expect(prompt).toContain('CRITICAL SHORT NOTES RULES');
    expect(prompt).toContain('Generate 4–5 concise Bengali bullet points');
    expect(prompt).toContain('"সঠিক উত্তর: ..."');
  });

  it('generates math calculation prompt for mathematics', () => {
    const prompt = getAiQuestionGenerationPrompt({
      subject: 'Elementary Mathematics',
      isMathematics: true,
    });
    expect(prompt).toContain('step-by-step mathematical derivation');
  });
});
