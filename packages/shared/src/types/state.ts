import { createHash } from 'crypto';

export interface AgentState {
  energy: number;
  mood: number;
  socialNeed: number;
  loneliness: number;
  stress: number;
  coins: number;
  
  lastUpdatedAt: number;
  checksum: string;
}

export interface StateUpdate {
  state: AgentState;
  changes: StateChange[];
  timestamp: number;
}

export interface StateChange {
  field: keyof Omit<AgentState, 'lastUpdatedAt' | 'checksum'>;
  oldValue: number;
  newValue: number;
  reason: string;
}

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
