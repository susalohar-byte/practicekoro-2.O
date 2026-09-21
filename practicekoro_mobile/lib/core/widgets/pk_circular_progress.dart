import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class PKCircularRing extends StatelessWidget {
  final double percentage; // 0 to 100
  final double size;
  final double strokeWidth;
  final String? centerText;
  final String? subText;
  final Color progressColor;
  final Color backgroundColor;

  const PKCircularRing({
    super.key,
    required this.percentage,
    this.size = 70,
    this.strokeWidth = 6,
    this.centerText,
    this.subText,
    this.progressColor = AppColors.primary,
    this.backgroundColor = AppColors.border,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _RingPainter(
              percentage: percentage,
              strokeWidth: strokeWidth,
              progressColor: progressColor,
              backgroundColor: backgroundColor,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                centerText ?? '${percentage.toInt()}%',
                style: TextStyle(
                  fontSize: size > 90 ? 22 : 14,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navy,
                ),
              ),
              if (subText != null)
                Text(
                  subText!,
                  style: TextStyle(
                    fontSize: size > 90 ? 11 : 9,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double percentage;
  final double strokeWidth;
  final Color progressColor;
  final Color backgroundColor;

  _RingPainter({
    required this.percentage,
    required this.strokeWidth,
    required this.progressColor,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Background track
    final bgPaint = Paint()
      ..color = backgroundColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = progressColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final sweepAngle = 2 * math.pi * (percentage.clamp(0, 100) / 100);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) {
    return oldDelegate.percentage != percentage ||
        oldDelegate.progressColor != progressColor ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
