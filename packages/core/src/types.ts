export type Department =
  | 'safety'
  | 'lifts'
  | 'staff_behaviour'
  | 'fare'
  | 'cleanliness';

export type ScriptType =
  | 'gujarati'
  | 'devanagari'
  | 'latin'
  | 'mixed'
  | 'unknown';

export type LangGuess =
  | 'gu'
  | 'hi'
  | 'en'
  | 'mixed'
  | 'unknown';

export type UrgencyBand =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

export type FormType =
  | 'gu_script'
  | 'hi_script'
  | 'en'
  | 'romanized';

export type LaneType =
  | 'needs_human'
  | 'automated';

export interface NormalizationResult {
  original: string;
  normalized: string;
  script: ScriptType;
  lang_guess: LangGuess;
}

export interface MatchedTerm {
  term: string;
  matchedText: string;
  department: Department;
  subtopic: string;
  form: FormType;
  startIndex: number;
  endIndex: number;
  isNegated: boolean;
  isDanger: boolean;
  dangerFloor: number;
  reviewStatus: 'needs_native_speaker_review' | 'reviewed';
}

export interface UrgencyModifierInput {
  isVulnerablePerson?: boolean;
  vulnerableDetails?: string[];
  hasTimePressure?: boolean;
  timePressureDetails?: string[];
  incidentDuplicatesCount?: number; // incident count N: 1 -> 0, 2 -> +5, 4 -> +10, 8+ -> +15
  ageMinutes?: number;
  slaMinutes?: number;
  isPublicSocial?: boolean;
}

export interface UrgencyBreakdownItem {
  name: string;
  points: number;
  description: string;
  category: 'base' | 'floor' | 'modifier';
}

export interface UrgencyResult {
  score: number;
  band: UrgencyBand;
  baseScore: number;
  floorScore: number;
  modifiersScore: number;
  breakdown: UrgencyBreakdownItem[];
}

export interface TriageResult {
  originalText: string;
  normalizedText: string;
  script: ScriptType;
  lang_guess: LangGuess;
  primaryDepartment: Department | null;
  departments: Department[];
  matchedTerms: MatchedTerm[];
  negationFlagged: boolean;
  urgency: UrgencyResult;
  lane: LaneType;
  laneReason: string;
  flaggedSafetyByCost: boolean;
}
