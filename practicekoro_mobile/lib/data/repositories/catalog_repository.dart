import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/exam_model.dart';
import '../models/subject_model.dart';
import '../models/test_model.dart';
import '../models/question_model.dart';
import '../datasources/mock_data.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository();
});

class CatalogRepository {
  SupabaseClient? get _supabase {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  Future<List<ExamModel>> getExams() async {
    final client = _supabase;
    if (client != null) {
      try {
        final response = await client
            .from('exams')
            .select()
            .eq('is_active', true)
            .order('order_index', ascending: true);
        if (response.isNotEmpty) {
          return (response as List<dynamic>)
              .map((e) => ExamModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {
        // Fallback to local mock data
      }
    }
    return MockData.exams;
  }

  Future<ExamModel?> getExamById(String examId) async {
    final exams = await getExams();
    try {
      return exams.firstWhere((e) => e.id == examId || e.slug == examId);
    } catch (_) {
      return exams.isNotEmpty ? exams.first : null;
    }
  }

  Future<List<SubjectModel>> getSubjects({String? examId}) async {
    final client = _supabase;
    if (client != null) {
      try {
        var query = client.from('subjects').select().eq('is_active', true);
        if (examId != null) {
          query = query.or('exam_id.eq.$examId,exam_id.is.null');
        }
        final response = await query.order('order_index', ascending: true);
        if (response.isNotEmpty) {
          return (response as List<dynamic>)
              .map((e) => SubjectModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {
        // Fallback
      }
    }
    return MockData.subjects;
  }

  Future<List<MockTestModel>> getMockTests({String? examId, String? testType}) async {
    final client = _supabase;
    if (client != null) {
      try {
        var query = client.from('tests').select().eq('is_active', true);
        if (examId != null) {
          query = query.eq('exam_id', examId);
        }
        if (testType != null) {
          query = query.eq('test_type', testType);
        }
        final response = await query.order('order_index', ascending: true);
        if (response.isNotEmpty) {
          return (response as List<dynamic>)
              .map((e) => MockTestModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {
        // Fallback
      }
    }
    var list = MockData.mockTests;
    if (examId != null) {
      list = list.where((t) => t.examId == examId).toList();
    }
    if (testType != null) {
      list = list.where((t) => t.testType == testType).toList();
    }
    return list.isNotEmpty ? list : MockData.mockTests;
  }

  Future<MockTestModel?> getTestById(String testId) async {
    final allTests = await getMockTests();
    try {
      return allTests.firstWhere((t) => t.id == testId || t.slug == testId);
    } catch (_) {
      return MockData.mockTests.first;
    }
  }

  Future<List<QuestionModel>> getQuestionsForTest(String testId) async {
    final client = _supabase;
    if (client != null) {
      try {
        final response = await client
            .from('test_questions')
            .select('marks, negative_marks, question_order, questions(*)')
            .eq('test_id', testId)
            .order('question_order', ascending: true);

        if (response.isNotEmpty) {
          return (response as List<dynamic>).map((item) {
            final q = item['questions'] as Map<String, dynamic>;
            return QuestionModel(
              id: q['id'] as String,
              questionOrder: (item['question_order'] as num?)?.toInt() ?? 1,
              questionText: q['question_text'] as String,
              questionBengaliText: q['question_bengali_text'] as String?,
              imageUrl: q['image_url'] as String?,
              optionA: q['option_a'] as String,
              optionB: q['option_b'] as String,
              optionC: q['option_c'] as String,
              optionD: q['option_d'] as String,
              correctOption: q['correct_option'] as String,
              explanation: q['explanation'] as String?,
              explanationBengali: q['explanation_bengali'] as String?,
              marks: (item['marks'] as num?)?.toDouble() ?? 1.0,
              negativeMarks: (item['negative_marks'] as num?)?.toDouble() ?? 0.25,
            );
          }).toList();
        }
      } catch (_) {
        // Fallback
      }
    }
    return MockData.sampleQuestions;
  }
}
