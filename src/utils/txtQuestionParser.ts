/**
 * PracticeKoro 2.0 — Defined TXT Question Parser
 *
 * Implements the exact question structure specified in Section 8:
 *
 * 1. Question text (English/Bengali)
 * (a) Option A
 * (b) Option B
 * (c) Option C
 * (d) Option D
 *
 * সঠিক উত্তর: (a) Option text / Ans: (a)
 *
 * Explanation:
 * - Point 1
 * - Point 2
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
 * Standard Sample TXT content provided for Admins to view or download.
 */
export const SAMPLE_TXT_CONTENT = `1. ভারতের প্রথম রাষ্ট্রপতি কে ছিলেন?
(a) ড. রাজেন্দ্র প্রসাদ
(b) জওহরলাল নেহরু
(c) সর্বপল্লী রাধাকৃষ্ণন
(d) ড. বি. আর. আম্বেদকর

সঠিক উত্তর: (a) ড. রাজেন্দ্র প্রসাদ

Explanation:
- ড. রাজেন্দ্র প্রসাদ ছিলেন স্বাধীন ভারতের প্রথম রাষ্ট্রপতি।
- তিনি ১৯৫০ থেকে ১৯৬২ সাল পর্যন্ত ভারতের রাষ্ট্রপতির পদে আসীন ছিলেন।
- তিনি গণপরিষদের সভাপতি নির্বাচিত হয়েছিলেন।

2. মানবদেহের বৃহত্তম অঙ্গ কোনটি?
(a) যকৃৎ (Liver)
(b) ত্বক (Skin)
(c) ফুসফুস (Lungs)
(d) বৃক্ক (Kidney)

সঠিক উত্তর: (b) ত্বক (Skin)

Explanation:
- ত্বক হলো মানবদেহের বৃহত্তম বাহ্যিক অঙ্গ।
- মানবদেহের বৃহত্তম অভ্যন্তরীণ গ্রন্থি বা অঙ্গ হলো যকৃৎ (Liver)।`;

/**
 * Helper to trigger browser download of sample TXT template.
 */
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

/**
 * Normalizes Bengali numerals (০-৯) to standard Arabic numerals (0-9)
 */
export function normalizeBengaliNumerals(input: string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return input.replace(/[০-৯]/g, (digit) => String(bengaliDigits.indexOf(digit)));
}

/**
 * Parses raw TXT content into structured questions with granular error tracking.
 */
