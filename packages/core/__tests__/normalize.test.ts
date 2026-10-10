import { describe, it, expect } from 'vitest';
import {
  detectScript,
  normalizeDigits,
  collapseRepeatedLetters,
  mapRomanizedVariants,
  guessLanguage,
  normalizeComplaintText
} from '../src/normalize.js';

describe('packages/core: normalize', () => {
  describe('Script detection', () => {
    it('detects pure Gujarati script', () => {
      expect(detectScript('લિફ્ટમાં આગ લાગી છે')).toBe('gujarati');
    });

    it('detects pure Devanagari script', () => {
      expect(detectScript('स्टेशन पर आग लग गई है')).toBe('devanagari');
    });

    it('detects pure Latin script', () => {
      expect(detectScript('the escalator is broken')).toBe('latin');
    });

    it('detects mixed script (Gujarati + Latin)', () => {
      expect(detectScript('Platform 1 પર lift બંધ છે')).toBe('mixed');
    });

    it('detects mixed script (Devanagari + Latin)', () => {
      expect(detectScript('Gate 2 par लिफ्ट खराब है')).toBe('mixed');
    });

    it('detects unknown script for punctuation/symbols', () => {
      expect(detectScript('??? !!! 12345')).toBe('unknown');
    });
  });

  describe('Digit normalization', () => {
    it('normalizes Gujarati digits to ASCII', () => {
      expect(normalizeDigits('પ્લેટફોર્મ ૫ પર ટ્રેન ૧૦ મિનિટમાં')).toBe('પ્લેટફોર્મ 5 પર ટ્રેન 10 મિનિટમાં');
    });

    it('normalizes Devanagari digits to ASCII', () => {
      expect(normalizeDigits('गेट २ पर ५ मिनट में')).toBe('गेट 2 पर 5 मिनट में');
    });

    it('preserves existing ASCII digits', () => {
      expect(normalizeDigits('Platform 1 at 12:30')).toBe('Platform 1 at 12:30');
    });
  });

  describe('Collapse repeated letters', () => {
    it('collapses 3+ identical letters down to 1', () => {
      expect(collapseRepeatedLetters('pleeeaaase')).toBe('please');
      expect(collapseRepeatedLetters('bachaaaooo')).toBe('bachao');
      expect(collapseRepeatedLetters('faaaaas')).toBe('fas');
      expect(collapseRepeatedLetters('heeeelp')).toBe('help');
    });

    it('preserves double letters that are normal spelling', () => {
      expect(collapseRepeatedLetters('stuck')).toBe('stuck');
      expect(collapseRepeatedLetters('wheelchair')).toBe('wheelchair');
      expect(collapseRepeatedLetters('door')).toBe('door');
    });
  });

  describe('Romanized variant mapping', () => {
    it('maps che to chhe', () => {
      expect(mapRomanizedVariants('aag che')).toBe('aag chhe');
    });

    it('maps nthi to nathi', () => {
      expect(mapRomanizedVariants('paisa nthi maliya')).toBe('paisa nathi maliya');
    });

    it('maps kam to kaam', () => {
      expect(mapRomanizedVariants('kam nathi karto')).toBe('kaam nathi karto');
    });

    it('maps vridh/vriddh to vrudh', () => {
      expect(mapRomanizedVariants('ek vridh vyakti chhe')).toBe('ek vrudh vyakti chhe');
    });

    it('maps bchao to bachao', () => {
      expect(mapRomanizedVariants('bchao mane')).toBe('bachao mane');
    });
  });

  describe('guessLanguage', () => {
    it('guesses gu for Gujarati script', () => {
      expect(guessLanguage('લિફ્ટ બંધ છે', 'gujarati')).toBe('gu');
    });

    it('guesses hi for Devanagari script', () => {
      expect(guessLanguage('लिफ्ट बंद है', 'devanagari')).toBe('hi');
    });

    it('guesses gu for Romanized Gujlish cues', () => {
      expect(guessLanguage('lift ma fasai gaya ek vrudh chhe', 'latin')).toBe('gu');
    });

    it('guesses hi for Romanized Hinglish cues', () => {
      expect(guessLanguage('station mein bohot bheed hai aurat giri', 'latin')).toBe('hi');
    });

    it('guesses en for English text', () => {
      expect(guessLanguage('elevator is stuck on the third floor please help', 'latin')).toBe('en');
    });
  });

  describe('normalizeComplaintText pipeline', () => {
    it('keeps original unchanged and provides clean normalized output', () => {
      const raw = '  LIFT MA FASAAAAI GAYA, EK VRIDH CHEEE, ૫ MINUTE MA TRAIN CHE!  ';
      const result = normalizeComplaintText(raw);

      expect(result.original).toBe(raw);
      expect(result.script).toBe('mixed'); // Gujarati digit + Latin
      expect(result.lang_guess).toBe('gu');
      expect(result.normalized).toContain('lift ma fasai gaya');
      expect(result.normalized).toContain('ek vrudh chhe');
      expect(result.normalized).toContain('5 minute ma train chhe');
    });

    it('handles untrusted empty or non-string input safely', () => {
      // @ts-expect-error test untrusted input
      const result = normalizeComplaintText(null);
      expect(result.normalized).toBe('');
      expect(result.script).toBe('unknown');
      expect(result.lang_guess).toBe('unknown');
    });
  });
});
