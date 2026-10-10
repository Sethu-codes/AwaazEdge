import { normalizeComplaintText } from './normalize.js';
import { matchLexicon } from './lexicon.js';
import { calculateUrgency } from './urgency.js';
import { shouldFlagSafety } from './safety-cost.js';
import {
  Department,
  LaneType,
  TriageResult,
  UrgencyModifierInput
} from './types.js';

export interface TriageOptions {
  manualModifiers?: UrgencyModifierInput;
  safetyCostMiss?: number;
  safetyCostFalse?: number;
}

/**
 * Main pure deterministic rules-based triage pipeline for TransitTriage Phase 0.
 *
 * Rules:
 * 1. Normalize text (Unicode NFC, Indic digits, lowercase, collapse repeats, variant mapping).
 * 2. Detect script & guess language.
 * 3. Match lexicon terms with character offsets & detect negation.
 * 4. Determine departments & primary department.
 * 5. Compute urgency score with danger floors and modifiers.
 * 6. Apply safety-cost threshold rule.
 * 7. Apply lane rule: lane="needs_human" if no lexicon hit, if negation flagged, or if language is unknown.
 */
export function triageComplaint(
  inputText: string,
  options: TriageOptions = {}
): TriageResult {
  // 1 & 2: Normalize and detect script/language
  const norm = normalizeComplaintText(inputText);

  // 3: Match lexicon terms on normalized & original text
  const matchedTerms = matchLexicon(inputText, norm.normalized);

  // Collect unique matched departments
  const deptSet = new Set<Department>();
  for (const match of matchedTerms) {
    deptSet.add(match.department);
  }

  // Check if any non-negated danger term is present
  const hasActiveDanger = matchedTerms.some((t) => t.isDanger && !t.isNegated);
  if (hasActiveDanger) {
    deptSet.add('safety');
  }

  const departments = Array.from(deptSet);

  // Determine primary department
  // If safety has danger floor, safety or asset-specific dept
  let primaryDepartment: Department | null = null;
  if (departments.length > 0) {
    // Rank departments by base priority or active danger
    if (departments.includes('lifts') && departments.includes('safety')) {
      primaryDepartment = 'lifts'; // Specific asset failure takes primary in operations, safety tagged as multi-label
    } else if (departments.includes('safety')) {
      primaryDepartment = 'safety';
    } else if (departments.includes('lifts')) {
      primaryDepartment = 'lifts';
    } else if (departments.includes('staff_behaviour')) {
      primaryDepartment = 'staff_behaviour';
    } else if (departments.includes('fare')) {
      primaryDepartment = 'fare';
    } else {
      primaryDepartment = 'cleanliness';
    }
  }

  // Check negation flag across all matched terms
  const negationFlagged = matchedTerms.some((t) => t.isNegated);

  // 4: Calculate deterministic urgency
  const urgency = calculateUrgency(
    departments,
    matchedTerms,
    norm.normalized,
    options.manualModifiers
  );

  // 5: Safety cost decision
  const hasSafetyTerms = matchedTerms.some((t) => t.department === 'safety' && !t.isNegated);
  const estimatedSafetyProb = hasSafetyTerms || departments.includes('safety') ? 0.95 : 0.0;
  const flaggedSafetyByCost = shouldFlagSafety(
    estimatedSafetyProb,
    options.safetyCostMiss,
    options.safetyCostFalse
  );

  // 6: Lane rule:
  // lane="needs_human" if:
  // - no lexicon hit and no model
  // - if negation flagged
  // - if language is unknown
  let lane: LaneType = 'automated';
  let laneReason = 'Standard automated classification';

  if (matchedTerms.length === 0) {
    lane = 'needs_human';
    laneReason = 'No lexicon matches detected (unclassified text)';
  } else if (negationFlagged) {
    lane = 'needs_human';
    laneReason = 'Negation detected near critical or operational terms';
  } else if (norm.lang_guess === 'unknown') {
    lane = 'needs_human';
    laneReason = 'Language could not be reliably determined';
  }

  return {
    originalText: inputText,
    normalizedText: norm.normalized,
    script: norm.script,
    lang_guess: norm.lang_guess,
    primaryDepartment,
    departments,
    matchedTerms,
    negationFlagged,
    urgency,
    lane,
    laneReason,
    flaggedSafetyByCost
  };
}
