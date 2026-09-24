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
              testTitle: 'WBP Constable Mock 01',
              score: 68.0,
              totalMarks: 100.0,
              percentage: 68.0,
              accuracy: 73.9,
              correctCount: 68,
              wrongCount: 24,
              skippedCount: 8,
              timeSpentSeconds: 2892,
              totalQuestions: 100,
              completedAt: DateTime.now(),
            ),
    );

    final minutes = attempt.timeSpentSeconds ~/ 60;
    final seconds = attempt.timeSpentSeconds % 60;
    final timeStr = '${minutes}m ${seconds}s';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.navy),
          onPressed: () => context.go('/home'),
        ),
        title: const Text(
          'Test Result',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.navy,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 20, color: AppColors.navy),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Scorecard link copied to clipboard!')),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Golden Trophy Illustration with Confetti Effect
            Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7).withValues(alpha: 0.6),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Color(0x40F59E0B),
                          blurRadius: 16,
                          offset: Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.emoji_events_rounded, color: Colors.white, size: 40),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            const Center(
              child: Text(
                'Test Completed!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.navy,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                'Here is your performance in ${attempt.testTitle}',
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 20),

            // Dual Scorecard: Your Score & Rank
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Left: Your Score
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text(
                          'Your Score',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '${attempt.score.toInt()}',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                            Text(
                              ' / ${attempt.totalMarks.toInt()}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Divider
                  Container(width: 1, height: 50, color: const Color(0xFFE2E8F0)),

                  // Right: Rank
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text(
                          'All Bengal Rank',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              '#1243',
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                                color: AppColors.navy,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.arrow_upward_rounded, size: 10, color: Color(0xFF16A34A)),
                                  Text(
                                    '12%',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Triple Metric Row: Correct, Incorrect, Skipped
            Row(
              children: [
                Expanded(
                  child: _buildResultStatCard(
                    icon: Icons.check_circle_outline_rounded,
                    count: '${attempt.correctCount}',
                    label: 'Correct',
                    color: const Color(0xFF16A34A),
                    bgColor: const Color(0xFFF0FDF4),
                    borderColor: const Color(0xFFBBF7D0),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildResultStatCard(
                    icon: Icons.cancel_outlined,
                    count: '${attempt.wrongCount}',
                    label: 'Incorrect',
                    color: const Color(0xFFEF4444),
                    bgColor: const Color(0xFFFEF2F2),
                    borderColor: const Color(0xFFFECACA),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildResultStatCard(
                    icon: Icons.remove_circle_outline_rounded,
                    count: '${attempt.skippedCount}',
                    label: 'Skipped',
                    color: const Color(0xFF64748B),
                    bgColor: const Color(0xFFF8FAFC),
                    borderColor: const Color(0xFFE2E8F0),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Performance Analysis Breakdown Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildAnalysisRow(
                    icon: Icons.track_changes_rounded,
                    iconColor: AppColors.primary,
                    label: 'Accuracy',
                    value: '${attempt.accuracy.toStringAsFixed(1)}%',
                    subtext: 'High precision',
                  ),
                  const Divider(height: 24, color: Color(0xFFF1F5F9)),
                  _buildAnalysisRow(
                    icon: Icons.timer_outlined,
                    iconColor: const Color(0xFFF59E0B),
                    label: 'Time Spent',
                    value: timeStr,
                    subtext: 'Avg. 34s / question',
                  ),
                  const Divider(height: 24, color: Color(0xFFF1F5F9)),
                  _buildAnalysisRow(
                    icon: Icons.leaderboard_outlined,
                    iconColor: const Color(0xFF8B5CF6),
                    label: 'Percentile',
                    value: '84.2%',
                    subtext: 'Better than 84% users',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Action 1: View Detailed Analysis Button
            ElevatedButton(
              onPressed: () {
                context.push('/analysis/${attempt.id}', extra: attempt);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('View Detailed Analysis', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward_rounded, size: 18),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Action 2: Re-attempt Test
            OutlinedButton(
              onPressed: () {
                context.pushReplacement('/live-test/${attempt.testId}');
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.navy,
                side: const BorderSide(color: Color(0xFFCBD5E1)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.refresh_rounded, size: 18),
                  SizedBox(width: 8),
                  Text('Re-attempt Test', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildResultStatCard({
    required IconData icon,
    required String count,
    required String label,
    required Color color,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 6),
          Text(
            count,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalysisRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required String subtext,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
              Text(
                subtext,
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.navy),
        ),
      ],
    );
  }
}
