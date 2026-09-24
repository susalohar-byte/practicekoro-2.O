import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/navigation/main_scaffold.dart';
import '../../features/onboarding/splash_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/exams/exam_selection_screen.dart';
import '../../features/exams/primary_exam_selection_screen.dart';
import '../../features/exams/exam_tests_screen.dart';
import '../../features/practice/topic_screen.dart';
import '../../features/test_runner/test_runner_screen.dart';
import '../../features/result_analytics/result_screen.dart';
import '../../features/result_analytics/analysis_screen.dart';
import '../../features/result_analytics/solutions_screen.dart';
import '../../features/profile/saved_questions_screen.dart';
import '../../features/subscription/subscription_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../data/models/attempt_model.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    // 1. Splash Screen
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),

    // 2, 3, 4. Onboarding Pages
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),

    // 5. Exam Selection
    GoRoute(
      path: '/exam-selection',
      builder: (context, state) => const ExamSelectionScreen(),
    ),

    // 6. Primary Exam Selection
    GoRoute(
      path: '/primary-exam',
      builder: (context, state) {
        final initialId = state.extra as String?;
        return PrimaryExamSelectionScreen(initialExamId: initialId);
      },
    ),

    // 7. Home Screen (via MainScaffold tab 0)
    GoRoute(
      path: '/home',
      builder: (context, state) => const MainScaffold(initialIndex: 0),
    ),

    // 10. Test Series / Exams Screen (via MainScaffold tab 1)
    GoRoute(
      path: '/exams',
      builder: (context, state) => const MainScaffold(initialIndex: 1),
    ),

    // Test List Within Exam Series
    GoRoute(
      path: '/exams/:examId',
      builder: (context, state) {
        final examId = state.pathParameters['examId'] ?? 'wbp-constable';
        return ExamTestsScreen(examId: examId);
      },
    ),

    // 8. Practice Screen (via MainScaffold tab 2)
    GoRoute(
      path: '/practice',
      builder: (context, state) => const MainScaffold(initialIndex: 2),
    ),

    // 9. Topic Screen
    GoRoute(
      path: '/practice/topics/:subjectId',
      builder: (context, state) {
        final subjectId = state.pathParameters['subjectId'] ?? 'math';
        return TopicScreen(subjectId: subjectId);
      },
    ),

    // 11. Live Test Screen
    GoRoute(
      path: '/live-test/:testId',
      builder: (context, state) {
        final testId = state.pathParameters['testId'] ?? 'test-wbp-001';
        return TestRunnerScreen(testId: testId);
      },
    ),

    // 12. Result Screen
    GoRoute(
      path: '/result/:attemptId',
      builder: (context, state) {
        final attemptId = state.pathParameters['attemptId'] ?? 'att-latest';
        return ResultScreen(attemptId: attemptId);
      },
    ),

    // 13. Detailed Analysis Screen
    GoRoute(
      path: '/analysis/:attemptId',
      builder: (context, state) {
        final attemptId = state.pathParameters['attemptId'] ?? 'att-latest';
        final attempt = state.extra as TestAttemptModel?;
        return AnalysisScreen(attemptId: attemptId, attempt: attempt);
      },
    ),

    // 14. Saved Questions Screen
    GoRoute(
      path: '/saved-questions',
      builder: (context, state) => const SavedQuestionsScreen(),
    ),

    // 15. Leaderboard / Results Screen (via MainScaffold tab 3)
    GoRoute(
      path: '/leaderboard',
      builder: (context, state) => const MainScaffold(initialIndex: 3),
    ),

    // 16. Subscription Screen
    GoRoute(
      path: '/subscription',
      builder: (context, state) => const SubscriptionScreen(),
    ),

    // 17. Profile Screen (via MainScaffold tab 4)
    GoRoute(
      path: '/profile',
      builder: (context, state) => const MainScaffold(initialIndex: 4),
    ),

    // Extra Solutions Review Route
    GoRoute(
      path: '/solutions/:testId',
      builder: (context, state) {
        final testId = state.pathParameters['testId'] ?? 'test-wbp-001';
        final attempt = state.extra as TestAttemptModel?;
        return SolutionsScreen(testId: testId, attempt: attempt);
      },
    ),

    // Login Route
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Text('Page not found: ${state.uri}'),
    ),
  ),
);
