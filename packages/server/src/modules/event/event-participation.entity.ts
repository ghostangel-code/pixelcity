import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { SocialEventEntity } from './social-event.entity';

export type ParticipationStatus = 'registered' | 'attended' | 'completed' | 'disqualified';

@Entity('event_participations')
export class EventParticipationEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  eventId: string;

  @ManyToOne(() => SocialEventEntity)
  @JoinColumn({ name: 'eventId' })
  event: SocialEventEntity;

  @Column('uuid')
  agentId: string;

  @Column({
    type: 'enum',
    enum: ['registered', 'attended', 'completed', 'disqualified'],
    default: 'registered',
  })
  status: ParticipationStatus;

  @Column('int', { default: 0 })
  score: number;

  @Column('jsonb', { nullable: true })
  rewards: Record<string, unknown> | null;

  @Column('timestamp', { nullable: true })
  joinedAt: Date | null;

  @Column('timestamp', { nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
