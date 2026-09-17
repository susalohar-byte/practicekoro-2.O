/**
 * PracticeKoro 2.0 — Short Notes & Explanation Utilities
 *
 * Enforces the Short Notes system for non-Mathematics questions:
 * - The existing `explanation_bengali` field IS the Short Notes.
 * - Stored as 4–5 concise Bengali bullet points, each on a separate line starting with `•`.
 * - For Mathematics subjects, standard mathematical Explanation is preserved.
 * - Zero database schema changes.
 */

import type { Question } from '../types';

/**
 * Keywords to identify Mathematics subjects, chapters, or topics.
 */
const MATH_KEYWORDS = [
  'math',
  'mathematics',
  'গণিত',
  'পাটিগণিত',
  'বীজগণিত',
  'জ্যামিতি',
  'ত্রিকোণমিতি',
  'arithmetic',
  'algebra',
  'geometry',
  'mensuration',
  'trigonometry',
  'quantitative',
  'aptitude',
];

/**
 * Determines whether a given subject or context is Mathematics.
 */
export function isMathematicsSubject(
  subject?: { name?: string; slug?: string; id?: string } | string | null,
  context?: { chapterName?: string; topicName?: string; title?: string } | null
): boolean {
  const parts: string[] = [];

  if (typeof subject === 'string') {
    parts.push(subject);
  } else if (subject && typeof subject === 'object') {
    if (subject.name) parts.push(subject.name);
    if (subject.slug) parts.push(subject.slug);
    if (subject.id) parts.push(subject.id);
  }

  if (context?.chapterName) parts.push(context.chapterName);
  if (context?.topicName) parts.push(context.topicName);
  if (context?.title) parts.push(context.title);

  const combined = parts.join(' ').toLowerCase();
  return MATH_KEYWORDS.some((kw) => combined.includes(kw));
}

/**
 * Determines whether a question belongs to a Mathematics subject/topic.
 */
export function isMathematicsQuestion(question?: Partial<Question> | null): boolean {
  if (!question) return false;
  return isMathematicsSubject(question.subjectId || question.subjectName, {
    chapterName: question.chapterName,
    topicName: question.topicName,
  });
}

/**
 * Forbidden phrases in Bengali Short Notes.
 * Short Notes must NOT contain answer declarations or option correctness commentary.
 */
export const FORBIDDEN_SHORT_NOTES_PATTERNS = [
  {
    regex: /সঠিক\s*উত্তর\s*[:\-–—=]?/i,
    label: '"সঠিক উত্তর:"',
  },
  {
    regex: /উত্তর\s*(?:হলো|হল|হচ্ছে|হয়)\s*[:\-–—=]?/i,
    label: '"উত্তর হলো ..."',
  },
  {
    regex: /(?:option|অপশন)\s*[a-dA-Dক-খগ-ঘ]\s*(?:সঠিক|হলো|হল)/i,
    label: '"Option সঠিক"',
  },
  {
    regex: /(?:option|অপশন)\s*[a-dA-Dক-খগ-ঘ]\s*ভুল/i,
    label: '"Option ভুল"',
  },
  {
    regex: /correct\s*option\s*is/i,
    label: '"Correct option is"',
  },
  {
    regex: /answer\s*is\s*[:\-–—]?/i,
    label: '"Answer is"',
  },
];

/**
 * Normalizes escaped newlines and cleans text for Short Notes rendering.
 */
export function normalizeShortNotes(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return '';

  const raw = value
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!raw) return '';

  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const cleaned = lines.map((line) => {
    // Strip existing bullet/number markers to uniformize to `• `
    return line.replace(/^([•\u2022\u25cf\u25cb*✓✔▪▫■□►▸▶◆◇\s-]|📌|🔹|🔸|➡️|👉)+/u, '').trim();
  });

  return cleaned.map((line) => `• ${line}`).join('\n');
}

/**
 * Validates Short Notes according to PracticeKoro rules:
 * For non-Mathematics:
 * - Must exist.
 * - Must contain 4–5 bullet points.
 * - Each bullet must start with `•` on a separate line.
 * - Must not contain forbidden answer/option declarations.
 *
 * For Mathematics:
 * - Preserves standard mathematical explanation (optional or standard multi-line steps).
 */
