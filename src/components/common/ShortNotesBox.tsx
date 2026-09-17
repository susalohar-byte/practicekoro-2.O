import React, { useState, useMemo } from 'react';
import { ClipboardList, ChevronUp, ChevronDown } from 'lucide-react';

interface ShortNotesBoxProps {
  explanation?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Parses raw explanation text into structured, clean bullet/note points.
 * Handles escaped newlines (\n), bullet points (•, -, *, 📌, 🔹, etc.), numbered lists,
 * semicolons, HTML line breaks, and Bengali sentence endings (।).
 *
 * STRICT PRODUCT RULE:
 * - Every question should display 4–5 meaningful Short Notes.
 * - If the database contains 4 notes → display all 4.
 * - If the database contains 5 notes → display all 5.
 * - If more than 5 exist → never truncate artificially.
 * - Never omit an entire note just because it starts with "সঠিক উত্তর:".
 * - Never repeat pure answer declarations (e.g. "সঠিক উত্তর: (B)") as standalone notes.
 */
export function parseShortNotePoints(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  const raw = text.trim();
  if (!raw) return [];

  // 1. Check for JSON Array or JSON Object (e.g. ["note1", "note2"] or { "notes": [...] })
  if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
    try {
      const parsed = JSON.parse(raw);
      let list: any[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const potentialKeys = [
          'notes',
          'short_notes',
          'shortNotes',
          'points',
          'important_notes',
          'importantNotes',
          'explanations',
        ];
        for (const k of potentialKeys) {
          if (Array.isArray(parsed[k])) {
            list = parsed[k];
            break;
          }
        }
      }
      if (list.length > 0) {
        return list
          .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
          .filter(Boolean);
      }
    } catch {
      // Fall through to standard text parsing
    }
  }

  // 2. Normalize escaped newlines, HTML line breaks, and whitespace
  const normalized = raw
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '') // strip any residual HTML tags
    .trim();

  if (!normalized) return [];

  // 3. Split on newlines, explicit bullet characters, or list markers
  const bulletSplitRegex =
    /(?:\r?\n+)|(?<=[^\n])\s*(?:[•\u2022\u25cf\u25cb*✓✔▪▫■□►▸▶◆◇-]|📌|🔹|🔸|➡️|👉)\s+/u;

  let rawSegments = normalized
    .split(bulletSplitRegex)
    .map((s) => s.trim())
    .filter(Boolean);

  // If fewer than 4 segments, check if notes are separated by semicolons (;)
  if (rawSegments.length < 4) {
    const semiSegments: string[] = [];
    for (const seg of rawSegments) {
      if (seg.includes(';')) {
        const parts = seg
          .split(/;\s+/)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length > 1) {
          semiSegments.push(...parts);
          continue;
        }
      }
      semiSegments.push(seg);
    }
    if (semiSegments.length >= rawSegments.length) {
      rawSegments = semiSegments;
    }
  }

  // Helper to clean leading bullets and numbering (e.g. '1.', '(1)', '1 -', '১.', '(১)', 'Note 1:', etc.)
  const cleanLeadingNumbering = (str: string) =>
    str
      .replace(/^(?:[•\u2022\u25cf\u25cb*✓✔▪▫■□►▸▶◆◇\s-]|📌|🔹|🔸|➡️|👉)+/u, '')
      .replace(/^(?:Note\s*[0-9০-৯]+[:\-–—]?|নোট\s*[0-9০-৯]+[:\-–—]?)\s*/i, '')
      .replace(/^(?:\(?(?:[0-9০-৯]+|[ivxIVX]+|[a-zA-Z])[.)\-:]\s*|[0-9০-৯]+\.\s*)/, '')
      .replace(/^(?:[•\u2022\u25cf\u25cb*✓✔▪▫■□►▸▶◆◇\s-]|📌|🔹|🔸|➡️|👉)+/u, '')
      .trim();

  const points = rawSegments.map(cleanLeadingNumbering).filter((s) => s.length > 0);

  // Helper to detect and safely strip answer declarations
  // e.g. "সঠিক উত্তর: (B) ১৮৬৫ সালে..." -> "১৮৬৫ সালে..."
  const isAnsPattern =
    /^(?:সঠিক\s*উত্তর(?:\s*(?:হলো|হল|হচ্ছে|হয়))?|উত্তর|Answer|Ans|Correct\s*Answer|Correct\s*Option)(?::|ঃ|[-–—=\s])/i;

  const stripAnswerPrefix = (str: string): string => {
    return str
      .replace(
        /^(?:সঠিক\s*উত্তর(?:\s*(?:হলো|হল|হচ্ছে|হয়))?|উত্তর|Answer|Ans|Correct\s*Answer|Correct\s*Option)\s*(?::|ঃ|[-–—=.])?\s*(?:\([a-dA-Dক-ঘ0-9০-৯]\)|[a-dA-Dক-ঘ0-9০-৯][.)]?)?\s*(?::|ঃ|[-–—=.])?\s*/i,
        ''
      )
      .trim();
  };

  const isPureAnswerOnly = (str: string): boolean => {
    const trimmed = str.trim();
    if (!trimmed || trimmed.length <= 2) return true;
    if (/^(?:\([a-dA-Dক-ঘ]\)|[a-dA-Dক-ঘ])$/i.test(trimmed)) return true;
    if (/^(?:option|বিকল্প)\s*[:\-–—]?\s*(?:\([a-dA-Dক-ঘ]\)|[a-dA-Dক-ঘ])$/i.test(trimmed)) {
      return true;
    }
    return false;
  };

  const cleanedPoints: string[] = [];
  for (const pt of points) {
    let trimmed = pt.trim();
    // Strip explanation header if present
    trimmed = trimmed
      .replace(
        /^(?:explanation|ব্যাখ্যা|Important\s*Notes?|গুরুত্বপূর্ণ\s*তথ্য)\s*(?::|ঃ|[-–—])?\s*/i,
        ''
      )
      .trim();
    if (!trimmed) continue;

    // Check if line has an answer declaration
    if (isAnsPattern.test(trimmed)) {
      const stripped = stripAnswerPrefix(trimmed);
      // Only keep if the line contains actual factual explanation beyond just option name
      if (stripped && !isPureAnswerOnly(stripped)) {
        cleanedPoints.push(stripped);
      }
      // If it was just repeating the correct answer with no explanation, omit to avoid redundant notes
      continue;
    }

    cleanedPoints.push(trimmed);
  }

  // 4. Expand compound sentences if notes are < 4 so all factual points are surfaced
  let finalPoints = cleanedPoints;
  if (finalPoints.length < 4) {
    const expanded: string[] = [];
    for (const pt of finalPoints) {
      // Check Bengali Dari (।)
      if (pt.includes('।')) {
        const sentences = pt
          .split(/(?<=[।!?])\s+/)
          .map((s) => cleanLeadingNumbering(s.trim()))
          .filter(Boolean);
        if (sentences.length > 1) {
          expanded.push(...sentences);
          continue;
        }
      }
      // Check English period followed by space and uppercase letter (. [A-Z])
      if (/\.\s+[A-Z]/.test(pt)) {
        const sentences = pt
          .split(/(?<=[.!?])\s+(?=[A-Z])/)
          .map((s) => cleanLeadingNumbering(s.trim()))
          .filter(Boolean);
        if (sentences.length > 1) {
          expanded.push(...sentences);
          continue;
        }
      }
      expanded.push(pt);
    }
    if (expanded.length >= finalPoints.length) {
      finalPoints = expanded;
    }
  }

  return finalPoints;
}

