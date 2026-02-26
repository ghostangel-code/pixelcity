import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PublicAreaEntity } from './public-area.entity';

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

  @CreateDateColumn()
  createdAt: Date;
}
