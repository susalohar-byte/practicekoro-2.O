import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/pk_pill_tabs.dart';

class ExamsCatalogScreen extends StatefulWidget {
  const ExamsCatalogScreen({super.key});

  @override
  State<ExamsCatalogScreen> createState() => _ExamsCatalogScreenState();
}

class _ExamsCatalogScreenState extends State<ExamsCatalogScreen> {
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All Exams', 'WBSSC', 'WBP', 'SSC'];

  final List<Map<String, dynamic>> _testSeries = [
    {
      'id': 'test-wbssc-001',
      'title': 'WBSSC Group D',
      'subtitle': '20 Full Tests • 2000+ Questions',
      'category': 'WBSSC',
      'icon': Icons.account_balance_rounded,
      'color': AppColors.orange,
    },
    {
      'id': 'test-wbp-001',
      'title': 'WBP Constable',
      'subtitle': '15 Full Tests • 1600+ Questions',
      'category': 'WBP',
      'icon': Icons.shield_rounded,
      'color': AppColors.error,
    },
    {
      'id': 'test-wbpsc-001',
      'title': 'WBPSC Clerkship',
      'subtitle': '20 Full Tests • 2000+ Questions',
      'category': 'WBSSC',
      'icon': Icons.stars_rounded,
      'color': AppColors.gold,
    },
    {
      'id': 'test-tet-001',
      'title': 'Primary TET',
      'subtitle': '12 Full Tests • 1200+ Questions',
      'category': 'WBSSC',
      'icon': Icons.menu_book_rounded,
      'color': AppColors.purple,
    },
    {
      'id': 'test-ssc-001',
      'title': 'SSC GD',
      'subtitle': '25 Full Tests • 2500+ Questions',
      'category': 'SSC',
      'icon': Icons.military_tech_rounded,
      'color': AppColors.navy,
    },
    {
      'id': 'test-rail-001',
      'title': 'Railway (NTPC)',
      'subtitle': '18 Full Tests • 1800+ Questions',
      'category': 'SSC',
      'icon': Icons.train_rounded,
      'color': AppColors.cyan,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final activeFilter = _filters[_selectedFilterIndex];
    final filteredList = _testSeries.where((t) {
      if (activeFilter == 'All Exams') return true;
      return t['category'] == activeFilter;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Test Series',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: AppColors.navy,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: AppColors.navy, size: 24),
            onPressed: () {},
          ),
        ],
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),

            // Exam Filter Pills
            PKPillTabs(
              tabs: _filters,
              selectedIndex: _selectedFilterIndex,
              onTabSelected: (idx) => setState(() => _selectedFilterIndex = idx),
            ),

            const SizedBox(height: 12),

            // Test Series Cards List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                itemCount: filteredList.length,
                itemBuilder: (context, index) {
                  final item = filteredList[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      onTap: () {
                        context.push('/live-test/${item['id']}');
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(16),
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
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: (item['color'] as Color).withAlpha(25),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                item['icon'] as IconData,
                                color: item['color'] as Color,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'] as String,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.navy,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    item['subtitle'] as String,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.chevron_right_rounded,
                              color: AppColors.textMuted,
                              size: 22,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
