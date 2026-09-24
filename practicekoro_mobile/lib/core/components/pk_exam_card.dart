import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_typography.dart';
import 'pk_card.dart';

/// Exam Card with official emblem matching Web Popular Exam Card
class PKExamCard extends StatelessWidget {
  final String title;
  final String testsCount;
  final String emblemPath;
  final Color backgroundColor;
  final bool isSelected;
  final VoidCallback onTap;

  const PKExamCard({
    super.key,
    required this.title,
    required this.testsCount,
    required this.emblemPath,
    this.backgroundColor = const Color(0xFFEFF6FF),
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return PKCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      onTap: onTap,
      borderColor: isSelected ? AppColors.primary : AppColors.border,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: AppRadius.rMd,
            ),
            child: Image.asset(
              emblemPath,
              fit: BoxFit.contain,
              errorBuilder: (_, _, _) => const Icon(
                Icons.school_rounded,
                size: 26,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: AppTypography.titleSmall(
              color: isSelected ? AppColors.primary : AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            testsCount,
            style: AppTypography.bodySmall(color: AppColors.secondaryText),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
