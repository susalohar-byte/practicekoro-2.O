import 'package:flutter/material.dart';

/// PracticeKoro Mockup Design System Colors
class AppColors {
  // Vibrant Primary Blue (matches website #0158FC)
  static const Color primary = Color(0xFF0158FC);
  static const Color primaryLight = Color(0xFFEFF6FF);
  static const Color primaryBright = Color(0xFF0158FC);
  static const Color primaryInteractive = Color(0xFF0158FC);
  static const Color blueLight = Color(0xFFEFF6FF);
  static const Color blueSoft = Color(0xFFDBEAFE);

  // Website Midnight Navy & Headers
  static const Color navyDark = Color(0xFF0C1B3D);
  static const Color navy = Color(0xFF0F172A);
  static const Color navyLight = Color(0xFF1E3A8A);

  // Dark Theme Mappings
  static const Color backgroundDark = Color(0xFF020617);
  static const Color surfaceDark = Color(0xFF0F172A);
  static const Color surfaceDarkVariant = Color(0xFF1E293B);
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color borderDark = Color(0xFF334155);

  // Accent & Feature Colors (from the 17 screens)
  static const Color gold = Color(0xFFF59E0B);
  static const Color goldLight = Color(0xFFFEF3C7);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
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

  // Canvas & Card Surfaces
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF1F5F9);

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);

  // Borders
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderSubtle = Color(0xFFF1F5F9);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1E6FFB), Color(0xFF0091FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient splashGradient = LinearGradient(
    colors: [Color(0xFF0A224E), Color(0xFF133E87), Color(0xFF1E6FFB)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient navyGradient = LinearGradient(
    colors: [Color(0xFF0D234A), Color(0xFF1B3B6F)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
