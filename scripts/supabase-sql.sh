#!/usr/bin/env bash
# ============================================================================
# PracticeKoro — run SQL against a Supabase Postgres database.
#
# Usage (CI or local):
#   SUPABASE_DB_PASSWORD=... scripts/supabase-sql.sh -f supabase/tests/rls_security.sql
#
# Resolution order for the connection string:
#   1. DATABASE_URL env var (used verbatim)
#   2. SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_REF (pooler, ipv4-friendly)
#
# Requires: psql (libpq). Installs nothing.
# ============================================================================
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  for candidate in /opt/homebrew/opt/libpq/bin /usr/local/opt/libpq/bin; do
    if [ -x "$candidate/psql" ]; then PATH="$candidate:$PATH"; break; fi
  done
fi
command -v psql >/dev/null 2>&1 || { echo "error: psql not found (brew install libpq)" >&2; exit 2; }

if [ -n "${DATABASE_URL:-}" ]; then
  CONN="$DATABASE_URL"
elif [ -n "${SUPABASE_DB_PASSWORD:-}" ] && [ -n "${SUPABASE_PROJECT_REF:-}" ]; then
  REGION="${SUPABASE_DB_REGION:-ap-south-1}"
  CONN="postgresql://postgres:${SUPABASE_DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"
else
  echo "error: set DATABASE_URL, or SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_REF" >&2
  exit 2
fi

exec psql "$CONN" -v ON_ERROR_STOP=1 "$@"
