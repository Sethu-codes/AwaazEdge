/**
 * Safety cost matrix and optimal decision threshold logic.
 *
 * Cost matrix:
 * - C_miss: Cost of missing a true safety complaint (high severity, default 20)
 * - C_false: Cost of false-flagging a benign complaint as safety (annoyance/review overhead, default 1)
 *
 * Expected risk minimization:
 * Flag safety if:
 *   P * C_miss > (1 - P) * C_false
 *   => P > C_false / (C_miss + C_false)
 */

export const DEFAULT_C_MISS = 20;
export const DEFAULT_C_FALSE = 1;

/**
 * Calculates the critical probability threshold for flagging safety.
 * P_threshold = C_false / (C_miss + C_false)
 */
export function getSafetyCostThreshold(
  cMiss: number = DEFAULT_C_MISS,
  cFalse: number = DEFAULT_C_FALSE
): number {
  if (cMiss <= 0 || cFalse <= 0) {
    throw new Error('Costs C_miss and C_false must be positive numbers');
  }
  return cFalse / (cMiss + cFalse);
}

/**
 * Checks whether safety should be flagged based on estimated safety probability P
 * and the cost parameters C_miss and C_false.
 */
export function shouldFlagSafety(
  probability: number,
  cMiss: number = DEFAULT_C_MISS,
  cFalse: number = DEFAULT_C_FALSE
): boolean {
  if (probability < 0 || probability > 1) {
    throw new Error(`Probability must be between 0 and 1, got ${probability}`);
  }
  const threshold = getSafetyCostThreshold(cMiss, cFalse);
  return probability > threshold;
}

export interface SafetyCostExplanation {
  probability: number;
  cMiss: number;
  cFalse: number;
  threshold: number;
  flagged: boolean;
  formula: string;
  explanation: string;
}

/**
 * Generates an explainer object detailing the cost-sensitive decision.
 */
export function explainSafetyCost(
  probability: number,
  cMiss: number = DEFAULT_C_MISS,
  cFalse: number = DEFAULT_C_FALSE
): SafetyCostExplanation {
  const threshold = getSafetyCostThreshold(cMiss, cFalse);
  const flagged = shouldFlagSafety(probability, cMiss, cFalse);

  return {
    probability,
    cMiss,
    cFalse,
    threshold,
    flagged,
    formula: 'P * C_miss > (1 - P) * C_false => P > C_false / (C_miss + C_false)',
    explanation: flagged
      ? `Safety flagged: Estimated risk (${(probability * 100).toFixed(1)}%) exceeds optimal threshold (${(threshold * 100).toFixed(1)}%) given C_miss=${cMiss} and C_false=${cFalse}.`
      : `Safety not flagged: Estimated risk (${(probability * 100).toFixed(1)}%) is below threshold (${(threshold * 100).toFixed(1)}%).`
  };
}
