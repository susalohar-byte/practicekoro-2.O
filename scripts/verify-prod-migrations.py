#!/usr/bin/env python3
"""
PracticeKoro Production Database Migration Verifier.

Probes the live Supabase production instance (using publishable credentials from .env)
to verify which schema objects, tables, RPCs, and columns have been deployed.

Usage:
    python3 scripts/verify-prod-migrations.py
"""

import os
import re
import json
import urllib.request
import urllib.error
import sys

# Locate root directory and .env
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")

if not os.path.isfile(ENV_PATH):
    print(f"Error: .env file not found at {ENV_PATH}", file=sys.stderr)
    sys.exit(1)

with open(ENV_PATH, "r") as f:
    env_content = f.read()

url_match = re.search(r'VITE_SUPABASE_URL="?https://([a-z0-9]+)\.supabase\.co', env_content)
key_match = re.search(r'VITE_SUPABASE_ANON_KEY="?([A-Za-z0-9_\-.]+)', env_content)

if not url_match or not key_match:
    print("Error: Could not parse VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY from .env", file=sys.stderr)
    sys.exit(1)

project_ref = url_match.group(1)
anon_key = key_match.group(1)
rest_base = f"https://{project_ref}.supabase.co/rest/v1"


def probe_rest(endpoint: str, check_has_data: bool = False):
    """Probes a REST endpoint to verify table/column existence."""
    req = urllib.request.Request(
        f"{rest_base}/{endpoint}",
        headers={"apikey": anon_key}
    )
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                if check_has_data:
                    data = json.load(response)
                    return (len(data) > 0, f"HTTP 200 (rows: {len(data)})")
                return (True, f"HTTP {response.status}")
            return (False, f"HTTP {response.status}")
    except urllib.error.HTTPError as e:
        return (False, f"HTTP {e.code}")
    except Exception as e:
        return (False, str(e)[:30])


# Verification specification across historical and pending migrations
MIGRATION_CHECKS = [
    {
        "id": "001-007",
        "title": "Core Schema & Subscription Plans",
        "check": lambda: probe_rest("subscription_plans?limit=1"),
        "critical": True,
    },
    {
        "id": "014",
        "title": "Canonical Exam-Topic Junction (exam_topics)",
        "check": lambda: probe_rest("exam_topics?limit=1"),
        "critical": True,
    },
    {
        "id": "016",
        "title": "Question Source Types (questions.source_type)",
        "check": lambda: probe_rest("questions?select=source_type&limit=1"),
        "critical": True,
    },
    {
        "id": "017",
        "title": "Standalone Topic Mocks (tests.chapter_id)",
        "check": lambda: probe_rest("tests?select=chapter_id&limit=1"),
        "critical": True,
    },
    {
        "id": "018",
        "title": "Global App Settings (app_settings)",
        "check": lambda: probe_rest("app_settings?limit=1"),
        "critical": True,
    },
    {
        "id": "018",
        "title": "In-App Announcements (notifications)",
        "check": lambda: probe_rest("notifications?limit=1"),
        "critical": True,
    },
    {
        "id": "018",
        "title": "Student Support Desk (support_tickets)",
        "check": lambda: probe_rest("support_tickets?limit=1"),
        "critical": True,
    },
    {
        "id": "022",
        "title": "Free Plan in Catalog (plan_free row seeded)",
        "check": lambda: probe_rest("subscription_plans?id=eq.plan_free", check_has_data=True),
        "critical": False,
    },
    {
        "id": "024",
        "title": "Coupons & Discounts Subsystem (coupons)",
        "check": lambda: probe_rest("coupons?limit=1"),
        "critical": True,
    },
    {
        "id": "027",
        "title": "Bulk Student Cohorts (student_batches)",
        "check": lambda: probe_rest("student_batches?limit=1"),
        "critical": True,
    },
    {
        "id": "027",
        "title": "Refund Audit Tracking (payments.refund_id)",
        "check": lambda: probe_rest("payments?select=refund_id&limit=1"),
        "critical": True,
    },
    {
        "id": "027",
        "title": "Dynamic Exam Categories (exam_categories)",
        "check": lambda: probe_rest("exam_categories?limit=1"),
        "critical": True,
    },
    {
        "id": "027",
        "title": "Question Images Column (questions.image_url)",
        "check": lambda: probe_rest("questions?select=image_url&limit=1"),
        "critical": True,
    },
    {
        "id": "029",
        "title": "Admin Audit Trail (admin_audit_logs)",
        "check": lambda: probe_rest("admin_audit_logs?limit=1"),
        "critical": True,
    },
]


def main():
    print("=" * 80)
    print("  PRACTICEKORO 2.0 — PRODUCTION DATABASE MIGRATION VERIFIER")
    print(f"  Target Instance: https://{project_ref}.supabase.co")
    print("=" * 80)

    applied_count = 0
    pending_count = 0

    print(f"{'MIGRATION':<12} | {'STATUS':<9} | {'CHECKPOINT DESCRIPTION':<42} | {'HTTP STATUS'}")
    print("-" * 80)

    for item in MIGRATION_CHECKS:
        ok, detail = item["check"]()
        if ok:
            applied_count += 1
            status_badge = "APPLIED"
        else:
            pending_count += 1
            status_badge = "PENDING"

        print(f"{item['id']:<12} | {status_badge:<9} | {item['title']:<42} | {detail}")

    print("-" * 80)
    print(f"SUMMARY: {applied_count} Checkpoints Applied, {pending_count} Checkpoints Pending")
    print("=" * 80)

    if pending_count > 0:
        print("\nACTION REQUIRED BEFORE PRODUCTION LAUNCH:")
        print("The production database is missing pending migrations (018 through 031).")
        print("To apply all pending migrations:")
        print(f"    SUPABASE_DB_PASSWORD=*** bash scripts/apply-migrations-prod.sh\n")
        return 1
    else:
        print("\nALL PRODUCTION MIGRATIONS FULLY RECONCILED AND LIVE!\n")
        return 0


if __name__ == "__main__":
    sys.exit(main())
