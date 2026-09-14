export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface ScorableQuestion {
  id: string;
  correctOption: AnswerOption;
  marks: number;
  negativeMarks: number;
}

export interface SubmittedAnswer {
  questionId: string;
  selectedOption?: AnswerOption | null;
}

export interface ScoreSummary {
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  attemptedCount: number;
  accuracy: number;
  percentage: number;
  passed: boolean;
  wrongQuestionIds: string[];
}

export function calculateScore(
  questions: ScorableQuestion[],
  answers: SubmittedAnswer[],
  totalMarks: number,
  passingMarks: number
): ScoreSummary {
  const answersByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOption])
  );
  const wrongQuestionIds: string[] = [];
  let rawScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (const question of questions) {
    const selectedOption = answersByQuestion.get(question.id);

    if (!selectedOption) {
      skippedCount += 1;
    } else if (selectedOption === question.correctOption) {
      correctCount += 1;
      rawScore += question.marks;
    } else {
      wrongCount += 1;
      rawScore -= question.negativeMarks;
      wrongQuestionIds.push(question.id);
    }
  }

  const score = Number(Math.max(0, rawScore).toFixed(2));
  const attemptedCount = correctCount + wrongCount;
  const accuracy =
    attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
  const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(1)) : 0;

  return {
    score,
    correctCount,
    wrongCount,
    skippedCount,
    attemptedCount,
    accuracy,
    percentage,
    passed: score >= passingMarks,
    wrongQuestionIds,
  };
}
