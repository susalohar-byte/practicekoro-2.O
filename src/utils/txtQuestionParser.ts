/**
 * PracticeKoro 2.0 — Defined TXT Question Parser
 *
 * Each question contains:
 * - Question text
 * - 4 options
 * - Correct answer
 * - Explanation & Notes as 3–4 concise bullet points focused on the question/options
 */

export interface ParsedTxtQuestion {
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  rawText: string;
}

export interface TxtParseError {
  questionNumber: number;
  reason: string;
  rawText: string;
}

export interface TxtParseResult {
  totalDetected: number;
  valid: ParsedTxtQuestion[];
  errors: TxtParseError[];
}

/**
 * Standard sample TXT content.
 * Explanation must contain 3–4 useful, question/option-related bullet points.
 */
export const SAMPLE_TXT_CONTENT = `1. ভারতের প্রথম রাষ্ট্রপতি কে ছিলেন?
(a) ড. রাজেন্দ্র প্রসাদ
(b) জওহরলাল নেহরু
(c) সর্বপল্লী রাধাকৃষ্ণন
(d) ড. বি. আর. আম্বেদকর

সঠিক উত্তর: (a) ড. রাজেন্দ্র প্রসাদ

Explanation:
- ড. রাজেন্দ্র প্রসাদ স্বাধীন ভারতের প্রথম রাষ্ট্রপতি ছিলেন এবং ১৯৫০ সালে দায়িত্ব গ্রহণ করেন।
- তিনি ১৯৫০ থেকে ১৯৬২ সাল পর্যন্ত টানা দুই মেয়াদে রাষ্ট্রপতি ছিলেন।
- সর্বপল্লী রাধাকৃষ্ণন ছিলেন ভারতের দ্বিতীয় রাষ্ট্রপতি, তাই (c) সঠিক নয়।
- জওহরলাল নেহরু ছিলেন ভারতের প্রথম প্রধানমন্ত্রী এবং ড. বি. আর. আম্বেদকর ছিলেন আইনমন্ত্রী ও সংবিধানের খসড়া প্রণয়ন কমিটির চেয়ারম্যান।

2. মানবদেহের বৃহত্তম অঙ্গ কোনটি?
(a) যকৃৎ (Liver)
(b) ত্বক (Skin)
(c) ফুসফুস (Lungs)
(d) বৃক্ক (Kidney)

সঠিক উত্তর: (b) ত্বক (Skin)

Explanation:
- ত্বক মানবদেহের বৃহত্তম বাহ্যিক অঙ্গ এবং এটি পুরো শরীরকে আবৃত করে।
- ত্বক শরীরকে জীবাণু, আঘাত এবং অতিরিক্ত জলক্ষয় থেকে সুরক্ষা দেয়।
- যকৃৎ হলো বৃহত্তম অভ্যন্তরীণ অঙ্গ, তাই (a) ত্বকের সঠিক বিকল্প নয়।
- ফুসফুস ও বৃক্কের গুরুত্বপূর্ণ শারীরবৃত্তীয় কাজ থাকলেও আকারের দিক থেকে তারা ত্বকের চেয়ে ছোট।`;

export function downloadSampleTxt(filename = 'practicekoro_question_template.txt'): void {
  const blob = new Blob([SAMPLE_TXT_CONTENT], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Normalizes Bengali numerals (০-৯) to Arabic numerals (0-9). */
export function normalizeBengaliNumerals(input: string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return input.replace(/[০-৯]/g, (digit) => String(bengaliDigits.indexOf(digit)));
}

/**
 * Count meaningful explanation bullets. Supports "-", "•", "*" and numbered bullets.
 */
export function countExplanationBullets(explanation?: string): number {
  if (!explanation?.trim()) return 0;
  return explanation
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-•*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)).length;
}

/**
 * Normalize explanation to a clean 3–4 bullet-point block.
 */
export function normalizeExplanationBullets(explanation?: string): string | undefined {
  if (!explanation?.trim()) return undefined;

  const lines = explanation
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

  if (lines.length === 0) return undefined;
  return lines.map((line) => `- ${line}`).join('\n');
}

