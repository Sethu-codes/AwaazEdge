import { describe, it, expect } from 'vitest';
import {
  getSafetyCostThreshold,
  shouldFlagSafety,
  explainSafetyCost,
  DEFAULT_C_MISS,
  DEFAULT_C_FALSE
} from '../src/safety-cost.js';

describe('packages/core: safety-cost', () => {
  it('calculates default threshold P > 1/(20+1) ~ 0.0476', () => {
    const threshold = getSafetyCostThreshold();
    expect(threshold).toBeCloseTo(1 / 21, 5);
  });

  it('flags safety when P exceeds threshold', () => {
    // 0.05 > 0.0476 -> flagged
    expect(shouldFlagSafety(0.05)).toBe(true);
    expect(shouldFlagSafety(0.95)).toBe(true);
  });

  it('does not flag safety when P is below threshold', () => {
    // 0.04 < 0.0476 -> not flagged
    expect(shouldFlagSafety(0.04)).toBe(false);
    expect(shouldFlagSafety(0.01)).toBe(false);
    expect(shouldFlagSafety(0.0)).toBe(false);
  });

  it('supports custom cost matrices', () => {
    // If missing is 100x worse than false alarm: C_miss=100, C_false=1 -> threshold ~ 0.0099
    const sensitiveThreshold = getSafetyCostThreshold(100, 1);
    expect(sensitiveThreshold).toBeCloseTo(1 / 101, 5);
    expect(shouldFlagSafety(0.02, 100, 1)).toBe(true);

    // If costs are equal: C_miss=1, C_false=1 -> threshold = 0.5
    expect(getSafetyCostThreshold(1, 1)).toBe(0.5);
    expect(shouldFlagSafety(0.49, 1, 1)).toBe(false);
    expect(shouldFlagSafety(0.51, 1, 1)).toBe(true);
  });

  it('throws error for invalid probabilities or non-positive costs', () => {
    expect(() => shouldFlagSafety(-0.1)).toThrow();
    expect(() => shouldFlagSafety(1.5)).toThrow();
    expect(() => getSafetyCostThreshold(0, 1)).toThrow();
  });

  it('provides a detailed explanation card', () => {
    const explanation = explainSafetyCost(0.1);
    expect(explanation.flagged).toBe(true);
    expect(explanation.formula).toContain('P * C_miss > (1 - P) * C_false');
    expect(explanation.explanation).toContain('Safety flagged');
  });
});
