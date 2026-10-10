import { describe, it, expect } from 'vitest';
import { calculateUrgency, getUrgencyBand } from '../src/urgency.js';
import { MatchedTerm } from '../src/types.js';

describe('packages/core: urgency', () => {
  const dummyMatchedTerm = (
    dept: any,
    subtopic: string,
    floor: number,
    isDanger: boolean,
    isNegated: boolean = false
  ): MatchedTerm => ({
    term: subtopic,
    matchedText: subtopic,
    department: dept,
    subtopic,
    form: 'romanized',
    startIndex: 0,
    endIndex: subtopic.length,
    isNegated,
    isDanger,
    dangerFloor: floor,
    reviewStatus: 'reviewed'
  });

  describe('Department base scores', () => {
    it('sets base 40 for safety', () => {
      const res = calculateUrgency(['safety']);
      expect(res.score).toBe(40);
      expect(res.band).toBe('Medium');
      expect(res.baseScore).toBe(40);
    });

    it('sets base 25 for lifts', () => {
      const res = calculateUrgency(['lifts']);
      expect(res.score).toBe(25);
      expect(res.band).toBe('Low');
      expect(res.baseScore).toBe(25);
    });

    it('sets base 20 for staff_behaviour', () => {
      const res = calculateUrgency(['staff_behaviour']);
      expect(res.score).toBe(20);
      expect(res.band).toBe('Low');
    });

    it('sets base 15 for fare', () => {
      const res = calculateUrgency(['fare']);
      expect(res.score).toBe(15);
      expect(res.band).toBe('Low');
    });

    it('sets base 10 for cleanliness', () => {
      const res = calculateUrgency(['cleanliness']);
      expect(res.score).toBe(10);
      expect(res.band).toBe('Low');
    });

    it('takes the highest base when multiple departments are present', () => {
      const res = calculateUrgency(['lifts', 'cleanliness', 'safety']);
      expect(res.baseScore).toBe(40);
    });
  });

  describe('Danger floors', () => {
    it('sets floor 95 for fire', () => {
      const term = dummyMatchedTerm('safety', 'fire', 95, true);
      const res = calculateUrgency(['safety'], [term]);
      expect(res.floorScore).toBe(95);
      expect(res.score).toBe(95);
      expect(res.band).toBe('Critical');
    });

    it('sets floor 95 for stampede, unconscious, child missing', () => {
      for (const topic of ['stampede', 'unconscious', 'child_missing']) {
        const term = dummyMatchedTerm('safety', topic, 95, true);
        const res = calculateUrgency(['safety'], [term]);
        expect(res.floorScore).toBe(95);
        expect(res.score).toBe(95);
        expect(res.band).toBe('Critical');
      }
    });

    it('sets floor 85 for stuck', () => {
      const term = dummyMatchedTerm('safety', 'stuck', 85, true);
      const res = calculateUrgency(['lifts', 'safety'], [term]);
      expect(res.floorScore).toBe(85);
      expect(res.score).toBe(85);
      expect(res.band).toBe('Critical');
    });

    it('sets floor 85 for harassment', () => {
      const term = dummyMatchedTerm('safety', 'harassment', 85, true);
      const res = calculateUrgency(['safety'], [term]);
      expect(res.floorScore).toBe(85);
      expect(res.score).toBe('Critical' === res.band ? 85 : 0);
    });

    it('sets floor 80 for fell', () => {
      const term = dummyMatchedTerm('safety', 'fell', 80, true);
      const res = calculateUrgency(['safety'], [term]);
      expect(res.floorScore).toBe(80);
      expect(res.score).toBe(80);
      expect(res.band).toBe('High');
    });

    it('ignores floor when danger term is negated', () => {
      const term = dummyMatchedTerm('safety', 'fire', 95, true, true); // negated!
      const res = calculateUrgency(['safety'], [term]);
      expect(res.floorScore).toBe(0);
      expect(res.score).toBe(40); // Falls back to safety base
      expect(res.band).toBe('Medium');
    });
  });

  describe('Modifiers', () => {
    it('adds +10 for single vulnerable category', () => {
      const term = dummyMatchedTerm('lifts', 'lift', 0, false);
      const res = calculateUrgency(['lifts'], [term], 'there is an elderly passenger inside');
      expect(res.modifiersScore).toBe(10);
      expect(res.score).toBe(35); // 25 + 10
    });

    it('caps vulnerable modifier at +15 for multiple categories', () => {
      const term = dummyMatchedTerm('lifts', 'lift', 0, false);
      const res = calculateUrgency(
        ['lifts'],
        [term],
        'there is an elderly grandmother and a disabled child in wheelchair'
      );
      expect(res.modifiersScore).toBe(15);
      expect(res.score).toBe(40); // 25 + 15
    });

    it('adds +10 for time pressure in text', () => {
      const term = dummyMatchedTerm('fare', 'ticket_machine', 0, false);
      const res = calculateUrgency(['fare'], [term], 'train in 5 minutes please hurry');
      expect(res.modifiersScore).toBe(10);
      expect(res.score).toBe(25); // 15 + 10
    });

    it('adds +5 per doubling for duplicate incident reports (cap 15)', () => {
      // N=1 -> 0
      expect(calculateUrgency(['cleanliness'], [], '', { incidentDuplicatesCount: 1 }).modifiersScore).toBe(0);
      // N=2 -> +5
      expect(calculateUrgency(['cleanliness'], [], '', { incidentDuplicatesCount: 2 }).modifiersScore).toBe(5);
      // N=4 -> +10
      expect(calculateUrgency(['cleanliness'], [], '', { incidentDuplicatesCount: 4 }).modifiersScore).toBe(10);
      // N=8 -> +15
      expect(calculateUrgency(['cleanliness'], [], '', { incidentDuplicatesCount: 8 }).modifiersScore).toBe(15);
      // N=16 -> +15 (capped)
      expect(calculateUrgency(['cleanliness'], [], '', { incidentDuplicatesCount: 16 }).modifiersScore).toBe(15);
    });

    it('ramps SLA age up to +20', () => {
      // age 0 of 60 -> 0
      expect(calculateUrgency(['fare'], [], '', { ageMinutes: 0, slaMinutes: 60 }).modifiersScore).toBe(0);
      // age 30 of 60 -> +10
      expect(calculateUrgency(['fare'], [], '', { ageMinutes: 30, slaMinutes: 60 }).modifiersScore).toBe(10);
      // age 60 of 60 -> +20
      expect(calculateUrgency(['fare'], [], '', { ageMinutes: 60, slaMinutes: 60 }).modifiersScore).toBe(20);
      // age 90 of 60 -> +20 (capped at 20)
      expect(calculateUrgency(['fare'], [], '', { ageMinutes: 90, slaMinutes: 60 }).modifiersScore).toBe(20);
    });

    it('adds +5 for public social media post tagging', () => {
      const res = calculateUrgency(['staff_behaviour'], [], 'Staff was rude @ahmedabadmetro fix this');
      expect(res.modifiersScore).toBe(5);
      expect(res.score).toBe(25); // 20 + 5
    });

    it('caps final urgency score at 100', () => {
      const term = dummyMatchedTerm('safety', 'fire', 95, true);
      const res = calculateUrgency(
        ['safety'],
        [term],
        'fire at station elderly trapped train in 5 minutes @ahmedabadmetro',
        { incidentDuplicatesCount: 8, ageMinutes: 60, slaMinutes: 60 }
      );
      expect(res.score).toBe(100);
      expect(res.band).toBe('Critical');
    });
  });

  describe('Urgency bands', () => {
    it('correctly maps scores to bands', () => {
      expect(getUrgencyBand(100)).toBe('Critical');
      expect(getUrgencyBand(85)).toBe('Critical');
      expect(getUrgencyBand(84)).toBe('High');
      expect(getUrgencyBand(65)).toBe('High');
      expect(getUrgencyBand(64)).toBe('Medium');
      expect(getUrgencyBand(40)).toBe('Medium');
      expect(getUrgencyBand(39)).toBe('Low');
      expect(getUrgencyBand(0)).toBe('Low');
    });
  });
});
