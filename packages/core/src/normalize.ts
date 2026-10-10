import { LangGuess, NormalizationResult, ScriptType } from './types.js';

// Unicode Script regex ranges
const GUJARATI_SCRIPT_REGEX = /[\u0A80-\u0AFF]/g;
const DEVANAGARI_SCRIPT_REGEX = /[\u0900-\u097F]/g;
const LATIN_SCRIPT_REGEX = /[a-zA-Z]/g;

// Digit mappings
const GUJARATI_ZERO_CODE = 0x0AE6;
const DEVANAGARI_ZERO_CODE = 0x0966;

// Common romanized spelling variant rules (applied on token boundaries)
const ROMANIZED_VARIANT_MAP: Array<[RegExp, string]> = [
  [/\bch+e+y?\b/g, 'chhe'],          // che, chey, chhe -> chhe
  [/\bchhe\b/g, 'chhe'],
  [/\bn+t+h+i+\b/g, 'nathi'],        // nthi, nathi -> nathi
  [/\bnah?i+\b/g, 'nahi'],           // nai, nahi -> nahi
  [/\bka+m\b/g, 'kaam'],             // kam, kaam -> kaam
  [/\bvr+i+d+h+\b/g, 'vrudh'],       // vridh, vriddh -> vrudh
  [/\bvr+u+d+h+\b/g, 'vrudh'],       // vrudh -> vrudh
  [/\bvroodh\b/g, 'vrudh'],
  [/\bdh+u+v+a+d+o+\b/g, 'dhuvado'], // dhuvado, dhuwado
  [/\bdh+u+w+a+d+o+\b/g, 'dhuvado'],
  [/\bdh+u+a+n?\b/g, 'dhua'],
  [/\bf+a+s+a+i+\b/g, 'fasai'],      // fasaai, fasai -> fasai
  [/\bph+a+s+a+i+\b/g, 'fasai'],     // phasai -> fasai
  [/\bba+ch+a+o+\b/g, 'bachao'],     // bchao, bachao -> bachao
  [/\bbchao\b/g, 'bachao'],
  [/\bm+a+d+a+d+\b/g, 'madad'],      // maddad, madad -> madad
  [/\bbh+a+g+d+o+d+\b/g, 'bhagdod'], // bhagdaud, bhagdod
  [/\bbhagdaud\b/g, 'bhagdod'],
  [/\bch+e+d+ch+a+d+\b/g, 'chhedchhad'], // chedchad, chhedchhad
  [/\bt+i+k+i+t+\b/g, 'ticket'],     // tikit, ticket -> ticket
  [/\btikkit\b/g, 'ticket'],
  [/\bk+a+ch+r+o+\b/g, 'kachro'],    // kachro
  [/\bk+a+ch+r+a+\b/g, 'kachra'],
  [/\bb+a+d+t+a+m+i+z+i+\b/g, 'badtameezi'],
  [/\bbadtamizi\b/g, 'badtameezi']
];

// Heuristic cues for language guessing
const GUJARATI_CUES = new Set([
  'chhe', 'che', 'nathi', 'gayo', 'gaya', 'gai', 'karvu', 'padi', 'fasai', 'ek',
  'vrudh', 'ma', 'mane', 'tame', 'shu', 'su', 'karo', 'haju', 'aavi', 'joye',
  'kachro', 'bhagdod', 'aag', 'dhuvado', 'bhadu', 'vartan', 'tochhadu', 'athi',
  'kem', 'nthi', 'chho', 'mara', 'mari', 'maru', 'thay', 'thai', 'jase', 'kare',
  'lifte', 'balak', 'chhokro', 'chhokri', 'purai', 'atvai', 'lapsi', 'vas', 'khota'
]);

const HINDI_CUES = new Set([
  'hai', 'hain', 'nahi', 'nahin', 'hua', 'hui', 'gaya', 'gayi', 'gaye', 'kar',
  'raha', 'rahe', 'rahi', 'mein', 'kuch', 'aurat', 'buddha', 'madad', 'kiraya',
  'badtameezi', 'chilla', 'paisa', 'kripya', 'yahan', 'wahan', 'karo', 'apka',
  'aapka', 'mera', 'meri', 'mere', 'kya', 'kyun', 'bahut', 'tha', 'thi', 'the'
]);

const ENGLISH_CUES = new Set([
  'the', 'is', 'are', 'in', 'at', 'on', 'of', 'for', 'with', 'not', 'and', 'to',
  'please', 'help', 'train', 'station', 'elevator', 'escalator', 'complaint',
  'stuck', 'dirty', 'clean', 'rude', 'floor', 'minutes', 'gate', 'ticket', 'fare',
  'refund', 'smoke', 'fire', 'harass', 'missing', 'lost', 'person', 'woman',
  'child', 'urgent', 'emergency', 'platform', 'toilet', 'staff', 'money', 'card'
]);

