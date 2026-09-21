import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class PKCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final Color? backgroundColor;
  final Border? border;
  final bool hasShadow;
  final double borderRadius;

  const PKCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
    this.backgroundColor,
    this.border,
    this.hasShadow = false,
    this.borderRadius = 16,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget card = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? (isDark ? AppColors.surfaceDark : AppColors.surface),
        borderRadius: BorderRadius.circular(borderRadius),
        border: border ??
            Border.all(
              color: isDark ? AppColors.borderDark : AppColors.border,
              width: 1,
            ),
        boxShadow: hasShadow
            ? [
                BoxShadow(
                  color: Colors.black.withAlpha(isDark ? 30 : 10),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius),
          child: card,
        ),
      );
    }

    return card;
  }
}
