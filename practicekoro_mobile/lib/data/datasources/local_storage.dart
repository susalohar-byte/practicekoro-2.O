import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/attempt_model.dart';
import '../../core/constants/app_constants.dart';

class LocalStorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static Future<void> saveTargetExam(String examId) async {
    await _prefs?.setString(AppConstants.prefsTargetExamKey, examId);
  }

  static Future<void> setSelectedExam(String examId) => saveTargetExam(examId);

  static String? getTargetExam() {
    return _prefs?.getString(AppConstants.prefsTargetExamKey);
  }

  static String? getSelectedExam() => getTargetExam();

  static const String _onboardingCompleteKey = 'pk_onboarding_completed';

  static bool isOnboardingCompleted() {
    return _prefs?.getBool(_onboardingCompleteKey) ?? false;
  }

  static Future<void> setOnboardingCompleted([bool completed = true]) async {
    await _prefs?.setBool(_onboardingCompleteKey, completed);
  }

  static Future<void> saveLanguagePreference(bool preferBengali) async {
    await _prefs?.setBool('pk_prefer_bengali', preferBengali);
  }

  static bool getLanguagePreference() {
    return _prefs?.getBool('pk_prefer_bengali') ?? false; // Default to English
  }

  static Future<void> saveAttempt(TestAttemptModel attempt) async {
    final existingAttempts = getAttempts();
    existingAttempts.insert(0, attempt);
    final encoded = jsonEncode(existingAttempts.map((e) => e.toJson()).toList());
    await _prefs?.setString(AppConstants.prefsOfflineAttemptsKey, encoded);
  }

  static List<TestAttemptModel> getAttempts() {
    final raw = _prefs?.getString(AppConstants.prefsOfflineAttemptsKey);
    if (raw == null || raw.isEmpty) return [];
    try {
      final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
      return decoded.map((e) => TestAttemptModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> toggleBookmark(String questionId) async {
    final list = getBookmarks();
    if (list.contains(questionId)) {
      list.remove(questionId);
    } else {
      list.add(questionId);
    }
    await _prefs?.setStringList(AppConstants.prefsBookmarksKey, list);
  }

  static List<String> getBookmarks() {
    return _prefs?.getStringList(AppConstants.prefsBookmarksKey) ?? [];
  }

  static bool isBookmarked(String questionId) {
    return getBookmarks().contains(questionId);
  }

  static bool isProUser() {
    return _prefs?.getBool(AppConstants.prefsIsProUserKey) ?? false;
  }

  static Future<void> setProUser(bool isPro, {DateTime? expiresAt}) async {
    await _prefs?.setBool(AppConstants.prefsIsProUserKey, isPro);
    if (expiresAt != null) {
      await _prefs?.setString(AppConstants.prefsProExpiresAtKey, expiresAt.toIso8601String());
    }
  }

  static DateTime? getProExpiryDate() {
    final raw = _prefs?.getString(AppConstants.prefsProExpiresAtKey);
    if (raw != null) {
      try {
        return DateTime.parse(raw);
      } catch (_) {}
    }
    return null;
  }
}
