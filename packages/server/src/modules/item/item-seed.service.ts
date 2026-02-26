import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemTypeEntity, ItemEffect, SpriteData } from './item-type.entity';

const ITEM_TYPES: Partial<ItemTypeEntity>[] = [
  {
    id: 'coffee_cup',
    name: '咖啡杯',
    category: 'consumable',
    description: '一杯热腾腾的咖啡，可以恢复能量',
    effects: [{ type: 'energy', value: 20 }],
    basePrice: 10,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 16 },
    tradeable: true,
    maxStack: 10,
  },
  {
    id: 'energy_drink',
    name: '能量饮料',
    category: 'consumable',
    description: '高能量饮料，大幅恢复能量',
    effects: [{ type: 'energy', value: 50 }],
    basePrice: 25,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 16 },
    tradeable: true,
    maxStack: 5,
  },
  {
    id: 'comfort_food',
    name: '治愈食物',
    category: 'consumable',
    description: '美味的治愈食物，提升心情',
    effects: [{ type: 'mood', value: 15 }],
    basePrice: 15,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 16 },
    tradeable: true,
    maxStack: 10,
  },
  {
    id: 'stress_ball',
    name: '减压球',
    category: 'consumable',
    description: '捏一捏，减少压力',
    effects: [{ type: 'stress', value: -20 }],
    basePrice: 20,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 16 },
    tradeable: true,
    maxStack: 10,
  },
  {
    id: 'social_candy',
    name: '社交糖果',
    category: 'consumable',
    description: '增加社交欲望的糖果',
    effects: [{ type: 'social', value: 25 }],
    basePrice: 12,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 16 },
    tradeable: true,
    maxStack: 15,
  },
  {
    id: 'basic_chair',
    name: '基础椅子',
    category: 'furniture',
    description: '一把简单的椅子',
    effects: [],
    basePrice: 50,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 32, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'cozy_sofa',
    name: '舒适沙发',
    category: 'furniture',
    description: '舒适的沙发，休息时恢复更多能量',
    effects: [{ type: 'energy', value: 5 }],
    basePrice: 200,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 64, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'bookshelf',
    name: '书架',
    category: 'furniture',
    description: '装满书籍的书架',
    effects: [],
    basePrice: 150,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 48, height: 64 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'bed_single',
    name: '单人床',
    category: 'furniture',
    description: '一张舒适的单人床',
    effects: [{ type: 'energy', value: 30 }],
    basePrice: 300,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 48, height: 64 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'desk',
    name: '书桌',
    category: 'furniture',
    description: '一张实用的书桌',
    effects: [],
    basePrice: 120,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 48, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'lamp',
    name: '台灯',
    category: 'furniture',
    description: '温暖的台灯',
    effects: [],
    basePrice: 40,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'plant_pot',
    name: '盆栽',
    category: 'furniture',
    description: '一盆绿色植物，提升心情',
    effects: [{ type: 'mood', value: 2 }],
    basePrice: 35,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 16, height: 24 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'tv',
    name: '电视机',
    category: 'furniture',
    description: '一台电视机，可以观看节目',
    effects: [],
    basePrice: 250,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 48, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'rare_crystal',
    name: '稀有水晶',
    category: 'collectible',
    description: '一颗闪闪发光的稀有水晶',
    effects: [],
    basePrice: 500,
    spriteData: { path: 'sprites/ui/icons_monsters.png', width: 32, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'golden_statue',
    name: '金色雕像',
    category: 'collectible',
    description: '一座精美的金色雕像',
    effects: [],
    basePrice: 1000,
    spriteData: { path: 'sprites/ui/icons_monsters.png', width: 32, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'antique_clock',
    name: '古董钟',
    category: 'collectible',
    description: '一个古老的机械钟',
    effects: [],
    basePrice: 750,
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 24, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'fishing_rod',
    name: '钓鱼竿',
    category: 'tool',
    description: '一根钓鱼竿，可以在水边钓鱼',
    effects: [],
    basePrice: 80,
    spriteData: { path: 'sprites/ui/weapons.png', width: 32, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'camera',
    name: '相机',
    category: 'tool',
    description: '一台相机，可以拍照留念',
    effects: [],
    basePrice: 150,
    spriteData: { path: 'sprites/ui/weapons.png', width: 32, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'guitar',
    name: '吉他',
    category: 'tool',
    description: '一把吉他，可以弹奏音乐',
    effects: [{ type: 'mood', value: 10 }],
    basePrice: 200,
    spriteData: { path: 'sprites/ui/weapons.png', width: 32, height: 48 },
    tradeable: true,
    maxStack: 1,
  },
  {
    id: 'umbrella',
    name: '雨伞',
    category: 'tool',
    description: '一把雨伞，下雨时使用',
    effects: [],
    basePrice: 30,
    spriteData: { path: 'sprites/ui/icons_monsters.png', width: 24, height: 32 },
    tradeable: true,
    maxStack: 1,
  },
];

@Injectable()
export class ItemSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(ItemTypeEntity)
    private readonly itemTypeRepository: Repository<ItemTypeEntity>
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<void> {
    const count = await this.itemTypeRepository.count();
    if (count > 0) {
      console.log('Item types already seeded, skipping...');
      return;
    }

    for (const itemData of ITEM_TYPES) {
      const itemType = this.itemTypeRepository.create(itemData);
      await this.itemTypeRepository.save(itemType);
    }

    console.log(`Seeded ${ITEM_TYPES.length} item types`);
  }

  async getAllItemTypes(): Promise<ItemTypeEntity[]> {
    return this.itemTypeRepository.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async getItemTypesByCategory(category: string): Promise<ItemTypeEntity[]> {
    return this.itemTypeRepository.find({
      where: { category: category as ItemTypeEntity['category'] },
      order: { name: 'ASC' },
    });
  }

  async getItemTypeById(id: string): Promise<ItemTypeEntity | null> {
    return this.itemTypeRepository.findOne({ where: { id } });
  }
}
