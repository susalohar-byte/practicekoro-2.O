import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/pk_pill_tabs.dart';

class ExamSelectionScreen extends StatefulWidget {
  const ExamSelectionScreen({super.key});

  @override
  State<ExamSelectionScreen> createState() => _ExamSelectionScreenState();
}

class _ExamSelectionScreenState extends State<ExamSelectionScreen> {
  int _selectedCategoryIndex = 0;
  final TextEditingController _searchController = TextEditingController();
  final List<String> _categories = ['West Bengal', 'SSC', 'Railway', 'All'];

  final List<Map<String, dynamic>> _allExams = [
    {
      'id': 'wbssc-group-d',
      'title': 'WBSSC Group D',
      'category': 'West Bengal',
      'subtitle': 'State Government',
      'icon': Icons.account_balance_rounded,
      'color': AppColors.orange,
    },
    {
      'id': 'wbp-constable',
      'title': 'WBP Constable',
      'category': 'West Bengal',
      'subtitle': 'State Government',
      'icon': Icons.shield_rounded,
      'color': AppColors.error,
    },
    {
      'id': 'wbpsc',
      'title': 'WBPSC',
      'category': 'West Bengal',
      'subtitle': 'State Government',
      'icon': Icons.stars_rounded,
      'color': AppColors.gold,
    },
    {
      'id': 'primary-tet',
      'title': 'Primary TET',
      'category': 'West Bengal',
      'subtitle': 'Teaching Eligibility',
      'icon': Icons.menu_book_rounded,
      'color': AppColors.purple,
    },
    {
      'id': 'ssc-gd',
      'title': 'SSC GD',
      'category': 'SSC',
      'subtitle': 'Central Government',
      'icon': Icons.military_tech_rounded,
      'color': AppColors.navy,
    },
    {
      'id': 'railway-ntpc',
      'title': 'Railway (NTPC)',
      'category': 'Railway',
      'subtitle': 'Central Government',
      'icon': Icons.train_rounded,
      'color': AppColors.cyan,
    },
    {
      'id': 'ssc-cgl',
      'title': 'SSC CGL',
      'category': 'SSC',
      'subtitle': 'Central Government',
      'icon': Icons.badge_rounded,
      'color': AppColors.primary,
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedCat = _categories[_selectedCategoryIndex];
    final query = _searchController.text.toLowerCase();

    final filteredExams = _allExams.where((exam) {
      final matchesCategory = selectedCat == 'All' || exam['category'] == selectedCat;
      final matchesQuery = query.isEmpty ||
          (exam['title'] as String).toLowerCase().contains(query) ||
          (exam['subtitle'] as String).toLowerCase().contains(query);
      return matchesCategory && matchesQuery;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Choose Your Exam',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: AppColors.navy,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Select the exam you want to prepare for',
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),

                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() {}),
                      decoration: const InputDecoration(
                        hintText: 'Search exams...',
                        hintStyle: TextStyle(fontSize: 14, color: AppColors.textMuted),
                        prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 22),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Category Filter Tabs
            PKPillTabs(
              tabs: _categories,
              selectedIndex: _selectedCategoryIndex,
              onTabSelected: (idx) => setState(() => _selectedCategoryIndex = idx),
            ),

            const SizedBox(height: 12),

            // Exams List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                itemCount: filteredExams.length,
                separatorBuilder: (_, _) => const Divider(height: 1, color: AppColors.borderSubtle),
                itemBuilder: (context, index) {
                  final exam = filteredExams[index];
                  return InkWell(
                    onTap: () {
                      context.push('/primary-exam', extra: exam['id']);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: (exam['color'] as Color).withAlpha(25),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              exam['icon'] as IconData,
                              color: exam['color'] as Color,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  exam['title'] as String,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.navy,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  exam['subtitle'] as String,
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
