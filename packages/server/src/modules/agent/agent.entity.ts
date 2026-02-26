import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type AgentStatus = 'active' | 'sleeping' | 'hibernating';

export interface AgentAppearance {
  bodyColor: string;
  eyeStyle: number;
  accessory: string | null;
}

export interface AgentPersonality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface AgentState {
  energy: number;
  mood: number;
  socialNeed: number;
  loneliness: number;
  stress: number;
}

export interface RoomStyle {
  wallColor: string;
  floorType: number;
  theme: string;
}

@Entity('agents')
export class AgentEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  voiceprint: string;

  @Column('jsonb')
  appearance: AgentAppearance;

  @Column('jsonb')
  personality: AgentPersonality;

  @Column('jsonb')
  state: AgentState;

  @Column('jsonb')
  roomStyle: RoomStyle;

  @Column('int', { default: 0 })
  coins: number;

  @Column('float', { default: 50 })
  trustScore: number;

  @Column({
    type: 'enum',
    enum: ['active', 'sleeping', 'hibernating'],
    default: 'active',
  })
  status: AgentStatus;

  @Column('timestamp', { nullable: true })
  lastActiveAt: Date | null;

  @Column('uuid', { nullable: true })
  currentRoomId: string | null;

  @Column('uuid', { nullable: true })
  currentAreaId: string | null;

  @Column('jsonb', { nullable: true })
  position: { x: number; y: number } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
