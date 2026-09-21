class ExamModel {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final String category;
  final String iconName;
  final String? bannerUrl;
  final int orderIndex;
  final bool isActive;
  final int? totalTests;
  final int? totalVacancies;

  const ExamModel({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    required this.category,
    this.iconName = 'Shield',
    this.bannerUrl,
    this.orderIndex = 0,
    this.isActive = true,
    this.totalTests,
    this.totalVacancies,
  });

  factory ExamModel.fromJson(Map<String, dynamic> json) {
    return ExamModel(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      category: (json['category'] as String?) ?? 'State Govt.',
      iconName: (json['icon_name'] as String?) ?? 'Shield',
      bannerUrl: json['banner_url'] as String?,
      orderIndex: (json['order_index'] as int?) ?? 0,
      isActive: (json['is_active'] as bool?) ?? true,
      totalTests: json['total_tests'] as int?,
      totalVacancies: json['total_vacancies'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'description': description,
      'category': category,
      'icon_name': iconName,
      'banner_url': bannerUrl,
      'order_index': orderIndex,
      'is_active': isActive,
      'total_tests': totalTests,
      'total_vacancies': totalVacancies,
    };
  }
}
