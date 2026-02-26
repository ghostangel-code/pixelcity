import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ItemTypeEntity } from './item-type.entity';

export interface Position {
  x: number;
  y: number;
}

@Entity('items')
export class ItemEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  itemTypeId: string;

  @ManyToOne(() => ItemTypeEntity, { eager: true })
  @JoinColumn({ name: 'itemTypeId' })
  itemType: ItemTypeEntity;

  @Column('uuid', { nullable: true })
  ownerId: string | null;

  @Column('uuid', { nullable: true })
  roomId: string | null;

  @Column('jsonb', { nullable: true })
  position: Position | null;

  @Column('int', { default: 1 })
  quantity: number;

  @Column('jsonb', { nullable: true })
  customData: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
