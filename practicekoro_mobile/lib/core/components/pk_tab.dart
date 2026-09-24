import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_typography.dart';

/// Segmented Pill Tab Bar matching Web Tab Bar
class PKTab<T> extends StatelessWidget {
  final List<T> values;
  final T selectedValue;
  final String Function(T) labelBuilder;
  final ValueChanged<T> onSelected;

  const PKTab({
    super.key,
    required this.values,
    required this.selectedValue,
    required this.labelBuilder,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: AppRadius.rMd,
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Row(
        children: values.map((val) {
          final isSelected = val == selectedValue;
          return Expanded(
            child: InkWell(
              onTap: () => onSelected(val),
              borderRadius: AppRadius.rSm,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: AppRadius.rSm,
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.25),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                alignment: Alignment.center,
                child: Text(
                  labelBuilder(val),
                  style: AppTypography.buttonText(
                    color: isSelected ? Colors.white : AppColors.secondaryText,
                  ).copyWith(fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
