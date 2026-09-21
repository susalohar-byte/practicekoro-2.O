import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatefulWidget {
  final ValueChanged<int>? onTabSelected;

  const HomeScreen({super.key, this.onTabSelected});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

typedef PracticeKoroHomeScreen = HomeScreen;

class _HomeScreenState extends State<HomeScreen> {
  static const Color primary = Color(0xFF0158FC);
  static const Color navy = Color(0xFF063585);
  static const Color bg = Color(0xFFF7FAFF);

  int _selectedRecTabIndex = 0;

  final List<String> _recTabs = [
    'Mock Tests',
    'Topic Practice',
    'PYQ',
    'Based on Your Progress',
  ];

  final Map<int, List<Map<String, String>>> _recTestData = {
    0: [
      {
        'title': 'WBP Constable Full Mock Test 01',
        'badge': 'Popular',
        'questions': '100 Questions',
        'duration': '90 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'test-wbp-001',
      },
      {
        'title': 'KP Constable Prelims Mock 02',
        'badge': 'New',
        'questions': '100 Questions',
        'duration': '60 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'test-kp-002',
      },
      {
        'title': 'WBPSC Food SI Mock Test 03',
        'badge': 'Trending',
        'questions': '100 Questions',
        'duration': '90 Minutes',
        'language': 'Bengali',
        'testId': 'test-wbpsc-003',
      },
    ],
    1: [
      {
        'title': 'Percentage & Ratio Practice Set',
        'badge': 'High Yield',
        'questions': '40 Questions',
        'duration': '35 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'practice-math-01',
      },
      {
        'title': 'Indian Constitution MCQ Set',
        'badge': 'Popular',
        'questions': '50 Questions',
        'duration': '40 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'practice-gk-02',
      },
      {
        'title': 'Synonyms & Antonyms Booster',
        'badge': 'Trending',
        'questions': '30 Questions',
        'duration': '25 Minutes',
        'language': 'English',
        'testId': 'practice-eng-03',
      },
    ],
    2: [
      {
        'title': 'WBP Constable 2020 Prelims Paper',
        'badge': 'Official PYQ',
        'questions': '100 Questions',
        'duration': '60 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'pyq-wbp-2020',
      },
      {
        'title': 'WBPSC Clerkship 2019 Shift 1',
        'badge': 'Official PYQ',
        'questions': '100 Questions',
        'duration': '90 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'pyq-clerk-2019',
      },
      {
        'title': 'Primary TET 2022 Question Paper',
        'badge': 'Official PYQ',
        'questions': '150 Questions',
        'duration': '150 Minutes',
        'language': 'Bengali',
        'testId': 'pyq-tet-2022',
      },
    ],
    3: [
      {
        'title': 'Arithmetic Weak Areas Booster',
        'badge': 'AI Pick',
        'questions': '25 Questions',
        'duration': '30 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'ai-arithmetic-boost',
      },
      {
        'title': 'General Science Essentials',
        'badge': 'Target 80%+',
        'questions': '50 Questions',
        'duration': '45 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'ai-gen-science',
      },
      {
        'title': 'Speed Reasoning 15-Min Test',
        'badge': 'Speed Run',
        'questions': '20 Questions',
        'duration': '15 Minutes',
        'language': 'Bilingual (EN/BN)',
        'testId': 'ai-reasoning-speed',
      },
    ],
  };

  void _handleTabNavigation(int index, String route) {
    if (widget.onTabSelected != null) {
      widget.onTabSelected!(index);
    } else {
      context.go(route);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Stack(
          children: [
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 110),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      _header(context),
                      const SizedBox(height: 14),

                      _hero(context),
                      const SizedBox(height: 12),

                      _stats(),
                      const SizedBox(height: 14),

                      _continueTest(context),
                      const SizedBox(height: 18),

                      _sectionTitle('Quick Actions'),
                      const SizedBox(height: 10),
                      _quickActions(context),
                      const SizedBox(height: 18),

                      _sectionTitle(
                        'Popular Test Series',
                        action: 'See All',
                        onAction: () => _handleTabNavigation(1, '/exams'),
                      ),
                      const SizedBox(height: 10),
                      _popularSeries(context),
                      const SizedBox(height: 20),

                      _sectionTitle(
                        'Practice by Subject',
                        action: 'See All',
                        onAction: () => _handleTabNavigation(2, '/practice'),
                      ),
                      const SizedBox(height: 10),
                      _subjects(context),
                      const SizedBox(height: 20),

                      _sectionTitle(
                        'Recommended for You',
                        action: 'See All',
                        onAction: () => _handleTabNavigation(1, '/exams'),
                      ),
                      const SizedBox(height: 10),
                      _recommendationTabs(),
                      const SizedBox(height: 10),
                      _recommendedTests(context),
                      const SizedBox(height: 14),

                      _motivationCard(),
                      const SizedBox(height: 20),

                      _sectionTitle(
                        'Your Progress',
                        action: 'This Month',
                      ),
                      const SizedBox(height: 10),
                      _progress(),
                      const SizedBox(height: 20),

                      _sectionTitle(
                        'Latest Updates',
                        action: 'See All',
                      ),
                      const SizedBox(height: 10),
                      _updates(),
                      const SizedBox(height: 12),

                      _bottomPromos(context),
                    ]),
                  ),
                ),
              ],
            ),

            // Rounded floating bottom navigation
            Positioned(
              left: 16,
              right: 16,
              bottom: 12,
              child: _bottomNavigation(context),
            ),
          ],
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // HEADER
  // ------------------------------------------------------------

  Widget _header(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: primary,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: primary.withValues(alpha: 0.28),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Image.asset(
            'assets/images/logo.png',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => const Center(
              child: Text(
                'P',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 25,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),

        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'PracticeKoro',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: navy,
                  letterSpacing: -0.4,
                ),
              ),
              Text(
                'Practice Today, Progress Tomorrow',
                style: TextStyle(
                  fontSize: 9,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),

        GestureDetector(
          onTap: () => _handleTabNavigation(1, '/exams'),
          child: _circleButton(Icons.search),
        ),
        const SizedBox(width: 8),

        GestureDetector(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Notifications: 3 new test series published!'),
                duration: Duration(seconds: 2),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              _circleButton(Icons.notifications_none),
              Positioned(
                right: -1,
                top: -3,
                child: Container(
                  width: 17,
                  height: 17,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      '3',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(width: 8),

        GestureDetector(
          onTap: () => _handleTabNavigation(4, '/profile'),
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFD9E7FD),
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 8,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(21),
              child: Image.asset(
                'assets/images/student_avatar.png',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const Center(
                  child: Icon(
                    Icons.person,
                    color: navy,
                    size: 22,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _circleButton(IconData icon) {
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
          ),
        ],
      ),
      child: Icon(
        icon,
        color: navy,
        size: 22,
      ),
    );
  }

  // ------------------------------------------------------------
  // HERO
  // ------------------------------------------------------------

  Widget _hero(BuildContext context) {
    return Container(
      height: 178,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          colors: [
            Color(0xFFEAF4FF),
            Color(0xFFD9E9FC),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            left: 16,
            top: 18,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Good Morning,',
                  style: TextStyle(
                    color: navy,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Susanta 👋',
                  style: TextStyle(
                    color: Color(0xFF061B55),
                    fontSize: 27,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                const Text(
                  'Small steps today,\nbig results tomorrow.',
                  style: TextStyle(
                    color: Color(0xFF37517D),
                    fontSize: 12,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 13),

                ElevatedButton(
                  onPressed: () {
                    context.go('/live-test/test-wbp-001');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Start a Mock Test →',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Positioned(
            right: 4,
            bottom: 0,
            child: SizedBox(
              width: 205,
              height: 170,
              child: Image.asset(
                'assets/images/student.png',
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(
                    Icons.school,
                    size: 90,
                    color: primary,
                  );
                },
              ),
            ),
          ),

          const Positioned(
            right: 14,
            top: 42,
            child: RotatedBox(
              quarterTurns: 0,
              child: Text(
                'Learn\nPractice\nImprove\nSucceed',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: primary,
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  fontStyle: FontStyle.italic,
                  height: 1.25,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  Widget _stats() {
    return Row(
      children: [
        _stat(
          Icons.description_outlined,
          '12',
          'Tests Taken',
          const Color(0xFF20C982),
        ),
        _stat(
          Icons.track_changes,
          '78%',
          'Accuracy',
          const Color(0xFF007AFF),
        ),
        _stat(
          Icons.help_outline,
          '1.2k',
          'Questions',
          const Color(0xFFFF9F0A),
        ),
        _stat(
          Icons.local_fire_department,
          '5 Days',
          'Day Streak',
          const Color(0xFFFF453A),
        ),
      ],
    );
  }

  Widget _stat(
    IconData icon,
    String value,
    String label,
    Color color,
  ) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 3),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(13),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 20,
            ),
            const SizedBox(height: 5),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: navy,
              ),
            ),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 8,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // CONTINUE TEST
  // ------------------------------------------------------------

  Widget _continueTest(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFF032A70),
        borderRadius: BorderRadius.circular(17),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF032A70).withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Continue Your Test',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              _badge('In Progress'),
            ],
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Container(
                width: 55,
                height: 55,
                decoration: BoxDecoration(
                  color: primary.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(13),
                  child: Image.asset(
                    'assets/images/continue_clipboard.png',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.description,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 12),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'WBP Constable 2024',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      'Prelims Official Paper',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'Attempted 45/100 questions • 55 min left',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 9,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 9),

          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: const LinearProgressIndicator(
                    value: .45,
                    minHeight: 7,
                    backgroundColor: Colors.white24,
                    valueColor: AlwaysStoppedAnimation(primary),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                '45%',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          SizedBox(
            width: 145,
            child: ElevatedButton(
              onPressed: () {
                context.go('/live-test/test-wbp-001');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9),
                ),
              ),
              child: const Text(
                'Resume Test →',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // QUICK ACTIONS
  // ------------------------------------------------------------

  Widget _quickActions(BuildContext context) {
    final actions = [
      ('Mock Test', Icons.gps_fixed, const Color(0xFFE6F1FF), () => _handleTabNavigation(1, '/exams')),
      ('Topic Practice', Icons.notes, const Color(0xFFE0FFF4), () => _handleTabNavigation(2, '/practice')),
      ('Previous Year', Icons.assignment, const Color(0xFFFFE7EE), () => _handleTabNavigation(1, '/exams')),
      ('Saved Questions', Icons.bookmark_outline, const Color(0xFFF1E8FF), () => context.go('/saved-questions')),
    ];

    return Row(
      children: actions.map((item) {
        return Expanded(
          child: GestureDetector(
            onTap: item.$4,
            child: Container(
              margin: const EdgeInsets.only(right: 6),
              padding: const EdgeInsets.symmetric(vertical: 13),
              decoration: BoxDecoration(
                color: item.$3,
                borderRadius: BorderRadius.circular(13),
              ),
              child: Column(
                children: [
                  Icon(
                    item.$2,
                    color: primary,
                    size: 23,
                  ),
                  const SizedBox(height: 7),
                  Text(
                    item.$1,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 8,
                      color: navy,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ------------------------------------------------------------
  // POPULAR SERIES
  // ------------------------------------------------------------

  Widget _popularSeries(BuildContext context) {
    final exams = [
      ('WBP', 'Constable', const Color(0xFFFFEFEF), 'assets/images/exams/emblem_wbp.png', Colors.red),
      ('WBPSC', 'Clerkship', const Color(0xFFFFF4DF), 'assets/images/exams/emblem_wbpsc.png', Colors.orange),
      ('Primary', 'TET', const Color(0xFFF4EEFF), 'assets/images/exams/emblem_tet.png', Colors.purple),
      ('SSC', 'GD', const Color(0xFFF3F5FA), 'assets/images/exams/emblem_ssc.png', Colors.blue),
      ('Railway', '(NTPC)', const Color(0xFFFFF2D8), 'assets/images/exams/emblem_railway.png', Colors.amber),
    ];

    return SizedBox(
      height: 104,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: exams.length,
        itemBuilder: (_, index) {
          final exam = exams[index];

          return GestureDetector(
            onTap: () => _handleTabNavigation(1, '/exams'),
            child: Container(
              width: 104,
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: exam.$3,
                borderRadius: BorderRadius.circular(13),
                border: Border.all(
                  color: Colors.white,
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.white,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.asset(
                        exam.$4,
                        width: 28,
                        height: 28,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => Icon(
                          Icons.workspace_premium,
                          color: exam.$5,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    exam.$1,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: navy,
                    ),
                  ),
                  Text(
                    exam.$2,
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: navy,
                    ),
                  ),
                  const Text(
                    '25+ Tests',
                    style: TextStyle(
                      fontSize: 8,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ------------------------------------------------------------
  // SUBJECTS
  // ------------------------------------------------------------

  Widget _subjects(BuildContext context) {
    final subjects = [
      ('General Knowledge', '1,520 Questions', Colors.green, 'gk'),
      ('Mathematics', '1,240 Questions', Colors.pink, 'math'),
      ('Reasoning', '980 Questions', Colors.blue, 'reasoning'),
      ('English', '1,010 Questions', Colors.purple, 'english'),
      ('Bengali', '820 Questions', Colors.orange, 'bengali'),
      ('Current Affairs', '420 Questions', Colors.red, 'ca'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: subjects.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 2.9,
      ),
      itemBuilder: (_, index) {
        final item = subjects[index];

        return GestureDetector(
          onTap: () {
            context.go('/practice/topics/${item.$4}');
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: item.$3.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: item.$3.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Icon(
                    Icons.menu_book,
                    color: item.$3,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.$1,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: navy,
                        ),
                      ),
                      Text(
                        item.$2,
                        style: const TextStyle(
                          fontSize: 8,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  size: 12,
                  color: navy,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ------------------------------------------------------------
  // RECOMMENDATIONS
  // ------------------------------------------------------------

  Widget _recommendationTabs() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(_recTabs.length, (index) {
          final isSelected = _selectedRecTabIndex == index;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedRecTabIndex = index;
              });
            },
            child: _tab(_recTabs[index], isSelected),
          );
        }),
      ),
    );
  }

  Widget _tab(String text, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: active ? primary : const Color(0xFFEAF2FC),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: active ? Colors.white : navy,
          fontSize: 9,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _recommendedTests(BuildContext context) {
    final tests = _recTestData[_selectedRecTabIndex] ?? _recTestData[0]!;

    return SizedBox(
      height: 164,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: tests.length,
        itemBuilder: (_, index) {
          final test = tests[index];

          return Container(
            width: 190,
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.all(11),
            decoration: _cardDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.assignment_outlined,
                      color: primary,
                      size: 17,
                    ),
                    const Spacer(),
                    _smallBadge(test['badge'] ?? 'Popular'),
                  ],
                ),

                const SizedBox(height: 7),

                Text(
                  test['title'] ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: navy,
                    height: 1.25,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  test['questions'] ?? '',
                  style: const TextStyle(
                    fontSize: 8,
                    color: Color(0xFF64748B),
                  ),
                ),
                Text(
                  test['duration'] ?? '',
                  style: const TextStyle(
                    fontSize: 8,
                    color: Color(0xFF64748B),
                  ),
                ),
                Text(
                  test['language'] ?? '',
                  style: const TextStyle(
                    fontSize: 8,
                    color: Color(0xFF64748B),
                  ),
                ),

                const Spacer(),

                SizedBox(
                  width: double.infinity,
                  height: 30,
                  child: ElevatedButton(
                    onPressed: () {
                      final testId = test['testId'] ?? 'test-wbp-001';
                      context.go('/live-test/$testId');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Start Test →',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _smallBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 6,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF0D8),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.deepOrange,
          fontSize: 7,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // MOTIVATION
  // ------------------------------------------------------------

  Widget _motivationCard() {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFFEAF5FF),
            Color(0xFFF1F7FF),
          ],
        ),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 32,
            height: 32,
            child: Image.asset(
              'assets/images/trophy.png',
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) => const Text(
                '🏆',
                style: TextStyle(fontSize: 27),
              ),
            ),
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'You are on the right track!',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: navy,
                  ),
                ),
                Text(
                  'Keep practicing to achieve your goal.',
                  style: TextStyle(
                    fontSize: 8,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.arrow_forward,
              color: primary,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // PROGRESS
  // ------------------------------------------------------------

  Widget _progress() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: _cardDecoration(),
      child: Column(
        children: [
          Row(
            children: [
              SizedBox(
                width: 110,
                height: 110,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const SizedBox(
                      width: 100,
                      height: 100,
                      child: CircularProgressIndicator(
                        value: .78,
                        strokeWidth: 9,
                        backgroundColor: Color(0xFFDCEAFF),
                        valueColor: AlwaysStoppedAnimation(primary),
                      ),
                    ),
                    const Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '78%',
                          style: TextStyle(
                            fontSize: 23,
                            fontWeight: FontWeight.w900,
                            color: navy,
                          ),
                        ),
                        Text(
                          'Overall Accuracy',
                          style: TextStyle(
                            fontSize: 7,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 15),

              const Expanded(
                child: Column(
                  children: [
                    _ProgressRow(
                      color: Colors.green,
                      label: 'Correct',
                      value: '342',
                    ),
                    _ProgressRow(
                      color: Colors.red,
                      label: 'Incorrect',
                      value: '78',
                    ),
                    _ProgressRow(
                      color: Colors.blueGrey,
                      label: 'Skipped',
                      value: '20',
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              _miniProgressStat('18h', 'Time Spent'),
              _miniProgressStat('32', 'Tests Taken'),
              _miniProgressStat('1,240', 'Questions Solved'),
              _miniProgressStat('12', 'Best Rank'),
            ],
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // UPDATES
  // ------------------------------------------------------------

  Widget _updates() {
    final updates = [
      ('WBPSC Clerkship 2025 Notification', '2 days ago'),
      ('WBP Constable Admit Card Update', '4 days ago'),
      ('TET 2025 Exam Dates', '1 week ago'),
    ];

    return Container(
      decoration: _cardDecoration(),
      child: Column(
        children: updates.map((item) {
          return Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 9,
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundColor: Color(0xFFFFF1D7),
                  child: Icon(
                    Icons.workspace_premium,
                    size: 19,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    item.$1,
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: navy,
                    ),
                  ),
                ),
                Text(
                  item.$2,
                  style: const TextStyle(
                    fontSize: 7,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // ------------------------------------------------------------
  // PROMOS
  // ------------------------------------------------------------

  Widget _bottomPromos(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 105,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F3FF),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dream\nPrepare\nPractice\nAchieve',
                  style: TextStyle(
                    color: primary,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 105,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF2F7FF),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Upgrade to PracticeKoro Pro',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: navy,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Unlock unlimited mock tests,\ndetailed solutions and more.',
                  style: TextStyle(
                    fontSize: 7,
                    color: Color(0xFF64748B),
                  ),
                ),
                const Spacer(),
                SizedBox(
                  height: 28,
                  child: ElevatedButton(
                    onPressed: () {
                      context.go('/subscription');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                      ),
                    ),
                    child: const Text(
                      'View Plans →',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ------------------------------------------------------------
  // BOTTOM NAVIGATION
  // ------------------------------------------------------------

  Widget _bottomNavigation(BuildContext context) {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 7,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.10),
            blurRadius: 25,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          _navItem(
            Icons.home_rounded,
            'Home',
            true,
            () => _handleTabNavigation(0, '/home'),
          ),
          _navItem(
            Icons.description_outlined,
            'Test Series',
            false,
            () => _handleTabNavigation(1, '/exams'),
          ),
          _navItem(
            Icons.bolt_rounded,
            'Practice',
            false,
            () => _handleTabNavigation(2, '/practice'),
          ),
          _navItem(
            Icons.bar_chart_rounded,
            'Results',
            false,
            () => _handleTabNavigation(3, '/leaderboard'),
          ),
          _navItem(
            Icons.person_outline_rounded,
            'Profile',
            false,
            () => _handleTabNavigation(4, '/profile'),
          ),
        ],
      ),
    );
  }

  Widget _navItem(
    IconData icon,
    String label,
    bool active,
    VoidCallback onTap,
  ) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 3),
          decoration: BoxDecoration(
            color: active ? const Color(0xFFDCEBFF) : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 22,
                color: active ? primary : const Color(0xFF526A8C),
              ),
              const SizedBox(height: 3),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: active ? FontWeight.w800 : FontWeight.w500,
                  color: active ? primary : const Color(0xFF526A8C),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  Widget _sectionTitle(
    String title, {
    String? action,
    VoidCallback? onAction,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            color: navy,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        const Spacer(),
        if (action != null)
          GestureDetector(
            onTap: onAction,
            child: Text(
              action,
              style: const TextStyle(
                color: primary,
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
      ],
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(15),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.035),
          blurRadius: 15,
          offset: const Offset(0, 5),
        ),
      ],
    );
  }

  Widget _miniProgressStat(
    String value,
    String label,
  ) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 5),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFF6F9FD),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: navy,
              ),
            ),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 6,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressRow extends StatelessWidget {
  final Color color;
  final String label;
  final String value;

  const _ProgressRow({
    required this.color,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 7),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 9,
                color: Color(0xFF64748B),
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: Color(0xFF172554),
            ),
          ),
        ],
      ),
    );
  }
}
