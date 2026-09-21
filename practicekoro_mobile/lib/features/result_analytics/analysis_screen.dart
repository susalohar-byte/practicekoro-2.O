import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/pk_circular_progress.dart';
import '../../core/widgets/pk_pill_tabs.dart';
import '../../data/models/attempt_model.dart';

class AnalysisScreen extends StatefulWidget {
  final String attemptId;
  final TestAttemptModel? attempt;

  const AnalysisScreen({super.key, required this.attemptId, this.attempt});

  @override
  State<AnalysisScreen> createState() => _AnalysisScreenState();
}

class _AnalysisScreenState extends State<AnalysisScreen> {
  int _selectedTabIndex = 0; // 0: Overview, 1: Subject-wise, 2: Topic-wise
  final List<String> _tabs = ['Overview', 'Subject-wise', 'Topic-wise'];

  final List<Map<String, dynamic>> _subjectStats = [
    {'title': 'Mathematics', 'percentage': 78, 'color': AppColors.primary, 'icon': Icons.calculate_rounded},
    {'title': 'Reasoning', 'percentage': 84, 'color': AppColors.error, 'icon': Icons.psychology_rounded},
    {'title': 'General Knowledge', 'percentage': 61, 'color': AppColors.success, 'icon': Icons.public_rounded},
    {'title': 'English', 'percentage': 72, 'color': AppColors.purple, 'icon': Icons.translate_rounded},
    {'title': 'Bengali', 'percentage': 68, 'color': AppColors.orange, 'icon': Icons.menu_book_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    final accuracy = widget.attempt?.accuracy ?? 72.0;
    final correct = widget.attempt?.correctCount ?? 78;
    final incorrect = widget.attempt?.wrongCount ?? 22;
    final skipped = widget.attempt?.skippedCount ?? 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Detailed Analysis',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          children: [
            // Tab Switcher
            PKPillTabs(
              tabs: _tabs,
              selectedIndex: _selectedTabIndex,
              isFullWidth: true,
              padding: EdgeInsets.zero,
              onTabSelected: (idx) => setState(() => _selectedTabIndex = idx),
            ),

            const SizedBox(height: 18),

            // Section 1: Your Performance
            const Text(
              'Your Performance',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Circular Ring 72%
                  PKCircularRing(
                    percentage: accuracy,
                    size: 96,
                    strokeWidth: 8,
                    centerText: '${accuracy.toInt()}%',
                    subText: 'Accuracy',
                    progressColor: AppColors.primary,
                    backgroundColor: AppColors.primaryLight,
                  ),
                  const SizedBox(width: 24),
                  // Legend
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLegendRow('Correct', '$correct', AppColors.success),
                        const SizedBox(height: 10),
                        _buildLegendRow('Incorrect', '$incorrect', AppColors.error),
                        const SizedBox(height: 10),
                        _buildLegendRow('Skipped', '$skipped', AppColors.cyan),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // Section 2: Subject Performance
            const Text(
              'Subject Performance',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: _subjectStats.map((stat) {
                  final color = stat['color'] as Color;
                  final percentage = stat['percentage'] as int;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: color.withAlpha(20),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(stat['icon'] as IconData, color: color, size: 16),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                stat['title'] as String,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.navy,
                                ),
                              ),
                            ),
                            Text(
                              '$percentage%',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: color,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: percentage / 100,
                            backgroundColor: AppColors.surfaceMuted,
                            valueColor: AlwaysStoppedAnimation<Color>(color),
                            minHeight: 6,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendRow(String label, String count, Color color) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
          ),
        ),
        Text(
          count,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.navy),
        ),
      ],
    );
  }
}
