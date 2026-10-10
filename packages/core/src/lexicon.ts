import { Department, FormType, MatchedTerm } from './types.js';
import safetyLexicon from '../../../data/lexicon/safety.json' with { type: 'json' };
import liftsLexicon from '../../../data/lexicon/lifts.json' with { type: 'json' };
import cleanlinessLexicon from '../../../data/lexicon/cleanliness.json' with { type: 'json' };
import fareLexicon from '../../../data/lexicon/fare.json' with { type: 'json' };
import staffBehaviourLexicon from '../../../data/lexicon/staff_behaviour.json' with { type: 'json' };

export interface LexiconEntry {
  subtopic: string;
  is_danger: boolean;
  danger_floor: number;
  review_status: 'needs_native_speaker_review' | 'reviewed';
  en: string[];
  hi_script: string[];
  gu_script: string[];
  romanized: string[];
}

export interface DepartmentLexicon {
  department: Department;
  review_status: string;
  terms: LexiconEntry[];
}

export const ALL_LEXICONS: DepartmentLexicon[] = [
  safetyLexicon as DepartmentLexicon,
  liftsLexicon as DepartmentLexicon,
  cleanlinessLexicon as DepartmentLexicon,
  fareLexicon as DepartmentLexicon,
  staffBehaviourLexicon as DepartmentLexicon
];

// Negation patterns in various scripts & romanized forms
const NEGATION_TOKENS = new Set([
  // English
  'no', 'not', 'never', 'neither', 'nor', 'without', 'none',
  // Gujarati script
  'નથી', 'નહિ', 'નહી', 'ના', 'વગર', 'વિના',
  // Devanagari script
  'नहीं', 'नही', 'न', 'ना', 'मत', 'बिना',
  // Romanized Gujlish / Hinglish
  'nathi', 'nthi', 'nahi', 'nahin', 'nai', 'na', 'bina', 'vagar', 'mat'
]);

/**
 * Check if a matched term is negated by examining surrounding context.
 * Window: ~3 tokens or ~35 characters before and after the match.
 * Uses Unicode-aware tokenization with combining marks (\p{M}) to support Indic scripts.
 */
export function checkNegation(
  text: string,
  matchStart: number,
  matchEnd: number
): boolean {
  const windowChars = 35;
  const beforeStart = Math.max(0, matchStart - windowChars);
  const afterEnd = Math.min(text.length, matchEnd + windowChars);

  const textBefore = text.slice(beforeStart, matchStart).toLowerCase();
  const textAfter = text.slice(matchEnd, afterEnd).toLowerCase();

  const tokensBefore = textBefore.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  const tokensAfter = textAfter.match(/[\p{L}\p{M}\p{N}]+/gu) || [];

  // Check last 3 tokens before match (e.g. "there is no fire", "आग नहीं", "koi aag nathi")
  const recentBefore = tokensBefore.slice(-3);
  for (const token of recentBefore) {
    if (NEGATION_TOKENS.has(token)) {
      return true;
    }
  }

  // Check first 3 tokens after match (e.g. "fire nathi", "aag nathi", "આગ નથી", "आग नहीं है")
  const recentAfter = tokensAfter.slice(0, 3);
  for (const token of recentAfter) {
    if (NEGATION_TOKENS.has(token)) {
      return true;
    }
  }

  return false;
}

interface CompiledPattern {
  term: string;
  department: Department;
  subtopic: string;
  form: FormType;
  isDanger: boolean;
  dangerFloor: number;
  reviewStatus: 'needs_native_speaker_review' | 'reviewed';
}

/**
 * Compile all lexicon entries into an ordered array of search items.
 * Longer phrases are sorted first to match multi-word expressions ahead of single words.
 */
function compilePatterns(): CompiledPattern[] {
  const compiled: CompiledPattern[] = [];

  for (const lex of ALL_LEXICONS) {
    for (const entry of lex.terms) {
      const forms: Array<{ form: FormType; list: string[] }> = [
        { form: 'gu_script', list: entry.gu_script || [] },
        { form: 'hi_script', list: entry.hi_script || [] },
        { form: 'en', list: entry.en || [] },
        { form: 'romanized', list: entry.romanized || [] }
      ];

      for (const { form, list } of forms) {
        for (const phrase of list) {
          const cleaned = phrase.trim().toLowerCase();
          if (cleaned.length > 0) {
            compiled.push({
              term: phrase.trim(),
              department: lex.department,
              subtopic: entry.subtopic,
              form,
              isDanger: entry.is_danger,
              dangerFloor: entry.danger_floor,
              reviewStatus: entry.review_status
            });
          }
        }
      }
    }
  }

  // Sort descending by length of term so longer multi-word phrases match first
  compiled.sort((a, b) => b.term.length - a.term.length);
  return compiled;
}

const COMPILED_PATTERNS = compilePatterns();

/**
 * Escape regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find all lexicon matches in untrusted text.
 * Returns matched terms with character offsets in the original text,
 * negation flags, danger flags, and urgency floors.
 */
export function matchLexicon(
  originalText: string,
  normalizedText?: string
): MatchedTerm[] {
  if (!originalText || typeof originalText !== 'string') {
    return [];
  }

  const results: MatchedTerm[] = [];
  const textToSearch = (normalizedText || originalText).toLowerCase();
  const originalLower = originalText.toLowerCase();

  // Track matched spans in original text to avoid overlapping duplicate spans
  const matchedSpans: Array<[number, number]> = [];

  function hasOverlap(start: number, end: number): boolean {
    return matchedSpans.some(([s, e]) => start < e && end > s);
  }

  for (const pattern of COMPILED_PATTERNS) {
    const termLower = pattern.term.toLowerCase();

    // Unicode word boundary pattern including combining marks (\p{M})
    const regexPattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${escapeRegex(termLower)}(?![\\p{L}\\p{M}\\p{N}])`, 'gui');

    // 1. Search in normalized text
    let match: RegExpExecArray | null;
    while ((match = regexPattern.exec(textToSearch)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // Locate corresponding match in original text
      let origStart = matchStart;
      let origEnd = matchEnd;

      const directIndex = originalLower.indexOf(match[0].toLowerCase(), Math.max(0, matchStart - 10));
      if (directIndex !== -1 && Math.abs(directIndex - matchStart) < 25) {
        origStart = directIndex;
        origEnd = directIndex + match[0].length;
      } else {
        const fallbackIndex = originalLower.indexOf(match[0].toLowerCase());
        if (fallbackIndex !== -1) {
          origStart = fallbackIndex;
          origEnd = fallbackIndex + match[0].length;
        }
      }

      if (!hasOverlap(origStart, origEnd)) {
        matchedSpans.push([origStart, origEnd]);

        // Check for negation around match in original text and normalized text
        const isNegated =
          checkNegation(originalText, origStart, origEnd) ||
          checkNegation(textToSearch, matchStart, matchEnd);

        results.push({
          term: pattern.term,
          matchedText: originalText.slice(origStart, origEnd) || match[0],
          department: pattern.department,
          subtopic: pattern.subtopic,
          form: pattern.form,
          startIndex: origStart,
          endIndex: origEnd,
          isNegated,
          isDanger: pattern.isDanger,
          dangerFloor: pattern.dangerFloor,
          reviewStatus: pattern.reviewStatus
        });
      }
    }
  }

  // Sort matched terms by startIndex
  results.sort((a, b) => a.startIndex - b.startIndex);
  return results;
}