export function parseQuestionsTxt(content: string): TxtParseResult {
  if (!content || !content.trim()) {
    return { totalDetected: 0, valid: [], errors: [] };
  }

  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const lines = normalized.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  const startRegex = /^(?:(?:Q(?:uestion)?\s*)?[0-9০-৯]+[-.:)]\s*)/i;

  for (const line of lines) {
    const isNewQuestionStart = startRegex.test(line.trim());
    if (isNewQuestionStart && currentBlock.length > 0) {
      const joined = currentBlock.join('\n').trim();
      if (joined) blocks.push(joined);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    const joined = currentBlock.join('\n').trim();
    if (joined) blocks.push(joined);
  }

  const hasAnyNumbering = lines.some((line) => startRegex.test(line.trim()));
  if (!hasAnyNumbering && normalized.includes('\n\n')) {
    const paragraphs = normalized.split(/\n\s*\n+/);
    blocks.length = 0;
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) blocks.push(paragraph.trim());
    }
  }

  const valid: ParsedTxtQuestion[] = [];
  const errors: TxtParseError[] = [];

  blocks.forEach((block, index) => {
    const fallbackNumber = index + 1;
    const blockLines = block.split('\n');
    const firstLine = blockLines[0]?.trim() || '';
    const numMatch = firstLine.match(/^(?:(?:Q(?:uestion)?\s*)?([0-9০-৯]+)[-.:)]\s*)/i);
    const parsedNumber = numMatch
      ? parseInt(normalizeBengaliNumerals(numMatch[1]), 10)
      : fallbackNumber;

    let questionFirstLine = firstLine;
    if (numMatch) questionFirstLine = firstLine.substring(numMatch[0].length).trim();

    const optionRegex = /^\s*(?:\(([a-dA-D])\)|([a-dA-D])[.)])\s*(.*)$/;
    const answerRegex =
      /^\s*(?:সঠিক\s*উত্তর|উত্তর|Answer|Ans|Correct\s*Answer|Correct\s*Option)\s*[:\-–—]\s*(?:\(([a-dA-D])\)|([a-dA-D]))/i;
    const explanationRegex = /^\s*(?:Explanation|ব্যাখ্যা|Note|Notes)\s*[:\-–—]?\s*(.*)$/i;

    const questionLines: string[] = [questionFirstLine];
    const options: Record<'A' | 'B' | 'C' | 'D', string> = { A: '', B: '', C: '', D: '' };
    let correctOption: 'A' | 'B' | 'C' | 'D' | null = null;
    const explanationLines: string[] = [];

    let currentSection: 'question' | 'option' | 'answer' | 'explanation' = 'question';
    let currentOptionKey: 'A' | 'B' | 'C' | 'D' | null = null;

    for (let l = 1; l < blockLines.length; l++) {
      const rawLine = blockLines[l];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      const ansMatch = trimmed.match(answerRegex);
      if (ansMatch) {
        const letter = (ansMatch[1] || ansMatch[2]).toUpperCase() as 'A' | 'B' | 'C' | 'D';
        correctOption = letter;
        currentSection = 'answer';
        continue;
      }

      const expMatch = trimmed.match(explanationRegex);
      if (expMatch) {
        currentSection = 'explanation';
        if (expMatch[1]?.trim()) explanationLines.push(expMatch[1].trim());
        continue;
      }

      const optMatch = trimmed.match(optionRegex);
      if (optMatch) {
        const letter = (optMatch[1] || optMatch[2]).toUpperCase() as 'A' | 'B' | 'C' | 'D';
        currentOptionKey = letter;
        options[letter] = optMatch[3].trim();
        currentSection = 'option';
        continue;
      }

      if (currentSection === 'question') {
        questionLines.push(trimmed);
      } else if (currentSection === 'option' && currentOptionKey) {
        options[currentOptionKey] += (options[currentOptionKey] ? ' ' : '') + trimmed;
      } else if (currentSection === 'explanation') {
        explanationLines.push(trimmed);
      }
    }

    const fullQuestionText = questionLines.join('\n').trim();

    if (!correctOption) {
      const inlineAnsMatch = block.match(
        /(?:সঠিক\s*উত্তর|উত্তর|Answer|Ans|Correct)\s*[:\-–—]\s*(?:\(([a-dA-D])\)|([a-dA-D]))/i
      );
      if (inlineAnsMatch) {
        correctOption = (inlineAnsMatch[1] || inlineAnsMatch[2]).toUpperCase() as
          'A' | 'B' | 'C' | 'D';
      }
    }

    if (!fullQuestionText) {
      errors.push({
        questionNumber: parsedNumber,
        reason: 'Question text is missing or empty.',
        rawText: block,
      });
      return;
    }

    const missingOptions: string[] = [];
    if (!options.A) missingOptions.push('(a)');
    if (!options.B) missingOptions.push('(b)');
    if (!options.C) missingOptions.push('(c)');
    if (!options.D) missingOptions.push('(d)');

    if (missingOptions.length > 0) {
      errors.push({
        questionNumber: parsedNumber,
        reason: `Incomplete options detected. Missing: ${missingOptions.join(', ')} (${4 - missingOptions.length} of 4 options found).`,
        rawText: block,
      });
      return;
    }

    if (!correctOption) {
      errors.push({
        questionNumber: parsedNumber,
        reason: 'Missing or undetectable correct answer (e.g. "সঠিক উত্তর: (a)" or "Answer: (a)").',
        rawText: block,
      });
      return;
    }

    const explanation = normalizeExplanationBullets(explanationLines.join('\n'));
    const explanationBulletCount = countExplanationBullets(explanation);

    if (explanationBulletCount < 3 || explanationBulletCount > 4) {
      errors.push({
        questionNumber: parsedNumber,
        reason:
          explanationBulletCount === 0
            ? 'Explanation & Notes must contain 3–4 bullet points focused on the question and options.'
            : `Explanation & Notes must contain 3–4 bullet points; ${explanationBulletCount} bullet point(s) were detected.`,
        rawText: block,
      });
      return;
    }

    valid.push({
      questionNumber: parsedNumber,
      questionText: fullQuestionText,
      optionA: options.A,
      optionB: options.B,
      optionC: options.C,
      optionD: options.D,
      correctOption,
      explanation,
      rawText: block,
    });
  });

  return {
    totalDetected: blocks.length,
    valid,
    errors,
  };
}
