import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/test_model.dart';
import '../models/question_model.dart';
import '../models/attempt_model.dart';
import '../datasources/local_storage.dart';

final testRunnerRepositoryProvider = Provider<TestRunnerRepository>((ref) {
  return TestRunnerRepository();
});

class TestRunnerRepository {
  SupabaseClient? get _supabase {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  TestAttemptModel gradeAndSubmitAttempt({
    required MockTestModel test,
    required List<QuestionModel> questions,
    required Map<String, AttemptAnswerState> answers,
    required int timeSpentSeconds,
    String? userId,
  }) {
    int correctCount = 0;
    int wrongCount = 0;
    int skippedCount = 0;
    double rawScore = 0.0;

    for (final q in questions) {
      final answer = answers[q.id];
      if (answer == null || answer.selectedOption == null) {
        skippedCount++;
      } else if (answer.selectedOption!.toUpperCase() == q.correctOption.toUpperCase()) {
        correctCount++;
        rawScore += q.marks;
      } else {
        wrongCount++;
        rawScore -= q.negativeMarks;
      }
    }

    final totalMarks = test.totalMarks > 0 ? test.totalMarks : (questions.length * 1.0);
    final score = rawScore < 0 ? 0.0 : rawScore;
    final percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0.0;
    final attemptedCount = correctCount + wrongCount;
    final accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0.0;

    final attempt = TestAttemptModel(
      id: 'att-${DateTime.now().millisecondsSinceEpoch}',
      userId: userId ?? _supabase?.auth.currentUser?.id ?? 'guest-student',
      testId: test.id,
      testTitle: test.title,
      score: double.parse(score.toStringAsFixed(2)),
      totalMarks: totalMarks,
      percentage: double.parse(percentage.toStringAsFixed(1)),
      accuracy: double.parse(accuracy.toStringAsFixed(1)),
      correctCount: correctCount,
      wrongCount: wrongCount,
      skippedCount: skippedCount,
      timeSpentSeconds: timeSpentSeconds,
      totalQuestions: questions.length,
      completedAt: DateTime.now(),
      answers: answers,
    );

    // Save locally for instant offline access
    LocalStorageService.saveAttempt(attempt);

    // If online, sync in background
    _syncAttemptToSupabase(attempt, test, questions);

    return attempt;
  }

  Future<void> _syncAttemptToSupabase(
    TestAttemptModel attempt,
    MockTestModel test,
    List<QuestionModel> questions,
  ) async {
    final client = _supabase;
    if (client == null || client.auth.currentUser == null) return;

    try {
      await client.from('test_attempts').insert({
        'user_id': client.auth.currentUser!.id,
        'test_id': test.id,
        'score': attempt.score,
        'total_marks': attempt.totalMarks,
        'percentage': attempt.percentage,
        'accuracy': attempt.accuracy,
        'correct_count': attempt.correctCount,
        'wrong_count': attempt.wrongCount,
        'skipped_count': attempt.skippedCount,
        'time_spent_seconds': attempt.timeSpentSeconds,
        'status': 'completed',
        'completed_at': attempt.completedAt.toIso8601String(),
      });
    } catch (_) {
      // Ignored for offline grace
    }
  }
}
