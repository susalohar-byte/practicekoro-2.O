import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../data/datasources/local_storage.dart';
import '../../data/models/attempt_model.dart';

class ResultScreen extends StatelessWidget {
  final String attemptId;

  const ResultScreen({super.key, required this.attemptId});

  @override
  Widget build(BuildContext context) {
    final attempts = LocalStorageService.getAttempts();
    final attempt = attempts.firstWhere(
      (a) => a.id == attemptId,
      orElse: () => attempts.isNotEmpty
          ? attempts.first
          : TestAttemptModel(
              id: attemptId,
              userId: 'student',
              testId: 'test-wbp-001',
              testTitle: 'WBSSC Group D Mock',
              score: 72.0,
              totalMarks: 100.0,
              percentage: 72.0,
              accuracy: 78.0,
              correctCount: 78,
              wrongCount: 22,
              skippedCount: 0,
              timeSpentSeconds: 2400,
              totalQuestions: 100,
              completedAt: DateTime.now(),
            ),
    );

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.go('/home'),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          children: [
            // Golden Trophy Illustration
            Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppColors.goldLight.withAlpha(120),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      gradient: AppColors.goldGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.gold.withAlpha(80),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.emoji_events_rounded, color: Colors.white, size: 44),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            const Center(
              child: Text(
                'Great Job!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppColors.navy,
                ),
              ),
            ),
            const SizedBox(height: 4),
            const Center(
              child: Text(
                'You have completed the test.',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
            ),

            const SizedBox(height: 20),

            // Score Card
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withAlpha(80),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primaryLight),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${attempt.score.toInt()}',
                        style: const TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        ' / ${attempt.totalMarks.toInt()}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Your Score',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Metrics Row (Correct, Incorrect, Skipped)
            Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    count: '${attempt.correctCount}',
                    label: 'Correct',
                    color: AppColors.success,
                    bgColor: AppColors.successLight,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    count: '${attempt.wrongCount}',
                    label: 'Incorrect',
                    color: AppColors.error,
                    bgColor: AppColors.errorLight,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    count: '${attempt.skippedCount}',
                    label: 'Skipped',
                    color: AppColors.primary,
                    bgColor: AppColors.primaryLight,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // Action 1: View Detailed Analysis
            InkWell(
              onTap: () {
                context.push('/analysis/${attempt.id}', extra: attempt);
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.purpleLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.assessment_outlined, color: AppColors.purple, size: 20),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Text(
                        'View Detailed Analysis',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 10),

            // Action 2: Review Answers
            InkWell(
              onTap: () {
                context.push('/solutions/${attempt.testId}', extra: attempt);
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.successLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.fact_check_outlined, color: AppColors.success, size: 20),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Text(
                        'Review Answers',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 28),

            // Bottom Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      context.pushReplacement('/live-test/${attempt.testId}');
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.navy,
                      side: const BorderSide(color: AppColors.border),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Attempt Again', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => context.go('/home'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile({
    required String count,
    required String label,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: bgColor.withAlpha(120),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(
            count,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
