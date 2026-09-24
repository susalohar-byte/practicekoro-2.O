import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class PracticeScreen extends StatelessWidget {
  const PracticeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final modes = [
      {
        'title': 'Subject Practice',
        'subtitle': 'Topic-wise questions from all syllabus subjects',
        'icon': Icons.menu_book_rounded,
        'color': const Color(0xFF2563EB),
        'bgColor': const Color(0xFFEFF6FF),
        'onTap': () => context.push('/practice/topics/math'),
      },
      {
        'title': 'Topic Practice',
        'subtitle': 'Drill down into specific chapters & sub-topics',
        'icon': Icons.category_rounded,
        'color': const Color(0xFF10B981),
        'bgColor': const Color(0xFFECFDF5),
        'onTap': () => context.push('/practice/topics/gk'),
      },
      {
        'title': 'Chapter PYQs',
        'subtitle': 'Previous years question papers solved chapter-wise',
        'icon': Icons.history_edu_rounded,
        'color': const Color(0xFFF59E0B),
        'bgColor': const Color(0xFFFEF3C7),
        'onTap': () => context.push('/practice/topics/reasoning'),
      },
      {
        'title': 'Weak Topic Practice',
        'subtitle': 'Special questions on areas where your accuracy is low',
        'icon': Icons.trending_down_rounded,
        'color': const Color(0xFFEF4444),
        'bgColor': const Color(0xFFFEF2F2),
        'badge': 'Needs Focus',
        'badgeColor': const Color(0xFFEF4444),
        'onTap': () => context.push('/live-test/test-wbp-001'),
      },
      {
        'title': 'Incorrect Questions',
        'subtitle': 'Re-attempt all questions you previously answered wrong',
        'icon': Icons.cancel_outlined,
        'color': const Color(0xFFDC2626),
        'bgColor': const Color(0xFFFEE2E2),
        'badge': '36 Questions',
        'badgeColor': const Color(0xFFDC2626),
        'onTap': () => context.push('/saved-questions'),
      },
      {
        'title': 'Saved Questions',
        'subtitle': 'Access all important questions you bookmarked',
        'icon': Icons.bookmark_rounded,
        'color': const Color(0xFF8B5CF6),
        'bgColor': const Color(0xFFF5F3FF),
        'badge': '24 Questions',
        'badgeColor': const Color(0xFF8B5CF6),
        'onTap': () => context.push('/saved-questions'),
      },
      {
        'title': 'Random Practice',
        'subtitle': 'Quick mixed speed challenge of 10-20 questions',
        'icon': Icons.shuffle_rounded,
        'color': const Color(0xFF06B6D4),
        'bgColor': const Color(0xFFECFEFF),
        'onTap': () => context.push('/live-test/test-wbp-001'),
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Practice',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: AppColors.navy,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: AppColors.navy),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            const Text(
              'Select Practice Mode',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.navy,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Boost your weak topics and master previous questions',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),

            // 7 Modes List
            ...modes.map((mode) {
              final color = mode['color'] as Color;
              final bgColor = mode['bgColor'] as Color;
              final badge = mode['badge'] as String?;
              final badgeColor = mode['badgeColor'] as Color?;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: mode['onTap'] as VoidCallback,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(14),
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
                        // Colored squircle icon
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: bgColor,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            mode['icon'] as IconData,
                            color: color,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),

                        // Title & Subtitle
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    mode['title'] as String,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.navy,
                                    ),
                                  ),
                                  if (badge != null && badgeColor != null) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: badgeColor.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        badge,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: badgeColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                mode['subtitle'] as String,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(width: 8),
                        const Icon(
                          Icons.chevron_right_rounded,
                          color: Color(0xFF94A3B8),
                          size: 22,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
