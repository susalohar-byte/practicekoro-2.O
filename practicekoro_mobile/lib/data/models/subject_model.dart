class SubjectModel {
  final String id;
  final String? examId;
  final String name;
  final String slug;
  final String? description;
  final String iconName;
  final int orderIndex;
  final bool isActive;
  final int? chaptersCount;

  const SubjectModel({
    required this.id,
    this.examId,
    required this.name,
    required this.slug,
    this.description,
    this.iconName = 'BookOpen',
    this.orderIndex = 0,
    this.isActive = true,
    this.chaptersCount,
  });

  factory SubjectModel.fromJson(Map<String, dynamic> json) {
    return SubjectModel(
      id: json['id'] as String,
      examId: json['exam_id'] as String?,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      iconName: (json['icon_name'] as String?) ?? 'BookOpen',
      orderIndex: (json['order_index'] as int?) ?? 0,
      isActive: (json['is_active'] as bool?) ?? true,
      chaptersCount: json['chapters_count'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'exam_id': examId,
      'name': name,
      'slug': slug,
      'description': description,
      'icon_name': iconName,
      'order_index': orderIndex,
      'is_active': isActive,
      'chapters_count': chaptersCount,
    };
  }
}

class ChapterModel {
  final String id;
  final String subjectId;
  final String name;
  final String slug;
  final String? description;
  final int orderIndex;
  final bool isActive;
  final int? testsCount;

  const ChapterModel({
    required this.id,
    required this.subjectId,
    required this.name,
    required this.slug,
    this.description,
    this.orderIndex = 0,
    this.isActive = true,
    this.testsCount,
  });

  factory ChapterModel.fromJson(Map<String, dynamic> json) {
    return ChapterModel(
      id: json['id'] as String,
      subjectId: json['subject_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      orderIndex: (json['order_index'] as int?) ?? 0,
      isActive: (json['is_active'] as bool?) ?? true,
      testsCount: json['tests_count'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subject_id': subjectId,
      'name': name,
      'slug': slug,
      'description': description,
      'order_index': orderIndex,
      'is_active': isActive,
      'tests_count': testsCount,
    };
  }
}
