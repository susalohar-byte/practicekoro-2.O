"""One-shot extraction of presentational components from AdminQuestionBank.tsx.

Extracts (verbatim JSX, only closure refs rewritten to props):
  - questionBank/QuestionCard.tsx        (card list row)
  - questionBank/QuestionTableRow.tsx    (table view row)
  - questionBank/PreviewQuestionModal.tsx (preview dialog)
Parent keeps all state/handlers/data-flow unchanged.
Run: python3 scripts/split-question-bank.py (then delete this script).
"""

import pathlib
import re
import textwrap

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'pages' / 'admin' / 'AdminQuestionBank.tsx'
OUT = ROOT / 'src' / 'pages' / 'admin' / 'questionBank'
OUT.mkdir(exist_ok=True)

lines = SRC.read_text().splitlines()


def slice_block(start1: int, end1: int) -> list[str]:
    """1-indexed inclusive line slice."""
    return lines[start1 - 1 : end1]


def dedent_block(block: list[str]) -> str:
    indent = min(len(ln) - len(ln.lstrip()) for ln in block if ln.strip())
    return '\n'.join(ln[indent:] if ln.strip() else '' for ln in block)


# ---------------------------------------------------------------- QuestionCard
# lines 2083..2350: the card <div key={q.id}> ... </div> (inside map return)
card = slice_block(2083, 2350)
assert card[0].strip().startswith('<div'), card[0]
assert card[-1].strip() == '</div>', card[-1]
card_text = dedent_block(card)
card_text = card_text.replace(
    'onClick={() => toggleSelectQuestion(q.id)}', 'onClick={onToggleSelect}'
)
card_text = card_text.replace('onClick={() => handleOpenEdit(q)}', 'onClick={onOpenEdit}')
card_text = card_text.replace('onClick={() => setQuestionToDelete(q)}', 'onClick={onRequestDelete}')
card_text = card_text.replace('Boolean(expandedNotesIds[q.id])', 'notesExpanded')
card_text = card_text.replace('onToggle={() => toggleNotes(q.id)}', 'onToggle={onToggleNotes}')
card_text, n_prev = re.subn(
    r'onClick=\{\(\) => \{\s+setPreviewingQuestion\(q\);\s+setIsPreviewModalOpen\(true\);\s+\}\}',
    'onClick={onPreview}',
    card_text,
)
assert n_prev == 1, n_prev
assert 'toggleSelectQuestion' not in card_text
assert 'handleOpenEdit' not in card_text
assert 'setQuestionToDelete' not in card_text
assert 'expandedNotesIds' not in card_text
assert 'toggleNotes' not in card_text
assert 'setPreviewingQuestion' not in card_text
assert 'setIsPreviewModalOpen' not in card_text

(OUT / 'QuestionCard.tsx').write_text(
    """import React from 'react';
import { BookOpen, Edit2, Lock, Trash2 } from 'lucide-react';
import { ShortNotesBox } from '@/components/common/ShortNotesBox';
import { isMathematicsQuestion } from '@/utils/shortNotes';
import type { Question } from '@/types';

export interface QuestionCardProps {
  q: Question;
  questionNumber: number;
  isSelected: boolean;
  subjectTitle: string;
  notesExpanded: boolean;
  onToggleSelect: () => void;
  onOpenEdit: () => void;
  onRequestDelete: () => void;
  onToggleNotes: () => void;
  onPreview: () => void;
}

/** Single question card (extracted verbatim from AdminQuestionBank; props-driven). */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  q,
  questionNumber,
  isSelected,
  subjectTitle,
  notesExpanded,
  onToggleSelect,
  onOpenEdit,
  onRequestDelete,
  onToggleNotes,
  onPreview,
}) => {
  return (
"""
    + textwrap.indent(card_text, '    ')
    + """
  );
};
"""
)

# ------------------------------------------------------- QuestionTableRow
# lines 2377..2557: the <tr> ... </tr> (inside table map return)
row = slice_block(2377, 2557)
assert row[0].strip().startswith('<tr'), row[0]
assert row[-1].strip() == '</tr>', row[-1]
row_text = dedent_block(row)
row_text, n_prev2 = re.subn(
    r'onClick=\{\(\) => \{\s+setPreviewingQuestion\(q\);\s+setIsPreviewModalOpen\(true\);\s+\}\}',
    'onClick={onPreview}',
    row_text,
)
assert n_prev2 == 1, n_prev2
row_text = row_text.replace('onClick={() => handleOpenEdit(q)}', 'onClick={onOpenEdit}')
row_text = row_text.replace(
    'onClick={() => handleArchiveQuestion(q)}', 'onClick={onArchive}'
)
row_text = row_text.replace('onClick={() => setQuestionToDelete(q)}', 'onClick={onRequestDelete}')
assert 'handleOpenEdit' not in row_text
assert 'handleArchiveQuestion' not in row_text
assert 'setQuestionToDelete' not in row_text
assert 'setPreviewingQuestion' not in row_text
# isTopic/isExam/isPyq/examObj move inside (need only q + examTitle)
row_text = row_text.replace(
    '{examObj?.title || q.sourceExam || \'Standard Exam\'}',
    '{examTitle || q.sourceExam || \'Standard Exam\'}',
)
assert 'examObj' not in row_text

(OUT / 'QuestionTableRow.tsx').write_text(
    """import React from 'react';
import { Archive, Edit2, Eye, ImageIcon, Trash2 } from 'lucide-react';
import type { Question } from '@/types';

export interface QuestionTableRowProps {
  q: Question;
  questionNumber: number;
  examTitle?: string;
  onPreview: () => void;
  onOpenEdit: () => void;
  onArchive: () => void;
  onRequestDelete: () => void;
}

/** Compact table row (extracted verbatim from AdminQuestionBank; props-driven). */
export const QuestionTableRow: React.FC<QuestionTableRowProps> = ({
  q,
  questionNumber,
  examTitle,
  onPreview,
  onOpenEdit,
  onArchive,
  onRequestDelete,
}) => {
  const isTopic = q.sourceType === 'topic';
  const isExam = q.sourceType === 'other' || Boolean(q.sourceExam);
  const isPyq = q.sourceType === 'pyq';
  return (
"""
    + textwrap.indent(row_text, '    ')
    + """
  );
};
"""
)

# ---------------------------------------------------- PreviewQuestionModal
# lines 3687..3769: inner fixed dialog div
prev = slice_block(3687, 3769)
assert prev[0].strip().startswith('<div className="fixed'), prev[0]
assert prev[-1].strip() == '</div>', prev[-1]
prev_text = dedent_block(prev).replace(
    'previewingQuestion', 'question'
).replace(
    'onClick={() => setIsPreviewModalOpen(false)}', 'onClick={onClose}'
)
assert 'previewingQuestion' not in prev_text
assert 'setIsPreviewModalOpen' not in prev_text

(OUT / 'PreviewQuestionModal.tsx').write_text(
    """import React from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ShortNotesBox } from '@/components/common/ShortNotesBox';
import { isMathematicsQuestion } from '@/utils/shortNotes';
import type { Question } from '@/types';

export interface PreviewQuestionModalProps {
  question: Question;
  onClose: () => void;
}

/** Read-only question preview (extracted verbatim from AdminQuestionBank). */
export const PreviewQuestionModal: React.FC<PreviewQuestionModalProps> = ({
  question,
  onClose,
}) => {
  return (
"""
    + textwrap.indent(prev_text, '    ')
    + """
  );
};
"""
)

print('components written')
