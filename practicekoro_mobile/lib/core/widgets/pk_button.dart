import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum PKButtonType { primary, secondary, outline, danger }

class PKButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final PKButtonType type;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;
  final double? height;

  const PKButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.type = PKButtonType.primary,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = true,
    this.height = 50,
  });

  @override
  Widget build(BuildContext context) {
    Widget child = isLoading
        ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: 8),
              ],
              Text(
                text,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          );

    Widget button;

    switch (type) {
      case PKButtonType.primary:
        button = Container(
          decoration: BoxDecoration(
            gradient: onPressed == null ? null : AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(12),
            boxShadow: onPressed == null
                ? null
                : [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(60),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: ElevatedButton(
            onPressed: isLoading ? null : onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              foregroundColor: Colors.white,
              disabledBackgroundColor: AppColors.textMuted.withAlpha(50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: child,
          ),
        );
        break;

      case PKButtonType.secondary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.blueLight,
            foregroundColor: AppColors.primary,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: child,
        );
        break;

      case PKButtonType.outline:
        button = OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: child,
        );
        break;

      case PKButtonType.danger:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: child,
        );
        break;
    }

    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: height,
      child: button,
    );
  }
}
