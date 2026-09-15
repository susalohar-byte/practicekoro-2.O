#!/usr/bin/env bash
# Apply pending migrations to production Supabase via psql (session pooler, IPv4).
# Usage: SUPABASE_DB_PASSWORD=*** bash scripts/apply-migrations-prod.sh
set -euo pipefail

PSQL=/opt/homebrew/opt/libpq/bin/psql
command -v $PSQL >/dev/null 2>&1 || PSQL=psql

: "${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD (Supabase Dashboard > Project Settings > Database > Database password)}"
: "${SUPABASE_PROJECT_REF:?Set SUPABASE_PROJECT_REF}"
REGION="${SUPABASE_DB_REGION:-ap-south-1}"

CONN="postgresql://postgres.${SUPABASE_PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

# Files to apply, in order. Idempotent-safe: each uses IF EXISTS / ON CONFLICT guards.
FILES=(
  "supabase/migrations/005_phase2a_security_hardening.sql"
  "supabase/migrations/008_security_hardening.sql"
  "supabase/migrations/010_remove_question_difficulty_constraint.sql"
  "supabase/migrations/011_make_subject_exam_id_optional.sql"
  "supabase/migrations/011_role_source_of_truth.sql"
  "supabase/migrations/013_fix_user_test_access_view.sql"
  "supabase/migrations/014_canonical_question_bank_architecture.sql"
)

echo "Applying ${#FILES[@]} migrations to project ${SUPABASE_PROJECT_REF}..."
for f in "${FILES[@]}"; do
  echo "==> $f"
  "$PSQL" "$CONN" -v ON_ERROR_STOP=1 -q -f "$f"
  echo "    OK"
done

echo "All migrations applied."
