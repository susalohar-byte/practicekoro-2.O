import 'package:flutter/material.dart';

/// Centralized Spacing and Responsive Insets for PracticeKoro
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;

  // Screen horizontal padding
  static const EdgeInsets screenPadding = EdgeInsets.symmetric(horizontal: 16.0);
  static const EdgeInsets screenPaddingWithTop = EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 0.0);

  // Bottom scroll padding so content never gets covered by floating navbar (64px + 14px + margin)
  static const double bottomNavSpacing = 92.0;
  static const EdgeInsets scrollContentPadding = EdgeInsets.only(bottom: bottomNavSpacing);
}

/// Responsive Helper for layout adaptation
class PKResponsive {
  static bool isSmallPhone(BuildContext context) =>
      MediaQuery.of(context).size.width < 360;

  static bool isStandardPhone(BuildContext context) =>
      MediaQuery.of(context).size.width >= 360 && MediaQuery.of(context).size.width < 600;

  static double horizontalPadding(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < 360) return 12.0;
    if (width > 600) return 24.0;
    return 16.0;
  }
}
