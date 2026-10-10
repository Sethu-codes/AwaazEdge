export type SyncEventType =
  | 'COMPLAINT_CREATED'
  | 'CLASSIFIED'
  | 'LABEL_CORRECTED'
  | 'URGENCY_OVERRIDDEN'
  | 'DRAFT_CREATED'
  | 'DRAFT_APPROVED'
  | 'REPLY_SENT'
  | 'STATUS_CHANGED'
  | 'INCIDENT_MERGED';

export interface SyncEvent {
  id: string; // ULID
  type: SyncEventType;
  deviceId: string;
  timestamp: string; // ISO String
  hlc: { logicalTime: number; counter: number; node: string }; // Hybrid logical clock
  payload: any;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
  conflicts: Array<{ id: string; description: string; resolvedAt?: string }>;
}

export interface SyncService {
  queueEvent(type: SyncEventType, payload: any): Promise<SyncEvent>;
  getPendingEvents(): Promise<SyncEvent[]>;
  getAllEvents(): Promise<SyncEvent[]>;
  syncNow(onProgress?: (percent: number) => void): Promise<{ syncedCount: number }>;
  getStatus(): SyncStatus;
  setSimulatedOffline(offline: boolean): void;
}

// Lightweight monotonic Crockford Base32 ULID generator
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
let lastTime = 0;
let lastRandom = new Uint8Array(10);

export function generateULID(): string {
  const now = Date.now();
  let timeStr = '';
  let time = now;
  for (let i = 9; i >= 0; i--) {
    timeStr = ENCODING[time % 32] + timeStr;
    time = Math.floor(time / 32);
  }

  if (now > lastTime) {
    lastTime = now;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(lastRandom);
    } else {
      for (let i = 0; i < 10; i++) lastRandom[i] = Math.floor(Math.random() * 256);
    }
  } else {
    // Increment random component monotonically
    for (let i = 9; i >= 0; i--) {
      if (lastRandom[i] < 255) {
        lastRandom[i]++;
        break;
      }
      lastRandom[i] = 0;
    }
  }

  let randomStr = '';
  for (let i = 0; i < 16; i++) {
    const byte = lastRandom[i % 10];
    randomStr += ENCODING[byte % 32];
  }

  return timeStr + randomStr;
}

/**
 * Mock / In-Browser SyncService implementation
 */
export class MockSyncService implements SyncService {
  private deviceId: string;
  private isSimulatedOffline: boolean = false;
  private lastSyncTime: string | null = new Date().toISOString();
  private events: SyncEvent[] = [];
  private conflicts: Array<{ id: string; description: string }> = [];
  private logicalCounter = 0;

  constructor() {
    this.deviceId = 'dev_' + Math.random().toString(36).substring(2, 9);
  }

  async queueEvent(type: SyncEventType, payload: any): Promise<SyncEvent> {
    this.logicalCounter++;
    const event: SyncEvent = {
      id: generateULID(),
      type,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
      hlc: {
        logicalTime: Date.now(),
        counter: this.logicalCounter,
        node: this.deviceId
      },
      payload,
      status: this.isSimulatedOffline ? 'pending' : 'synced',
      retryCount: 0
    };

    this.events.unshift(event);
    return event;
  }

  async getPendingEvents(): Promise<SyncEvent[]> {
    return this.events.filter((e) => e.status === 'pending');
  }

  async getAllEvents(): Promise<SyncEvent[]> {
    return [...this.events];
  }

  async syncNow(onProgress?: (percent: number) => void): Promise<{ syncedCount: number }> {
    const pending = this.events.filter((e) => e.status === 'pending');
    if (pending.length === 0) {
      if (onProgress) onProgress(100);
      this.lastSyncTime = new Date().toISOString();
      return { syncedCount: 0 };
    }

    const total = pending.length;
    for (let i = 0; i < total; i++) {
      await new Promise((r) => setTimeout(r, 40)); // Smooth progress animation
      pending[i].status = 'synced';
      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    this.lastSyncTime = new Date().toISOString();
    return { syncedCount: total };
  }

  getStatus(): SyncStatus {
    const pendingCount = this.events.filter((e) => e.status === 'pending').length;
    return {
      isOnline: !this.isSimulatedOffline,
      isSimulatedOffline: this.isSimulatedOffline,
      pendingCount,
      lastSyncTime: this.lastSyncTime,
      isSyncing: false,
      conflicts: this.conflicts
    };
  }

  setSimulatedOffline(offline: boolean): void {
    this.isSimulatedOffline = offline;
  }
}

export const defaultSyncService = new MockSyncService();
