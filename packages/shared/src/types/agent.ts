export interface AgentProfile {
  id: string;
  name: string;
  createdAt: number;
  lastActiveAt: number;
  
  appearance: AgentAppearance;
  roomStyle: RoomStyle;
  backgroundStory: string;
}

export interface AgentAppearance {
  bodyType: string;
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  outfit: string;
  accessories: string[];
}

export interface RoomStyle {
  theme: string;
  floorType: string;
  wallColor: string;
  furnitureIds: string[];
}

export type AgentStatus = 'online' | 'offline' | 'sleeping' | 'away';

export interface AgentPublicInfo {
  id: string;
  name: string;
  appearance: AgentAppearance;
  status: AgentStatus;
  trustValue: number;
  roomId: string;
}
