export interface ComplaintForCluster {
  id: string;
  trackingId: string;
  stationId: string;
  assetId?: string;
  text: string;
  normalizedText?: string;
  createdAt: string; // ISO String
  urgencyScore: number;
  department: string;
}

export interface ClusteredIncident {
  id: string;
  title: string;
  stationId: string;
  assetId?: string;
  department: string;
  count: number;
  maxUrgency: number;
  meanUrgency: number;
  firstReportedAt: string;
  lastReportedAt: string;
  complaintIds: string[];
  sampleText: string;
}

/**
 * Token Jaccard similarity as stand-in for embedding cosine similarity in mock browser environment.
 */
function tokenSimilarity(text1: string, text2: string): number {
  const set1 = new Set((text1.toLowerCase().match(/\b[\p{L}\p{N}]+\b/gu) || []));
  const set2 = new Set((text2.toLowerCase().match(/\b[\p{L}\p{N}]+\b/gu) || []));

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }

  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Clusters complaints that occurred within 6 hours at the same station/asset with high text similarity.
 */
export function clusterComplaints(complaints: ComplaintForCluster[]): ClusteredIncident[] {
  const incidents: ClusteredIncident[] = [];
  const assigned = new Set<string>();

  // Sort chronologically
  const sorted = [...complaints].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (let i = 0; i < sorted.length; i++) {
    const c1 = sorted[i];
    if (assigned.has(c1.id)) continue;

    const clusterMembers: ComplaintForCluster[] = [c1];
    assigned.add(c1.id);

    const t1 = new Date(c1.createdAt).getTime();

    for (let j = i + 1; j < sorted.length; j++) {
      const c2 = sorted[j];
      if (assigned.has(c2.id)) continue;

      const t2 = new Date(c2.createdAt).getTime();
      const timeDiff = Math.abs(t2 - t1);

      // Must be within 6 hours
      if (timeDiff > SIX_HOURS_MS) continue;

      // Same station and same asset (or both station platform/escalator issues)
      const sameStation = c1.stationId === c2.stationId;
      const sameAsset = Boolean(c1.assetId && c2.assetId && c1.assetId === c2.assetId);

      // If same asset at same station, or text similarity >= 0.45
      const similarity = tokenSimilarity(c1.normalizedText || c1.text, c2.normalizedText || c2.text);

      if (sameStation && (sameAsset || similarity >= 0.4)) {
        clusterMembers.push(c2);
        assigned.add(c2.id);
      }
    }

    if (clusterMembers.length > 1) {
      const urgencies = clusterMembers.map((m) => m.urgencyScore);
      const maxUrgency = Math.max(...urgencies);
      const sum = urgencies.reduce((a, b) => a + b, 0);
      const meanUrgency = Math.round(sum / clusterMembers.length);

      incidents.push({
        id: `INC-${c1.stationId}-${c1.assetId || 'GEN'}-${clusterMembers[0].id.slice(-4)}`,
        title: `${c1.department.toUpperCase()} Issue at ${c1.stationId} (${c1.assetId || 'Station Area'})`,
        stationId: c1.stationId,
        assetId: c1.assetId,
        department: c1.department,
        count: clusterMembers.length,
        maxUrgency,
        meanUrgency,
        firstReportedAt: clusterMembers[0].createdAt,
        lastReportedAt: clusterMembers[clusterMembers.length - 1].createdAt,
        complaintIds: clusterMembers.map((m) => m.id),
        sampleText: clusterMembers[0].text
      });
    }
  }

  // Sort incidents by count desc, then maxUrgency desc
  return incidents.sort((a, b) => b.count - a.count || b.maxUrgency - a.maxUrgency);
}
