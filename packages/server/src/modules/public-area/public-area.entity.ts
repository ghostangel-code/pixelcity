import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type PublicAreaType = 'plaza' | 'cafe' | 'park' | 'shop' | 'library' | 'gym';

export interface AreaPosition {
  x: number;
  y: number;
}

export interface AreaCapacity {
  max: number;
  current: number;
}

export interface AreaFacility {
  id: string;
  name: string;
  type: string;
  position: AreaPosition;
}

@Entity('public_areas')
export class PublicAreaEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['plaza', 'cafe', 'park', 'shop', 'library', 'gym'],
  })
  type: PublicAreaType;

  @Column('text')
  description: string;

  @Column('jsonb')
  position: AreaPosition;

  @Column('jsonb')
  capacity: AreaCapacity;

  @Column('jsonb', { default: [] })
  facilities: AreaFacility[];

  @Column('jsonb', { nullable: true })
  spriteData: { path: string; width: number; height: number } | null;

  @Column('boolean', { default: true })
  active: boolean;

  @Column('uuid', { nullable: true })
  currentEventId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
