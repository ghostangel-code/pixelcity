import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ItemCategory = 'furniture' | 'clothing' | 'consumable' | 'collectible' | 'tool';
export type EffectType = 'energy' | 'mood' | 'social' | 'stress';

export interface ItemEffect {
  type: EffectType;
  value: number;
}

export interface SpriteData {
  path: string;
  width: number;
  height: number;
  frames?: number;
}

@Entity('item_types')
export class ItemTypeEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['furniture', 'clothing', 'consumable', 'collectible', 'tool'],
  })
  category: ItemCategory;

  @Column('text')
  description: string;

  @Column('jsonb')
  effects: ItemEffect[];

  @Column('int')
  basePrice: number;

  @Column('jsonb', { nullable: true })
  spriteData: SpriteData | null;

  @Column('boolean', { default: true })
  tradeable: boolean;

  @Column('int', { default: 1 })
  maxStack: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