export function validateShortNotes(value: string | undefined | null, isMath = false): string[] {
  const errors: string[] = [];

  // Mathematics: standard validation
  if (isMath) {
    if (!value || !value.trim()) return [];
    // Allow standard math explanations without bullet restrictions
    return [];
  }

  // Non-Mathematics: strict Short Notes rules
  if (!value || !value.trim()) {
    errors.push('শর্ট নোটস (Short Notes) প্রদান করা আবশ্যক। ৪–৫টি বুলেট পয়েন্ট দিন।');
    return errors;
  }

  // Normalize escaped \n if present
  const unescaped = value
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Check forbidden phrases
  for (const forbidden of FORBIDDEN_SHORT_NOTES_PATTERNS) {
    if (forbidden.regex.test(unescaped)) {
      errors.push(
        `শর্ট নোটসে ${forbidden.label} বা অপশনের সঠিক/ভুল ঘোষণা দেওয়া যাবে না। প্রতিটি বুলেটে শুধুমাত্র পরীক্ষার জন্য প্রয়োজনীয় নতুন তথ্য দিন।`
      );
      break;
    }
  }

  // Check line count and bullet markers
  const lines = unescaped
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 4) {
    errors.push(
      `শর্ট নোটসে অন্তত ৪টি বুলেট পয়েন্ট থাকতে হবে (বর্তমানে ${lines.length}টি পাওয়া গেছে)।`
    );
  } else if (lines.length > 5) {
    errors.push(
      `শর্ট নোটসে সর্বোচ্চ ৫টি বুলেট পয়েন্ট থাকতে পারে (বর্তমানে ${lines.length}টি পাওয়া গেছে)। ৪–৫টি পয়েন্ট দিন।`
    );
  }

  // Every line must start with •
  const nonBulletLines = lines.filter((l) => !l.startsWith('•'));
  if (nonBulletLines.length > 0) {
    errors.push("প্রতিটি পয়েন্ট অবশ্যই '•' দিয়ে শুরু হতে হবে এবং আলাদা লাইনে থাকতে হবে।");
  }

  return errors;
}

/**
 * Generates the official AI prompt for question generation enforcing PracticeKoro rules.
 */
export function getAiQuestionGenerationPrompt(options: {
  subject: string;
  topic?: string;
  isMathematics?: boolean;
  count?: number;
}): string {
  const isMath = Boolean(
    options.isMathematics ?? isMathematicsSubject(options.subject, { topicName: options.topic })
  );
  const count = options.count ?? 5;

  if (isMath) {
    return `Generate ${count} multiple-choice questions for Mathematics:
Subject: ${options.subject}
${options.topic ? `Topic: ${options.topic}` : ''}

Format for each question:
1. Question text in Bengali (with English mathematical terms if applicable)
(a) Option A
(b) Option B
(c) Option C
(d) Option D

সঠিক উত্তর: (a) Option text

Explanation:
[Provide step-by-step mathematical derivation, formula used, and clear calculation steps.]`;
  }

  return `Generate ${count} high-yield multiple-choice questions for competitive exams (WBP, WBCS, KP, SSC, etc.):
Subject: ${options.subject}
${options.topic ? `Topic: ${options.topic}` : ''}

Format for each question:
1. Question statement in clear Bengali
(a) Option A
(b) Option B
(c) Option C
(d) Option D

সঠিক উত্তর: (a) Option text

Explanation:
• [Bullet 1: Direct fact related to the question/topic]
• [Bullet 2: Important exam-relevant context or historical/scientific fact]
• [Bullet 3: Additional high-yield information from the same topic]
• [Bullet 4: Closely related or commonly confused comparison if helpful]
• [Bullet 5: Another useful exam fact]

CRITICAL SHORT NOTES RULES:
1. Generate 4–5 concise Bengali bullet points under Explanation.
2. Every bullet MUST start with '•' on a separate line.
3. Every bullet MUST contain NEW, exam-useful information in natural Bengali.
4. NEVER write:
   - "সঠিক উত্তর: ..."
   - "উত্তর হলো ..."
   - "Option A সঠিক"
   - "Option B ভুল" / "Option C ভুল" / "Option D ভুল"
   - Standalone repetitions of the correct answer
   - Generic filler or useless explanations of obviously wrong options.
5. Only mention an incorrect option if it is closely related, commonly confused by students, or provides high exam value. Otherwise, use that bullet space for another vital fact on the topic.`;
}
