import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/test_model.dart';
import '../../data/models/question_model.dart';
import '../../data/models/attempt_model.dart';
import '../../data/repositories/catalog_repository.dart';
import '../../data/repositories/test_runner_repository.dart';

class TestRunnerScreen extends ConsumerStatefulWidget {
  final String testId;

  const TestRunnerScreen({super.key, required this.testId});

  @override
  ConsumerState<TestRunnerScreen> createState() => _TestRunnerScreenState();
}

class _TestRunnerScreenState extends ConsumerState<TestRunnerScreen> {
  MockTestModel? _test;
  List<QuestionModel> _questions = [];
  bool _isLoading = true;

  int _currentIndex = 0;
  final Map<String, AttemptAnswerState> _answers = {};

  // Timer: 59m 32s (matches mockup 00:59:32)
  Timer? _timer;
  int _secondsRemaining = 3572;
  int _elapsedSeconds = 0;
  final ScrollController _paletteScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadTestData();
  }

  Future<void> _loadTestData() async {
    final catalogRepo = ref.read(catalogRepositoryProvider);
    final test = await catalogRepo.getTestById(widget.testId);
    final questions = await catalogRepo.getQuestionsForTest(widget.testId);

    if (mounted) {
      setState(() {
        _test = test;
        _questions = questions;
        _isLoading = false;

        for (final q in questions) {
          _answers[q.id] = AttemptAnswerState(questionId: q.id);
        }
      });
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        _submitTest();
      } else {
        setState(() {
          _secondsRemaining--;
          _elapsedSeconds++;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _paletteScrollController.dispose();
    super.dispose();
  }

  void _selectOption(String option) {
    if (_questions.isEmpty) return;
    final currentQ = _questions[_currentIndex];
    setState(() {
      final state = _answers[currentQ.id]!;
      if (state.selectedOption == option) {
        state.selectedOption = null;
      } else {
        state.selectedOption = option;
      }
    });
  }

  void _clearResponse() {
    if (_questions.isEmpty) return;
    final currentQ = _questions[_currentIndex];
    setState(() {
      _answers[currentQ.id]?.selectedOption = null;
    });
  }

  void _toggleMark() {
    if (_questions.isEmpty) return;
    final currentQ = _questions[_currentIndex];
    setState(() {
      final state = _answers[currentQ.id]!;
      state.isMarkedForReview = !state.isMarkedForReview;
    });
  }

  void _goToQuestion(int index) {
    if (index >= 0 && index < _questions.length) {
      setState(() => _currentIndex = index);
      // Auto-scroll palette to center current item
      if (_paletteScrollController.hasClients) {
        final targetOffset = (index * 46.0) - 100;
        _paletteScrollController.animateTo(
          targetOffset.clamp(0.0, _paletteScrollController.position.maxScrollExtent),
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeInOut,
        );
      }
    }
  }

  void _nextQuestion() {
    if (_currentIndex < _questions.length - 1) {
      _goToQuestion(_currentIndex + 1);
    } else {
      _showSubmitConfirmation();
    }
  }

  void _prevQuestion() {
    if (_currentIndex > 0) {
      _goToQuestion(_currentIndex - 1);
    }
  }

  void _submitTest() {
    _timer?.cancel();
    if (_test == null || _questions.isEmpty) return;

    final runnerRepo = ref.read(testRunnerRepositoryProvider);
    final attempt = runnerRepo.gradeAndSubmitAttempt(
      test: _test!,
      questions: _questions,
      answers: _answers,
      timeSpentSeconds: _elapsedSeconds,
    );

    if (mounted) {
      context.go('/result/${attempt.id}');
    }
  }

  void _showSubmitConfirmation() {
    int answeredCount = 0;
    int markedCount = 0;
    for (final s in _answers.values) {
      if (s.selectedOption != null) answeredCount++;
      if (s.isMarkedForReview) markedCount++;
    }
    final unansweredCount = _questions.length - answeredCount;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.help_outline_rounded, color: AppColors.primary, size: 26),
            SizedBox(width: 10),
            Text('Submit Test?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.navy)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Are you sure you want to finish and submit this test?',
              style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildSummaryRow('Total Questions:', '${_questions.length}', Colors.black87),
                  const SizedBox(height: 6),
                  _buildSummaryRow('Answered:', '$answeredCount', const Color(0xFF10B981)),
                  const SizedBox(height: 6),
                  _buildSummaryRow('Unanswered:', '$unansweredCount', const Color(0xFFEF4444)),
                  const SizedBox(height: 6),
                  _buildSummaryRow('Marked for Review:', '$markedCount', const Color(0xFFF59E0B)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Continue Test', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _submitTest();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            ),
            child: const Text('Submit Now', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, Color valueColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: valueColor)),
      ],
    );
  }

  String _formatTimer(int totalSeconds) {
    final hours = (totalSeconds ~/ 3600).toString().padLeft(2, '0');
    final minutes = ((totalSeconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final currentQ = _questions[_currentIndex];
    final answerState = _answers[currentQ.id];
    final isMarked = answerState?.isMarkedForReview ?? false;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.navy),
          onPressed: () => _showSubmitConfirmation(),
        ),
        titleSpacing: 0,
        title: Text(
          _test?.title ?? 'WBP Constable Mock 01',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.navy,
          ),
        ),
        actions: [
          // Timer Badge: ⏱ 00:59:32
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFDBEAFE)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.access_time_rounded, color: AppColors.primary, size: 15),
                const SizedBox(width: 5),
                Text(
                  _formatTimer(_secondsRemaining),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                    fontFeatures: [],
                  ),
                ),
              ],
            ),
          ),
          // Submit Button
          TextButton(
            onPressed: _showSubmitConfirmation,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              foregroundColor: const Color(0xFFEF4444),
            ),
            child: const Text('Submit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Sub-header: Q. 12 / 85 & Mark for Review
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(
                        'Q. ${_currentIndex + 1}',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.navy,
                        ),
                      ),
                      Text(
                        ' / ${_questions.length}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          currentQ.subjectName ?? 'General Knowledge',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Mark for Review toggle
                  InkWell(
                    onTap: _toggleMark,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: isMarked ? const Color(0xFFFEF3C7) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isMarked ? const Color(0xFFF59E0B) : const Color(0xFFCBD5E1),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isMarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                            size: 16,
                            color: isMarked ? const Color(0xFFD97706) : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Mark for Review',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isMarked ? const Color(0xFFD97706) : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Progress bar
            LinearProgressIndicator(
              value: (_currentIndex + 1) / _questions.length,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 2.5,
            ),

            // Scrollable Question & Options Card Area
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question Box
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentQ.questionText,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.navy,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Options Title
                    const Text(
                      'Choose an option:',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Options A, B, C, D
                    _buildMockupOptionItem('A', currentQ.optionA, answerState?.selectedOption == 'A'),
                    _buildMockupOptionItem('B', currentQ.optionB, answerState?.selectedOption == 'B'),
                    _buildMockupOptionItem('C', currentQ.optionC, answerState?.selectedOption == 'C'),
                    _buildMockupOptionItem('D', currentQ.optionD, answerState?.selectedOption == 'D'),

                    // Clear Answer button if selected
                    if (answerState?.selectedOption != null)
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton.icon(
                          onPressed: _clearResponse,
                          icon: const Icon(Icons.clear_rounded, size: 14, color: AppColors.textSecondary),
                          label: const Text('Clear Selection', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // Horizontal Question Palette Strip
            Container(
              color: Colors.white,
              padding: const EdgeInsets.only(top: 10, bottom: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Question Palette',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.navy),
                        ),
                        // Mini Legend
                        Row(
                          children: [
                            _buildLegendDot(const Color(0xFF2563EB), 'Ans'),
                            const SizedBox(width: 8),
                            _buildLegendDot(const Color(0xFFF59E0B), 'Review'),
                            const SizedBox(width: 8),
                            _buildLegendDot(const Color(0xFFCBD5E1), 'Skip'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 40,
                    child: ListView.builder(
                      controller: _paletteScrollController,
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _questions.length,
                      itemBuilder: (context, index) {
                        final q = _questions[index];
                        final ans = _answers[q.id];
                        final isSelected = ans?.selectedOption != null;
                        final isReview = ans?.isMarkedForReview ?? false;
                        final isCurrent = index == _currentIndex;

                        Color bgColor = Colors.white;
                        Color textColor = const Color(0xFF475569);
                        Color borderColor = const Color(0xFFE2E8F0);

                        if (isSelected) {
                          bgColor = const Color(0xFF2563EB);
                          textColor = Colors.white;
                          borderColor = const Color(0xFF2563EB);
                        } else if (isReview) {
                          bgColor = const Color(0xFFFEF3C7);
                          textColor = const Color(0xFFD97706);
                          borderColor = const Color(0xFFF59E0B);
                        }

                        if (isCurrent) {
                          borderColor = AppColors.navy;
                        }

                        return GestureDetector(
                          onTap: () => _goToQuestion(index),
                          child: Container(
                            width: 38,
                            height: 38,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: borderColor,
                                width: isCurrent ? 2.2 : 1.2,
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${index + 1}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: textColor,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Navigation Controls
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  // Previous button
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _currentIndex > 0 ? _prevQuestion : null,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.navy,
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('‹ Previous', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Next / Submit button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _nextQuestion,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: Text(
                        _currentIndex == _questions.length - 1 ? 'Submit Test' : 'Next ›',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildMockupOptionItem(String optionKey, String text, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _selectOption(optionKey),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
              width: isSelected ? 2 : 1,
            ),
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
                ),
                alignment: Alignment.center,
                child: Text(
                  optionKey,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : const Color(0xFF475569),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? const Color(0xFF1E3A8A) : AppColors.navy,
                    height: 1.35,
                  ),
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF2563EB),
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