/**
 * Detect script from character sets.
 */
export function detectScript(text: string): ScriptType {
  const hasGujarati = GUJARATI_SCRIPT_REGEX.test(text);
  GUJARATI_SCRIPT_REGEX.lastIndex = 0;

  const hasDevanagari = DEVANAGARI_SCRIPT_REGEX.test(text);
  DEVANAGARI_SCRIPT_REGEX.lastIndex = 0;

  const hasLatin = LATIN_SCRIPT_REGEX.test(text);
  LATIN_SCRIPT_REGEX.lastIndex = 0;

  const scriptCount = (hasGujarati ? 1 : 0) + (hasDevanagari ? 1 : 0) + (hasLatin ? 1 : 0);

  if (scriptCount > 1) {
    return 'mixed';
  }
  if (hasGujarati) {
    return 'gujarati';
  }
  if (hasDevanagari) {
    return 'devanagari';
  }
  if (hasLatin) {
    return 'latin';
  }
  return 'unknown';
}

/**
 * Normalize Indic digits (Gujarati and Devanagari) to ASCII 0-9.
 */
export function normalizeDigits(text: string): string {
  return text
    // Gujarati digits ૦-૯
    .replace(/[\u0AE6-\u0AEF]/g, (match) => {
      return String(match.charCodeAt(0) - GUJARATI_ZERO_CODE);
    })
    // Devanagari digits ०-९
    .replace(/[\u0966-\u096F]/g, (match) => {
      return String(match.charCodeAt(0) - DEVANAGARI_ZERO_CODE);
    });
}

/**
 * Collapse repeated letters (3 or more) down to standard length.
 * e.g., 'pleeease' -> 'please', 'bachaaaooo' -> 'bachao', 'faaaaas' -> 'fas'
 */
export function collapseRepeatedLetters(text: string): string {
  // Collapse 3 or more of any identical character to 1
  return text.replace(/(.)\1{2,}/gu, '$1');
}

/**
 * Map common romanized spelling variants.
 */
export function mapRomanizedVariants(text: string): string {
  let result = text;
  for (const [pattern, replacement] of ROMANIZED_VARIANT_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Guess language from script, cues, and token frequency.
 */
export function guessLanguage(text: string, script: ScriptType): LangGuess {
  if (script === 'gujarati') {
    return 'gu';
  }
  if (script === 'devanagari') {
    return 'hi';
  }

  // Tokenize text into words
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  if (tokens.length === 0) {
    return script === 'unknown' ? 'unknown' : 'en';
  }

  let guScore = 0;
  let hiScore = 0;
  let enScore = 0;

  for (const token of tokens) {
    if (GUJARATI_CUES.has(token)) guScore += 1.5;
    if (HINDI_CUES.has(token)) hiScore += 1.5;
    if (ENGLISH_CUES.has(token)) enScore += 1.0;
  }

  if (guScore > 0 && guScore >= hiScore && guScore >= enScore) {
    return 'gu';
  }
  if (hiScore > 0 && hiScore > guScore && hiScore >= enScore) {
    return 'hi';
  }
  if (enScore > 0) {
    return 'en';
  }

  if (script === 'mixed') {
    return 'mixed';
  }

  // Default for Latin script with no strong markers
  return script === 'latin' ? 'en' : 'unknown';
}

/**
 * Normalize untrusted complaint text.
 * 1. Unicode NFC
 * 2. Script detection
 * 3. Digit normalization
 * 4. Lowercase Latin
 * 5. Collapse repeated letters
 * 6. Map common romanized spelling variants
 * Keeps original text unchanged.
 */
export function normalizeComplaintText(originalText: string): NormalizationResult {
  if (typeof originalText !== 'string') {
    return {
      original: '',
      normalized: '',
      script: 'unknown',
      lang_guess: 'unknown'
    };
  }

  // 1. Unicode NFC
  const nfcText = originalText.normalize('NFC');

  // 2. Script detection on the original NFC text
  const script = detectScript(nfcText);

  // 3. Digit normalization (Indic to ASCII digits)
  let normalized = normalizeDigits(nfcText);

  // 4. Lowercase Latin letters
  normalized = normalized.toLowerCase();

  // 5. Collapse 3+ repeated letters
  normalized = collapseRepeatedLetters(normalized);

  // 6. Map romanized spelling variants
  normalized = mapRomanizedVariants(normalized);

  // Normalize excessive whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Language guess
  const lang_guess = guessLanguage(normalized, script);

  return {
    original: originalText,
    normalized,
    script,
    lang_guess
  };
}
