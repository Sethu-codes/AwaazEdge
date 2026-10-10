import { describe, it, expect } from 'vitest';
import { matchLexicon, checkNegation } from '../src/lexicon.js';

describe('packages/core: lexicon', () => {
  describe('Form 1: Gujarati script', () => {
    it('matches danger term fire in Gujarati script', () => {
      const matches = matchLexicon('સ્ટેશન પર આગ લાગી છે અને ધુમાડો નીકળે છે');
      const subtopics = matches.map((m) => m.subtopic);
      expect(subtopics).toContain('fire');
      const fireMatch = matches.find((m) => m.subtopic === 'fire');
      expect(fireMatch?.department).toBe('safety');
      expect(fireMatch?.dangerFloor).toBe(95);
      expect(fireMatch?.form).toBe('gu_script');
    });

    it('matches lift and stuck in Gujarati script', () => {
      const matches = matchLexicon('લિફ્ટમાં લોકો ફસાઈ ગયા છે');
      expect(matches.some((m) => m.department === 'lifts')).toBe(true);
      expect(matches.some((m) => m.dangerFloor === 85)).toBe(true);
    });

    it('matches cleanliness in Gujarati script', () => {
      const matches = matchLexicon('ટોયલેટમાં ખૂબ ગંદકી અને કચરો છે');
      expect(matches.some((m) => m.term === 'ગંદકી' && m.department === 'cleanliness')).toBe(true);
      expect(matches.some((m) => m.term === 'કચરો' && m.department === 'cleanliness')).toBe(true);
    });

    it('matches child missing and unconscious in Gujarati script', () => {
      const matches = matchLexicon('બાળક ખોવાયું છે અને એક માણસ બેભાન થઈ ગયો');
      expect(matches.some((m) => m.term === 'બાળક ખોવાયું' && m.dangerFloor === 95)).toBe(true);
      expect(matches.some((m) => m.term === 'બેભાન' && m.dangerFloor === 95)).toBe(true);
    });
  });

  describe('Form 2: Devanagari script', () => {
    it('matches fire and smoke in Devanagari', () => {
      const matches = matchLexicon('प्लेटफॉर्म पर आग लग गई और धुआं फैल गया');
      expect(matches.some((m) => m.subtopic === 'fire' && m.dangerFloor === 95)).toBe(true);
      expect(matches.some((m) => m.term === 'धुआं' && m.department === 'safety')).toBe(true);
    });

    it('matches stampede and fell in Devanagari', () => {
      const matches = matchLexicon('भगदड़ में एक यात्री गिर गया');
      expect(matches.some((m) => m.term === 'भगदड़' && m.dangerFloor === 95)).toBe(true);
      expect(matches.some((m) => m.term === 'गिर गया' && m.dangerFloor === 80)).toBe(true);
    });

    it('matches harassment and staff in Devanagari', () => {
      const matches = matchLexicon('सुरक्षा गार्ड ने छेड़छाड़ की और बदतमीज़ी की');
      expect(matches.some((m) => m.term === 'छेड़छाड़' && m.dangerFloor === 85)).toBe(true);
      expect(matches.some((m) => m.department === 'staff_behaviour')).toBe(true);
    });

    it('matches fare in Devanagari', () => {
      const matches = matchLexicon('टिकट मशीन खराब है और अधिक किराया काट लिया');
      expect(matches.some((m) => m.department === 'fare')).toBe(true);
    });
  });

  describe('Form 3: English', () => {
    it('matches fire and unconscious in English', () => {
      const matches = matchLexicon('There is a fire near platform 2 and a passenger fainted');
      expect(matches.some((m) => m.term === 'fire' && m.dangerFloor === 95)).toBe(true);
      expect(matches.some((m) => m.term === 'fainted' && m.dangerFloor === 95)).toBe(true);
    });

    it('matches escalator and fell in English', () => {
      const matches = matchLexicon('The escalator suddenly stopped and someone fell down');
      expect(matches.some((m) => m.term === 'escalator' && m.department === 'lifts')).toBe(true);
      expect(matches.some((m) => m.term === 'fell' && m.dangerFloor === 80)).toBe(true);
    });

    it('matches harassment in English', () => {
      const matches = matchLexicon('Passenger complaining about eve-teasing near entry gate');
      expect(matches.some((m) => m.term === 'eve-teasing' && m.dangerFloor === 85)).toBe(true);
    });

    it('matches overcharged and refund in English', () => {
      const matches = matchLexicon('I was overcharged by the ticket machine and need a refund');
      expect(matches.some((m) => m.subtopic === 'overcharged' && m.department === 'fare')).toBe(true);
      expect(matches.some((m) => m.subtopic === 'refund' && m.department === 'fare')).toBe(true);
    });
  });

  describe('Form 4: Romanized (Gujlish / Hinglish)', () => {
    it('matches fasai gaya and lift in Gujlish', () => {
      const matches = matchLexicon('lift ma fasai gaya, please help');
      expect(matches.some((m) => m.term === 'lift' && m.department === 'lifts')).toBe(true);
      expect(matches.some((m) => m.term === 'fasai gaya' && m.dangerFloor === 85)).toBe(true);
    });

    it('matches aag and dhuvado in Gujlish', () => {
      const matches = matchLexicon('station par aag lagi che ane dhuvado aave che');
      expect(matches.some((m) => m.subtopic === 'fire' && m.dangerFloor === 95)).toBe(true);
      expect(matches.some((m) => m.term === 'dhuvado')).toBe(true);
    });

    it('matches bhagdod and padi gayo in Gujlish', () => {
      const matches = matchLexicon('gate par bhagdod machi ane ek vyakti padi gayo');
      expect(matches.some((m) => m.term === 'bhagdod' && m.dangerFloor === 95)).toBe(true);
      expect(matches.some((m) => m.term === 'padi gayo' && m.dangerFloor === 80)).toBe(true);
    });

    it('matches kachro and gandki in Gujlish', () => {
      const matches = matchLexicon('toilet ma bau kachro ane gandki che');
      expect(matches.some((m) => m.term === 'kachro' && m.department === 'cleanliness')).toBe(true);
      expect(matches.some((m) => m.term === 'gandki' && m.department === 'cleanliness')).toBe(true);
    });
  });

  describe('Negation detection', () => {
    it('flags negation for "no fire"', () => {
      const text = 'Platform 1 has smoke but no fire seen';
      const matches = matchLexicon(text);
      const fireMatch = matches.find((m) => m.term === 'fire');
      expect(fireMatch).toBeDefined();
      expect(fireMatch?.isNegated).toBe(true);
    });

    it('flags negation for "aag nathi"', () => {
      const text = 'Dhuvado chhe pan aag nathi, chinta na karo';
      const matches = matchLexicon(text);
      const aagMatch = matches.find((m) => m.term === 'aag');
      expect(aagMatch).toBeDefined();
      expect(aagMatch?.isNegated).toBe(true);
    });

    it('flags negation for Gujarati script "આગ નથી"', () => {
      const text = 'માત્ર ધુમાડો છે, આગ નથી';
      const matches = matchLexicon(text);
      const fireMatch = matches.find((m) => m.term === 'આગ');
      expect(fireMatch).toBeDefined();
      expect(fireMatch?.isNegated).toBe(true);
    });

    it('flags negation for Devanagari script "आग नहीं"', () => {
      const text = 'स्टेशन पर धुआं है पर आग नहीं है';
      const matches = matchLexicon(text);
      const fireMatch = matches.find((m) => m.term === 'आग');
      expect(fireMatch).toBeDefined();
      expect(fireMatch?.isNegated).toBe(true);
    });

    it('does NOT flag negation when statement is affirmative', () => {
      const text = 'aag lagi chhe jaldi aavo';
      const matches = matchLexicon(text);
      const fireMatch = matches.find((m) => m.subtopic === 'fire');
      expect(fireMatch).toBeDefined();
      expect(fireMatch?.isNegated).toBe(false);
    });
  });

  describe('Character offsets', () => {
    it('returns accurate offsets in original text for highlighting', () => {
      const text = 'The lift stopped suddenly';
      const matches = matchLexicon(text);
      const liftMatch = matches.find((m) => m.subtopic === 'lift_stuck');
      expect(liftMatch).toBeDefined();
      expect(liftMatch?.startIndex).toBe(4);
      expect(liftMatch?.endIndex).toBe(16);
      expect(text.slice(liftMatch!.startIndex, liftMatch!.endIndex)).toBe('lift stopped');
    });
  });
});
