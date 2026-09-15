import type { Question } from '../types/index.ts';

export interface ParsedCsvQuestion {
  rowNumber: number;
  data: Omit<Question, 'id'>;
  isValid: boolean;
  errors: string[];
}

export interface CsvParseResult {
  questions: Omit<Question, 'id'>[];
  parsedRows: ParsedCsvQuestion[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  errors: string[];
}

/**
 * Parses raw CSV text handling RFC 4180 quotes, commas, and newlines inside fields.
 */
export function parseCsvRaw(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quote
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Only push non-empty rows
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Handle final field/row if not followed by newline
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header string to lowercase alphanumeric representation
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Validates and maps CSV rows into Question objects
 */
export function parseQuestionsCsv(
  csvContent: string,
  defaults?: { defaultSubjectId?: string; defaultChapterId?: string }
): CsvParseResult {
  const rawRows = parseCsvRaw(csvContent);

  if (rawRows.length === 0) {
    return {
      questions: [],
      parsedRows: [],
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      errors: ['The CSV file is empty.'],
    };
  }

  const rawHeaders = rawRows[0];
  const headerMap = new Map<string, number>();

  rawHeaders.forEach((h, index) => {
    headerMap.set(normalizeHeader(h), index);
  });

  // Find column index helper
  const getCol = (possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const norm = normalizeHeader(name);
      if (headerMap.has(norm)) {
        return headerMap.get(norm)!;
      }
    }
    return -1;
  };

  const colQuestionText = getCol(['question_text', 'question', 'questiontext']);
  const colQuestionBengali = getCol([
    'question_bengali_text',
    'bengali_question',
    'questionbengali',
    'questionbengalitext',
  ]);
  const colOptA = getCol(['option_a', 'optiona', 'a']);
  const colOptB = getCol(['option_b', 'optionb', 'b']);
  const colOptC = getCol(['option_c', 'optionc', 'c']);
  const colOptD = getCol(['option_d', 'optiond', 'd']);
  const colCorrect = getCol(['correct_option', 'correctoption', 'answer', 'correct_answer']);
  const colExplanation = getCol(['explanation', 'explanation_text']);
  const colExplanationBengali = getCol(['explanation_bengali', 'explanationbengali']);
  const colMarks = getCol(['marks', 'default_marks', 'defaultmarks']);
  const colNegativeMarks = getCol(['negative_marks', 'default_negative_marks', 'negativemarking']);
  const colSubjectId = getCol(['subject_id', 'subjectid']);
  const colChapterId = getCol(['chapter_id', 'chapterid']);

  const errors: string[] = [];

  if (colQuestionText === -1) {
    errors.push('Missing required column: "question_text"');
  }
  if (colOptA === -1 || colOptB === -1 || colOptC === -1 || colOptD === -1) {
    errors.push(
      'Missing one or more required option columns: "option_a", "option_b", "option_c", "option_d"'
    );
  }
  if (colCorrect === -1) {
    errors.push('Missing required column: "correct_option"');
  }

  if (errors.length > 0) {
    return {
      questions: [],
      parsedRows: [],
      totalRows: rawRows.length - 1,
      validCount: 0,
      invalidCount: rawRows.length - 1,
      errors,
    };
  }

  const parsedRows: ParsedCsvQuestion[] = [];
  const validQuestions: Omit<Question, 'id'>[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const rowErrors: string[] = [];

    const getVal = (colIndex: number): string => {
      return colIndex >= 0 && colIndex < row.length ? row[colIndex].trim() : '';
    };

    const questionText = getVal(colQuestionText);
    const questionBengali = getVal(colQuestionBengali);
    const optionA = getVal(colOptA);
    const optionB = getVal(colOptB);
    const optionC = getVal(colOptC);
    const optionD = getVal(colOptD);
    const rawCorrect = getVal(colCorrect).toUpperCase();
    const explanation = getVal(colExplanation);
    const explanationBengali = getVal(colExplanationBengali);
    const rawMarks = getVal(colMarks);
    const rawNegativeMarks = getVal(colNegativeMarks);
    const rowSubjectId = getVal(colSubjectId) || defaults?.defaultSubjectId;
    const rowChapterId = getVal(colChapterId) || defaults?.defaultChapterId;

    if (!questionText) {
      rowErrors.push('Question text is empty');
    }
    if (!optionA) rowErrors.push('Option A is empty');
    if (!optionB) rowErrors.push('Option B is empty');
    if (!optionC) rowErrors.push('Option C is empty');
    if (!optionD) rowErrors.push('Option D is empty');

    let correctOption: 'A' | 'B' | 'C' | 'D' = 'A';
    if (!['A', 'B', 'C', 'D'].includes(rawCorrect)) {
      rowErrors.push(`Invalid correct option "${rawCorrect}". Must be A, B, C, or D`);
    } else {
      correctOption = rawCorrect as 'A' | 'B' | 'C' | 'D';
    }

    const marks = rawMarks ? parseFloat(rawMarks) || 1.0 : 1.0;
    const negativeMarks = rawNegativeMarks ? parseFloat(rawNegativeMarks) || 0.25 : 0.25;

    const data: Omit<Question, 'id'> = {
      subjectId: rowSubjectId || undefined,
      chapterId: rowChapterId || undefined,
      questionText,
      questionBengaliText: questionBengali || undefined,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanation: explanation || undefined,
      explanationBengali: explanationBengali || undefined,
      defaultMarks: marks,
      defaultNegativeMarks: negativeMarks,
      isActive: true,
      status: 'active',
    };

    const isValid = rowErrors.length === 0;

    parsedRows.push({
      rowNumber: r + 1,
      data,
      isValid,
      errors: rowErrors,
    });

    if (isValid) {
      validQuestions.push(data);
    }
  }

  const validCount = parsedRows.filter((p) => p.isValid).length;
  const invalidCount = parsedRows.filter((p) => !p.isValid).length;

  return {
    questions: validQuestions,
    parsedRows,
    totalRows: parsedRows.length,
    validCount,
    invalidCount,
    errors:
      invalidCount > 0
        ? [`${invalidCount} out of ${parsedRows.length} rows have validation errors.`]
        : [],
  };
}
