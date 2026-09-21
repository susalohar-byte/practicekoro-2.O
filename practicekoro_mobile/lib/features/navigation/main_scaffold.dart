import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../home/home_screen.dart';
import '../exams/exams_catalog_screen.dart';
import '../practice/practice_screen.dart';
import '../leaderboard/leaderboard_screen.dart';
import '../profile/profile_screen.dart';

class MainScaffold extends StatefulWidget {
  final int initialIndex;

  const MainScaffold({super.key, this.initialIndex = 0});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  late int _currentIndex;


  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          HomeScreen(
            onTabSelected: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
          const ExamsCatalogScreen(),
          const PracticeScreen(),
          const LeaderboardScreen(),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: _currentIndex == 0
          ? null
          : Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: AppColors.border, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined, size: 22),
              activeIcon: Icon(Icons.home_rounded, size: 22),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.assignment_outlined, size: 22),
              activeIcon: Icon(Icons.assignment_rounded, size: 22),
              label: 'Exams',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.menu_book_outlined, size: 22),
              activeIcon: Icon(Icons.menu_book_rounded, size: 22),
              label: 'Practice',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.leaderboard_outlined, size: 22),
              activeIcon: Icon(Icons.leaderboard_rounded, size: 22),
              label: 'Results',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded, size: 22),
              activeIcon: Icon(Icons.person_rounded, size: 22),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
