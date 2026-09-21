import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/pk_pill_tabs.dart';

class PracticeScreen extends StatefulWidget {
  const PracticeScreen({super.key});

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  int _selectedTabIndex = 0; // 0: Subjects, 1: Topics

  final List<Map<String, dynamic>> _subjects = [
    {
      'id': 'math',
      'title': 'Mathematics',
      'questions': '1,240 Questions',
      'icon': Icons.calculate_rounded,
      'color': AppColors.primary,
      'bgColor': AppColors.primaryLight,
    },
    {
      'id': 'reasoning',
      'title': 'Reasoning',
      'questions': '960 Questions',
      'icon': Icons.psychology_rounded,
      'color': AppColors.error,
      'bgColor': AppColors.errorLight,
    },
    {
      'id': 'gk',
      'title': 'General Knowledge',
      'questions': '1,520 Questions',
      'icon': Icons.public_rounded,
      'color': AppColors.success,
      'bgColor': AppColors.successLight,
    },
    {
      'id': 'english',
      'title': 'English',
      'questions': '1,010 Questions',
      'icon': Icons.translate_rounded,
      'color': AppColors.purple,
      'bgColor': AppColors.purpleLight,
    },
    {
      'id': 'bengali',
      'title': 'Bengali',
      'questions': '820 Questions',
      'icon': Icons.menu_book_rounded,
      'color': AppColors.orange,
      'bgColor': AppColors.orangeLight,
    },
    {
      'id': 'computer',
      'title': 'Computer',
      'questions': '640 Questions',
      'icon': Icons.computer_rounded,
      'color': AppColors.cyan,
      'bgColor': AppColors.cyanLight,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
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
            icon: const Icon(Icons.info_outline_rounded, color: AppColors.navy),
            onPressed: () {},
          ),
        ],
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          children: [
            const Text(
              'Choose a subject to start practicing',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),

            // Segmented Switcher (Subjects | Topics)
            PKPillTabs(
              tabs: const ['Subjects', 'Topics'],
              selectedIndex: _selectedTabIndex,
              isFullWidth: true,
              padding: EdgeInsets.zero,
              onTabSelected: (idx) {
                setState(() => _selectedTabIndex = idx);
                if (idx == 1) {
                  context.push('/practice/topics/math');
                }
              },
            ),

            const SizedBox(height: 18),

            // 6 Subject Cards Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.25,
              ),
              itemCount: _subjects.length,
              itemBuilder: (context, index) {
                final sub = _subjects[index];
                return InkWell(
                  onTap: () {
                    context.push('/practice/topics/${sub['id']}');
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(14),
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
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: sub['bgColor'] as Color,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            sub['icon'] as IconData,
                            color: sub['color'] as Color,
                            size: 20,
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              sub['title'] as String,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: AppColors.navy,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              sub['questions'] as String,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 24),

            // Quick Practice Section
            const Text(
              'Quick Practice',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: AppColors.navy,
              ),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => context.push('/live-test/test-wbp-001'),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
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
                            child: const Icon(Icons.flash_on_rounded, color: AppColors.success, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Daily Practice',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.navy),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  '10 Q • 5 Min',
                                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () => context.push('/live-test/test-wbp-002'),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.errorLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Weak Topics',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.navy),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Focus Now',
                                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
