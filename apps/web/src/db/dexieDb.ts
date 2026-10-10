import Dexie, { type Table } from 'dexie';
import { SyncEvent } from '../core/syncService.js';

export interface DBComplaint {
  id: string;
  trackingId: string;
  originalText: string;
  normalizedText: string;
  script: string;
  lang_guess: string;
  primaryDepartment: string;
  secondaryDepartments: string[];
  allDepartments: string[];
  urgencyScore: number;
  urgencyBand: 'Critical' | 'High' | 'Medium' | 'Low';
  urgencyBreakdown: Array<{ name: string; points: number; description: string; category: string }>;
  status: 'NEW' | 'TRIAGED' | 'DRAFTED' | 'APPROVED' | 'SENT' | 'RESOLVED';
  lane: 'needs_human' | 'automated';
  laneReason: string;
  stationId: string;
  assetId?: string;
  channel: 'app' | 'paper' | 'social' | 'email';
  contactName?: string;
  contactPhone?: string;
  createdAt: string; // ISO
  replyText?: string;
  replyStatus?: 'draft' | 'approved' | 'sent';
  auditTrail: Array<{ action: string; timestamp: string; actor: string; note?: string }>;
  incidentId?: string;
}

export interface DBCorrection {
  id: string;
  complaintId: string;
  originalDept: string;
  correctedDept: string;
  originalUrgency?: number;
  correctedUrgency?: number;
  reason: string;
  createdAt: string;
}

export interface DBTemplate {
  id: string;
  department: string;
  language: string; // en, gu, hi
  band: string;     // Critical, High, Medium, Low
  text: string;
  isReviewed: boolean;
}

export class TransitTriageDB extends Dexie {
  complaints!: Table<DBComplaint, string>;
  events!: Table<SyncEvent, string>;
  corrections!: Table<DBCorrection, string>;
  templates!: Table<DBTemplate, string>;

  constructor() {
    super('TransitTriageDB');
    this.version(1).stores({
      complaints: 'id, trackingId, primaryDepartment, status, lane, urgencyBand, stationId, assetId, createdAt',
      events: 'id, type, status, timestamp',
      corrections: 'id, complaintId, createdAt',
      templates: 'id, department, language, band'
    });
  }
}

export const db = new TransitTriageDB();
