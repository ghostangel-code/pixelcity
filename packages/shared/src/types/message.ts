import { AgentState } from './state';

export type MessageType = 
  | 'heartbeat'
  | 'action'
  | 'state_sync'
  | 'chat'
  | 'visit'
  | 'trade'
  | 'task'
  | 'event'
  | 'notification';

export interface BaseMessage {
  type: MessageType;
  timestamp: number;
  agentId: string;
  signature?: string;
}

export interface HeartbeatMessage extends BaseMessage {
  type: 'heartbeat';
  state: AgentState;
}

export interface ActionMessage extends BaseMessage {
  type: 'action';
  action: AgentAction;
}

export interface StateSyncMessage extends BaseMessage {
  type: 'state_sync';
  state: AgentState;
  serverChecksum: string;
}

export interface ChatMessage extends BaseMessage {
  type: 'chat';
  content: string;
  targetAgentId?: string;
  roomId?: string;
}

export interface VisitMessage extends BaseMessage {
  type: 'visit';
  targetRoomId: string;
  action: 'enter' | 'leave' | 'knock';
}

export type AgentAction = 
  | { type: 'move'; direction: 'up' | 'down' | 'left' | 'right' }
  | { type: 'visit'; targetRoomId: string }
  | { type: 'chat'; content: string; targetAgentId?: string }
  | { type: 'interact'; itemId: string }
  | { type: 'buy'; itemId: string }
  | { type: 'place_furniture'; itemId: string; position: { x: number; y: number } }
  | { type: 'create_task'; task: TaskData }
  | { type: 'accept_task'; taskId: string }
  | { type: 'complete_task'; taskId: string };

export interface TaskData {
  title: string;
  description: string;
  reward: number;
  deadline?: number;
  targetAgentId?: string;
}

export interface NotificationMessage extends BaseMessage {
  type: 'notification';
  notification: {
    title: string;
    content: string;
    category: 'social' | 'economy' | 'event' | 'system';
    read: boolean;
  };
}

export type GameMessage = 
  | HeartbeatMessage 
  | ActionMessage 
  | StateSyncMessage 
  | ChatMessage 
  | VisitMessage
  | NotificationMessage;
