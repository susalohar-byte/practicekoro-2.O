import 'package:flutter/material.dart';

/// PracticeKoro Unified Design System Colors
/// Single source of truth matching Mobile Web UI & Flutter App UI
class AppColors {
  // 1. Core Web Design Tokens
  static const Color primary = Color(0xFF0158FC); // Primary Blue
  static const Color brightBlue = Color(0xFF0198FD); // Bright Blue
  static const Color primaryBright = Color(0xFF0198FD);
  static const Color primaryInteractive = Color(0xFF0158FC);
  static const Color navy = Color(0xFF063585); // Navy
  static const Color darkNavy = Color(0xFF0B1F44); // Dark Navy
  static const Color navyDark = Color(0xFF0B1F44); // Compatibility
  static const Color softBlue = Color(0xFFD9E7FD); // Soft Blue
  static const Color veryLightBlue = Color(0xFFEFF5FB); // Very Light Blue
  static const Color primaryLight = Color(0xFFEFF5FB);
  static const Color blueLight = Color(0xFFEFF5FB);
  static const Color blueSoft = Color(0xFFD9E7FD);
  static const Color background = Color(0xFFF8FAFC); // Background
  static const Color white = Color(0xFFFFFFFF); // White
  static const Color surface = Color(0xFFFFFFFF);
  static const Color secondaryText = Color(0xFF64748B); // Secondary Text
  static const Color textSecondary = Color(0xFF64748B);

  // 2. Primary Text & Slate Scales
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderSubtle = Color(0xFFF1F5F9);
  static const Color surfaceMuted = Color(0xFFF1F5F9);

  // 3. Status & Subject Accents
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color gold = Color(0xFFF59E0B);
  static const Color goldLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color purple = Color(0xFF8B5CF6);
  static const Color purpleLight = Color(0xFFEDE9FE);
  static const Color cyan = Color(0xFF06B6D4);
  static const Color cyanLight = Color(0xFFCFFAFE);
  static const Color orange = Color(0xFFF97316);
  static const Color orangeLight = Color(0xFFFFEDD5);
  static const Color pink = Color(0xFFEC4899);
  static const Color pinkLight = Color(0xFFFCE7F3);

  // 4. Dark Theme Mappings
  static const Color backgroundDark = Color(0xFF020617);
  static const Color surfaceDark = Color(0xFF0F172A);
  static const Color surfaceDarkVariant = Color(0xFF1E293B);
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color borderDark = Color(0xFF334155);

  // 5. Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF0158FC), Color(0xFF0198FD)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF0B1F44), Color(0xFF063585), Color(0xFF0158FC)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient splashGradient = LinearGradient(
    colors: [Color(0xFF0B1F44), Color(0xFF063585), Color(0xFF0158FC)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
