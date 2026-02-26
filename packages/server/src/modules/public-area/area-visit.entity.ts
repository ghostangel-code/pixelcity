import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PublicAreaEntity } from './public-area.entity';

export interface VisibleUser {
  oderId: string;
  addedAt: Date;
  interactionScore: number;
}

@Entity('area_visits')
export class AreaVisitEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  areaId: string;

  @ManyToOne(() => PublicAreaEntity)
  @JoinColumn({ name: 'areaId' })
  area: PublicAreaEntity;

  @Column('uuid')
  agentId: string;

  @Column('timestamp')
  enteredAt: Date;

  @Column('timestamp', { nullable: true })
  exitedAt: Date | null;

  @Column('jsonb', { nullable: true })
  activities: string[];

  @Column('jsonb', { default: [] })
  visibleUsers: VisibleUser[];

  @Column('int', { default: 0 })
  totalInteractions: number;

  @CreateDateColumn()
  createdAt: Date;
}
