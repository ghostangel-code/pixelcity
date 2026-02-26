import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ItemEntity, Position } from './item.entity';
import { ItemTypeEntity, ItemEffect } from './item-type.entity';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    @InjectRepository(ItemTypeEntity)
    private readonly itemTypeRepository: Repository<ItemTypeEntity>,
    private readonly agentService: AgentService
  ) {}

  async createItem(itemTypeId: string, ownerId: string, quantity: number = 1): Promise<ItemEntity> {
    const itemType = await this.itemTypeRepository.findOne({ where: { id: itemTypeId } });
    if (!itemType) {
      throw new NotFoundException('Item type not found');
    }

    const existingItem = await this.itemRepository.findOne({
      where: { itemTypeId, ownerId, roomId: null },
    });

    if (existingItem && itemType.maxStack > 1) {
      const newQuantity = Math.min(existingItem.quantity + quantity, itemType.maxStack);
      existingItem.quantity = newQuantity;
      return this.itemRepository.save(existingItem);
    }

    const item = this.itemRepository.create({
      id: randomUUID(),
      itemTypeId,
      ownerId,
      quantity,
    });

    return this.itemRepository.save(item);
  }

  async useItem(itemId: string, agentId: string): Promise<{ success: boolean; effects: ItemEffect[] }> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, ownerId: agentId },
      relations: ['itemType'],
    });

    if (!item) {
      throw new NotFoundException('Item not found or not owned');
    }

    if (item.itemType.category !== 'consumable') {
      throw new BadRequestException('This item cannot be consumed');
    }

    const effects = item.itemType.effects;

    for (const effect of effects) {
      await this.applyEffect(agentId, effect);
    }

    item.quantity--;
    if (item.quantity <= 0) {
      await this.itemRepository.remove(item);
    } else {
      await this.itemRepository.save(item);
    }

    return { success: true, effects };
  }

  async placeFurniture(itemId: string, roomId: string, position: Position): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['itemType'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.itemType.category !== 'furniture') {
      throw new BadRequestException('This item cannot be placed');
    }

    item.roomId = roomId;
    item.position = position;

    return this.itemRepository.save(item);
  }

  async pickupFurniture(itemId: string, agentId: string): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, ownerId: agentId },
      relations: ['itemType'],
    });

    if (!item) {
      throw new NotFoundException('Item not found or not owned');
    }

    if (item.itemType.category !== 'furniture') {
      throw new BadRequestException('This item cannot be picked up');
    }

    item.roomId = null;
    item.position = null;

    return this.itemRepository.save(item);
  }

  async transferItem(
    itemId: string,
    fromAgentId: string,
    toAgentId: string,
    quantity: number = 1
  ): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, ownerId: fromAgentId },
      relations: ['itemType'],
    });

    if (!item) {
      throw new NotFoundException('Item not found or not owned');
    }

    if (!item.itemType.tradeable) {
      throw new BadRequestException('This item cannot be traded');
    }

    if (item.quantity < quantity) {
      throw new BadRequestException('Insufficient quantity');
    }

    if (item.quantity === quantity) {
      item.ownerId = toAgentId;
      return this.itemRepository.save(item);
    }

    item.quantity -= quantity;
    await this.itemRepository.save(item);

    return this.createItem(item.itemTypeId, toAgentId, quantity);
  }

  async getAgentInventory(agentId: string): Promise<ItemEntity[]> {
    return this.itemRepository.find({
      where: { ownerId: agentId, roomId: null },
      relations: ['itemType'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRoomFurniture(roomId: string): Promise<ItemEntity[]> {
    return this.itemRepository.find({
      where: { roomId },
      relations: ['itemType'],
      order: { createdAt: 'ASC' },
    });
  }

  async getItemById(itemId: string): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['itemType'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async deleteItem(itemId: string, agentId: string): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, ownerId: agentId },
    });

    if (!item) {
      throw new NotFoundException('Item not found or not owned');
    }

    await this.itemRepository.remove(item);
  }

  private async applyEffect(agentId: string, effect: ItemEffect): Promise<void> {
    const agent = await this.agentService.findById(agentId);
    const stateUpdate: Record<string, number> = {};

    switch (effect.type) {
      case 'energy':
        stateUpdate.energy = Math.min(100, Math.max(0, agent.state.energy + effect.value));
        break;
      case 'mood':
        stateUpdate.mood = Math.min(100, Math.max(0, agent.state.mood + effect.value));
        break;
      case 'social':
        stateUpdate.socialNeed = Math.min(100, Math.max(0, agent.state.socialNeed + effect.value));
        break;
      case 'stress':
        stateUpdate.stress = Math.min(100, Math.max(0, agent.state.stress + effect.value));
        break;
    }

    if (Object.keys(stateUpdate).length > 0) {
      await this.agentService.updateState(agentId, stateUpdate);
    }
  }

  async countAgentItems(agentId: string): Promise<number> {
    return this.itemRepository.count({
      where: { ownerId: agentId, roomId: null },
    });
  }
}
