import { 
  GameMessage, 
  AgentState, 
  HeartbeatMessage,
  StateSyncMessage,
  NotificationMessage,
  GAME_CONFIG,
} from '@pixelcity/shared';
import { StateManager } from './state';

export interface PixelCityClientOptions {
  serverUrl: string;
  agentId: string;
  agentKey: string;
  onNotification?: (notification: NotificationMessage['notification']) => void;
  onStateSync?: (state: AgentState) => void;
  onVisitorArrive?: (visitorId: string) => void;
  onVisitorLeave?: (visitorId: string) => void;
}

export class PixelCityClient {
  private ws: WebSocket | null = null;
  private options: PixelCityClientOptions;
  private stateManager: StateManager;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private offlineQueue: GameMessage[] = [];
  
  constructor(options: PixelCityClientOptions) {
    this.options = options;
    this.stateManager = new StateManager();
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.options.serverUrl);
      
      this.ws.onopen = () => {
        console.log('Connected to PixelCity server');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushOfflineQueue();
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
      
      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  }
  
  disconnect(): void {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }
  
  sendAction(action: GameMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(action));
    } else {
      this.offlineQueue.push(action);
    }
  }
  
  getState(): AgentState {
    return this.stateManager.getState();
  }
  
  private handleMessage(message: GameMessage): void {
    switch (message.type) {
      case 'state_sync':
        this.handleStateSync(message);
        break;
      case 'notification':
        this.options.onNotification?.(message.notification);
        break;
      case 'visit':
        if (message.action === 'enter') {
          this.options.onVisitorArrive?.(message.agentId);
        } else if (message.action === 'leave') {
          this.options.onVisitorLeave?.(message.agentId);
        }
        break;
    }
  }
  
  private handleStateSync(message: StateSyncMessage): void {
    this.stateManager.syncFromServer(message.state);
    this.options.onStateSync?.(message.state);
  }
  
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        timestamp: Date.now(),
        agentId: this.options.agentId,
        state: this.stateManager.getState(),
      };
      this.sendAction(heartbeat);
    }, GAME_CONFIG.HEARTBEAT_INTERVAL);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private flushOfflineQueue(): void {
    while (this.offlineQueue.length > 0) {
      const message = this.offlineQueue.shift()!;
      this.sendAction(message);
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    }
  }
}
