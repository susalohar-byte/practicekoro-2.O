import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class ExamTestsScreen extends StatefulWidget {
  final String examId;

  const ExamTestsScreen({super.key, required this.examId});

  @override
  State<ExamTestsScreen> createState() => _ExamTestsScreenState();
}

class _ExamTestsScreenState extends State<ExamTestsScreen> {
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All Tests', 'Full Mock', 'Topic Test', 'PYQ'];

  String get _seriesTitle {
    switch (widget.examId) {
      case 'wbp-constable':
        return 'WBP Constable';
      case 'wbpsc-clerkship':
        return 'WBPSC Clerkship';
      case 'ssc-gd':
        return 'SSC GD';
      case 'railway-group-d':
        return 'Railway Group D';
      case 'wbssc-group-d':
        return 'WBSSC Group D';
      default:
        return 'WBP Constable';
    }
  }

  final List<Map<String, dynamic>> _tests = [
    {
      'id': 'test-wbp-001',
      'title': 'Full Mock Test 01',
      'subtitle': '85 Questions • 60 Minutes',
      'category': 'Full Mock',
      'isLocked': false,
      'tag': null,
      'iconColor': const Color(0xFF8B5CF6),
      'iconBg': const Color(0xFFF3E8FF),
    },
    {
      'id': 'test-wbp-002',
      'title': 'Full Mock Test 02',
      'subtitle': '85 Questions • 60 Minutes',
      'category': 'Full Mock',
      'isLocked': true,
      'tag': null,
      'iconColor': const Color(0xFF8B5CF6),
      'iconBg': const Color(0xFFF3E8FF),
    },
    {
      'id': 'test-topic-gk-01',
      'title': 'General Knowledge - 01',
      'subtitle': '25 Questions • 20 Minutes',
      'category': 'Topic Test',
      'isLocked': false,
      'tag': 'Topic',
      'tagColor': const Color(0xFF10B981),
      'tagBg': const Color(0xFFECFDF5),
      'iconColor': const Color(0xFF10B981),
      'iconBg': const Color(0xFFECFDF5),
    },
    {
      'id': 'test-topic-gk-02',
      'title': 'General Knowledge - 02',
      'subtitle': '25 Questions • 20 Minutes',
      'category': 'Topic Test',
      'isLocked': true,
      'tag': 'Topic',
      'tagColor': const Color(0xFF10B981),
      'tagBg': const Color(0xFFECFDF5),
      'iconColor': const Color(0xFFEF4444),
      'iconBg': const Color(0xFFFEE2E2),
    },
    {
      'id': 'test-topic-reas-01',
      'title': 'Reasoning - 01',
      'subtitle': '25 Questions • 20 Minutes',
      'category': 'Topic Test',
      'isLocked': false,
      'tag': 'Topic',
      'tagColor': const Color(0xFF10B981),
      'tagBg': const Color(0xFFECFDF5),
      'iconColor': const Color(0xFF10B981),
      'iconBg': const Color(0xFFECFDF5),
    },
    {
      'id': 'test-topic-reas-02',
      'title': 'Reasoning - 02',
      'subtitle': '25 Questions • 20 Minutes',
      'category': 'Topic Test',
      'isLocked': true,
      'tag': 'Topic',
      'tagColor': const Color(0xFF10B981),
      'tagBg': const Color(0xFFECFDF5),
      'iconColor': const Color(0xFFF59E0B),
      'iconBg': const Color(0xFFFEF3C7),
    },
    {
      'id': 'pyq-wbp-2021',
      'title': 'Previous Year Paper 2021',
      'subtitle': '85 Questions • 60 Minutes',
      'category': 'PYQ',
      'isLocked': false,
      'tag': 'Pro',
      'tagColor': AppColors.primary,
      'tagBg': const Color(0xFFEFF6FF),
      'iconColor': AppColors.primary,
      'iconBg': const Color(0xFFEFF6FF),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final activeFilter = _filters[_selectedFilterIndex];
    final filteredTests = _tests.where((t) {
      if (activeFilter == 'All Tests') return true;
      return t['category'] == activeFilter;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: AppColors.navy),
          onPressed: () => context.pop(),
        ),
        title: Text(
          _seriesTitle,
          style: const TextStyle(
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

            // Tests List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                itemCount: filteredTests.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final t = filteredTests[index];
                  final isLocked = t['isLocked'] == true;
                  final tag = t['tag'] as String?;

                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Left Soft Colored Squircle Icon
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: t['iconBg'] as Color,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            Icons.description_outlined,
                            color: t['iconColor'] as Color,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Title & Subtitle + Tag
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      t['title'] as String,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.navy,
                                      ),
                                    ),
                                  ),
                                  if (tag != null) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: t['tagBg'] as Color,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        tag,
                                        style: TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.bold,
                                          color: t['tagColor'] as Color,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                t['subtitle'] as String,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF64748B),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Action: Blue "Start" button or Lock icon
                        if (isLocked)
                          IconButton(
                            onPressed: () {
                              context.push('/subscription');
                            },
                            icon: const Icon(
                              Icons.lock_outline_rounded,
                              size: 20,
                              color: Color(0xFF94A3B8),
                            ),
                          )
                        else
                          ElevatedButton(
                            onPressed: () {
                              context.push('/live-test/${t['id']}');
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'Start',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
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
