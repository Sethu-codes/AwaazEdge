import { create } from 'zustand';
import { DBComplaint, DBCorrection } from '../db/dexieDb.js';
import { SAMPLE_COMPLAINTS } from '../mock/sampleComplaints.js';
import { defaultSyncService } from '../core/syncService.js';
import { defaultClassifier } from '../core/classifier.js';
import { getUrgencyBand } from '@transit-triage/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppState {
  complaints: DBComplaint[];
  selectedComplaintId: string | null;
  activeDeptTab: string;
  stationFilter: string;
  channelFilter: string;
  bandFilter: string;
  statusFilter: string;
  searchQuery: string;

  isSimulatedOffline: boolean;
  isDarkMode: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: string | null;

  toasts: ToastMessage[];

  // Actions
  addComplaint: (complaint: Partial<DBComplaint>) => Promise<DBComplaint>;
  updateComplaint: (id: string, updates: Partial<DBComplaint>) => void;
  overrideUrgency: (id: string, newScore: number, reason: string) => Promise<void>;
  moveDepartment: (id: string, newDept: string, reason: string) => Promise<void>;
  approveDraft: (id: string, text: string) => Promise<void>;
  sendReply: (id: string) => Promise<void>;
  batchTriageComplaints: (items: Array<{ text: string; stationId: string; assetId?: string; channel?: string }>) => Promise<{ count: number; elapsedMs: number }>;

  setSelectedComplaintId: (id: string | null) => void;
  setActiveDeptTab: (tab: string) => void;
  setStationFilter: (station: string) => void;
  setChannelFilter: (channel: string) => void;
  setBandFilter: (band: string) => void;
  setStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;

  toggleOffline: () => void;
  toggleDarkMode: () => void;
  syncNow: () => Promise<void>;

  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  complaints: SAMPLE_COMPLAINTS,
  selectedComplaintId: null,
  activeDeptTab: 'all',
  stationFilter: 'all',
  channelFilter: 'all',
  bandFilter: 'all',
  statusFilter: 'all',
  searchQuery: '',

  isSimulatedOffline: false,
  isDarkMode: false,
  pendingSyncCount: 0,
  isSyncing: false,
  syncProgress: 0,
  lastSyncTime: new Date().toISOString(),

  toasts: [],

  addComplaint: async (data) => {
    const text = data.originalText || '';
    const res = await defaultClassifier.classify(text, {
      stationId: data.stationId,
      assetId: data.assetId
    });

    const newId = `CMP-${Date.now().toString().slice(-4)}`;
    const trackingId = `TRK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: DBComplaint = {
      id: newId,
      trackingId,
      originalText: text,
      normalizedText: res.normalizedText,
      script: res.script,
      lang_guess: res.lang_guess,
      primaryDepartment: res.primaryDepartment,
      secondaryDepartments: res.secondaryDepartments,
      allDepartments: res.allDepartments,
      urgencyScore: res.urgency.score,
      urgencyBand: res.urgency.band,
      urgencyBreakdown: res.urgency.breakdown,
      status: 'NEW',
      lane: res.lane,
      laneReason: res.laneReason,
      stationId: data.stationId || 'STN-01',
      assetId: data.assetId,
      channel: (data.channel as any) || 'app',
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      createdAt: new Date().toISOString(),
      auditTrail: [
        {
          action: 'CREATED',
          timestamp: new Date().toISOString(),
          actor: data.contactName ? `${data.contactName} (Passenger)` : 'Anonymous Passenger'
        }
      ]
    };

    // Log to sync service
    await defaultSyncService.queueEvent('COMPLAINT_CREATED', newComplaint);
    const syncStatus = defaultSyncService.getStatus();

    set((state) => ({
      complaints: [newComplaint, ...state.complaints],
      pendingSyncCount: syncStatus.pendingCount
    }));

    get().addToast(`Complaint #${trackingId} logged successfully`, 'success');
    return newComplaint;
  },

  updateComplaint: (id, updates) => {
    set((state) => ({
      complaints: state.complaints.map((c) => (c.id === id ? { ...c, ...updates } : c))
    }));
  },

  overrideUrgency: async (id, newScore, reason) => {
    const complaint = get().complaints.find((c) => c.id === id);
    if (!complaint) return;

    const clampedScore = Math.min(100, Math.max(0, newScore));
    const newBand = getUrgencyBand(clampedScore);

    const updatedTrail = [
      ...complaint.auditTrail,
      {
        action: 'URGENCY_OVERRIDDEN',
        timestamp: new Date().toISOString(),
        actor: 'Controller',
        note: `Override ${complaint.urgencyScore} -> ${clampedScore} (${reason})`
      }
    ];

    await defaultSyncService.queueEvent('URGENCY_OVERRIDDEN', {
      complaintId: id,
      oldScore: complaint.urgencyScore,
      newScore: clampedScore,
      reason
    });

    const syncStatus = defaultSyncService.getStatus();

    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              urgencyScore: clampedScore,
              urgencyBand: newBand,
              auditTrail: updatedTrail
            }
          : c
      ),
      pendingSyncCount: syncStatus.pendingCount
    }));

    get().addToast(`Urgency updated to ${clampedScore} (${newBand})`, 'info');
  },

  moveDepartment: async (id, newDept, reason) => {
    const complaint = get().complaints.find((c) => c.id === id);
    if (!complaint) return;

    const oldDept = complaint.primaryDepartment;
    const updatedTrail = [
      ...complaint.auditTrail,
      {
        action: 'LABEL_CORRECTED',
        timestamp: new Date().toISOString(),
        actor: 'Controller',
        note: `Moved department ${oldDept} -> ${newDept} (${reason})`
      }
    ];

    await defaultSyncService.queueEvent('LABEL_CORRECTED', {
      complaintId: id,
      oldDept,
      newDept,
      reason
    });

    const syncStatus = defaultSyncService.getStatus();

    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              primaryDepartment: newDept,
              allDepartments: Array.from(new Set([newDept, ...c.secondaryDepartments])),
              auditTrail: updatedTrail
            }
          : c
      ),
      pendingSyncCount: syncStatus.pendingCount
    }));

    get().addToast('Learned from your correction!', 'success');
  },

  approveDraft: async (id, text) => {
    const complaint = get().complaints.find((c) => c.id === id);
    if (!complaint) return;

    const updatedTrail = [
      ...complaint.auditTrail,
      {
        action: 'DRAFT_APPROVED',
        timestamp: new Date().toISOString(),
        actor: 'Station Controller',
        note: 'Approved official response draft'
      }
    ];

    await defaultSyncService.queueEvent('DRAFT_APPROVED', { complaintId: id, replyText: text });
    const syncStatus = defaultSyncService.getStatus();

    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              replyText: text,
              replyStatus: 'approved',
              status: 'APPROVED',
              auditTrail: updatedTrail
            }
          : c
      ),
      pendingSyncCount: syncStatus.pendingCount
    }));

    get().addToast('Draft response approved', 'success');
  },

  sendReply: async (id) => {
    const complaint = get().complaints.find((c) => c.id === id);
    if (!complaint) return;

    const updatedTrail = [
      ...complaint.auditTrail,
      {
        action: 'REPLY_SENT',
        timestamp: new Date().toISOString(),
        actor: 'Station Controller',
        note: 'Response dispatched to passenger'
      }
    ];

    await defaultSyncService.queueEvent('REPLY_SENT', { complaintId: id });
    const syncStatus = defaultSyncService.getStatus();

    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              replyStatus: 'sent',
              status: 'SENT',
              auditTrail: updatedTrail
            }
          : c
      ),
      pendingSyncCount: syncStatus.pendingCount
    }));

    get().addToast('Official response dispatched to complainant', 'success');
  },

  batchTriageComplaints: async (items) => {
    const t0 = performance.now();
    const newItems: DBComplaint[] = [];

    for (const item of items) {
      const res = await defaultClassifier.classify(item.text, {
        stationId: item.stationId,
        assetId: item.assetId
      });

      const newId = `CMP-B-${Math.random().toString(36).substring(2, 7)}`;
      const trackingId = `TRK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      newItems.push({
        id: newId,
        trackingId,
        originalText: item.text,
        normalizedText: res.normalizedText,
        script: res.script,
        lang_guess: res.lang_guess,
        primaryDepartment: res.primaryDepartment,
        secondaryDepartments: res.secondaryDepartments,
        allDepartments: res.allDepartments,
        urgencyScore: res.urgency.score,
        urgencyBand: res.urgency.band,
        urgencyBreakdown: res.urgency.breakdown,
        status: 'NEW',
        lane: res.lane,
        laneReason: res.laneReason,
        stationId: item.stationId || 'STN-01',
        assetId: item.assetId,
        channel: (item.channel as any) || 'paper',
        createdAt: new Date().toISOString(),
        auditTrail: [{ action: 'BATCH_IMPORTED', timestamp: new Date().toISOString(), actor: 'Admin Batch Intake' }]
      });

      await defaultSyncService.queueEvent('COMPLAINT_CREATED', newItems[newItems.length - 1]);
    }

    const elapsed = Math.round(performance.now() - t0);
    const syncStatus = defaultSyncService.getStatus();

    set((state) => ({
      complaints: [...newItems, ...state.complaints],
      pendingSyncCount: syncStatus.pendingCount
    }));

    get().addToast(`Triaged ${items.length} complaints in ${elapsed} ms`, 'success');
    return { count: items.length, elapsedMs: elapsed };
  },

  setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),
  setActiveDeptTab: (tab) => set({ activeDeptTab: tab }),
  setStationFilter: (station) => set({ stationFilter: station }),
  setChannelFilter: (channel) => set({ channelFilter: channel }),
  setBandFilter: (band) => set({ bandFilter: band }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleOffline: () => {
    const nextOffline = !get().isSimulatedOffline;
    defaultSyncService.setSimulatedOffline(nextOffline);
    set({ isSimulatedOffline: nextOffline });

    if (nextOffline) {
      get().addToast('Simulate Offline active: All actions queued locally in IndexedDB', 'warning');
    } else {
      get().syncNow();
    }
  },

  toggleDarkMode: () => {
    const nextDark = !get().isDarkMode;
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: nextDark });
  },

  syncNow: async () => {
    set({ isSyncing: true, syncProgress: 0 });
    const res = await defaultSyncService.syncNow((percent) => {
      set({ syncProgress: percent });
    });

    const status = defaultSyncService.getStatus();
    set({
      isSyncing: false,
      syncProgress: 100,
      pendingSyncCount: status.pendingCount,
      lastSyncTime: status.lastSyncTime
    });

    get().addToast(`Sync complete: ${res.syncedCount} events processed`, 'success');
  },

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
