import {
  Department,
  TriageResult,
  UrgencyResult,
  MatchedTerm,
  ScriptType,
  LangGuess,
  LaneType,
  triageComplaint
} from '@transit-triage/core';

export interface DepartmentConfidence {
  department: Department;
  confidence: number; // 0 to 1
  sources: Array<'lexicon' | 'model' | 'knn'>;
}

export interface ClassificationResult {
  originalText: string;
  normalizedText: string;
  script: ScriptType;
  lang_guess: LangGuess;
  primaryDepartment: Department;
  secondaryDepartments: Department[];
  allDepartments: Department[];
  departmentConfidences: DepartmentConfidence[];
  urgency: UrgencyResult;
  lane: LaneType;
  laneReason: string;
  matchedTerms: MatchedTerm[];
  negationFlagged: boolean;
  flaggedSafetyByCost: boolean;
  modelLatencyMs: number;
}

export interface ClassifierContext {
  stationId?: string;
  assetId?: string;
  channel?: string;
  ageMinutes?: number;
  slaMinutes?: number;
  duplicatesCount?: number;
}

export interface ModelInfo {
  name: string;
  version: string;
  mode: 'rules_only' | 'onnx_e5_small' | 'muril' | 'api';
  status: 'ready' | 'loading' | 'offline';
  device: 'cpu' | 'wasm' | 'webgpu';
}

export interface Classifier {
  classify(text: string, context?: ClassifierContext): Promise<ClassificationResult>;
  batchClassify(texts: Array<{ text: string; context?: ClassifierContext }>): Promise<ClassificationResult[]>;
  getModelInfo(): ModelInfo;
}

/**
 * Mock / Rules-Only Classifier implementation using packages/core triage engine.
 * Extensible for Phase 2 browser ONNX & kNN fusion.
 */
export class RulesBasedClassifier implements Classifier {
  private modelInfo: ModelInfo = {
    name: 'TransitTriage Rules Core',
    version: '0.1.0-rules',
    mode: 'rules_only',
    status: 'ready',
    device: 'wasm'
  };

  getModelInfo(): ModelInfo {
    return this.modelInfo;
  }

  async classify(text: string, context?: ClassifierContext): Promise<ClassificationResult> {
    const startTime = performance.now();

    const triageRes: TriageResult = triageComplaint(text, {
      manualModifiers: {
        incidentDuplicatesCount: context?.duplicatesCount,
        ageMinutes: context?.ageMinutes,
        slaMinutes: context?.slaMinutes
      }
    });

    const elapsed = Math.round(performance.now() - startTime);

    const allDepts: Department[] = ['safety', 'lifts', 'cleanliness', 'fare', 'staff_behaviour'];
    const confidences: DepartmentConfidence[] = allDepts.map((d) => {
      const isMatched = triageRes.departments.includes(d);
      const isPrimary = triageRes.primaryDepartment === d;
      let score = 0.05;
      const sources: Array<'lexicon' | 'model' | 'knn'> = [];

      if (isMatched) {
        sources.push('lexicon');
        score = isPrimary ? 0.94 : 0.72;
      }

      return {
        department: d,
        confidence: score,
        sources
      };
    });

    // Primary department fallback
    const primaryDept: Department = triageRes.primaryDepartment || (triageRes.departments[0] ?? 'safety');
    const secondaryDepts = triageRes.departments.filter((d) => d !== primaryDept);

    return {
      originalText: triageRes.originalText,
      normalizedText: triageRes.normalizedText,
      script: triageRes.script,
      lang_guess: triageRes.lang_guess,
      primaryDepartment: primaryDept,
      secondaryDepartments: secondaryDepts,
      allDepartments: triageRes.departments,
      departmentConfidences: confidences,
      urgency: triageRes.urgency,
      lane: triageRes.lane,
      laneReason: triageRes.laneReason,
      matchedTerms: triageRes.matchedTerms,
      negationFlagged: triageRes.negationFlagged,
      flaggedSafetyByCost: triageRes.flaggedSafetyByCost,
      modelLatencyMs: Math.max(1, elapsed)
    };
  }

  async batchClassify(
    items: Array<{ text: string; context?: ClassifierContext }>
  ): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];
    for (const item of items) {
      results.push(await this.classify(item.text, item.context));
    }
    return results;
  }
}

// Singleton classifier instance
export const defaultClassifier: Classifier = new RulesBasedClassifier();
