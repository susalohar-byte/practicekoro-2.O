import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class ExamsCatalogScreen extends StatefulWidget {
  const ExamsCatalogScreen({super.key});

  @override
  State<ExamsCatalogScreen> createState() => _ExamsCatalogScreenState();
}

class _ExamsCatalogScreenState extends State<ExamsCatalogScreen> {
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All', 'Full Mock', 'Topic Test', 'PYQ'];

  final List<Map<String, dynamic>> _seriesList = [
    {
      'id': 'wbp-constable',
      'title': 'WBP Constable Test Series',
      'subtitle': '85 Tests • Bilingual',
      'emblem': 'assets/images/exams/emblem_wbp.png',
      'fallbackIcon': Icons.shield_rounded,
      'color': const Color(0xFFEF4444),
      'fullMock': 'Full Mock 25',
      'topic': 'Topic 40',
      'pyq': 'PYQ 20',
      'category': 'Full Mock',
    },
    {
      'id': 'wbpsc-clerkship',
      'title': 'WBPSC Clerkship Test Series',
      'subtitle': '50 Tests • Bilingual',
      'emblem': 'assets/images/exams/emblem_wbpsc.png',
      'fallbackIcon': Icons.stars_rounded,
      'color': const Color(0xFFF59E0B),
      'fullMock': 'Full Mock 20',
      'topic': 'Topic 20',
      'pyq': 'PYQ 10',
      'category': 'Full Mock',
    },
    {
      'id': 'ssc-gd',
      'title': 'SSC GD Test Series',
      'subtitle': '60 Tests • Bilingual',
      'emblem': 'assets/images/exams/emblem_ssc.png',
      'fallbackIcon': Icons.military_tech_rounded,
      'color': AppColors.primary,
      'fullMock': 'Full Mock 25',
      'topic': 'Topic 25',
      'pyq': 'PYQ 10',
      'category': 'Topic Test',
    },
    {
      'id': 'railway-group-d',
      'title': 'Railway Group D Test Series',
      'subtitle': '45 Tests • Bilingual',
      'emblem': 'assets/images/exams/emblem_railway.png',
      'fallbackIcon': Icons.train_rounded,
      'color': const Color(0xFF0F172A),
      'fullMock': 'Full Mock 20',
      'topic': 'Topic 15',
      'pyq': 'PYQ 10',
      'category': 'PYQ',
    },
    {
      'id': 'wbssc-group-d',
      'title': 'WBSSC Group D Test Series',
      'subtitle': '50 Tests • Bilingual',
      'emblem': 'assets/images/exams/emblem_wbssc.png',
      'fallbackIcon': Icons.account_balance_rounded,
      'color': const Color(0xFFF97316),
      'fullMock': 'Full Mock 20',
      'topic': 'Topic 20',
      'pyq': 'PYQ 10',
      'category': 'Full Mock',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final activeFilter = _filters[_selectedFilterIndex];
    final items = _seriesList.where((s) {
      if (activeFilter == 'All') return true;
      return s['category'] == activeFilter;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: AppColors.navy),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              context.go('/home');
            }
          },
        ),
        title: const Text(
          'Test Series',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: AppColors.navy,
            letterSpacing: -0.3,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Pills
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(_filters.length, (idx) {
                    final isSel = _selectedFilterIndex == idx;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedFilterIndex = idx),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                        decoration: BoxDecoration(
                          color: isSel ? AppColors.primary : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _filters[idx],
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSel ? FontWeight.w700 : FontWeight.w600,
                            color: isSel ? Colors.white : const Color(0xFF64748B),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Series Cards List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = items[index];

                  return InkWell(
                    onTap: () {
                      context.push('/exams/${item['id']}');
                    },
                    borderRadius: BorderRadius.circular(18),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top row: Emblem, Title, Chevron
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFF1F5F9)),
                                ),
                                child: Image.asset(
                                  item['emblem'] as String,
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => Icon(
                                    item['fallbackIcon'] as IconData,
                                    color: item['color'] as Color,
                                    size: 24,
                                  ),
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
                                        fontSize: 14.5,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.navy,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      item['subtitle'] as String,
                                      style: const TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w500,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(
                                Icons.chevron_right_rounded,
                                color: Color(0xFF94A3B8),
                                size: 22,
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Badges Row: Full Mock 25, Topic 40, PYQ 20
                          Row(
                            children: [
                              _buildCountPill(item['fullMock'] as String),
                              const SizedBox(width: 6),
                              _buildCountPill(item['topic'] as String),
                              const SizedBox(width: 6),
                              _buildCountPill(item['pyq'] as String),
                            ],
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

  Widget _buildCountPill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFDBEAFE)),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
        ),
      ),
    );
  }
}