export function parseQuestionsTxt(content: string): TxtParseResult {
  if (!content || !content.trim()) {
    return { totalDetected: 0, valid: [], errors: [] };
  }

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Strategy to detect individual question blocks:
  // A question block typically starts with a number followed by dot/parenthesis/colon
  // e.g., "1.", "1)", "১.", "Q1.", "Question 1:" at the start of a line
  const lines = normalized.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  const startRegex = /^(?:(?:Q(?:uestion)?\s*)?[0-9০-৯]+[-.:)]\s*)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isNewQuestionStart = startRegex.test(line.trim());

    if (isNewQuestionStart && currentBlock.length > 0) {
      // Check if previous block has content before pushing
      const joined = currentBlock.join('\n').trim();
      if (joined) {
        blocks.push(joined);
      }
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    const joined = currentBlock.join('\n').trim();
    if (joined) {
      blocks.push(joined);
    }
  }

  // Fallback: If no numbering was found in any line, split by double empty lines
  const hasAnyNumbering = lines.some((l) => startRegex.test(l.trim()));
  if (!hasAnyNumbering && normalized.includes('\n\n')) {
    const paragraphs = normalized.split(/\n\s*\n+/);
    if (paragraphs.length > 0) {
      blocks.length = 0;
      for (const p of paragraphs) {
        if (p.trim()) blocks.push(p.trim());
      }
    }
  }

  const valid: ParsedTxtQuestion[] = [];
  const errors: TxtParseError[] = [];

  blocks.forEach((block, index) => {
    const questionNumber = index + 1;
    const blockLines = block.split('\n');

    // Extract Question Number if present in text
    const firstLine = blockLines[0]?.trim() || '';
    const numMatch = firstLine.match(/^(?:(?:Q(?:uestion)?\s*)?([0-9০-৯]+)[-.:)]\s*)/i);
    const parsedNumber = numMatch
      ? parseInt(normalizeBengaliNumerals(numMatch[1]), 10)
      : questionNumber;

    // Remove the leading number prefix from question statement line
    let questionFirstLine = firstLine;
    if (numMatch) {
      questionFirstLine = firstLine.substring(numMatch[0].length).trim();
    }

    // Extract Question Text, Options, Answer, and Explanation
    // Options pattern: (a), (b), (c), (d) or a), b), c), d) or A., B., C., D.
    const optionRegex = /^\s*(?:\(([a-dA-D])\)|([a-dA-D])[.)])\s*(.*)$/;

    // Answer pattern:
    // "সঠিক উত্তর: (a) ..." or "সঠিক উত্তর : a" or "Ans: (a)" or "Answer: a" or "Correct: (a)"
    const answerRegex =
      /^\s*(?:সঠিক\s*উত্তর|উত্তর|Answer|Ans|Correct\s*Answer|Correct\s*Option)\s*[:\-–—]\s*(?:\(([a-dA-D])\)|([a-dA-D]))/i;

    // Explanation pattern:
    // "Explanation:" or "ব্যাখ্যা:" or "ব্যাখ্যা : "
    const explanationRegex = /^\s*(?:Explanation|ব্যাখ্যা|Note|Notes)\s*[:\-–—]?\s*(.*)$/i;

    const questionLines: string[] = [questionFirstLine];
    const options: Record<'A' | 'B' | 'C' | 'D', string> = {
      A: '',
      B: '',
      C: '',
      D: '',
    };
    let correctOption: 'A' | 'B' | 'C' | 'D' | null = null;
    const explanationLines: string[] = [];

    let currentSection: 'question' | 'option' | 'answer' | 'explanation' = 'question';
    let currentOptionKey: 'A' | 'B' | 'C' | 'D' | null = null;

    for (let l = 1; l < blockLines.length; l++) {
      const rawLine = blockLines[l];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Check for Answer line
      const ansMatch = trimmed.match(answerRegex);
      if (ansMatch) {
        const letter = (ansMatch[1] || ansMatch[2]).toUpperCase() as 'A' | 'B' | 'C' | 'D';
        correctOption = letter;
        currentSection = 'answer';
        continue;
      }

      // Check for Explanation line
      const expMatch = trimmed.match(explanationRegex);
      if (expMatch) {
        currentSection = 'explanation';
        if (expMatch[1] && expMatch[1].trim()) {
          explanationLines.push(expMatch[1].trim());
        }
        continue;
      }

      // Check for Option line
      const optMatch = trimmed.match(optionRegex);
      if (optMatch) {
        const letter = (optMatch[1] || optMatch[2]).toUpperCase() as 'A' | 'B' | 'C' | 'D';
        currentOptionKey = letter;
        options[letter] = optMatch[3].trim();
        currentSection = 'option';
        continue;
      }

      // Continuation of current section
      if (currentSection === 'question') {
        questionLines.push(trimmed);
      } else if (currentSection === 'option' && currentOptionKey) {
        // Multi-line option text
        options[currentOptionKey] += (options[currentOptionKey] ? ' ' : '') + trimmed;
      } else if (currentSection === 'explanation') {
        explanationLines.push(trimmed);
      }
    }

    const fullQuestionText = questionLines.join('\n').trim();

    // Secondary search for Answer if not caught by line-start regex
    if (!correctOption) {
      const inlineAnsMatch = block.match(
        /(?:সঠিক\s*উত্তর|উত্তর|Answer|Ans|Correct)\s*[:\-–—]\s*(?:\(([a-dA-D])\)|([a-dA-D]))/i
      );
      if (inlineAnsMatch) {
        correctOption = (inlineAnsMatch[1] || inlineAnsMatch[2]).toUpperCase() as
          'A' | 'B' | 'C' | 'D';
      }
    }

    // Validation checks
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

    // Valid question block
    valid.push({
      questionNumber: parsedNumber,
      questionText: fullQuestionText,
      optionA: options.A,
      optionB: options.B,
      optionC: options.C,
      optionD: options.D,
      correctOption,
      explanation: explanationLines.length > 0 ? explanationLines.join('\n') : undefined,
      rawText: block,
    });
  });

  return {
    totalDetected: blocks.length,
    valid,
    errors,
  };
}
