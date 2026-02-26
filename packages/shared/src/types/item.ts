export type ItemType = 'furniture' | 'interactive' | 'collectible' | 'gift';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  
  spriteId: string;
  width: number;
  height: number;
  
  effects?: ItemEffect[];
  durability?: number;
}

export interface ItemEffect {
  type: 'energy' | 'mood' | 'socialNeed' | 'knowledge';
  value: number;
  duration?: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: number;
  placedInRoom?: boolean;
  position?: { x: number; y: number };
}

export interface FurnitureItem extends Item {
  type: 'furniture';
  category: 'seating' | 'table' | 'bed' | 'decoration' | 'lighting' | 'storage';
  canInteract: boolean;
}
