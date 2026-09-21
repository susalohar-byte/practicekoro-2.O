import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum PKBadgeVariant { primary, success, warning, error, navy, neutral }

class PKBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final PKBadgeVariant variant;
  final bool isSmall;

  const PKBadge({
    super.key,
    required this.label,
    this.icon,
    this.variant = PKBadgeVariant.primary,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;

    switch (variant) {
      case PKBadgeVariant.primary:
        bg = AppColors.blueLight;
        text = AppColors.primary;
        break;
      case PKBadgeVariant.success:
        bg = AppColors.successLight;
        text = AppColors.success;
        break;
      case PKBadgeVariant.warning:
        bg = AppColors.warningLight;
        text = AppColors.warning;
        break;
      case PKBadgeVariant.error:
        bg = AppColors.errorLight;
        text = AppColors.error;
        break;
      case PKBadgeVariant.navy:
        bg = AppColors.blueSoft;
        text = AppColors.navy;
        break;
      case PKBadgeVariant.neutral:
        bg = AppColors.borderSubtle;
        text = AppColors.textSecondary;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: isSmall ? 12 : 14, color: text),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: isSmall ? 11 : 12,
              fontWeight: FontWeight.w600,
              color: text,
            ),
          ),
        ],
      ),
    );
  }
}
