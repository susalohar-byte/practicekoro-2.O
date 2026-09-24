import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/pk_pill_tabs.dart';
import '../../data/datasources/local_storage.dart';
import '../../data/models/attempt_model.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  int _selectedMainTab = 0; // 0: Your Rank (Web 1:1), 1: Statewide Leaderboard
  int _selectedFilterIndex = 1; // 0: All India, 1: West Bengal, 2: Friends
  final List<String> _filters = ['All India', 'West Bengal', 'Friends'];

  final List<Map<String, dynamic>> _topStudents = [
    {
      'rank': 1,
      'name': 'Ananya P.',
      'score': '98.6%',
      'avatarColor': const Color(0xFFEC4899),
      'city': 'Kolkata',
      'tests': 42,
    },
    {
      'rank': 2,
      'name': 'Rohit S.',
      'score': '97.2%',
      'avatarColor': const Color(0xFF3B82F6),
      'city': 'Howrah',
      'tests': 38,
    },
    {
      'rank': 3,
      'name': 'Sayon D.',
      'score': '96.8%',
      'avatarColor': const Color(0xFFF97316),
      'city': 'Siliguri',
      'tests': 35,
    },
    {
      'rank': 4,
      'name': 'Priya M.',
      'score': '96.1%',
      'avatarColor': const Color(0xFFA855F7),
      'city': 'Burdwan',
      'tests': 31,
    },
    {
      'rank': 5,
      'name': 'Arindam D.',
      'score': '95.4%',
      'avatarColor': const Color(0xFF14B8A6),
      'city': 'Durgapur',
      'tests': 29,
    },
    {
      'rank': 6,
      'name': 'Debasmita G.',
      'score': '94.8%',
      'avatarColor': const Color(0xFF6366F1),
      'city': 'Midnapore',
      'tests': 27,
    },
    {
      'rank': 7,
      'name': 'Sourav M.',
      'score': '94.1%',
      'avatarColor': const Color(0xFFF59E0B),
      'city': 'Malda',
      'tests': 24,
    },
    {
      'rank': 8,
      'name': 'Bikram K.',
      'score': '93.5%',
      'avatarColor': const Color(0xFF06B6D4),
      'city': 'Barasat',
      'tests': 22,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final attempts = LocalStorageService.getAttempts();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Rank & Leaderboard',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: AppColors.navy,
            letterSpacing: -0.3,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.all(3),
              child: Row(
                children: [
                  _buildMainTabButton(0, 'Your Rank (Web)'),
                  _buildMainTabButton(1, 'Statewide Podium'),
                ],
              ),
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: _selectedMainTab == 0
            ? _buildYourRankTab(attempts)
            : _buildLeaderboardTab(),
      ),
    );
  }

  Widget _buildMainTabButton(int index, String label) {
    final isSelected = _selectedMainTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMainTab = index),
        child: Container(
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    )
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              color: isSelected ? AppColors.primary : const Color(0xFF64748B),
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // TAB 1: YOUR RANK (1:1 Web Rank.tsx Parity)
  // ---------------------------------------------------------------------------
  Widget _buildYourRankTab(List<TestAttemptModel> attempts) {
    final completed = attempts;
    final totalCompleted = completed.isNotEmpty ? completed.length : 14;
    final avgScore = completed.isNotEmpty
        ? (completed.fold<double>(0, (s, a) => s + a.score) / completed.length).toStringAsFixed(1)
        : '68.5';
    final avgAccuracy = completed.isNotEmpty
        ? (completed.fold<double>(0, (s, a) => s + a.accuracy) / completed.length).toStringAsFixed(0)
        : '74';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // 1. Hero Gradient Panel (Matching web Rank.tsx top section)
        Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFEFF5FB), Colors.white, Color(0xFFD9E7FD)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFD9E7FD)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'STUDENT RANKINGS',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Your Rank',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: AppColors.navy,
                            letterSpacing: -0.5,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Track your rank from completed mock tests and keep improving with every attempt.',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: Color(0xFF64748B),
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFD9E7FD)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: const [
                        Text(
                          'LATEST RANK',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          '#147',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 2. 4-Grid Stat Cards (Matching web Rank.tsx metrics)
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 1.5,
          children: [
            _buildStatCard(
              icon: Icons.emoji_events_rounded,
              iconColor: const Color(0xFFF59E0B),
              label: 'Best Rank',
              value: '#12',
            ),
            _buildStatCard(
              icon: Icons.bar_chart_rounded,
              iconColor: AppColors.primary,
              label: 'Average Score',
              value: avgScore,
            ),
            _buildStatCard(
              icon: Icons.track_changes_rounded,
              iconColor: const Color(0xFF10B981),
              label: 'Accuracy',
              value: '$avgAccuracy%',
            ),
            _buildStatCard(
              icon: Icons.local_fire_department_rounded,
              iconColor: const Color(0xFFF97316),
              label: 'Completed Tests',
              value: '$totalCompleted',
            ),
          ],
        ),

        const SizedBox(height: 20),

        // 3. Recent Performance / Rank History
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'RECENT PERFORMANCE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                          color: AppColors.primary,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Rank History',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: AppColors.navy,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF5FB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.trending_up_rounded, color: AppColors.primary, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Rank History List
              _buildRankHistoryRow(
                title: 'WBP Constable Full Mock 02',
                exam: 'WBP Constable • 22 Sep 2024',
                rank: '#147',
                accuracy: '78%',
                score: '68/100',
              ),
              const Divider(height: 18, color: Color(0xFFF1F5F9)),
              _buildRankHistoryRow(
                title: 'WBP Constable Full Mock 01',
                exam: 'WBP Constable • 18 Sep 2024',
                rank: '#112',
                accuracy: '82%',
                score: '72/100',
              ),
              const Divider(height: 18, color: Color(0xFFF1F5F9)),
              _buildRankHistoryRow(
                title: 'WBPSC Clerkship Practice 03',
                exam: 'WBPSC • 12 Sep 2024',
                rank: '#89',
                accuracy: '85%',
                score: '85/100',
              ),
              const Divider(height: 18, color: Color(0xFFF1F5F9)),
              _buildRankHistoryRow(
                title: 'Kolkata Police SI Mock 01',
                exam: 'KP SI • 05 Sep 2024',
                rank: '#210',
                accuracy: '71%',
                score: '142/200',
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 4. "Keep Climbing" Soft Panel
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF5FB),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFD9E7FD)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Keep Climbing',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: AppColors.navy,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Your rank is calculated from ranked attempts available to your account. More completed tests give you more performance history to track.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF475569),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.015),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: AppColors.navy,
              letterSpacing: -0.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRankHistoryRow({
    required String title,
    required String exam,
    required String rank,
    required String accuracy,
    required String score,
  }) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFFEFF5FB),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.military_tech_rounded, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
              const SizedBox(height: 2),
              Text(
                exam,
                style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              rank,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.navy),
            ),
            const SizedBox(height: 1),
            Text(
              accuracy,
              style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // TAB 2: STATEWIDE LEADERBOARD (Top 3 Podium + Aspirants Table)
  // ---------------------------------------------------------------------------
  Widget _buildLeaderboardTab() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            children: [
              // 1. Filter Chips (All India | West Bengal | Friends)
              PKPillTabs(
                tabs: _filters,
                selectedIndex: _selectedFilterIndex,
                isFullWidth: true,
                onTabSelected: (idx) => setState(() => _selectedFilterIndex = idx),
              ),

              const SizedBox(height: 18),

              // 2. Podium Layout (2nd Silver | 1st Gold 👑 | 3rd Bronze)
              _buildTop3Podium(),

              const SizedBox(height: 20),

              // 3. Aspirants List Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  children: const [
                    SizedBox(
                      width: 44,
                      child: Text('Rank', style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    ),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text('Aspirant', style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    ),
                    Text('Score', style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                  ],
                ),
              ),

              const SizedBox(height: 8),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),

              // 4. Students Rank 4 to 8
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: _topStudents.length - 3,
                separatorBuilder: (_, _) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                itemBuilder: (context, idx) {
                  final student = _topStudents[idx + 3];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 44,
                          child: Center(
                            child: Text(
                              '#${student['rank']}',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF64748B)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        CircleAvatar(
                          radius: 17,
                          backgroundColor: student['avatarColor'] as Color,
                          child: Text(
                            (student['name'] as String).substring(0, 1),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                student['name'] as String,
                                style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.navy),
                              ),
                              Text(
                                '${student['city']} • ${student['tests']} tests',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          student['score'] as String,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.navy,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),

        // 5. Pinned Current User Card at bottom (#147 You 78.3%)
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 8,
                offset: const Offset(0, -3),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  '#147',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 14),
              const CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary,
                child: Icon(Icons.person_rounded, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'You (Susanta Lohar)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: AppColors.navy,
                      ),
                    ),
                    Text(
                      'Top 14% statewide',
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              const Text(
                '78.3%',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // PODIUM WIDGET
  // ---------------------------------------------------------------------------
  Widget _buildTop3Podium() {
    final first = _topStudents[0];
    final second = _topStudents[1];
    final third = _topStudents[2];

    return Container(
      padding: const EdgeInsets.fromLTRB(12, 20, 12, 12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFEFF5FB), Color(0xFFF8FAFC)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFD9E7FD)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd Place (Silver)
          Expanded(
            child: _buildPodiumColumn(
              student: second,
              rankText: '2',
              badgeColor: const Color(0xFF94A3B8),
              ringColor: const Color(0xFFCBD5E1),
              pedestalHeight: 70,
              isFirst: false,
            ),
          ),
          const SizedBox(width: 8),

          // 1st Place (Gold 👑)
          Expanded(
            child: _buildPodiumColumn(
              student: first,
              rankText: '1',
              badgeColor: const Color(0xFFF59E0B),
              ringColor: const Color(0xFFFBBF24),
              pedestalHeight: 95,
              isFirst: true,
            ),
          ),
          const SizedBox(width: 8),

          // 3rd Place (Bronze)
          Expanded(
            child: _buildPodiumColumn(
              student: third,
              rankText: '3',
              badgeColor: const Color(0xFFCD7F32),
              ringColor: const Color(0xFFD97706),
              pedestalHeight: 55,
              isFirst: false,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumColumn({
    required Map<String, dynamic> student,
    required String rankText,
    required Color badgeColor,
    required Color ringColor,
    required double pedestalHeight,
    required bool isFirst,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isFirst)
          const Text('👑', style: TextStyle(fontSize: 20))
        else
          const SizedBox(height: 20),

        const SizedBox(height: 4),

        // Avatar with crown/ring
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              padding: const EdgeInsets.all(2.5),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: ringColor, width: 2.5),
              ),
              child: CircleAvatar(
                radius: isFirst ? 24 : 20,
                backgroundColor: student['avatarColor'] as Color,
                child: Text(
                  (student['name'] as String).substring(0, 1),
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: isFirst ? 18 : 15,
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: -2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: badgeColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  rankText,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 8),

        // Name & Score
        Text(
          student['name'] as String,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: isFirst ? 13 : 12,
            fontWeight: FontWeight.w900,
            color: AppColors.navy,
          ),
        ),
        Text(
          student['score'] as String,
          style: TextStyle(
            fontSize: isFirst ? 12 : 11,
            fontWeight: FontWeight.w800,
            color: isFirst ? AppColors.primary : const Color(0xFF64748B),
          ),
        ),

        const SizedBox(height: 8),

        // Pedestal
        Container(
          height: pedestalHeight,
          width: double.infinity,
          decoration: BoxDecoration(
            color: isFirst ? Colors.white : Colors.white.withValues(alpha: 0.7),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          alignment: Alignment.center,
          child: Text(
            rankText,
            style: TextStyle(
              fontSize: isFirst ? 24 : 18,
              fontWeight: FontWeight.w900,
              color: badgeColor.withValues(alpha: 0.6),
            ),
          ),
        ),
      ],
    );
  }
}