/**
 * Parses inline formatting: **bold**, <b>bold</b>, <u>underline</u>, __underline__
 */
export function formatInlineText(text: string): (string | React.ReactNode)[] {
  if (!text) return [];

  // Match: **bold**, <b>bold</b>, <u>underline</u>, __underline__
  const parts = text.split(/(\*\*.*?\*\*|<b>.*?<\/b>|<u>.*?<\/u>|__.*?__)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('<b>') && part.endsWith('</b>') && part.length >= 7) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(3, -4)}
        </strong>
      );
    }

    if (part.startsWith('<u>') && part.endsWith('</u>') && part.length >= 7) {
      return (
        <span key={i} className="underline decoration-slate-400 decoration-1 underline-offset-2">
          {part.slice(3, -4)}
        </span>
      );
    }

    if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
      return (
        <span key={i} className="underline decoration-slate-400 decoration-1 underline-offset-2">
          {part.slice(2, -2)}
        </span>
      );
    }

    return part;
  });
}

export const renderFormattedNote = formatInlineText;

export const ShortNotesBox: React.FC<ShortNotesBoxProps> = ({
  explanation,
  isExpanded: controlledExpanded,
  onToggle,
  title = 'Short Notes',
  collapsible = true,
  defaultExpanded = true,
  className = '',
}) => {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);

  const points = useMemo(() => {
    if (!explanation || !explanation.trim()) return [];
    return parseShortNotePoints(explanation);
  }, [explanation]);

  if (!explanation || !explanation.trim()) return null;

  // If all points were redundant answer lines and nothing remains, don't show an empty box
  if (points.length === 0) return null;

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setUncontrolledExpanded((prev) => !prev);
    }
  };

  // If collapsed and collapsible is enabled, show the sleek trigger button
  if (collapsible && !isExpanded) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/60 text-xs font-bold text-[#2563eb] dark:text-[#60a5fa] hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-all shadow-xs ${className}`}
      >
        <div className="w-5 h-5 rounded-md bg-[#3b82f6] text-white flex items-center justify-center shrink-0 shadow-xs">
          <ClipboardList className="w-3 h-3 stroke-[2.5]" />
        </div>
        <span>{title}</span>
        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-blue-200/90 dark:border-blue-800/60 bg-[#f4f7ff] dark:bg-[#0c1833]/90 p-4 sm:p-5 shadow-xs transition-all animate-fade-in ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#3b82f6] text-white flex items-center justify-center shadow-xs shrink-0">
            <ClipboardList className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h4 className="text-sm sm:text-[15px] font-extrabold text-[#2563eb] dark:text-[#60a5fa] tracking-tight">
            {title}
          </h4>
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8] dark:hover:text-[#93c5fd] transition-colors py-1 px-1.5 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Hide</span>
          </button>
        )}
      </div>

      {/* Bullet Points List */}
      <div className="mt-3.5 space-y-2.5">
        {points.map((point, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400 mt-1.5 shrink-0 ring-4 ring-blue-500/15 select-none" />
            <div className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed font-normal min-w-0 flex-1">
              {formatInlineText(point)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
