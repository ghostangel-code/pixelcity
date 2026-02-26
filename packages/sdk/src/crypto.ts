import { createHash } from 'crypto';
import { AgentState, TrustRecord } from '@pixelcity/shared';

export function calculateStateChecksum(state: Omit<AgentState, 'checksum'>): string {
  const data = JSON.stringify({
    energy: state.energy,
    mood: state.mood,
    socialNeed: state.socialNeed,
    loneliness: state.loneliness,
    stress: state.stress,
    coins: state.coins,
    lastUpdatedAt: state.lastUpdatedAt,
  });
  return createHash('md5').update(data).digest('hex');
}

export function calculateTrustChecksum(record: Omit<TrustRecord, 'checksum'>): string {
  const data = JSON.stringify({
    targetAgentId: record.targetAgentId,
    voiceprint: record.voiceprint,
    label: record.label,
    interactionCount: record.interactionCount,
    lastUpdatedAt: record.lastUpdatedAt,
  });
  return createHash('md5').update(data).digest('hex');
}

export function verifyChecksum(
  data: AgentState | TrustRecord,
  serverChecksum: string
): boolean {
  if ('voiceprint' in data) {
    return calculateTrustChecksum(data) === serverChecksum;
  }
  return calculateStateChecksum(data) === serverChecksum;
}
