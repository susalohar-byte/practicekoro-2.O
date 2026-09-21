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

  // Timer
  Timer? _timer;
  int _secondsRemaining = 2912; // 00:48:32 to match mockup
  int _elapsedSeconds = 0;

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
    super.dispose();
  }

  void _selectOption(String option) {
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
    final currentQ = _questions[_currentIndex];
    setState(() {
      _answers[currentQ.id]?.selectedOption = null;
    });
  }

  void _toggleMark() {
    final currentQ = _questions[_currentIndex];
    setState(() {
      final state = _answers[currentQ.id]!;
      state.isMarkedForReview = !state.isMarkedForReview;
    });
  }

  void _nextQuestion() {
    if (_currentIndex < _questions.length - 1) {
      setState(() => _currentIndex++);
    } else {
      _showSubmitConfirmation();
    }
  }

  void _prevQuestion() {
    if (_currentIndex > 0) {
      setState(() => _currentIndex--);
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
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Submit Test?', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
        content: const Text('Are you sure you want to submit and view your scorecard?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _submitTest();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  void _openQuestionPalette() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Question Palette',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
              const SizedBox(height: 16),
              Flexible(
                child: GridView.builder(
                  shrinkWrap: true,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 5,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: _questions.length,
                  itemBuilder: (context, index) {
                    final q = _questions[index];
                    final state = _answers[q.id];
                    final isAnswered = state?.selectedOption != null;
                    final isCurrent = index == _currentIndex;

                    return InkWell(
                      onTap: () {
                        setState(() => _currentIndex = index);
                        Navigator.pop(ctx);
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isAnswered ? AppColors.primary : AppColors.surfaceMuted,
                          borderRadius: BorderRadius.circular(10),
                          border: isCurrent ? Border.all(color: AppColors.navy, width: 2) : null,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isAnswered ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _showSubmitConfirmation();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Submit Test', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
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
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final currentQ = _questions[_currentIndex];
    final answerState = _answers[currentQ.id];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Text(
          _test?.title ?? 'WBSSC Group D',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.navy,
          ),
        ),
        actions: [
          // Timer Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.errorLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.alarm, color: AppColors.error, size: 16),
                const SizedBox(width: 4),
                Text(
                  _formatTimer(_secondsRemaining),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.error,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Question Counter Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.help_outline_rounded, color: AppColors.primary, size: 14),
                const SizedBox(width: 4),
                Text(
                  '${_currentIndex + 1}/${_questions.length}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),

          // Palette button
          IconButton(
            icon: const Icon(Icons.grid_view_rounded, color: AppColors.navy, size: 22),
            onPressed: _openQuestionPalette,
          ),
          const SizedBox(width: 6),
        ],
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Divider(height: 1, color: AppColors.border),

            // Question Content Area
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Subject Tag
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.calculate_rounded, color: AppColors.primary, size: 14),
                            const SizedBox(width: 6),
                            Text(
                              currentQ.subjectName ?? 'Mathematics',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Question Text
                  Text(
                    currentQ.questionText,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navy,
                      height: 1.45,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Options A, B, C, D
                  _buildOptionItem('A', currentQ.optionA, answerState?.selectedOption == 'A'),
                  _buildOptionItem('B', currentQ.optionB, answerState?.selectedOption == 'B'),
                  _buildOptionItem('C', currentQ.optionC, answerState?.selectedOption == 'C'),
                  _buildOptionItem('D', currentQ.optionD, answerState?.selectedOption == 'D'),
                ],
              ),
            ),

            // Bottom Navigation & Tools Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Column(
                children: [
                  // Previous & Next Row
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _currentIndex > 0 ? _prevQuestion : null,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.navy,
                            side: const BorderSide(color: AppColors.border),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('‹ Previous', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _nextQuestion,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text(
                            _currentIndex == _questions.length - 1 ? 'Submit' : 'Next ›',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Mark & Clear Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      InkWell(
                        onTap: _toggleMark,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          child: Row(
                            children: [
                              Icon(
                                answerState?.isMarkedForReview == true
                                    ? Icons.bookmark_rounded
                                    : Icons.bookmark_border_rounded,
                                size: 18,
                                color: answerState?.isMarkedForReview == true
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Mark',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: answerState?.isMarkedForReview == true
                                      ? AppColors.primary
                                      : AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Container(width: 1, height: 16, color: AppColors.border),
                      InkWell(
                        onTap: _clearResponse,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          child: Row(
                            children: const [
                              Icon(Icons.edit_note_rounded, size: 18, color: AppColors.textSecondary),
                              SizedBox(width: 6),
                              Text(
                                'Clear',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionItem(String optionKey, String text, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _selectOption(optionKey),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryLight : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected ? AppColors.primary : AppColors.surfaceMuted,
                ),
                alignment: Alignment.center,
                child: Text(
                  optionKey,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected ? AppColors.navy : AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
