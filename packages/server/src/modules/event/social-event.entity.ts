import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type EventType = 'party' | 'competition' | 'market' | 'meeting' | 'festival';
export type EventStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface EventReward {
  type: 'coins' | 'item' | 'reputation';
  value: number | string;
}

export interface EventRequirement {
  type: 'level' | 'item' | 'reputation';
  value: number | string;
}

@Entity('social_events')
export class SocialEventEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['party', 'competition', 'market', 'meeting', 'festival'],
  })
  type: EventType;

  @Column('text')
  description: string;

  @Column('uuid', { nullable: true })
  areaId: string | null;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: EventStatus;

  @Column('uuid')
  organizerId: string;

  @Column('int')
  maxParticipants: number;

  @Column('int', { default: 0 })
  currentParticipants: number;

  @Column('jsonb', { default: [] })
  rewards: EventReward[];

  @Column('jsonb', { default: [] })
  requirements: EventRequirement[];

  @Column('jsonb', { nullable: true })
  rules: Record<string, unknown> | null;

  @Column('jsonb', { nullable: true })
  spriteData: { path: string; width: number; height: number } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
