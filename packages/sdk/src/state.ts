import { AgentState, StateChange, calculateStateChecksum } from '@pixelcity/shared';

export class StateManager {
  private state: AgentState;
  private pendingChanges: StateChange[] = [];
  
  constructor(initialState: Partial<AgentState> = {}) {
    this.state = {
      energy: initialState.energy ?? 100,
      mood: initialState.mood ?? 80,
      socialNeed: initialState.socialNeed ?? 50,
      loneliness: initialState.loneliness ?? 30,
      stress: initialState.stress ?? 20,
      coins: initialState.coins ?? 100,
      lastUpdatedAt: Date.now(),
      checksum: '',
    };
    this.updateChecksum();
  }
  
  getState(): AgentState {
    return { ...this.state };
  }
  
  applyChange(change: Omit<StateChange, 'oldValue'>): void {
    const currentValue = this.state[change.field];
    const oldValue = typeof currentValue === 'number' ? currentValue : 0;
    
    (this.state as any)[change.field] = change.newValue;
    this.pendingChanges.push({
      ...change,
      oldValue,
    });
    
    this.state.lastUpdatedAt = Date.now();
    this.updateChecksum();
  }
  
  syncFromServer(serverState: AgentState): void {
    this.state = { ...serverState };
    this.pendingChanges = [];
  }
  
  getPendingChanges(): StateChange[] {
    return [...this.pendingChanges];
  }
  
  clearPendingChanges(): void {
    this.pendingChanges = [];
  }
  
  private updateChecksum(): void {
    this.state.checksum = calculateStateChecksum(this.state);
  }
}
