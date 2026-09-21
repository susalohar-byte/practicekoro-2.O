import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/pk_pill_tabs.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  int _selectedFilterIndex = 1; // 0: All India, 1: West Bengal, 2: Friends
  final List<String> _filters = ['All India', 'West Bengal', 'Friends'];

  final List<Map<String, dynamic>> _students = [
    {'rank': 1, 'name': 'Ananya P.', 'score': '98.6%', 'avatarColor': Colors.pink.shade200},
    {'rank': 2, 'name': 'Rohit S.', 'score': '97.2%', 'avatarColor': Colors.blue.shade200},
    {'rank': 3, 'name': 'Sayon D.', 'score': '96.8%', 'avatarColor': Colors.orange.shade200},
    {'rank': 4, 'name': 'Priya M.', 'score': '96.1%', 'avatarColor': Colors.purple.shade200},
    {'rank': 5, 'name': 'Arindam D.', 'score': '95.4%', 'avatarColor': Colors.teal.shade200},
    {'rank': 6, 'name': 'Debasmita G.', 'score': '94.8%', 'avatarColor': Colors.indigo.shade200},
    {'rank': 7, 'name': 'Sourav M.', 'score': '94.1%', 'avatarColor': Colors.amber.shade200},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'All Students Rank',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.navy,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 8),

            // Filter Tabs (All India | West Bengal | Friends)
            PKPillTabs(
              tabs: _filters,
              selectedIndex: _selectedFilterIndex,
              isFullWidth: true,
              onTabSelected: (idx) => setState(() => _selectedFilterIndex = idx),
            ),

            const SizedBox(height: 16),

            // Table Header (Rank, Student, Score)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: const [
                  SizedBox(
                    width: 40,
                    child: Text('Rank', style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: Text('Student', style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.bold)),
                  ),
                  Text('Score', style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.bold)),
                ],
              ),
            ),

            const SizedBox(height: 8),
            const Divider(height: 1, color: AppColors.border),

            // Students Rank List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                itemCount: _students.length,
                separatorBuilder: (_, _) => const Divider(height: 1, color: AppColors.borderSubtle),
                itemBuilder: (context, index) {
                  final student = _students[index];
                  final rank = student['rank'] as int;

                  Widget rankBadge;
                  if (rank == 1) {
                    rankBadge = const Icon(Icons.emoji_events_rounded, color: AppColors.gold, size: 24);
                  } else if (rank == 2) {
                    rankBadge = Icon(Icons.emoji_events_rounded, color: Colors.grey.shade400, size: 22);
                  } else if (rank == 3) {
                    rankBadge = const Icon(Icons.emoji_events_rounded, color: Color(0xFFCD7F32), size: 20);
                  } else {
                    rankBadge = Text(
                      '$rank',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textSecondary),
                    );
                  }

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 40,
                          child: Center(child: rankBadge),
                        ),
                        const SizedBox(width: 16),
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: student['avatarColor'] as Color,
                          child: Text(
                            (student['name'] as String).substring(0, 1),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(
                            student['name'] as String,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.navy,
                            ),
                          ),
                        ),
                        Text(
                          student['score'] as String,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.navy,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Pinned Current User Card at bottom (#147 You 78.3%)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withAlpha(140),
                border: const Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  const SizedBox(
                    width: 40,
                    child: Text(
                      '147',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(width: 16),
                  const CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.person, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Text(
                      'You',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.navy,
                      ),
                    ),
                  ),
                  const Text(
                    '78.3%',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
