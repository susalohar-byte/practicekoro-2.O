import { describe, expect, it } from 'vitest';
import { parseCsvRaw, parseQuestionsCsv } from './csvParser';

describe('parseCsvRaw', () => {
  it('supports quoted commas and escaped quotes', () => {
    expect(parseCsvRaw('question,answer\n"Who said ""Do or die"", and when?",A')).toEqual([
      ['question', 'answer'],
      ['Who said "Do or die", and when?', 'A'],
    ]);
  });
});

describe('parseQuestionsCsv', () => {
  const headers =
    'question_text,option_a,option_b,option_c,option_d,correct_option,marks,negative_marks';

  it('parses a valid question with marks', () => {
    const result = parseQuestionsCsv(
      `${headers}\nCapital of West Bengal?,Kolkata,Delhi,Mumbai,Chennai,A,2,0.5`
    );

    expect(result.validCount).toBe(1);
    expect(result.questions[0]).toMatchObject({
      questionText: 'Capital of West Bengal?',
      correctOption: 'A',
      defaultMarks: 2,
      defaultNegativeMarks: 0.5,
    });
  });

  it('rejects missing required columns', () => {
    const result = parseQuestionsCsv('question_text,option_a\nQuestion,A');

    expect(result.validCount).toBe(0);
    expect(result.errors).toContain(
      'Missing one or more required option columns: "option_a", "option_b", "option_c", "option_d"'
    );
  });

  it('rejects invalid answer options', () => {
    const result = parseQuestionsCsv(`${headers}\nQuestion,A,B,C,D,X,1,0.25`);

    expect(result.invalidCount).toBe(1);
    expect(result.parsedRows[0].errors[0]).toContain('Invalid correct option');
  });
});
