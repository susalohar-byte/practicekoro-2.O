import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

/// Centralized Inter Typography for PracticeKoro
/// 1:1 Match with Tailwind Web Typography
class AppTypography {
  static TextStyle displayLarge({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 30,
        fontWeight: FontWeight.w900,
        color: color,
        letterSpacing: -0.6,
        height: 1.2,
      );

  static TextStyle headlineLarge({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w900,
        color: color,
        letterSpacing: -0.4,
        height: 1.25,
      );

  static TextStyle headlineMedium({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w800,
        color: color,
        letterSpacing: -0.3,
        height: 1.3,
      );

  static TextStyle titleLarge({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: -0.2,
        height: 1.35,
      );

  static TextStyle titleMedium({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: color,
        letterSpacing: -0.1,
        height: 1.4,
      );

  static TextStyle titleSmall({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: color,
        height: 1.4,
      );

  static TextStyle bodyLarge({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: color,
        height: 1.5,
      );

  static TextStyle bodyMedium({Color color = AppColors.textPrimary}) => GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: color,
        height: 1.45,
      );

  static TextStyle bodySmall({Color color = AppColors.secondaryText}) => GoogleFonts.inter(
        fontSize: 11.5,
        fontWeight: FontWeight.w500,
        color: color,
        height: 1.4,
      );

  static TextStyle labelSmall({Color color = AppColors.secondaryText}) => GoogleFonts.inter(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 0.4,
        height: 1.2,
      );

  static TextStyle buttonText({Color color = Colors.white}) => GoogleFonts.inter(
        fontSize: 13.5,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 0.1,
      );
}
