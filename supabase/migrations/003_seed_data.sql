-- ============================================================================
-- PRACTICEKORO PRODUCTION SEED DATA (PHASE 1)
-- ============================================================================

-- 1. SEED EXAMS
INSERT INTO public.exams (id, title, slug, category, icon_name, description, order_index) VALUES
  ('wbp-constable', 'WBP Constable', 'wbp-constable', 'West Bengal Police', 'Shield', 'West Bengal Police Constable Prelims & Mains Recruitment Examination.', 1),
  ('kp-police-si', 'Kolkata Police SI', 'kolkata-police-si', 'West Bengal Police', 'Award', 'Kolkata Police Sub-Inspector & Sergeant Recruitment Examination.', 2),
  ('wbcs-prelims', 'WBCS Executive Prelims', 'wbcs-prelims', 'State Civil Services', 'FileCheck', 'West Bengal Civil Service (Executive) Preliminary Examination.', 3),
  ('wbpsc-clerkship', 'WBPSC Clerkship', 'wbpsc-clerkship', 'State Govt.', 'GraduationCap', 'West Bengal Public Service Commission Lower Division Clerk Examination.', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED SUBJECTS
INSERT INTO public.subjects (id, exam_id, name, slug, description, icon_name, order_index) VALUES
  ('wbp-history', 'wbp-constable', 'Indian History (ভারত ও বাংলার ইতিহাস)', 'indian-history', 'Ancient, Medieval, and Modern Indian history with special emphasis on Bengal.', 'BookOpen', 1),
  ('wbp-math', 'wbp-constable', 'Elementary Mathematics (পাটিগণিত)', 'mathematics', 'Arithmetic, percentages, profit & loss, ratio & proportion, time & work.', 'Calculator', 2),
  ('wbp-science', 'wbp-constable', 'General Science (সাধারণ বিজ্ঞান)', 'general-science', 'Physics, Chemistry, and Life Sciences according to Class 10 WBBSE syllabus.', 'FlaskConical', 3),
  ('wbp-polity', 'wbp-constable', 'Indian Constitution (ভারতের সংবিধান)', 'indian-constitution', 'Preamble, Fundamental Rights, Directive Principles, and Governance.', 'Scale', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CHAPTERS
INSERT INTO public.chapters (id, subject_id, name, slug, description, order_index) VALUES
  ('wbp-hist-indus', 'wbp-history', 'Indus Valley Civilization (সিন্ধু সভ্যতা)', 'indus-valley-civilization', 'Harappa, Mohenjodaro, urban planning, seals, trade, and decline.', 1),
  ('wbp-hist-vedic', 'wbp-history', 'Vedic Period & Buddhism (বৈদিক যুগ ও বৌদ্ধ ধর্ম)', 'vedic-period-buddhism', 'Early & Later Vedic age, Upanishads, Jainism, Buddhism councils.', 2),
  ('wbp-math-percentage', 'wbp-math', 'Percentage & Profit-Loss (শতকরা ও লাভ-ক্ষতি)', 'percentage-profit-loss', 'Core percentage calculations, CP, SP, discounts, and real-world exam math.', 1),
  ('wbp-polity-rights', 'wbp-polity', 'Fundamental Rights & Duties (মৌলিক অধিকার ও কর্তব্য)', 'fundamental-rights-duties', 'Articles 12 to 35, Writs, 42nd & 44th Constitutional Amendments.', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED TEST SERIES
INSERT INTO public.test_series (id, exam_id, title, slug, description, is_premium, order_index) VALUES
  ('wbp-prelims-2025', 'wbp-constable', 'WBP Constable 2025 Prelims Test Series', 'wbp-prelims-2025', 'Official pattern 85-question full mocks and chapter drills.', false, 1)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED TESTS (Free & Premium under Indus Valley Civilization)
INSERT INTO public.tests (id, exam_id, subject_id, chapter_id, test_series_id, title, slug, test_type, duration_minutes, total_questions, total_marks, passing_marks, negative_marking, is_premium, order_index) VALUES
  ('test-indus-01', 'wbp-constable', 'wbp-history', 'wbp-hist-indus', 'wbp-prelims-2025', 'Mock Test Part 01: Indus Valley (Free)', 'indus-valley-mock-01', 'chapter_mock', 15, 5, 5.00, 2.00, 0.25, false, 1),
  ('test-indus-02', 'wbp-constable', 'wbp-history', 'wbp-hist-indus', 'wbp-prelims-2025', 'Mock Test Part 02: High-Yield Indus (Premium)', 'indus-valley-mock-02', 'chapter_mock', 20, 5, 5.00, 2.00, 0.25, true, 2),
  ('test-indus-03', 'wbp-constable', 'wbp-history', 'wbp-hist-indus', 'wbp-prelims-2025', 'Mock Test Part 03: Advanced PYQ Drill (Premium)', 'indus-valley-mock-03', 'chapter_mock', 20, 5, 5.00, 2.00, 0.25, true, 3),
  ('test-wbp-full-01', 'wbp-constable', NULL, NULL, 'wbp-prelims-2025', 'WBP Constable Full Mock 01 (Free Starter)', 'wbp-full-mock-01', 'full_mock', 60, 85, 85.00, 35.00, 0.25, false, 4)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED QUESTIONS
INSERT INTO public.questions (id, chapter_id, question_text, question_bengali_text, option_a, option_b, option_c, option_d, correct_option, explanation, explanation_bengali, difficulty) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'wbp-hist-indus',
   '১৯২১ সালে হরপ্পা প্রত্নক্ষেত্রটি কে আবিষ্কার করেছিলেন?',
   '১৯২১ সালে হরপ্পা প্রত্নক্ষেত্রটি কে আবিষ্কার করেছিলেন?',
   'রাখালদাস বন্দ্যোপাধ্যায়', 'দয়ারাম সাহনি', 'স্যার জন মার্শাল', 'আলেকজান্ডার কানিংহাম',
   'B',
   '১৯২১ সালে স্যার জন মার্শালের অধীনে দয়ারাম সাহনি হরপ্পা সভ্যতা আবিষ্কার করেন।',
   '১৯২১ সালে স্যার জন মার্শালের অধীনে দয়ারাম সাহনি হরপ্পা সভ্যতা আবিষ্কার করেন।',
   'easy'),

  ('a0000000-0000-0000-0000-000000000002', 'wbp-hist-indus',
   'সিন্ধু সভ্যতার বিখ্যাত স্নানাগারটি (Great Bath) কোথায় পাওয়া গেছে?',
   'সিন্ধু সভ্যতার বিখ্যাত স্নানাগারটি (Great Bath) কোথায় পাওয়া গেছে?',
   'হরপ্পা', 'লোথাল', 'মহেঞ্জোদারো', 'কালিবঙ্গান',
   'C',
   'বিখ্যাত স্নানাগারটি মহেঞ্জোদারোতে আবিষ্কৃত হয়েছিল। এটি সিন্ধু প্রদেশের লারকানা জেলায় অবস্থিত।',
   'বিখ্যাত স্নানাগারটি মহেঞ্জোদারোতে আবিষ্কৃত হয়েছিল। এটি সিন্ধু প্রদেশের লারকানা জেলায় অবস্থিত।',
   'easy'),

  ('a0000000-0000-0000-0000-000000000003', 'wbp-hist-indus',
   'সিন্ধু সভ্যতার কোন শহরটিতে প্রাচীন কৃত্রিম পোতাশ্রয় বা ডকইয়ার্ড ছিল?',
   'সিন্ধু সভ্যতার কোন শহরটিতে প্রাচীন কৃত্রিম পোতাশ্রয় বা ডকইয়ার্ড ছিল?',
   'লোথাল', 'সুরকোটাদা', 'বনওয়ালি', 'রাখিগড়ী',
   'A',
   'গুজরাটের লোথালে বিশ্বের প্রাচীনতম বন্দর বা পোতাশ্রয় আবিষ্কৃত হয়েছে।',
   'গুজরাটের লোথালে বিশ্বের প্রাচীনতম বন্দর বা পোতাশ্রয় আবিষ্কৃত হয়েছে।',
   'medium'),

  ('a0000000-0000-0000-0000-000000000004', 'wbp-hist-indus',
   'সিন্ধু সভ্যতা কোন ঐতিহাসিক যুগের অন্তর্গত ছিল?',
   'সিন্ধু সভ্যতা কোন ঐতিহাসিক যুগের অন্তর্গত ছিল?',
   'প্রাচীন প্রস্তর যুগ', 'মধ্য প্রস্তর যুগ', 'তাম্র-ব্রোঞ্জ যুগ', 'লৌহ যুগ',
   'C',
   'সিন্ধু সভ্যতা ব্রোঞ্জ বা তাম্র-ব্রোঞ্জ যুগের সভ্যতা ছিল। লোহার ব্যবহার তারা জানত না।',
   'সিন্ধু সভ্যতা ব্রোঞ্জ বা তাম্র-ব্রোঞ্জ যুগের সভ্যতা ছিল। লোহার ব্যবহার তারা জানত না।',
   'medium'),

  ('a0000000-0000-0000-0000-000000000005', 'wbp-hist-indus',
   'সিন্ধু সভ্যতার কোন কেন্দ্রে লাঙল দেওয়া চাষের জমির প্রমাণ পাওয়া গেছে?',
   'সিন্ধু সভ্যতার কোন কেন্দ্রে লাঙল দেওয়া চাষের জমির প্রমাণ পাওয়া গেছে?',
   'চানহুদারো', 'কালিবঙ্গান', 'ধোলাভিরা', 'কোট দিজি',
   'B',
   'রাজস্থানের কালিবঙ্গানে লাঙল চষা কৃষি ক্ষেত্রের নিদর্শন আবিষ্কৃত হয়েছে।',
   'রাজস্থানের কালিবঙ্গানে লাঙল চষা কৃষি ক্ষেত্রের নিদর্শন আবিষ্কৃত হয়েছে।',
   'hard')
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_bengali_text = EXCLUDED.question_bengali_text,
  option_a = EXCLUDED.option_a,
  option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c,
  option_d = EXCLUDED.option_d,
  correct_option = EXCLUDED.correct_option,
  explanation = EXCLUDED.explanation,
  explanation_bengali = EXCLUDED.explanation_bengali;

-- 7. SEED TEST_QUESTIONS (Linking questions to test-indus-01)
INSERT INTO public.test_questions (test_id, question_id, question_order, marks, negative_marks) VALUES
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000001', 1, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000002', 2, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000003', 3, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000004', 4, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000005', 5, 1.00, 0.25)
ON CONFLICT (test_id, question_id) DO NOTHING;

-- 8. SEED SUBSCRIPTION PLANS
INSERT INTO public.subscription_plans (id, title, description, duration_days, price, original_price, features, is_active, order_index) VALUES
  ('pro_1_year', '1-Year All-Access Pass', 'Complete access to ALL Premium Mock Tests across WBP Constable, KP SI, WBCS & WBPSC for 365 days.', 365, 299.00, 999.00,
   '["Unlimited access to ALL Premium Mock Tests", "Detailed Question-wise Analysis & Explanations", "Automatic Mistakes Notebook & Revision", "Leaderboards & State-level Percentile", "Bengali & English Bilingual Format"]'::jsonb,
   true, 1),
  ('pro_6_month', '6-Month Exam Pass', 'Access to ALL Premium Mock Tests for 180 days.', 180, 199.00, 599.00,
   '["Access to ALL Premium Mock Tests", "Detailed Solutions & Explanations", "Mistakes Notebook", "Bilingual Tests"]'::jsonb,
   true, 2)
ON CONFLICT (id) DO NOTHING;
