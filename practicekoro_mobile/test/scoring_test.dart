import 'package:flutter_test/flutter_test.dart';
import 'package:practicekoro_mobile/data/models/test_model.dart';
import 'package:practicekoro_mobile/data/models/question_model.dart';
import 'package:practicekoro_mobile/data/models/attempt_model.dart';
import 'package:practicekoro_mobile/data/repositories/test_runner_repository.dart';

void main() {
  group('PracticeKoro Mock Test Scoring Engine', () {
    final testModel = MockTestModel(
      id: 'test-wbp-001',
      title: 'WBP Constable Mock',
      slug: 'wbp-mock',
      totalMarks: 4.0,
      totalQuestions: 4,
      negativeMarking: 0.25,
    );

    final questions = [
      const QuestionModel(
        id: 'q1',
        questionText: 'Question 1',
        questionBengaliText: 'প্রশ্ন ১',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctOption: 'A',
        marks: 1.0,
        negativeMarks: 0.25,
      ),
      const QuestionModel(
        id: 'q2',
        questionText: 'Question 2',
        questionBengaliText: 'প্রশ্ন ২',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctOption: 'B',
        marks: 1.0,
        negativeMarks: 0.25,
      ),
      const QuestionModel(
        id: 'q3',
        questionText: 'Question 3',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctOption: 'C',
        marks: 1.0,
        negativeMarks: 0.25,
      ),
      const QuestionModel(
        id: 'q4',
        questionText: 'Question 4',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctOption: 'D',
        marks: 1.0,
        negativeMarks: 0.25,
      ),
    ];

    test('calculates perfect score correctly', () {
      final repository = TestRunnerRepository();
      final answers = {
        'q1': AttemptAnswerState(questionId: 'q1', selectedOption: 'A'),
        'q2': AttemptAnswerState(questionId: 'q2', selectedOption: 'B'),
        'q3': AttemptAnswerState(questionId: 'q3', selectedOption: 'C'),
        'q4': AttemptAnswerState(questionId: 'q4', selectedOption: 'D'),
      };

      final result = repository.gradeAndSubmitAttempt(
        test: testModel,
        questions: questions,
        answers: answers,
        timeSpentSeconds: 120,
      );

      expect(result.correctCount, equals(4));
      expect(result.wrongCount, equals(0));
      expect(result.skippedCount, equals(0));
      expect(result.score, equals(4.0));
      expect(result.accuracy, equals(100.0));
      expect(result.percentage, equals(100.0));
    });

    test('deducts negative marks for incorrect answers', () {
      final repository = TestRunnerRepository();
      // q1 correct (+1), q2 wrong (-0.25), q3 wrong (-0.25), q4 skipped (0)
      final answers = {
        'q1': AttemptAnswerState(questionId: 'q1', selectedOption: 'A'), // correct
        'q2': AttemptAnswerState(questionId: 'q2', selectedOption: 'A'), // wrong
        'q3': AttemptAnswerState(questionId: 'q3', selectedOption: 'A'), // wrong
        'q4': AttemptAnswerState(questionId: 'q4', selectedOption: null), // skipped
      };

      final result = repository.gradeAndSubmitAttempt(
        test: testModel,
        questions: questions,
        answers: answers,
        timeSpentSeconds: 90,
      );

      expect(result.correctCount, equals(1));
      expect(result.wrongCount, equals(2));
      expect(result.skippedCount, equals(1));
      // Expected score: 1.0 - 0.25 - 0.25 = 0.5
      expect(result.score, equals(0.5));
      // Accuracy: 1 / 3 attempted = 33.3%
      expect(result.accuracy, equals(33.3));
    });

    test('provides Bengali question text when preferred', () {
      final q = questions[0];
      expect(q.getLocalizedQuestion(true), equals('প্রশ্ন ১'));
      expect(q.getLocalizedQuestion(false), equals('Question 1'));
    });
  });
}
