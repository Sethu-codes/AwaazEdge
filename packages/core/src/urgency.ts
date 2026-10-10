import {
  Department,
  MatchedTerm,
  UrgencyBand,
  UrgencyBreakdownItem,
  UrgencyModifierInput,
  UrgencyResult
} from './types.js';

// Base urgency scores by department
export const DEPARTMENT_BASE_URGENCY: Record<Department, number> = {
  safety: 40,
  lifts: 25,
  staff_behaviour: 20,
  fare: 15,
  cleanliness: 10
};

// Floor scores for specific danger situations
export const DANGER_FLOORS: Record<string, number> = {
  fire: 95,
  stampede: 95,
  unconscious: 95,
  child_missing: 95,
  stuck: 85,
  harassment: 85,
  fell: 80
};

// Regex patterns for detecting vulnerable person cues in text
const VULNERABLE_PATTERNS: Array<{ category: string; regex: RegExp }> = [
  {
    category: 'elderly',
    regex: /\b(vrudh|vriddh|vridh|elderly|senior|buddha|bujurg|old person|dada|dadi)\b|વૃદ્ધ|વૃદ્ધા|બુજુર્ગ|बुजुर्ग|वृद्ध/iu
  },
  {
    category: 'disabled',
    regex: /\b(disabled|handicapped|divyang|wheelchair|apang|blind|apahij)\b|દિવ્યાંગ|અપંગ|दिव्यांग|अपंग|अपाहिज/iu
  },
  {
    category: 'woman',
    regex: /\b(pregnant|woman|women|female|lady|ladies|mahila|stri|aurat)\b|મહિલા|સ્ત્રી|સગર્ભા|महिला|औरत|गर्भवती/iu
  },
  {
    category: 'child',
    regex: /\b(child|children|kid|kids|baby|infant|balak|baccha|bacha|chhokro|chhokri)\b|બાળક|છોકરો|છોકરી|બચ્ચું|बच्चा|बच्ची/iu
  }
];

// Regex patterns for detecting time pressure cues in text
const TIME_PRESSURE_PATTERNS = [
  /\b\d+\s*(?:minute|minutes|min|mins)\b/iu,
  /\b\d+\s*મિનિટ\b/iu,
  /\b\d+\s*मिनट\b/iu,
  /\b(train in \d+|5 minute ma|train miss|train chhutti|chali jayegi|jaldi|urgent|urgently|emergency|tatkal|aavani chhe)\b/iu,
  /જલ્દી|તરત|તત્કાળ|ઇમરજન્સી|इमरजेंसी|जल्दी|तुरंत/iu
];

