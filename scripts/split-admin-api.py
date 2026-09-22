"""One-shot split of src/services/domains/admin.ts into section modules.

Preserves the exact `adminApi` export shape (same keys, same order).
Run: python3 scripts/split-admin-api.py (then delete this script).
"""

import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'services' / 'domains' / 'admin.ts'

SECTIONS = [
    ('exams', 106, 408),
    ('subjects', 409, 606),
    ('chapters', 607, 799),
    ('testSeries', 800, 972),
    ('tests', 973, 1750),
    ('questions', 1751, 2259),
    ('examCategories', 2260, 2615),
    ('testQuestions', 2616, 2933),
    ('bulkImports', 2934, 3276),
    ('notifications', 3277, 3419),
    ('support', 3420, 3596),
    ('settings', 3597, 4242),
]

VALUE_CANDIDATES = [
    'supabase',
    'isSupabaseConfigured',
    'getErrorMessage',
    'parseQuestionsCsv',
    'parseQuestionsText',
    'catalogApi',
    'mapQuestionRow',
    'parseSettingValue',
    'localExams',
    'localExamCategories',
    'localSubjects',
    'localChapters',
    'localTestSeries',
    'localTests',
    'localQuestions',
    'localTestQuestions',
    'localNotifications',
    'syncLocalScheduledNotifications',
    'localAppSettings',
    'localPaymentGateways',
    'localSupportTickets',
    'localItemAnalysisStore',
]

TYPE_CANDIDATES = [
    'Exam',
    'ExamCategory',
    'Subject',
    'Chapter',
    'TestSeries',
    'MockTest',
    'Question',
    'TestQuestionAssignment',
    'PublishValidationResult',
    'NotificationItem',
    'SupportTicketItem',
    'AppSettingItem',
    'StudentAttemptExportRow',
    'QuestionItemAnalysis',
    'ItemAnalysisFilterOptions',
    'EmpiricalDifficulty',
    'PaymentGatewayConfig',
    'PaymentGatewayUpdatePayload',
    'ParsedTxtQuestion',
    'ChapterRow',
    'ExamRow',
    'QuestionRow',
    'SubjectRow',
]

LOCALSTORE_VALUES = {
    'localExams',
    'localExamCategories',
    'localSubjects',
    'localChapters',
    'localTestSeries',
    'localTests',
    'localQuestions',
    'localTestQuestions',
    'localNotifications',
    'syncLocalScheduledNotifications',
    'localAppSettings',
    'localPaymentGateways',
    'localSupportTickets',
    'localItemAnalysisStore',
}
LOCALSTORE_TYPES = {'ChapterRow', 'ExamRow', 'QuestionRow', 'SubjectRow'}


