# Supabase migration order

This directory contains the historical Supabase migration files for PracticeKoro.

## Important safety rule

Do not rename, delete, or renumber a migration after it has been applied to a Supabase project. Supabase records migration history using the full migration filename. Renaming an applied file can make the same SQL look like a new migration and may cause it to run again.

## Historical ordering

The duplicate numeric prefixes are retained intentionally for production safety. When reviewing the historical sequence, use the full filename in lexicographic order:

1. `011_make_subject_exam_id_optional.sql`
2. `011_role_source_of_truth.sql`
3. `013_fix_user_test_access_view.sql`
4. `014_canonical_question_bank_architecture.sql`
5. `015_repair_broken_admin_policies.sql`
6. `015_upgrade_admin_practicekoro_online.sql`
7. `016_separate_question_sources.sql`

The missing `012` and `023` prefixes are historical gaps, not missing files that should be recreated.

## New migrations

Use the next unused numeric prefix for new migrations. After `027_commerce_student_management.sql`, new migrations should start at `028_...`.

For a clearer business-level sequence, update this README rather than renaming historical files.