// Regex for public social tags
const SOCIAL_TAG_PATTERN = /(@\w+|#\w+|twitter|x\.com|facebook|instagram|tagging)/iu;

/**
 * Detect vulnerable person signals from text.
 */
export function detectVulnerablePersons(text: string): string[] {
  const detected: string[] = [];
  for (const { category, regex } of VULNERABLE_PATTERNS) {
    if (regex.test(text)) {
      detected.push(category);
    }
  }
  return detected;
}

/**
 * Detect time pressure signals from text.
 */
export function detectTimePressure(text: string): boolean {
  return TIME_PRESSURE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Compute urgency band from score.
 * Critical: >=85, High: 65-84, Medium: 40-64, Low: <40.
 */
export function getUrgencyBand(score: number): UrgencyBand {
  if (score >= 85) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

/**
 * Pure, deterministic urgency calculator.
 * Returns score, band, breakdown array.
 */
export function calculateUrgency(
  departments: Department[],
  matchedTerms: MatchedTerm[] = [],
  textContext: string = '',
  manualModifiers: UrgencyModifierInput = {}
): UrgencyResult {
  const breakdown: UrgencyBreakdownItem[] = [];

  // 1. Department Base
  let baseScore = 0;
  if (departments.length > 0) {
    const scoredDepts = departments.map((d) => ({
      dept: d,
      score: DEPARTMENT_BASE_URGENCY[d] ?? 10
    }));
    scoredDepts.sort((a, b) => b.score - a.score);
    const topDept = scoredDepts[0];
    baseScore = topDept.score;
    breakdown.push({
      name: `Base (${topDept.dept})`,
      points: baseScore,
      description: `Department base score for ${topDept.dept}`,
      category: 'base'
    });
  } else {
    baseScore = 10;
    breakdown.push({
      name: 'Default Base',
      points: 10,
      description: 'Default base urgency score for unclassified complaint',
      category: 'base'
    });
  }

  // 2. Danger Floors
  // Floor applies to active, non-negated danger terms
  let floorScore = 0;
  let activeFloorTrigger: { subtopic: string; floor: number } | null = null;

  for (const term of matchedTerms) {
    if (!term.isNegated && term.isDanger && term.dangerFloor > 0) {
      if (term.dangerFloor > floorScore) {
        floorScore = term.dangerFloor;
        activeFloorTrigger = { subtopic: term.subtopic, floor: term.dangerFloor };
      }
    }
  }

  if (activeFloorTrigger && floorScore > 0) {
    breakdown.push({
      name: `Floor: ${activeFloorTrigger.subtopic}`,
      points: floorScore,
      description: `Critical danger floor triggered by ${activeFloorTrigger.subtopic} (${floorScore})`,
      category: 'floor'
    });
  }

  // Effective anchor: max(base, floor)
  const effectiveAnchor = Math.max(baseScore, floorScore);

  // 3. Modifiers
  let totalModifiers = 0;

  // 3a. Vulnerable person (+10 per category, capped at 15)
  const textVulnerable = textContext ? detectVulnerablePersons(textContext) : [];
  const manualVulnerable = manualModifiers.vulnerableDetails || [];
  const allVulnerable = Array.from(new Set([...textVulnerable, ...manualVulnerable]));
  const isVulnerable = manualModifiers.isVulnerablePerson ?? (allVulnerable.length > 0);

  if (isVulnerable) {
    const rawPoints = allVulnerable.length >= 2 ? 15 : 10;
    const vulnPoints = Math.min(15, rawPoints);
    totalModifiers += vulnPoints;
    breakdown.push({
      name: 'Modifier: Vulnerable Person',
      points: vulnPoints,
      description: `Vulnerable person involved (${allVulnerable.join(', ') || 'unspecified'}) (+${vulnPoints}, cap 15)`,
      category: 'modifier'
    });
  }

  // 3b. Time pressure (+10)
  const hasTimePressure =
    manualModifiers.hasTimePressure ??
    (textContext ? detectTimePressure(textContext) : false);

  if (hasTimePressure) {
    totalModifiers += 10;
    breakdown.push({
      name: 'Modifier: Time Pressure',
      points: 10,
      description: 'Immediate time pressure or imminent train departure (+10)',
      category: 'modifier'
    });
  }

  // 3c. Incident Duplicates (+5 per doubling of incident size, cap 15)
  // N=1 -> 0, N=2 -> +5, N=4 -> +10, N>=8 -> +15
  const incidentCount = manualModifiers.incidentDuplicatesCount ?? 1;
  if (incidentCount >= 2) {
    const doublings = Math.floor(Math.log2(incidentCount));
    const dupPoints = Math.min(15, doublings * 5);
    if (dupPoints > 0) {
      totalModifiers += dupPoints;
      breakdown.push({
        name: 'Modifier: Duplicate Reports',
        points: dupPoints,
        description: `Incident cluster size of ${incidentCount} reports (+5 per doubling, cap 15)`,
        category: 'modifier'
      });
    }
  }

  // 3d. SLA Age ramp (up to +20 as age approaches SLA)
  if (
    manualModifiers.ageMinutes !== undefined &&
    manualModifiers.slaMinutes !== undefined &&
    manualModifiers.slaMinutes > 0
  ) {
    const ratio = Math.min(1.0, Math.max(0, manualModifiers.ageMinutes / manualModifiers.slaMinutes));
    const slaPoints = Math.round(ratio * 20);
    if (slaPoints > 0) {
      totalModifiers += slaPoints;
      breakdown.push({
        name: 'Modifier: SLA Ramp',
        points: slaPoints,
        description: `Complaint age ${manualModifiers.ageMinutes}m approaching SLA ${manualModifiers.slaMinutes}m (+${slaPoints}, ramp to 20)`,
        category: 'modifier'
      });
    }
  }

  // 3e. Public social post tagging authorities/media (+5)
  const isPublic =
    manualModifiers.isPublicSocial ??
    (textContext ? SOCIAL_TAG_PATTERN.test(textContext) : false);

  if (isPublic) {
    totalModifiers += 5;
    breakdown.push({
      name: 'Modifier: Public Social Escalation',
      points: 5,
      description: 'Public social post tagging authorities/media (+5)',
      category: 'modifier'
    });
  }

  // Final calculation: min(100, max(base, floor) + modifiers)
  const rawScore = effectiveAnchor + totalModifiers;
  const finalScore = Math.min(100, Math.max(0, rawScore));
  const band = getUrgencyBand(finalScore);

  return {
    score: finalScore,
    band,
    baseScore,
    floorScore,
    modifiersScore: totalModifiers,
    breakdown
  };
}
