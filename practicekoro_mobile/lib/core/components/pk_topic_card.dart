import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_typography.dart';
import 'pk_card.dart';

/// Topic Practice Card matching Web Topic Card
class PKTopicCard extends StatelessWidget {
  final String title;
  final String questionsCount;
  final double progress; // 0.0 to 1.0
  final VoidCallback onPractice;

  const PKTopicCard({
    super.key,
    required this.title,
    required this.questionsCount,
    this.progress = 0.0,
    required this.onPractice,
  });

  @override
  Widget build(BuildContext context) {
    return PKCard(
      padding: const EdgeInsets.all(14),
      onTap: onPractice,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AppTypography.titleSmall(color: AppColors.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: AppRadius.rSm,
                ),
                child: const Icon(
                  Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            questionsCount,
            style: AppTypography.bodySmall(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: AppRadius.rPill,
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 5,
              backgroundColor: AppColors.borderSubtle,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}
