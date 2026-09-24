import 'package:flutter/material.dart';

/// Centralized Elevation and Shadow Tokens for PracticeKoro
class AppShadows {
  // Soft card shadow matching web shadow-2xs / shadow-xs
  static final List<BoxShadow> card = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.04),
      blurRadius: 6,
      spreadRadius: 0,
      offset: const Offset(0, 2),
    ),
  ];

  // Elevated shadow for floating elements and hero banners
  static final List<BoxShadow> elevated = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.08),
      blurRadius: 16,
      spreadRadius: 0,
      offset: const Offset(0, 4),
    ),
  ];

  // Floating bottom navbar shadow
  static final List<BoxShadow> floatingNav = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.10),
      blurRadius: 20,
      spreadRadius: 0,
      offset: const Offset(0, 6),
    ),
  ];

  // Primary button glowing shadow
  static final List<BoxShadow> primaryButton = [
    BoxShadow(
      color: const Color(0xFF0158FC).withValues(alpha: 0.25),
      blurRadius: 12,
      spreadRadius: 0,
      offset: const Offset(0, 4),
    ),
  ];
}
