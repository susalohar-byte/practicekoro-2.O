import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'data/datasources/local_storage.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize local storage for offline support
  try {
    await LocalStorageService.init();
  } catch (e) {
    debugPrint('LocalStorageService init fallback: $e');
  }

  // Initialize Supabase if configured, otherwise fallback to local/demo gracefully
  try {
    if (AppConstants.supabaseUrl.startsWith('https://') &&
        !AppConstants.supabaseUrl.contains('demo.practicekoro.online')) {
      await Supabase.initialize(
        url: AppConstants.supabaseUrl,
        publishableKey: AppConstants.supabaseAnonKey,
      );
    }
  } catch (_) {
    // Graceful offline fallback
  }

  runApp(
    const ProviderScope(
      child: PracticeKoroApp(),
    ),
  );
}

class PracticeKoroApp extends StatelessWidget {
  const PracticeKoroApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      routerConfig: appRouter,
    );
  }
}
