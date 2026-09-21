class AppConstants {
  static const String appName = 'PracticeKoro';
  static const String appTagline = 'Practice Today, Progress Tomorrow';
  static const String appVersion = '2.0.0';

  // Supabase Configuration
  // Fallbacks to demo/offline mode when credentials are blank
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://demo.practicekoro.online',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'demo-anon-key',
  );

  // Storage Keys
  static const String prefsTargetExamKey = 'pk_target_exam_id';
  static const String prefsThemeKey = 'pk_theme_mode';
  static const String prefsOfflineAttemptsKey = 'pk_offline_attempts';
  static const String prefsBookmarksKey = 'pk_bookmarks';
  static const String prefsMistakesKey = 'pk_mistakes';
}