def main() -> None:
    lines = SRC.read_text().splitlines()
    assert lines[104].strip() == 'export const adminApi = {', lines[104]
    assert lines[4242].strip() == '};', lines[4242]

    modules: dict[str, dict] = {}
    for name, start, end in SECTIONS:
        chunk = lines[start - 1 : end]  # 1-indexed inclusive
        # 1. dedent by 2
        dedented = [ln[2:] if ln.startswith('  ') else ln for ln in chunk]
        # 2. method closings: col-0 "}," -> "}"
        fixed = [('}' if ln == '},' else ln) for ln in dedented]
        text = '\n'.join(fixed)
        # 3. this.X( -> X(
        this_refs = sorted(set(re.findall(r'this\.([A-Za-z_]\w*)\(', text)))
        text = re.sub(r'this\.([A-Za-z_]\w*)\(', r'\1(', text)
        # 4. method starts -> exported functions
        methods: list[str] = []

        def repl(m: re.Match) -> str:
            methods.append(m.group(2))
            return f'export {"async " if m.group(1) else ""}function {m.group(2)}('

        text, n = re.subn(r'^(async )?([A-Za-z_]\w*)\(', repl, text, flags=re.M)
        # 5. sanity: no leftover col-0 "}," and every col-0 code line accounted.
        # Allowed continuations: "> {" (multi-line Promise<...> return type)
        # and "): ..." (multi-line parameter list closing).
        leftovers = [
            ln
            for ln in text.splitlines()
            if ln.strip()
            and not ln.startswith((' ', '\t', '/', '*', 'export ', '}', '>', ')'))
            and ln.strip() != '},'
        ]
        assert not leftovers, (name, leftovers[:5])
        modules[name] = {'text': text, 'methods': methods, 'this_refs': this_refs}

    total_methods = sum(len(m['methods']) for m in modules.values())
    print(f'sections={len(modules)} methods={total_methods}')

    # cross-module refs must resolve via explicit acyclic imports
    # (verified: testQuestions/bulkImports targets import nothing back)
    CROSS_IMPORTS = {
        'tests': [('getTestAssignedQuestions', 'testQuestions'), ('saveTestQuestions', 'testQuestions')],
        'bulkImports': [('createQuestion', 'questions')],
    }
    for name, mod in modules.items():
        local = set(mod['methods'])
        foreign = [r for r in mod['this_refs'] if r not in local]
        print(f'{name}: methods={len(local)} foreign_this_refs={foreign}')
        allowed = [fn for fn, _sec in CROSS_IMPORTS.get(name, [])]
        assert sorted(foreign) == sorted(allowed), (name, foreign)
        mod['cross_imports'] = CROSS_IMPORTS.get(name, [])

    out_dir = ROOT / 'src' / 'services' / 'domains'
    obj_names: list[str] = []
    for name, _s, _e in SECTIONS:
        mod = modules[name]
        body = mod['text']
        # imports needed by this module
        values = [v for v in VALUE_CANDIDATES if re.search(rf'\b{v}\b', body)]
        types = [t for t in TYPE_CANDIDATES if re.search(rf'\b{t}\b', body)]
        imp_lines = [
            "import { getErrorMessage } from '@/lib/errors';"
            if 'getErrorMessage' in values
            else None,
            (
                "import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';"
                if ('supabase' in values or 'isSupabaseConfigured' in values)
                else None
            ),
            (
                "import { parseQuestionsCsv, parseQuestionsText } from '@/utils/csvParser';"
                if ('parseQuestionsCsv' in values or 'parseQuestionsText' in values)
                else None
            ),
            "import { catalogApi } from '@/services/domains/catalog';"
            if 'catalogApi' in values
            else None,
            "import { mapQuestionRow, parseSettingValue } from './admin.shared';"
            if ('mapQuestionRow' in values or 'parseSettingValue' in values)
            else None,
        ]
        by_sec: dict[str, list[str]] = {}
        for _fn, _sec in mod['cross_imports']:
            by_sec.setdefault(_sec, []).append(_fn)
        for _sec, _fns in by_sec.items():
            imp_lines.append(f"import {{ {', '.join(_fns)} }} from './admin.{_sec}';")
        local_vals = sorted(set(values) & LOCALSTORE_VALUES)
        if local_vals:
            imp_lines.append(
                f"import {{ {', '.join(local_vals)} }} from '@/services/domains/localStore';"
            )
        app_types = sorted(set(types) - LOCALSTORE_TYPES - {'ParsedTxtQuestion'})
        if app_types:
            imp_lines.append(f"import type {{ {', '.join(app_types)} }} from '@/types';")
        if 'ParsedTxtQuestion' in types:
            imp_lines.append("import type { ParsedTxtQuestion } from '@/utils/txtQuestionParser';")
        local_types = sorted(set(types) & LOCALSTORE_TYPES)
        if local_types:
            imp_lines.append(
                f"import type {{ {', '.join(local_types)} }} from '@/services/domains/localStore';"
            )
        imports = '\n'.join([ln for ln in imp_lines if ln])
        obj = f"admin{name[0].upper()}{name[1:]}Api"
        obj_names.append(obj)
        method_list = '\n'.join(f'  {m},' for m in mod['methods'])
        content = (
            f"{imports}\n\n"
            f'/** Section of the admin API: {name} (split from domains/admin.ts, same behaviour). */\n'
            f'{body}\n\n'
            f'export const {obj} = {{\n{method_list}\n}};\n'
        )
        (out_dir / f'admin.{name}.ts').write_text(content)

    # shared helpers (moved verbatim from admin.ts)
    shared_src = SRC.read_text()
    fn1 = re.search(
        r"/\*\* Maps a raw Supabase `questions` row.*?^}",
        shared_src,
        re.S | re.M,
    )
    fn2 = re.search(r'function parseSettingValue\(raw: unknown\): unknown \{.*?^}', shared_src, re.S | re.M)
    assert fn1 and fn2, 'helpers not found'
    (out_dir / 'admin.shared.ts').write_text(
        "import type { Question } from '@/types';\n\n" + fn1.group(0) + '\n\n' + fn2.group(0) + '\n'
    )

    # assembly (keeps the exact export shape: same keys, same order)
    spread = '\n'.join(f'  ...{o},' for o in obj_names)
    imports_asm = '\n'.join(
        f"import {{ {o} }} from './admin.{name}';" for o, (name, _, _) in zip(obj_names, SECTIONS)
    )
    SRC.write_text(
        '/**\n'
        ' * Admin content-management API (exams, subjects, chapters, series, tests, questions).\n'
        ' * Full Supabase CRUD operations without mock data fallbacks when Supabase is configured.\n'
        ' *\n'
        ' * Assembly only: method bodies live in the admin.* section modules.\n'
        ' * The exported `adminApi` shape (keys + order) is unchanged.\n'
        ' */\n'
        f'{imports_asm}\n\n'
        'export const adminApi = {\n'
        f'{spread}\n'
        '};\n'
    )
    print('split complete')


if __name__ == '__main__':
    main()
